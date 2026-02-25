import Foundation
import SwiftUI
import Combine

final class BookingSessionStore: ObservableObject {
    @Published var selectedCity: String
    @Published var address: String
    @Published var selectedCategory: ServiceCategory
    @Published var selectedService: ServiceCard?
    @Published var selectedDate: Date
    @Published var selectedTime: Date
    @Published var selectedAddOns: Set<ServiceAddOn>
    @Published var creditsBalance: Double
    @Published var inviteCode: String
    @Published var upcomingBookings: [Booking]

    init(
        selectedCity: String = MockData.defaultCity,
        address: String = "Add your address",
        selectedCategory: ServiceCategory = .hair,
        selectedService: ServiceCard? = nil,
        selectedDate: Date = Date(),
        selectedTime: Date = Calendar.current.date(bySettingHour: 17, minute: 0, second: 0, of: Date()) ?? Date(),
        selectedAddOns: Set<ServiceAddOn> = [],
        creditsBalance: Double = MockData.inviteSummary.creditBalance,
        inviteCode: String = MockData.inviteSummary.inviteCode,
        upcomingBookings: [Booking] = []
    ) {
        self.selectedCity = selectedCity
        self.address = address
        self.selectedCategory = selectedCategory
        self.selectedService = selectedService
        self.selectedDate = selectedDate
        self.selectedTime = selectedTime
        self.selectedAddOns = selectedAddOns
        self.creditsBalance = creditsBalance
        self.inviteCode = inviteCode
        self.upcomingBookings = upcomingBookings
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

    var nextBooking: Booking? {
        upcomingBookings.sorted { $0.dateTime < $1.dateTime }.first
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
            return "Please select a service before booking."
        }

        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedAddress.isEmpty || trimmedAddress == "Add your address" {
            return "Please add your address before booking."
        }

        let now = Date()
        if selectedDateTime < now {
            return "Please choose a future date and time."
        }

        let booking = Booking(
            service: service,
            dateTime: selectedDateTime,
            address: trimmedAddress,
            addOns: Array(selectedAddOns),
            totalPriceJOD: bookingTotalJOD
        )

        upcomingBookings.append(booking)
        return nil
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
                service: upcomingBookings[index].service,
                dateTime: combinedDate,
                address: upcomingBookings[index].address,
                addOns: upcomingBookings[index].addOns,
                totalPriceJOD: upcomingBookings[index].totalPriceJOD,
                createdAt: upcomingBookings[index].createdAt
            )
            upcomingBookings[index] = updated
        }

        selectedDate = newDate
        selectedTime = newTime
    }
}
