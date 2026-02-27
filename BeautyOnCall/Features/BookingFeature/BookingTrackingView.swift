import MapKit
import SwiftUI

struct BookingTrackingView: View {
    let booking: Booking

    var proName: String = "Sarah M."
    var proPhone: String = "+962790000000"
    var proRating: Double = 4.8

    @State private var proCoordinate: CLLocationCoordinate2D
    @State private var routePolyline: MKPolyline?
    @State private var etaMinutes: Int?
    @State private var currentStep: TrackingStep = .confirmed
    @State private var simulationTimer: Timer?

    @State private var cameraPosition: MapCameraPosition = .automatic

    private var customerCoordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(
            latitude: booking.latitude ?? 31.95,
            longitude: booking.longitude ?? 35.93
        )
    }

    init(booking: Booking, proName: String = "Sarah M.", proPhone: String = "+962790000000", proRating: Double = 4.8) {
        self.booking = booking
        self.proName = proName
        self.proPhone = proPhone
        self.proRating = proRating
        let lat = (booking.latitude ?? 31.95) + 0.015
        let lng = (booking.longitude ?? 35.93) + 0.012
        _proCoordinate = State(initialValue: CLLocationCoordinate2D(latitude: lat, longitude: lng))
    }

    var body: some View {
        ZStack(alignment: .top) {
            mapLayer

            VStack {
                statusBar
                Spacer()
            }
        }
        .safeAreaInset(edge: .bottom) {
            proInfoCard
        }
        .navigationTitle(String(localized: "Track Booking"))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await fetchRoute()
            startSimulation()
        }
        .onDisappear {
            simulationTimer?.invalidate()
        }
    }

    // MARK: - Map

    private var mapLayer: some View {
        Map(position: $cameraPosition) {
            Annotation(String(localized: "Your Location"), coordinate: customerCoordinate) {
                Image(systemName: "house.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .padding(8)
                    .background(AppTheme.Colors.brandBlue)
                    .clipShape(Circle())
            }

            Annotation(proName, coordinate: proCoordinate) {
                Image(systemName: "car.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .padding(8)
                    .background(AppTheme.Colors.accentCoral)
                    .clipShape(Circle())
            }

            if let routePolyline {
                MapPolyline(routePolyline)
                    .stroke(AppTheme.Colors.brandBlue, lineWidth: 4)
            }
        }
        .mapControls { MapCompass() }
    }

    // MARK: - Status Progress Bar

    private var statusBar: some View {
        HStack(spacing: 0) {
            ForEach(TrackingStep.allCases, id: \.self) { step in
                let isCompleted = step.rawValue < currentStep.rawValue
                let isActive = step == currentStep

                Circle()
                    .fill(isCompleted || isActive ? AppTheme.Colors.brandBlue : AppTheme.Colors.divider)
                    .frame(width: isActive ? 14 : 10, height: isActive ? 14 : 10)
                    .overlay {
                        if isCompleted {
                            Image(systemName: "checkmark")
                                .font(.system(size: 6, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }

                if step != TrackingStep.allCases.last {
                    Rectangle()
                        .fill(isCompleted ? AppTheme.Colors.brandBlue : AppTheme.Colors.divider)
                        .frame(height: 2)
                }
            }
        }
        .padding(.horizontal, AppTheme.Spacing.l)
        .padding(.vertical, AppTheme.Spacing.s)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
        .padding(.horizontal, AppTheme.Spacing.l)
        .padding(.top, AppTheme.Spacing.xs)
    }

    // MARK: - Pro Info Card

    private var proInfoCard: some View {
        VStack(spacing: AppTheme.Spacing.s) {
            HStack(spacing: AppTheme.Spacing.s) {
                Circle()
                    .fill(AppTheme.Colors.accentCoral.opacity(0.2))
                    .frame(width: 50, height: 50)
                    .overlay {
                        Text(String(proName.prefix(1)))
                            .font(.title2.weight(.bold))
                            .foregroundStyle(AppTheme.Colors.accentCoral)
                    }

                VStack(alignment: .leading, spacing: 2) {
                    Text(proName)
                        .font(.body.weight(.semibold))
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundStyle(.yellow)
                        Text(String(format: "%.1f", proRating))
                            .font(.caption)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }

                Spacer()

                if let etaMinutes {
                    VStack(spacing: 2) {
                        Text(String(format: String(localized: "~%d min"), etaMinutes))
                            .font(.body.weight(.bold))
                        Text(String(localized: "ETA"))
                            .font(.caption)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }
            }

            HStack(spacing: AppTheme.Spacing.s) {
                Button {
                    if let url = URL(string: "tel://\(proPhone)") {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    Label(String(localized: "Call"), systemImage: "phone.fill")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppTheme.Spacing.xs)
                        .background(AppTheme.Colors.brandBlue.opacity(0.1))
                        .foregroundStyle(AppTheme.Colors.brandBlue)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.button, style: .continuous))
                }

                Button {
                    // Navigate to ChatDetailView when implemented
                } label: {
                    Label(String(localized: "Chat"), systemImage: "message.fill")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppTheme.Spacing.xs)
                        .background(AppTheme.Colors.accentCoral.opacity(0.1))
                        .foregroundStyle(AppTheme.Colors.accentCoral)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.button, style: .continuous))
                }
            }
        }
        .padding(AppTheme.Spacing.l)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
        .padding(.horizontal, AppTheme.Spacing.s)
        .padding(.bottom, AppTheme.Spacing.xs)
    }

    // MARK: - Route & ETA

    private func fetchRoute() async {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: proCoordinate))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: customerCoordinate))
        request.transportType = .automobile

        do {
            let directions = MKDirections(request: request)
            let response = try await directions.calculate()
            if let route = response.routes.first {
                routePolyline = route.polyline
                etaMinutes = Int(route.expectedTravelTime / 60)
            }
        } catch {
            // Route unavailable — ETA stays nil
        }
    }

    // MARK: - Pro Movement Simulation

    private func startSimulation() {
        simulationTimer = Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { _ in
            Task { @MainActor in
                let fraction = 0.08
                let newLat = proCoordinate.latitude + (customerCoordinate.latitude - proCoordinate.latitude) * fraction
                let newLng = proCoordinate.longitude + (customerCoordinate.longitude - proCoordinate.longitude) * fraction
                withAnimation(.easeInOut(duration: 1)) {
                    proCoordinate = CLLocationCoordinate2D(latitude: newLat, longitude: newLng)
                }

                await fetchRoute()

                if let eta = etaMinutes, eta <= 1 {
                    currentStep = .arrived
                    simulationTimer?.invalidate()
                } else if currentStep == .confirmed {
                    currentStep = .onTheWay
                }
            }
        }
    }
}

enum TrackingStep: Int, CaseIterable {
    case confirmed = 0
    case onTheWay = 1
    case arrived = 2
    case inProgress = 3
    case done = 4
}
