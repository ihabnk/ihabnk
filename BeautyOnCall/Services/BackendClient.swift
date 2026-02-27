import Foundation

struct ReverseGeocodeResult: Decodable {
    let address: String
    let city: String?
    let placeId: String?
    let latitude: Double
    let longitude: Double
}

struct BackendBookingAddOn: Codable, Hashable {
    let name: String
    let priceJOD: Double
}

struct CreateBookingRequest: Encodable {
    let clientId: String
    let serviceTitle: String
    let serviceCategory: String
    let address: String
    let city: String?
    let latitude: Double?
    let longitude: Double?
    let dateTimeISO: String
    let addOns: [BackendBookingAddOn]
    let totalPriceJOD: Double
}

struct CreateBookingResponse: Decodable {
    let bookingId: String
    let createdAtISO: String
}

struct BackendBookingRecord: Decodable {
    let id: String
    let clientId: String
    let serviceTitle: String
    let serviceCategory: String
    let address: String
    let city: String?
    let latitude: Double?
    let longitude: Double?
    let dateTimeISO: String
    let addOns: [BackendBookingAddOn]
    let totalPriceJOD: Double
    let createdAtISO: String
    let updatedAtISO: String
}

private struct ListBookingsResponse: Decodable {
    let bookings: [BackendBookingRecord]
}

private struct APIErrorResponse: Decodable {
    let error: String
}

enum BackendClientError: LocalizedError {
    case invalidBaseURL
    case invalidResponse
    case server(statusCode: Int, message: String)

    var errorDescription: String? {
        switch self {
        case .invalidBaseURL:
            return String(localized: "Backend base URL is invalid.")
        case .invalidResponse:
            return String(localized: "The backend returned an invalid response.")
        case .server(_, let message):
            return message
        }
    }
}

actor BackendClient {
    static let shared = BackendClient()

    private let baseURL: URL
    private let session: URLSession

    init(baseURL: URL? = nil, session: URLSession = .shared) {
        self.baseURL = baseURL ?? Self.defaultBaseURL()
        self.session = session
    }

    private static func defaultBaseURL() -> URL {
        if let configured = Bundle.main.object(forInfoDictionaryKey: "BACKEND_BASE_URL") as? String,
           let url = URL(string: configured) {
            return url
        }

        return URL(string: "http://127.0.0.1:8080")!
    }

    func reverseGeocode(latitude: Double, longitude: Double, languageCode: String) async throws -> ReverseGeocodeResult {
        var components = URLComponents(url: baseURL.appending(path: "/api/location/reverse-geocode"), resolvingAgainstBaseURL: false)
        components?.queryItems = [
            URLQueryItem(name: "lat", value: String(latitude)),
            URLQueryItem(name: "lng", value: String(longitude)),
            URLQueryItem(name: "language", value: languageCode)
        ]

        guard let url = components?.url else {
            throw BackendClientError.invalidBaseURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        return try await send(request, as: ReverseGeocodeResult.self)
    }

    func createBooking(_ payload: CreateBookingRequest) async throws -> CreateBookingResponse {
        let url = baseURL.appending(path: "/api/bookings")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(payload)
        return try await send(request, as: CreateBookingResponse.self)
    }

    func fetchBookings(clientId: String) async throws -> [BackendBookingRecord] {
        var components = URLComponents(url: baseURL.appending(path: "/api/bookings"), resolvingAgainstBaseURL: false)
        components?.queryItems = [URLQueryItem(name: "clientId", value: clientId)]

        guard let url = components?.url else {
            throw BackendClientError.invalidBaseURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        let response = try await send(request, as: ListBookingsResponse.self)
        return response.bookings
    }

    func rescheduleBooking(backendBookingId: String, clientId: String, dateTimeISO: String) async throws {
        let url = baseURL.appending(path: "/api/bookings/\(backendBookingId)/reschedule")
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        struct Payload: Encodable {
            let clientId: String
            let dateTimeISO: String
        }

        request.httpBody = try JSONEncoder().encode(Payload(clientId: clientId, dateTimeISO: dateTimeISO))
        _ = try await send(request, as: EmptyResponse.self)
    }

    private func send<Response: Decodable>(_ request: URLRequest, as type: Response.Type) async throws -> Response {
        let (data, rawResponse) = try await session.data(for: request)

        guard let response = rawResponse as? HTTPURLResponse else {
            throw BackendClientError.invalidResponse
        }

        guard (200..<300).contains(response.statusCode) else {
            let message = (try? JSONDecoder().decode(APIErrorResponse.self, from: data).error) ?? HTTPURLResponse.localizedString(forStatusCode: response.statusCode)
            throw BackendClientError.server(statusCode: response.statusCode, message: message)
        }

        return try JSONDecoder().decode(Response.self, from: data)
    }
}

private struct EmptyResponse: Decodable {}
