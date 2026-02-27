import Foundation
import SwiftUI
import Combine
import CoreLocation

@MainActor
final class BookingSessionStore: ObservableObject {
    static let addressPlaceholder = String(localized: "Add your address")
    private static let clientIDDefaultsKey = "beautyoncall.client.id"
    private static let profileDefaultsKey = "beautyoncall.user.profile"
    private static let notificationsDefaultsKey = "beautyoncall.notifications.enabled"

    @Published var userProfile: UserProfile {
        didSet { persistProfile() }
    }
    @Published var notificationsEnabled: Bool {
        didSet { UserDefaults.standard.set(notificationsEnabled, forKey: Self.notificationsDefaultsKey) }
    }
    @Published var isLoggedIn: Bool = KeychainHelper.hasToken

    @Published var selectedCity: String
    @Published var address: String
    @Published var selectedLatitude: Double?
    @Published var selectedLongitude: Double?
    @Published var selectedCategory: ServiceCategory
    @Published var selectedService: ServiceCard?
    @Published var selectedDate: Date
    @Published var selectedTime: Date
    @Published var selectedAddOns: Set<ServiceAddOn>
    @Published var creditsBalance: Double
    @Published var inviteCode: String
    @Published var upcomingBookings: [Booking]

    let clientID: String

    init(
        userProfile: UserProfile? = nil,
        selectedCity: String = MockData.defaultCity,
        address: String = BookingSessionStore.addressPlaceholder,
        selectedLatitude: Double? = nil,
        selectedLongitude: Double? = nil,
        selectedCategory: ServiceCategory = .hair,
        selectedService: ServiceCard? = nil,
        selectedDate: Date = Date(),
        selectedTime: Date = Calendar.current.date(bySettingHour: 17, minute: 0, second: 0, of: Date()) ?? Date(),
        selectedAddOns: Set<ServiceAddOn> = [],
        creditsBalance: Double = MockData.inviteSummary.creditBalance,
        inviteCode: String = MockData.inviteSummary.inviteCode,
        upcomingBookings: [Booking] = []
    ) {
        self.userProfile = userProfile ?? Self.loadProfile()
        self.notificationsEnabled = UserDefaults.standard.bool(forKey: Self.notificationsDefaultsKey)
        self.selectedCity = selectedCity
        self.address = address
        self.selectedLatitude = selectedLatitude
        self.selectedLongitude = selectedLongitude
        self.selectedCategory = selectedCategory
        self.selectedService = selectedService
        self.selectedDate = selectedDate
        self.selectedTime = selectedTime
        self.selectedAddOns = selectedAddOns
        self.creditsBalance = creditsBalance
        self.inviteCode = inviteCode
        self.upcomingBookings = upcomingBookings
        self.clientID = Self.resolveClientID()
    }

    var selectedDateTime: Date {
        let calendar = Calendar.current
        let dateComponents = calendar.dateComponents([.year, .month, .day], from: selectedDate)
        let timeComponents = calendar.dateComponents([.hour, .minute], from: selectedTime)

        return calendar.date(
            from: DateComponents(
                year: dateComponents.year,
                month: dateComponents.month,
                day: dateComponents.day,
                hour: timeComponents.hour,
                minute: timeComponents.minute
            )
        ) ?? selectedDate
    }

    var addOnsTotalJOD: Double {
        selectedAddOns.reduce(0) { $0 + $1.priceJOD }
    }

    var selectedServiceBasePriceJOD: Double {
        selectedService?.startingPriceJOD ?? 0
    }

    var bookingTotalJOD: Double {
        selectedServiceBasePriceJOD + addOnsTotalJOD
    }

    var selectedCoordinate: CLLocationCoordinate2D? {
        guard let latitude = selectedLatitude, let longitude = selectedLongitude else {
            return nil
        }

        return CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    var nextBooking: Booking? {
        upcomingBookings.sorted { $0.dateTime < $1.dateTime }.first
    }

    func updateAddress(
        address newAddress: String,
        city: String? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        address = newAddress

        if let city {
            selectedCity = city
        }

        if let latitude, let longitude {
            selectedLatitude = latitude
            selectedLongitude = longitude
        }
    }

    func setSelectedService(_ service: ServiceCard) {
        selectedService = service
        selectedCategory = service.category
        selectedAddOns = []
    }

    func toggleAddOn(_ addOn: ServiceAddOn) {
        if selectedAddOns.contains(addOn) {
            selectedAddOns.remove(addOn)
        } else {
            selectedAddOns.insert(addOn)
        }
    }

    func updateSchedule(date: Date, time: Date) {
        selectedDate = date
        selectedTime = time
    }

    func confirmCurrentBooking() -> String? {
        guard let service = selectedService else {
            return String(localized: "Please select a service before booking.")
        }

        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedAddress.isEmpty || trimmedAddress == BookingSessionStore.addressPlaceholder {
            return String(localized: "Please add your address before booking.")
        }

        let now = Date()
        if selectedDateTime < now {
            return String(localized: "Please choose a future date and time.")
        }

        let booking = Booking(
            service: service,
            dateTime: selectedDateTime,
            address: trimmedAddress,
            city: selectedCity,
            latitude: selectedLatitude,
            longitude: selectedLongitude,
            addOns: Array(selectedAddOns),
            totalPriceJOD: bookingTotalJOD
        )

        upcomingBookings.append(booking)
        return nil
    }

    func confirmAndSyncCurrentBooking() async -> String {
        if let error = confirmCurrentBooking() {
            return error
        }

        guard let booking = upcomingBookings.last else {
            return String(localized: "Your booking was saved locally.")
        }

        let payload = CreateBookingRequest(
            clientId: clientID,
            serviceTitle: booking.service.title,
            serviceCategory: booking.service.category.rawValue,
            address: booking.address,
            city: booking.city,
            latitude: booking.latitude,
            longitude: booking.longitude,
            dateTimeISO: booking.dateTime.ISO8601Format(),
            addOns: booking.addOns.map { BackendBookingAddOn(name: $0.name, priceJOD: $0.priceJOD) },
            totalPriceJOD: booking.totalPriceJOD
        )

        do {
            let response = try await BackendClient.shared.createBooking(payload)
            if let index = upcomingBookings.indices.last {
                let localBooking = upcomingBookings[index]
                upcomingBookings[index] = Booking(
                    id: localBooking.id,
                    backendBookingId: response.bookingId,
                    service: localBooking.service,
                    dateTime: localBooking.dateTime,
                    address: localBooking.address,
                    city: localBooking.city,
                    latitude: localBooking.latitude,
                    longitude: localBooking.longitude,
                    addOns: localBooking.addOns,
                    totalPriceJOD: localBooking.totalPriceJOD,
                    createdAt: localBooking.createdAt
                )
            }

            return String(localized: "Your appointment has been added and synced with the backend.")
        } catch {
            return String(format: String(localized: "Your appointment has been added, but backend sync failed: %@"), error.localizedDescription)
        }
    }

    func refreshUpcomingBookingsFromBackend() async {
        do {
            let remoteBookings = try await BackendClient.shared.fetchBookings(clientId: clientID)
            let mapped = remoteBookings.compactMap { mapBackendBookingToLocal($0) }
            if !mapped.isEmpty {
                upcomingBookings = mapped
            }
        } catch {
            // Keep local state if backend is unavailable.
        }
    }

    func reschedule(booking: Booking, to newDate: Date, time newTime: Date) {
        let calendar = Calendar.current
        let dateComponents = calendar.dateComponents([.year, .month, .day], from: newDate)
        let timeComponents = calendar.dateComponents([.hour, .minute], from: newTime)

        let combinedDate = calendar.date(
            from: DateComponents(
                year: dateComponents.year,
                month: dateComponents.month,
                day: dateComponents.day,
                hour: timeComponents.hour,
                minute: timeComponents.minute
            )
        ) ?? newDate

        if let index = upcomingBookings.firstIndex(of: booking) {
            let updated = Booking(
                id: upcomingBookings[index].id,
                backendBookingId: upcomingBookings[index].backendBookingId,
                service: upcomingBookings[index].service,
                dateTime: combinedDate,
                address: upcomingBookings[index].address,
                city: upcomingBookings[index].city,
                latitude: upcomingBookings[index].latitude,
                longitude: upcomingBookings[index].longitude,
                addOns: upcomingBookings[index].addOns,
                totalPriceJOD: upcomingBookings[index].totalPriceJOD,
                createdAt: upcomingBookings[index].createdAt
            )
            upcomingBookings[index] = updated

            if let backendBookingId = updated.backendBookingId {
                Task {
                    try? await BackendClient.shared.rescheduleBooking(
                        backendBookingId: backendBookingId,
                        clientId: clientID,
                        dateTimeISO: combinedDate.ISO8601Format()
                    )
                }
            }
        }

        selectedDate = newDate
        selectedTime = newTime
    }

    private func mapBackendBookingToLocal(_ backend: BackendBookingRecord) -> Booking? {
        guard let date = ISO8601DateFormatter().date(from: backend.dateTimeISO) else {
            return nil
        }

        let category = ServiceCategory(rawValue: backend.serviceCategory) ?? .hair
        let service = MockData.serviceCards.first(where: { $0.title == backend.serviceTitle }) ?? ServiceCard(
            category: category,
            title: backend.serviceTitle,
            description: String(localized: "Synced from backend booking."),
            startingPriceJOD: backend.totalPriceJOD
        )

        let addOns = backend.addOns.map { ServiceAddOn(name: $0.name, priceJOD: $0.priceJOD) }
        let createdAt = ISO8601DateFormatter().date(from: backend.createdAtISO) ?? Date()

        return Booking(
            backendBookingId: backend.id,
            service: service,
            dateTime: date,
            address: backend.address,
            city: backend.city,
            latitude: backend.latitude,
            longitude: backend.longitude,
            addOns: addOns,
            totalPriceJOD: backend.totalPriceJOD,
            createdAt: createdAt
        )
    }

    func updateProfile(name: String? = nil, email: String? = nil, phoneNumber: String? = nil) {
        if let name { userProfile.name = name }
        if let email { userProfile.email = email }
        if let phoneNumber { userProfile.phoneNumber = phoneNumber }
    }

    func redeemPromoCode(_ code: String) -> String? {
        let trimmed = code.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !trimmed.isEmpty else {
            return String(localized: "Please enter a promo code.")
        }

        if trimmed == "glam15" {
            creditsBalance += 15
            return nil
        } else if trimmed == "beauty25" {
            creditsBalance += 25
            return nil
        }

        return String(localized: "Invalid promo code. Please try again.")
    }

    func logOut() {
        Task {
            await AuthService.shared.logout()
        }
        userProfile = .empty
        selectedService = nil
        selectedAddOns = []
        upcomingBookings = []
        creditsBalance = 0
        address = Self.addressPlaceholder
        selectedCity = MockData.defaultCity
        isLoggedIn = false
    }

    private func persistProfile() {
        if let data = try? JSONEncoder().encode(userProfile) {
            UserDefaults.standard.set(data, forKey: Self.profileDefaultsKey)
        }
    }

    private static func loadProfile() -> UserProfile {
        guard let data = UserDefaults.standard.data(forKey: profileDefaultsKey),
              let profile = try? JSONDecoder().decode(UserProfile.self, from: data) else {
            return .empty
        }
        return profile
    }

    private static func resolveClientID() -> String {
        let defaults = UserDefaults.standard
        if let existing = defaults.string(forKey: clientIDDefaultsKey), !existing.isEmpty {
            return existing
        }

        let value = UUID().uuidString
        defaults.set(value, forKey: clientIDDefaultsKey)
        return value
    }
}
