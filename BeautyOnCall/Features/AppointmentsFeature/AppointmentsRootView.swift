import SwiftUI

struct AppointmentsRootView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @Binding var selectedTab: AppTab

    @State private var isShowingDateSheet = false
    @State private var bookingBeingRescheduled: Booking?

    private var nextBooking: Booking? {
        session.nextBooking
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                    Text("Appointments")
                        .font(.system(size: 56, weight: .bold, design: .rounded))

                    if let booking = nextBooking {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                            Text("Next appointment")
                                .font(.title2.weight(.semibold))
                                .foregroundStyle(AppTheme.Colors.textSecondary)

                            Text(booking.service.title)
                                .font(.title.weight(.bold))

                            appointmentRow(
                                title: "When",
                                value: booking.dateTime.formatted(date: .abbreviated, time: .shortened)
                            )
                            appointmentRow(title: "Address", value: booking.address)
                            appointmentRow(title: "Total", value: formatJOD(booking.totalPriceJOD))

                            PrimaryCTAButton(title: "Reschedule") {
                                bookingBeingRescheduled = booking
                                session.updateSchedule(date: booking.dateTime, time: booking.dateTime)
                                isShowingDateSheet = true
                            }
                        }
                        .padding(AppTheme.Spacing.l)
                        .background(AppTheme.Colors.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
                    } else {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                            Text("No appointment yet")
                                .font(.title.weight(.bold))
                            Text("Pick a service and choose your date to see it here.")
                                .font(.title3)
                                .foregroundStyle(AppTheme.Colors.textSecondary)

                            PrimaryCTAButton(title: "Explore Services") {
                                selectedTab = .services
                            }
                        }
                        .padding(AppTheme.Spacing.l)
                        .background(AppTheme.Colors.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
                    }
                }
                .padding(AppTheme.Spacing.l)
            }
            .background(AppTheme.Colors.pageBackground)
            .sheet(isPresented: $isShowingDateSheet) {
                DateTimeSelectionSheet(
                    initialDate: bookingBeingRescheduled?.dateTime ?? session.selectedDate,
                    initialTime: bookingBeingRescheduled?.dateTime ?? session.selectedTime
                ) { date, time in
                    if let booking = bookingBeingRescheduled {
                        session.reschedule(booking: booking, to: date, time: time)
                    } else {
                        session.updateSchedule(date: date, time: time)
                    }
                }
            }
        }
    }

    private func appointmentRow(title: String, value: String) -> some View {
        HStack {
            Text(title)
                .foregroundStyle(AppTheme.Colors.textSecondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
                .multilineTextAlignment(.trailing)
        }
        .font(.title3)
    }
}
