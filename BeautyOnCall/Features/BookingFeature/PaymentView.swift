import SwiftUI

struct PaymentView: View {
    @EnvironmentObject private var session: BookingSessionStore

    let booking: Booking

    @State private var isProcessing = false
    @State private var paymentFailed = false
    @State private var paymentSucceeded = false
    @State private var walletBalance: Double?
    @State private var errorMessage = ""

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.l) {
                orderSummaryCard
                walletPayOption
                applePayButton
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(String(localized: "Payment"))
        .navigationBarTitleDisplayMode(.inline)
        .task { await fetchWalletBalance() }
        .navigationDestination(isPresented: $paymentSucceeded) {
            BookingConfirmationView(booking: booking)
        }
        .alert(String(localized: "Payment Failed"), isPresented: $paymentFailed) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage.isEmpty
                 ? String(localized: "Payment failed, please try again.")
                 : errorMessage)
        }
        .allowsHitTesting(!isProcessing)
    }

    // MARK: - Order Summary

    private var orderSummaryCard: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
            Text(String(localized: "Order Summary"))
                .font(.title2.weight(.bold))

            summaryRow(
                label: String(localized: "Service"),
                value: booking.service.title
            )

            if let city = booking.city {
                summaryRow(label: String(localized: "Location"), value: city)
            }

            summaryRow(
                label: String(localized: "Date"),
                value: booking.dateTime.formatted(date: .abbreviated, time: .shortened)
            )

            if !booking.addOns.isEmpty {
                Divider()
                ForEach(booking.addOns) { addOn in
                    summaryRow(label: addOn.name, value: formatJOD(addOn.priceJOD))
                }
            }

            Divider()

            HStack {
                Text(String(localized: "Total"))
                    .font(.title3.weight(.bold))
                Spacer()
                Text(formatJOD(booking.totalPriceJOD))
                    .font(.title3.weight(.bold))
            }
        }
        .padding(AppTheme.Spacing.l)
        .background(AppTheme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
    }

    private func summaryRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(AppTheme.Colors.textSecondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
                .multilineTextAlignment(.trailing)
        }
        .font(.body)
    }

    // MARK: - Wallet Pay

    @ViewBuilder
    private var walletPayOption: some View {
        if let balance = walletBalance, balance >= booking.totalPriceJOD {
            Button {
                Task { await processPayment() }
            } label: {
                HStack(spacing: AppTheme.Spacing.xs) {
                    Image(systemName: "wallet.bifold")
                        .font(.title3)
                    Text(String(format: String(localized: "Pay with Credits (%@)"),
                                formatJOD(balance)))
                        .font(.body.weight(.semibold))
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppTheme.Spacing.m)
                .background(AppTheme.Colors.brandBlue)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.button, style: .continuous))
            }
            .buttonStyle(.plain)
            .disabled(isProcessing)
        }
    }

    // MARK: - Apple Pay Mock

    // TODO: Replace with real PKPaymentButton + HyperPay when merchant account is ready
    private var applePayButton: some View {
        Button {
            Task { await processPayment() }
        } label: {
            HStack(spacing: 6) {
                if isProcessing {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: "applelogo")
                        .font(.title3)
                    Text("Pay")
                        .font(.title3.weight(.semibold))
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.m)
            .background(Color.black)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.button, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(isProcessing)
    }

    // MARK: - Payment Flow

    private func fetchWalletBalance() async {
        do {
            let response: WalletResponse = try await APIClient.shared.request(
                path: "/wallet/me",
                method: "GET"
            )
            walletBalance = response.data.balance
        } catch {
            walletBalance = nil
        }
    }

    private func processPayment() async {
        guard let bookingId = booking.backendBookingId else {
            errorMessage = String(localized: "Booking has not been synced with the server yet.")
            paymentFailed = true
            return
        }

        isProcessing = true
        defer { isProcessing = false }

        do {
            let checkoutResponse: CheckoutResponse = try await APIClient.shared.request(
                path: "/payments/checkout",
                method: "POST",
                body: CheckoutBody(bookingId: bookingId)
            )

            try await Task.sleep(for: .seconds(1.5))

            let confirmResponse: ConfirmResponse = try await APIClient.shared.request(
                path: "/payments/confirm",
                method: "POST",
                body: ConfirmBody(checkoutId: checkoutResponse.data.checkoutId)
            )

            if confirmResponse.data.success {
                paymentSucceeded = true
            } else {
                errorMessage = String(localized: "Payment failed, please try again.")
                paymentFailed = true
            }
        } catch let error as APIError {
            errorMessage = error.localizedDescription
            paymentFailed = true
        } catch {
            errorMessage = error.localizedDescription
            paymentFailed = true
        }
    }
}

// MARK: - Booking Confirmation

struct BookingConfirmationView: View {
    @EnvironmentObject private var session: BookingSessionStore

    let booking: Booking

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xl) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundStyle(.green)

            Text(String(localized: "Booking Confirmed!"))
                .font(.system(size: 28, weight: .bold, design: .rounded))

            VStack(spacing: AppTheme.Spacing.s) {
                Text(booking.service.title)
                    .font(.title3.weight(.semibold))

                Text(booking.dateTime.formatted(date: .abbreviated, time: .shortened))
                    .font(.body)
                    .foregroundStyle(AppTheme.Colors.textSecondary)

                Text(formatJOD(booking.totalPriceJOD))
                    .font(.title3.weight(.bold))
            }
            .padding(AppTheme.Spacing.l)
            .frame(maxWidth: .infinity)
            .background(AppTheme.Colors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))

            Spacer()

            Text(String(localized: "Your professional will be notified shortly."))
                .font(.body)
                .foregroundStyle(AppTheme.Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(AppTheme.Spacing.l)
        .background(AppTheme.Colors.pageBackground)
        .navigationBarBackButtonHidden(true)
    }
}

// MARK: - API Models

private struct CheckoutBody: Encodable {
    let bookingId: String
}

private struct ConfirmBody: Encodable {
    let checkoutId: String
}

private struct CheckoutResponse: Decodable {
    let data: CheckoutData
    struct CheckoutData: Decodable {
        let checkoutId: String
        let amount: Double
        let currency: String
    }
}

private struct ConfirmResponse: Decodable {
    let data: ConfirmData
    struct ConfirmData: Decodable {
        let success: Bool
        let transactionId: String
    }
}

private struct WalletResponse: Decodable {
    let data: WalletData
    struct WalletData: Decodable {
        let balance: Double
        let currency: String
    }
}
