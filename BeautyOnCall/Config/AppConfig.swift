import Foundation

enum AppConfig {
    enum Environment {
        case dev
        case prod
    }

    #if DEBUG
    static let environment: Environment = .dev
    #else
    static let environment: Environment = .prod
    #endif

    static var baseURL: String {
        switch environment {
        case .dev:
            return "http://localhost:3000/api"
        case .prod:
            return "https://api.beautyoncall.com/api"
        }
    }
}
