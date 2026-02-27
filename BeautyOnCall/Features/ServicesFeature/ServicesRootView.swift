import SwiftUI

struct ServicesRootView: View {
    @EnvironmentObject private var session: BookingSessionStore

    @State private var path: [ServicesRoute] = []
    @State private var isShowingDateSheet = false

    private var filteredServices: [ServiceCard] {
        MockData.services(for: session.selectedCategory)
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.s) {
                    ForEach(filteredServices) { service in
                        Button {
                            session.setSelectedService(service)
                            if let detail = MockData.serviceDetails[service.id] {
                                path.append(.serviceDetail(detail))
                            }
                        } label: {
                            ServiceCardView(service: service)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.l)
                .padding(.vertical, AppTheme.Spacing.s)
            }
            .background(AppTheme.Colors.pageBackground)
            .safeAreaInset(edge: .top, spacing: 0) {
                VStack(spacing: 0) {
                    TopLocationBar(city: session.selectedCity)
                    CategoryPillBar(selection: $session.selectedCategory)
                }
            }
            .navigationDestination(for: ServicesRoute.self) { route in
                switch route {
                case .serviceDetail(let detail):
                    ServiceDetailView(detail: detail) {
                        isShowingDateSheet = true
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
}

private struct ServiceDetailView: View {
    @EnvironmentObject private var session: BookingSessionStore

    let detail: ServiceDetail
    let onChooseDate: () -> Void

    @State private var isShowingBookingAlert = false
    @State private var bookingAlertMessage: String = ""
    @State private var isConfirmingBooking = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                if let imageName = detail.serviceCard.imageName {
                    PlaceholderAssetImage(imageName: imageName, fallbackSystemName: "wand.and.rays")
                        .frame(height: 260)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
                }

                VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                    Text(detail.serviceCard.title)
                        .font(.system(size: 62, weight: .bold, design: .rounded))

                    Text(detail.longDescription)
                        .font(.title2)
                        .foregroundStyle(AppTheme.Colors.textSecondary)

                    if let duration = detail.serviceCard.durationMinutes {
                        Text(String(format: String(localized: "Duration: %d mins"), duration))
                            .font(.title3)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }

                    Text(String(format: String(localized: "Starting at %@"), formatJOD(detail.serviceCard.startingPriceJOD)))
                        .font(.title2.weight(.semibold))
                }

                if !detail.addOns.isEmpty {
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                        Text("Add-ons")
                            .font(.title2.weight(.bold))

                        ForEach(detail.addOns) { addOn in
                            Toggle(isOn: Binding(
                                get: { session.selectedAddOns.contains(addOn) },
                                set: { _ in session.toggleAddOn(addOn) }
                            )) {
                                HStack {
                                    Text(addOn.name)
                                        .font(.title3)
                                    Spacer()
                                    Text(String(format: String(localized: "+%@"), formatJOD(addOn.priceJOD)))
                                        .font(.title3)
                                        .foregroundStyle(AppTheme.Colors.textSecondary)
                                }
                            }
                            .toggleStyle(.switch)
                        }
                    }
                    .padding(AppTheme.Spacing.m)
                    .background(AppTheme.Colors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
                }

                VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                    Text("Selected date")
                        .font(.title3)
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                    Text(session.selectedDateTime.formatted(date: .abbreviated, time: .shortened))
                        .font(.title2.weight(.semibold))
                }

                PrimaryCTAButton(title: String(localized: "Choose Date & Time")) {
                    onChooseDate()
                }

                HStack {
                    Text("Total")
                        .font(.title2.weight(.bold))
                    Spacer()
                    Text(formatJOD(session.bookingTotalJOD))
                        .font(.title2.weight(.bold))
                }

                PrimaryCTAButton(title: isConfirmingBooking ? String(localized: "Syncing booking...") : String(localized: "Confirm Booking")) {
                    guard !isConfirmingBooking else {
                        return
                    }

                    isConfirmingBooking = true
                    Task {
                        bookingAlertMessage = await session.confirmAndSyncCurrentBooking()
                        isShowingBookingAlert = true
                        isConfirmingBooking = false
                    }
                }
                .disabled(isConfirmingBooking)
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(detail.serviceCard.category.localizedTitle)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            session.setSelectedService(detail.serviceCard)
        }
        .alert("Booking", isPresented: $isShowingBookingAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(bookingAlertMessage)
        }
    }
}
