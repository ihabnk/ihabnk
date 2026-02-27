import Foundation

enum APIError: LocalizedError {
    case unauthorized
    case networkError(Error)
    case decodingError(Error)
    case serverError(String)
    case invalidURL

    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return String(localized: "Session expired. Please log in again.")
        case .networkError(let error):
            return error.localizedDescription
        case .decodingError:
            return String(localized: "Unexpected response from server.")
        case .serverError(let message):
            return message
        case .invalidURL:
            return String(localized: "Invalid request URL.")
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.httpCookieAcceptPolicy = .always
        config.httpShouldSetCookies = true
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
    }

    func request<T: Decodable>(
        path: String,
        method: String = "GET",
        body: (any Encodable)? = nil
    ) async throws -> T {
        do {
            return try await performRequest(path: path, method: method, body: body, isRetry: false)
        } catch APIError.unauthorized {
            try await refreshToken()
            return try await performRequest(path: path, method: method, body: body, isRetry: true)
        }
    }

    func requestVoid(
        path: String,
        method: String = "GET",
        body: (any Encodable)? = nil
    ) async throws {
        let _: EmptyResponse = try await request(path: path, method: method, body: body)
    }

    private func performRequest<T: Decodable>(
        path: String,
        method: String,
        body: (any Encodable)?,
        isRetry: Bool
    ) async throws -> T {
        guard let url = URL(string: AppConfig.baseURL + path) else {
            throw APIError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainHelper.load(key: KeychainHelper.accessTokenKey) {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            urlRequest.httpBody = try JSONEncoder().encode(body)
        }

        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await session.data(for: urlRequest)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid response")
        }

        if httpResponse.statusCode == 401 {
            if isRetry {
                await forceLogout()
            }
            throw APIError.unauthorized
        }

        if !(200..<300).contains(httpResponse.statusCode) {
            let serverMessage = (try? decoder.decode(ServerErrorResponse.self, from: data))?.message
                ?? "Request failed (\(httpResponse.statusCode))"
            throw APIError.serverError(serverMessage)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    private func refreshToken() async throws {
        guard let url = URL(string: AppConfig.baseURL + "/auth/refresh") else {
            throw APIError.invalidURL
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await session.data(for: urlRequest)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.unauthorized
        }

        if httpResponse.statusCode == 401 {
            await forceLogout()
            throw APIError.unauthorized
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            await forceLogout()
            throw APIError.unauthorized
        }

        let refreshResponse = try decoder.decode(RefreshResponse.self, from: data)
        KeychainHelper.save(key: KeychainHelper.accessTokenKey, value: refreshResponse.accessToken)
    }

    @MainActor
    private func forceLogout() {
        KeychainHelper.clearAll()
    }
}

private struct ServerErrorResponse: Decodable {
    let message: String
}

private struct RefreshResponse: Decodable {
    let accessToken: String
}

private struct EmptyResponse: Decodable {}
