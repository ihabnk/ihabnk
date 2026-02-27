import Foundation

@MainActor
final class AuthService {
    static let shared = AuthService()

    private init() {}

    func login(email: String, password: String) async throws {
        let body = LoginRequest(email: email, password: password)
        let response: AuthResponse = try await APIClient.shared.request(
            path: "/auth/login",
            method: "POST",
            body: body
        )
        KeychainHelper.save(key: KeychainHelper.accessTokenKey, value: response.accessToken)
    }

    func register(name: String, email: String, phone: String, password: String) async throws {
        let body = RegisterRequest(fullName: name, email: email, phone: phone, password: password)
        let response: AuthResponse = try await APIClient.shared.request(
            path: "/auth/register",
            method: "POST",
            body: body
        )
        KeychainHelper.save(key: KeychainHelper.accessTokenKey, value: response.accessToken)
    }

    func logout() async {
        do {
            try await APIClient.shared.requestVoid(path: "/auth/logout", method: "POST")
        } catch {
            // Best-effort server logout; always clear local state
        }
        KeychainHelper.clearAll()
    }

    func refreshToken() async throws {
        let response: RefreshTokenResponse = try await APIClient.shared.request(
            path: "/auth/refresh",
            method: "POST"
        )
        KeychainHelper.save(key: KeychainHelper.accessTokenKey, value: response.accessToken)
    }
}

private struct LoginRequest: Encodable {
    let email: String
    let password: String
}

private struct RegisterRequest: Encodable {
    let fullName: String
    let email: String
    let phone: String
    let password: String
}

private struct AuthResponse: Decodable {
    let accessToken: String
}

private struct RefreshTokenResponse: Decodable {
    let accessToken: String
}
