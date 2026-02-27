import SwiftUI

struct DateTimeSelectionSheet: View {
    @Environment(\.dismiss) private var dismiss

    @State private var selectedDate: Date
    @State private var selectedHour: Double
    @State private var weekOffset: Int = 0

    private let maxWeekOffset: Int = 7

    let onConfirm: (Date, Date) -> Void

    init(initialDate: Date, initialTime: Date, onConfirm: @escaping (Date, Date) -> Void) {
        _selectedDate = State(initialValue: initialDate)

        let hour = Double(Calendar.current.component(.hour, from: initialTime))
        let minute = Double(Calendar.current.component(.minute, from: initialTime))
        _selectedHour = State(initialValue: hour + (minute / 60.0))

        self.onConfirm = onConfirm
    }

    private var weekDays: [Date] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let clampedOffset = min(max(weekOffset, 0), maxWeekOffset)
        let start = calendar.date(byAdding: .day, value: clampedOffset * 7, to: today) ?? today
        return (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }

    private var selectedTime: Date {
        let hour = Int(selectedHour)
        let minutes = Int((selectedHour - Double(hour)) * 60)
        return Calendar.current.date(bySettingHour: hour, minute: minutes, second: 0, of: selectedDate) ?? selectedDate
    }

    private var arrivalWindowText: String {
        let start = selectedTime.formatted(date: .omitted, time: .shortened)
        let endDate = Calendar.current.date(byAdding: .minute, value: 15, to: selectedTime) ?? selectedTime
        let end = endDate.formatted(date: .omitted, time: .shortened)
        return String(format: String(localized: "Your beauty pro will arrive between %@ and %@."), start, end)
    }

    var body: some View {
        VStack(spacing: AppTheme.Spacing.l) {
            Capsule()
                .fill(AppTheme.Colors.divider)
                .frame(width: 60, height: 6)
                .padding(.top, AppTheme.Spacing.s)

            Text("SELECT DATE & TIME")
                .font(.headline)
                .tracking(1)

            VStack(spacing: AppTheme.Spacing.xs) {
                HStack {
                    Image(systemName: "calendar")
                    Text(selectedDate.formatted(date: .complete, time: .omitted))
                        .font(.title2.weight(.semibold))
                    Spacer()
                }

                HStack {
                    Button {
                        if weekOffset > 0 {
                            weekOffset -= 1
                        }
                    } label: {
                        Image(systemName: "chevron.backward")
                            .font(.title3.weight(.semibold))
                    }

                    Spacer()
                    Text(String(format: String(localized: "Week %d"), min(max(weekOffset, 0), maxWeekOffset) + 1))
                        .font(.title3.weight(.medium))
                    Spacer()

                    Button {
                        if weekOffset < maxWeekOffset {
                            weekOffset += 1
                        }
                    } label: {
                        Image(systemName: "chevron.forward")
                            .font(.title3.weight(.semibold))
                    }
                }
                .foregroundStyle(AppTheme.Colors.brandBlue)

                HStack(spacing: AppTheme.Spacing.xs) {
                    ForEach(weekDays, id: \.self) { day in
                        let isSelected = Calendar.current.isDate(day, inSameDayAs: selectedDate)

                        Button {
                            selectedDate = day
                        } label: {
                            VStack(spacing: 4) {
                                Text(day.formatted(.dateTime.weekday(.narrow)))
                                Text(day.formatted(.dateTime.day()))
                            }
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppTheme.Spacing.s)
                            .background(isSelected ? AppTheme.Colors.brandBlue : .clear)
                            .foregroundStyle(isSelected ? .white : AppTheme.Colors.textSecondary)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(AppTheme.Colors.divider, lineWidth: isSelected ? 0 : 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            Divider()

            VStack(spacing: AppTheme.Spacing.s) {
                HStack(spacing: AppTheme.Spacing.s) {
                    Image(systemName: "clock")
                    Text(selectedTime.formatted(date: .omitted, time: .shortened))
                        .font(.largeTitle.weight(.bold))
                }

                Text(arrivalWindowText)
                    .font(.title3)
                    .foregroundStyle(AppTheme.Colors.textSecondary)
                    .multilineTextAlignment(.center)

                HStack {
                    Text("5 AM")
                    Slider(value: $selectedHour, in: 5...21, step: 0.5)
                        .tint(AppTheme.Colors.brandBlue)
                    Text("9 PM")
                }
                .font(.headline)
            }

            Spacer()

            PrimaryCTAButton(title: String(localized: "Confirm Date & Time")) {
                onConfirm(selectedDate, selectedTime)
                dismiss()
            }
            .padding(.bottom, AppTheme.Spacing.l)
        }
        .padding(.horizontal, AppTheme.Spacing.l)
        .background(AppTheme.Colors.cardBackground)
        .presentationDetents([.large])
    }
}
