import MapKit
import SwiftUI

struct LocationPickerView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var locationManager = LocationManager()

    var onConfirm: (CLLocationCoordinate2D, String) -> Void

    @State private var position: MapCameraPosition = .userLocation(fallback: .automatic)
    @State private var centerCoordinate = CLLocationCoordinate2D(latitude: 31.95, longitude: 35.93) // Amman default
    @State private var geocodedAddress = ""
    @State private var isGeocoding = false
    @State private var geocodeTask: Task<Void, Never>?

    @State private var searchText = ""
    @State private var searchResults: [MKMapItem] = []
    @State private var isSearching = false
    @State private var isShowingSearch = false

    @State private var isShowingDeniedAlert = false
    @State private var isShowingSavedAddresses = false

    var body: some View {
        ZStack {
            mapLayer

            VStack(spacing: 0) {
                searchBar
                Spacer()
                bottomCard
            }

            centerPin
        }
        .navigationTitle(String(localized: "Pick Location"))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    isShowingSavedAddresses = true
                } label: {
                    Image(systemName: "bookmark")
                }
            }
        }
        .onAppear {
            locationManager.requestPermission()
        }
        .onChange(of: locationManager.authorizationStatus) { _, status in
            if status == .denied || status == .restricted {
                isShowingDeniedAlert = true
            }
        }
        .alert(String(localized: "Location Access Denied"), isPresented: $isShowingDeniedAlert) {
            Button(String(localized: "Open Settings")) {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button(String(localized: "Cancel"), role: .cancel) { }
        } message: {
            Text(String(localized: "Please enable location access in Settings to use this feature."))
        }
        .sheet(isPresented: $isShowingSavedAddresses) {
            savedAddressesSheet
        }
    }

    // MARK: - Map

    private var mapLayer: some View {
        MapReader { proxy in
            Map(position: $position) {
                UserAnnotation()
            }
            .mapControls {
                MapCompass()
                MapUserLocationButton()
            }
            .onMapCameraChange(frequency: .onEnd) { context in
                centerCoordinate = context.camera.centerCoordinate
                debounceGeocode(coordinate: centerCoordinate)
            }
        }
        .ignoresSafeArea(edges: .bottom)
    }

    // MARK: - Center Pin Overlay

    private var centerPin: some View {
        VStack(spacing: 0) {
            Spacer()
            Image(systemName: "mappin")
                .font(.system(size: 36))
                .foregroundStyle(AppTheme.Colors.accentCoral)
                .shadow(color: .black.opacity(0.3), radius: 4, y: 2)
            Image(systemName: "circle.fill")
                .font(.system(size: 6))
                .foregroundStyle(.black.opacity(0.3))
                .offset(y: 2)
            Spacer()
        }
        .allowsHitTesting(false)
    }

    // MARK: - Search

    private var searchBar: some View {
        VStack(spacing: 0) {
            HStack(spacing: AppTheme.Spacing.xs) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(AppTheme.Colors.textSecondary)
                TextField(String(localized: "Search address..."), text: $searchText)
                    .textInputAutocapitalization(.words)
                    .onSubmit { Task { await performSearch() } }
                    .onChange(of: searchText) { _, newValue in
                        isShowingSearch = !newValue.isEmpty
                        if newValue.isEmpty { searchResults = [] }
                    }

                if !searchText.isEmpty {
                    Button { searchText = ""; searchResults = [] } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }
            }
            .padding(AppTheme.Spacing.s)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
            .padding(.horizontal, AppTheme.Spacing.l)
            .padding(.top, AppTheme.Spacing.xs)

            if isShowingSearch && !searchResults.isEmpty {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {
                        ForEach(searchResults, id: \.self) { item in
                            Button {
                                selectSearchResult(item)
                            } label: {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(item.name ?? "")
                                        .font(.body.weight(.medium))
                                        .foregroundStyle(AppTheme.Colors.textPrimary)
                                    if let subtitle = item.placemark.title {
                                        Text(subtitle)
                                            .font(.caption)
                                            .foregroundStyle(AppTheme.Colors.textSecondary)
                                    }
                                }
                                .padding(.horizontal, AppTheme.Spacing.m)
                                .padding(.vertical, AppTheme.Spacing.xs)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            Divider().padding(.leading, AppTheme.Spacing.m)
                        }
                    }
                }
                .frame(maxHeight: 220)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
                .padding(.horizontal, AppTheme.Spacing.l)
                .padding(.top, 4)
            }
        }
    }

    // MARK: - Bottom Card

    private var bottomCard: some View {
        VStack(spacing: AppTheme.Spacing.s) {
            HStack(spacing: AppTheme.Spacing.xs) {
                Image(systemName: "mappin.and.ellipse")
                    .foregroundStyle(AppTheme.Colors.accentCoral)

                if isGeocoding {
                    ProgressView()
                        .controlSize(.small)
                    Text(String(localized: "Locating..."))
                        .font(.body)
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                } else {
                    Text(geocodedAddress.isEmpty ? String(localized: "Move map to select location") : geocodedAddress)
                        .font(.body)
                        .lineLimit(2)
                }

                Spacer()
            }

            HStack(spacing: AppTheme.Spacing.s) {
                Button {
                    position = .userLocation(fallback: .automatic)
                } label: {
                    Label(String(localized: "My Location"), systemImage: "location.fill")
                        .font(.subheadline.weight(.medium))
                        .padding(.vertical, AppTheme.Spacing.xs)
                        .padding(.horizontal, AppTheme.Spacing.s)
                        .background(AppTheme.Colors.divider.opacity(0.5))
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                Spacer()
            }

            PrimaryCTAButton(title: String(localized: "Confirm This Location")) {
                onConfirm(centerCoordinate, geocodedAddress)
                dismiss()
            }
            .disabled(geocodedAddress.isEmpty)
        }
        .padding(AppTheme.Spacing.l)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
        .padding(.horizontal, AppTheme.Spacing.s)
        .padding(.bottom, AppTheme.Spacing.s)
    }

    // MARK: - Saved Addresses Sheet

    private var savedAddressesSheet: some View {
        NavigationStack {
            List {
                Text(String(localized: "Saved addresses will appear here once synced from your profile."))
                    .font(.body)
                    .foregroundStyle(AppTheme.Colors.textSecondary)
            }
            .navigationTitle(String(localized: "Saved Addresses"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(String(localized: "Done")) { isShowingSavedAddresses = false }
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Geocoding

    private func debounceGeocode(coordinate: CLLocationCoordinate2D) {
        geocodeTask?.cancel()
        geocodeTask = Task {
            try? await Task.sleep(for: .milliseconds(800))
            guard !Task.isCancelled else { return }
            await geocode(coordinate: coordinate)
        }
    }

    private func geocode(coordinate: CLLocationCoordinate2D) async {
        isGeocoding = true
        defer { isGeocoding = false }

        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        do {
            let placemarks = try await CLGeocoder().reverseGeocodeLocation(location)
            guard let placemark = placemarks.first else { return }
            let street = placemark.thoroughfare ?? ""
            let city = placemark.locality ?? placemark.administrativeArea ?? ""
            let parts = [street, city].filter { !$0.isEmpty }
            geocodedAddress = parts.joined(separator: ", ")
        } catch {
            if !Task.isCancelled {
                geocodedAddress = String(localized: "Map unavailable offline")
            }
        }
    }

    // MARK: - Search

    private func performSearch() async {
        guard !searchText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isSearching = true
        defer { isSearching = false }

        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = searchText
        request.resultTypes = .address

        do {
            let search = MKLocalSearch(request: request)
            let response = try await search.start()
            searchResults = response.mapItems
        } catch {
            searchResults = []
        }
    }

    private func selectSearchResult(_ item: MKMapItem) {
        let coord = item.placemark.coordinate
        withAnimation {
            position = .region(MKCoordinateRegion(
                center: coord,
                span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
            ))
        }
        centerCoordinate = coord
        geocodedAddress = item.placemark.title ?? item.name ?? ""
        searchText = ""
        searchResults = []
        isShowingSearch = false
    }
}
