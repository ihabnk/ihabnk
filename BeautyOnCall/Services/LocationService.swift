import CoreLocation
import Foundation
import Combine

enum LocationServiceError: LocalizedError {
    case denied
    case restricted
    case disabled
    case unavailable
    case unableToAuthorize

    var errorDescription: String? {
        switch self {
        case .denied:
            return String(localized: "Location permission was denied. Please enable it in Settings.")
        case .restricted:
            return String(localized: "Location access is restricted on this device.")
        case .disabled:
            return String(localized: "Location services are disabled on this device.")
        case .unavailable:
            return String(localized: "Unable to get your current location right now.")
        case .unableToAuthorize:
            return String(localized: "Could not complete location authorization.")
        }
    }
}

@MainActor
final class LocationService: NSObject, ObservableObject {
    @Published private(set) var authorizationStatus: CLAuthorizationStatus

    private let manager = CLLocationManager()
    private var authorizationContinuation: CheckedContinuation<Void, Error>?
    private var locationContinuation: CheckedContinuation<CLLocationCoordinate2D, Error>?

    override init() {
        authorizationStatus = manager.authorizationStatus
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
    }

    func requestCurrentLocation() async throws -> CLLocationCoordinate2D {
        guard CLLocationManager.locationServicesEnabled() else {
            throw LocationServiceError.disabled
        }

        try await ensureAuthorized()

        return try await withCheckedThrowingContinuation { continuation in
            locationContinuation = continuation
            manager.requestLocation()
        }
    }

    private func ensureAuthorized() async throws {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            return
        case .notDetermined:
            try await withCheckedThrowingContinuation { continuation in
                authorizationContinuation = continuation
                manager.requestWhenInUseAuthorization()
            }
        case .denied:
            throw LocationServiceError.denied
        case .restricted:
            throw LocationServiceError.restricted
        @unknown default:
            throw LocationServiceError.unableToAuthorize
        }
    }
}

extension LocationService: CLLocationManagerDelegate {
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus

        guard let continuation = authorizationContinuation else {
            return
        }

        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            authorizationContinuation = nil
            continuation.resume()
        case .denied:
            authorizationContinuation = nil
            continuation.resume(throwing: LocationServiceError.denied)
        case .restricted:
            authorizationContinuation = nil
            continuation.resume(throwing: LocationServiceError.restricted)
        case .notDetermined:
            break
        @unknown default:
            authorizationContinuation = nil
            continuation.resume(throwing: LocationServiceError.unableToAuthorize)
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let continuation = locationContinuation else {
            return
        }

        locationContinuation = nil

        guard let location = locations.last else {
            continuation.resume(throwing: LocationServiceError.unavailable)
            return
        }

        continuation.resume(returning: location.coordinate)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        guard let continuation = locationContinuation else {
            return
        }

        locationContinuation = nil
        continuation.resume(throwing: error)
    }
}
