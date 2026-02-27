import SwiftUI
import MapKit

struct HomeRootView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @Environment(\.layoutDirection) private var layoutDirection
    @Binding var selectedTab: AppTab

    @StateObject private var locationManager = LocationManager()
    @State private var path: [HomeRoute] = []
    @State private var isShowingDateSheet = false

    private let columns = [
        GridItem(.flexible(), spacing: AppTheme.Spacing.s),
        GridItem(.flexible(), spacing: AppTheme.Spacing.s)
    ]

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xl) {
                    offersSection
                    nearbyProsSection
                    stepsSection
                    prosSection
                    exploreSection
                }
                .padding(.bottom, AppTheme.Spacing.xl)
            }
            .background(AppTheme.Colors.pageBackground)
            .safeAreaInset(edge: .top, spacing: 0) {
                TopLocationBar(city: session.selectedCity)
            }
            .navigationDestination(for: HomeRoute.self) { route in
                switch route {
                case .address:
                    AddressEditorView()
                case .exploreCategory(let tile):
                    if let category = tile.category {
                        ServicesCategoryPreviewView(category: category)
                    } else {
                        SimpleInfoView(title: tile.title, bodyText: String(localized: "This flow is ready for your branded content and backend wiring."))
                    }
                }
            }
            .sheet(isPresented: $isShowingDateSheet) {
                DateTimeSelectionSheet(initialDate: session.selectedDate, initialTime: session.selectedTime) { date, time in
                    session.updateSchedule(date: date, time: time)
                }
            }
        }
    }

    private var nearbyProsSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            if let coordinate = locationManager.userLocation {
                MapSnapshotView(
                    coordinate: coordinate,
                    spanDelta: 0.04,
                    width: UIScreen.main.bounds.width - AppTheme.Spacing.l * 2,
                    height: 160
                )
                Text(String(localized: "Beauty pros available near you"))
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.Colors.textSecondary)
            }
        }
        .padding(.horizontal, AppTheme.Spacing.l)
        .onAppear {
            locationManager.requestPermission()
        }
    }

    private var offersSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
            Text("Offers for your first glam")
                .font(.system(size: 40, weight: .semibold, design: .rounded))
                .foregroundStyle(AppTheme.Colors.textSecondary)
                .padding(.horizontal, AppTheme.Spacing.l)
                .padding(.top, AppTheme.Spacing.m)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: AppTheme.Spacing.s) {
                    ForEach(MockData.offers) { offer in
                        OfferCarouselCard(offer: offer)
                            .frame(width: 430)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.l)
            }
        }
    }

    private var stepsSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
            Text("Beauty on call starts here")
                .font(.system(size: 56, weight: .bold, design: .rounded))
                .padding(.horizontal, AppTheme.Spacing.l)

            VStack(spacing: AppTheme.Spacing.s) {
                StepActionCard(
                    icon: "mappin",
                    title: String(localized: "Add your address"),
                    subtitle: session.address == BookingSessionStore.addressPlaceholder ? String(localized: "Services vary by location.") : session.address
                ) {
                    path.append(.address)
                }

                StepActionCard(
                    icon: "sparkles",
                    title: String(localized: "Select your services"),
                    subtitle: String(localized: "Now for the fun part.")
                ) {
                    selectedTab = .services
                }

                StepActionCard(
                    icon: "calendar",
                    title: String(localized: "Choose date + time"),
                    subtitle: session.selectedDateTime.formatted(date: .abbreviated, time: .shortened)
                ) {
                    isShowingDateSheet = true
                }
            }
            .padding(.horizontal, AppTheme.Spacing.l)
        }
    }

    private var prosSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.m) {
            Text("Get to know your beauty pros")
                .font(.system(size: 52, weight: .bold, design: .rounded))

            VStack(alignment: .leading, spacing: AppTheme.Spacing.m) {
                trustPoint(icon: "medal", text: String(localized: "Fully licensed hair and makeup artists"))
                trustPoint(icon: "number.circle", text: String(localized: "Averaging 7 years of experience"))
                trustPoint(icon: "checkmark.seal", text: String(localized: "Always background-checked"))
            }

            PrimaryCTAButton(title: String(localized: "Book Now")) {
                selectedTab = .services
            }
        }
        .padding(AppTheme.Spacing.l)
        .background(AppTheme.Colors.pageBackground)
    }

    private func trustPoint(icon: String, text: String) -> some View {
        HStack(spacing: AppTheme.Spacing.s) {
            Image(systemName: icon)
                .font(.title2)
            Text(text)
                .font(.title2)
        }
    }

    private var exploreSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
            Text("Explore our services")
                .font(.system(size: 40, weight: .semibold, design: .rounded))
                .foregroundStyle(AppTheme.Colors.textSecondary)

            LazyVGrid(columns: columns, spacing: AppTheme.Spacing.s) {
                ForEach(MockData.homeExploreTiles) { tile in
                    Button {
                        path.append(.exploreCategory(tile))
                    } label: {
                        ZStack(alignment: .bottomLeading) {
                            PlaceholderAssetImage(imageName: tile.imageName, fallbackSystemName: "sparkles.rectangle.stack")
                                .frame(height: 180)
                                .clipped()

                            Text(tile.title)
                                .font(.system(size: 36, weight: .bold))
                                .lineLimit(2)
                                .minimumScaleFactor(0.65)
                                .multilineTextAlignment(layoutDirection == .rightToLeft ? .trailing : .leading)
                                .frame(maxWidth: .infinity, alignment: layoutDirection == .rightToLeft ? .trailing : .leading)
                                .foregroundStyle(.white)
                                .padding(AppTheme.Spacing.s)
                        }
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, AppTheme.Spacing.l)
    }
}

private struct AddressEditorView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @StateObject private var locationService = LocationService()
    @State private var mapPosition: MapCameraPosition = .automatic
    @State private var isResolvingLocation = false
    @State private var locationError: String?
    @State private var hasPositionedMap = false

    private var addressBinding: Binding<String> {
        Binding(
            get: { session.address },
            set: { session.updateAddress(address: $0) }
        )
    }

    private var cityBinding: Binding<String> {
        Binding(
            get: { session.selectedCity },
            set: { session.updateAddress(address: session.address, city: $0) }
        )
    }

    var body: some View {
        Form {
            Section("Address") {
                TextField("Amman - Building, Street, Floor", text: addressBinding)
                    .textInputAutocapitalization(.words)
            }

            Section("City") {
                TextField("City", text: cityBinding)
                    .textInputAutocapitalization(.words)
            }

            Section("Map") {
                Map(position: $mapPosition) {
                    if let coordinate = session.selectedCoordinate {
                        Marker(String(localized: "Selected location"), coordinate: coordinate)
                    }
                }
                .frame(height: 220)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))

                Button {
                    Task {
                        await resolveCurrentLocation()
                    }
                } label: {
                    Label(String(localized: "Use Current Location"), systemImage: "location.fill")
                }
                .disabled(isResolvingLocation)

                if isResolvingLocation {
                    HStack(spacing: AppTheme.Spacing.s) {
                        ProgressView()
                        Text("Detecting your location...")
                    }
                }

                if let locationError {
                    Text(locationError)
                        .font(.footnote)
                        .foregroundStyle(AppTheme.Colors.destructive)
                }
            }
        }
        .navigationTitle("Add your address")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            focusMapIfNeeded()
        }
        .onChange(of: session.selectedLatitude) { _, _ in
            focusMapIfNeeded()
        }
        .onChange(of: session.selectedLongitude) { _, _ in
            focusMapIfNeeded()
        }
    }

    private func resolveCurrentLocation() async {
        isResolvingLocation = true
        locationError = nil
        defer { isResolvingLocation = false }

        do {
            let coordinate = try await locationService.requestCurrentLocation()
            let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
            let placemarks = try await CLGeocoder().reverseGeocodeLocation(location)

            guard let placemark = placemarks.first else {
                locationError = String(localized: "Could not determine address for this location.")
                return
            }

            let street = placemark.thoroughfare ?? ""
            let city = placemark.locality ?? placemark.administrativeArea ?? ""
            let parts = [street, city].filter { !$0.isEmpty }
            let address = parts.joined(separator: ", ")

            session.updateAddress(
                address: address.isEmpty ? String(localized: "Current Location") : address,
                city: city.isEmpty ? nil : city,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude
            )

            focusMap(on: coordinate)
        } catch {
            locationError = error.localizedDescription
        }
    }

    private func focusMapIfNeeded() {
        guard !hasPositionedMap, let coordinate = session.selectedCoordinate else {
            return
        }

        focusMap(on: coordinate)
    }

    private func focusMap(on coordinate: CLLocationCoordinate2D) {
        mapPosition = .region(
            MKCoordinateRegion(
                center: coordinate,
                span: MKCoordinateSpan(latitudeDelta: 0.015, longitudeDelta: 0.015)
            )
        )
        hasPositionedMap = true
    }
}

private struct ServicesCategoryPreviewView: View {
    @EnvironmentObject private var session: BookingSessionStore
    let category: ServiceCategory

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.s) {
                ForEach(MockData.services(for: category)) { service in
                    ServiceCardView(service: service)
                }
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(category.localizedTitle)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            session.selectedCategory = category
        }
    }
}

private struct SimpleInfoView: View {
    let title: String
    let bodyText: String

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.m) {
            Text(bodyText)
                .font(.title3)
                .foregroundStyle(AppTheme.Colors.textSecondary)
            Spacer()
        }
        .padding(AppTheme.Spacing.l)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
