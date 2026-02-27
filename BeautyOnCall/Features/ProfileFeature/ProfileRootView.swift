import SwiftUI
import UIKit

struct ProfileRootView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @State private var path: [ProfileRoute] = []
    @State private var isShowingLogOutAlert = false

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(spacing: 0) {
                    profileHeader

                    VStack(spacing: 0) {
                        profileLink(title: String(localized: "Account Details"), icon: "person.text.rectangle", route: .accountDetails)
                        profileLink(title: String(localized: "Booking History"), icon: "clock.arrow.circlepath", route: .bookingHistory)
                        profileLink(title: String(localized: "Credits"), icon: "creditcard", route: .credits)
                        profileLink(title: String(localized: "Invite Friends"), icon: "person.2", route: .inviteFriends)
                        profileLink(title: String(localized: "Bundles"), icon: "gift", route: .bundles)
                        profileLink(title: String(localized: "Gifts"), icon: "giftcard", route: .gifts)
                        profileLink(title: String(localized: "Settings"), icon: "gearshape", route: .settings)
                    }
                    .padding(.horizontal, AppTheme.Spacing.l)

                    logOutButton
                }
                .padding(.bottom, AppTheme.Spacing.xl)
            }
            .background(AppTheme.Colors.pageBackground)
            .navigationTitle(String(localized: "Profile"))
            .navigationDestination(for: ProfileRoute.self) { route in
                switch route {
                case .accountDetails:
                    AccountDetailsView()
                case .credits:
                    CreditsView()
                case .inviteFriends:
                    InviteFriendsView()
                case .bundles:
                    BundlesView()
                case .gifts:
                    GiftsView()
                case .bookingHistory:
                    BookingHistoryView()
                case .settings:
                    SettingsView()
                }
            }
            .alert(String(localized: "Log Out"), isPresented: $isShowingLogOutAlert) {
                Button(String(localized: "Log Out"), role: .destructive) {
                    session.logOut()
                }
                Button(String(localized: "Cancel"), role: .cancel) { }
            } message: {
                Text(String(localized: "Are you sure you want to log out? Your local booking data will be cleared."))
            }
        }
    }

    // MARK: - Header

    private var profileHeader: some View {
        VStack(spacing: AppTheme.Spacing.s) {
            ZStack {
                Circle()
                    .fill(AppTheme.Colors.brandBlue)
                    .frame(width: 80, height: 80)

                Text(session.userProfile.initials)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }

            if session.userProfile.isComplete {
                Text(session.userProfile.name)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.Colors.textPrimary)

                Text(session.userProfile.email)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.Colors.textSecondary)
            } else {
                Text(String(localized: "Complete your profile"))
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.Colors.accentCoral)
            }

            if session.creditsBalance > 0 {
                Text(String(format: String(localized: "%@ credits"), formatJOD(session.creditsBalance)))
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(AppTheme.Colors.brandBlue)
                    .padding(.horizontal, AppTheme.Spacing.s)
                    .padding(.vertical, AppTheme.Spacing.xxs)
                    .background(AppTheme.Colors.brandBlue.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppTheme.Spacing.xl)
    }

    // MARK: - Row

    private func profileLink(title: String, icon: String, route: ProfileRoute) -> some View {
        Button {
            path.append(route)
        } label: {
            HStack(spacing: AppTheme.Spacing.s) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(AppTheme.Colors.brandBlue)
                    .frame(width: 28)

                Text(title)
                    .font(.title3.weight(.medium))
                    .foregroundStyle(AppTheme.Colors.textPrimary)

                Spacer()

                Image(systemName: "chevron.forward")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.Colors.textSecondary)
            }
            .padding(.vertical, AppTheme.Spacing.m)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Log Out

    private var logOutButton: some View {
        Button {
            isShowingLogOutAlert = true
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.title3)
                Text(String(localized: "Log Out"))
                    .font(.title3.weight(.medium))
            }
            .foregroundStyle(AppTheme.Colors.destructive)
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.m)
            .background(AppTheme.Colors.destructive.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, AppTheme.Spacing.l)
        .padding(.top, AppTheme.Spacing.xl)
    }
}

// MARK: - Account Details (Editable)

private struct AccountDetailsView: View {
    @EnvironmentObject private var session: BookingSessionStore

    @State private var editingName: String = ""
    @State private var editingEmail: String = ""
    @State private var editingPhone: String = ""
    @State private var isSaved = false
    @State private var isShowingDeleteAlert = false
    @State private var isShowingPasswordSheet = false

    var body: some View {
        Form {
            Section(String(localized: "Personal Information")) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(String(localized: "Name"))
                        .font(.caption)
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                    TextField(String(localized: "Full Name"), text: $editingName)
                        .textContentType(.name)
                        .textInputAutocapitalization(.words)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(String(localized: "Email"))
                        .font(.caption)
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                    TextField(String(localized: "Email Address"), text: $editingEmail)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(String(localized: "Phone Number"))
                        .font(.caption)
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                    TextField(String(localized: "Phone Number"), text: $editingPhone)
                        .textContentType(.telephoneNumber)
                        .keyboardType(.phonePad)
                }
            }

            Section {
                Button(String(localized: "Save Changes")) {
                    session.updateProfile(name: editingName, email: editingEmail, phoneNumber: editingPhone)
                    isSaved = true
                }
                .font(.body.weight(.semibold))
                .foregroundStyle(hasChanges ? AppTheme.Colors.brandBlue : AppTheme.Colors.textSecondary)
                .disabled(!hasChanges)
            }

            Section {
                Button(String(localized: "Change Password")) {
                    isShowingPasswordSheet = true
                }
                .foregroundStyle(AppTheme.Colors.brandBlue)
            }

            Section {
                Button(String(localized: "Delete Account"), role: .destructive) {
                    isShowingDeleteAlert = true
                }
            }
        }
        .navigationTitle(String(localized: "Account Details"))
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            editingName = session.userProfile.name
            editingEmail = session.userProfile.email
            editingPhone = session.userProfile.phoneNumber
        }
        .alert(String(localized: "Saved"), isPresented: $isSaved) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(String(localized: "Your profile has been updated."))
        }
        .alert(String(localized: "Delete Account"), isPresented: $isShowingDeleteAlert) {
            Button(String(localized: "Delete"), role: .destructive) {
                session.logOut()
            }
            Button(String(localized: "Cancel"), role: .cancel) { }
        } message: {
            Text(String(localized: "This will permanently delete your account and all associated data. This action cannot be undone."))
        }
        .sheet(isPresented: $isShowingPasswordSheet) {
            ChangePasswordSheet()
        }
    }

    private var hasChanges: Bool {
        editingName != session.userProfile.name ||
        editingEmail != session.userProfile.email ||
        editingPhone != session.userProfile.phoneNumber
    }
}

// MARK: - Change Password Sheet

private struct ChangePasswordSheet: View {
    @Environment(\.dismiss) private var dismiss

    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var errorMessage: String?
    @State private var isSuccess = false

    var body: some View {
        NavigationStack {
            Form {
                Section(String(localized: "Current Password")) {
                    SecureField(String(localized: "Current Password"), text: $currentPassword)
                }

                Section(String(localized: "New Password")) {
                    SecureField(String(localized: "New Password"), text: $newPassword)
                    SecureField(String(localized: "Confirm New Password"), text: $confirmPassword)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundStyle(AppTheme.Colors.destructive)
                    }
                }

                Section {
                    Button(String(localized: "Update Password")) {
                        validateAndSave()
                    }
                    .font(.body.weight(.semibold))
                    .foregroundStyle(canSubmit ? AppTheme.Colors.brandBlue : AppTheme.Colors.textSecondary)
                    .disabled(!canSubmit)
                }
            }
            .navigationTitle(String(localized: "Change Password"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "Cancel")) { dismiss() }
                }
            }
            .alert(String(localized: "Password Updated"), isPresented: $isSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text(String(localized: "Your password has been changed successfully."))
            }
        }
    }

    private var canSubmit: Bool {
        !currentPassword.isEmpty && newPassword.count >= 6 && !confirmPassword.isEmpty
    }

    private func validateAndSave() {
        guard newPassword == confirmPassword else {
            errorMessage = String(localized: "New passwords do not match.")
            return
        }
        guard newPassword.count >= 6 else {
            errorMessage = String(localized: "Password must be at least 6 characters.")
            return
        }
        errorMessage = nil
        isSuccess = true
    }
}

// MARK: - Booking History

private struct BookingHistoryView: View {
    @EnvironmentObject private var session: BookingSessionStore

    var body: some View {
        Group {
            if session.upcomingBookings.isEmpty {
                VStack(spacing: AppTheme.Spacing.m) {
                    Spacer()
                    Image(systemName: "calendar.badge.clock")
                        .font(.system(size: 48))
                        .foregroundStyle(AppTheme.Colors.textSecondary)

                    Text(String(localized: "No bookings yet"))
                        .font(.title2.weight(.bold))

                    Text(String(localized: "Your booking history will appear here once you've confirmed your first appointment."))
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, AppTheme.Spacing.xl)

                    Spacer()
                }
            } else {
                ScrollView {
                    VStack(spacing: AppTheme.Spacing.s) {
                        ForEach(session.upcomingBookings.sorted(by: { $0.dateTime > $1.dateTime })) { booking in
                            BookingHistoryCard(booking: booking)
                        }
                    }
                    .padding(AppTheme.Spacing.l)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(String(localized: "Booking History"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct BookingHistoryCard: View {
    let booking: Booking

    private var isPast: Bool {
        booking.dateTime < Date()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
            HStack {
                Text(booking.service.title)
                    .font(.title3.weight(.bold))
                Spacer()
                Text(isPast ? String(localized: "Past") : String(localized: "Upcoming"))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(isPast ? AppTheme.Colors.textSecondary : AppTheme.Colors.brandBlue)
                    .padding(.horizontal, AppTheme.Spacing.xs)
                    .padding(.vertical, 4)
                    .background(isPast ? AppTheme.Colors.divider : AppTheme.Colors.brandBlue.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
            }

            HStack(spacing: AppTheme.Spacing.s) {
                Label(booking.dateTime.formatted(date: .abbreviated, time: .shortened), systemImage: "calendar")
                Spacer()
                Label(booking.address, systemImage: "mappin")
                    .lineLimit(1)
            }
            .font(.subheadline)
            .foregroundStyle(AppTheme.Colors.textSecondary)

            if !booking.addOns.isEmpty {
                Text(booking.addOns.map(\.name).joined(separator: ", "))
                    .font(.caption)
                    .foregroundStyle(AppTheme.Colors.textSecondary)
            }

            HStack {
                Spacer()
                Text(formatJOD(booking.totalPriceJOD))
                    .font(.title3.weight(.bold))
                    .foregroundStyle(AppTheme.Colors.brandBlue)
            }
        }
        .padding(AppTheme.Spacing.m)
        .background(AppTheme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
    }
}

// MARK: - Credits (with Promo Code Redemption)

private struct CreditsView: View {
    @EnvironmentObject private var session: BookingSessionStore
    let summary = MockData.creditSummary

    @State private var promoCode = ""
    @State private var promoMessage: String?
    @State private var promoIsError = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(String(localized: "Your Balance"))
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.Colors.textSecondary)

                    Text(formatJOD(session.creditsBalance))
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundStyle(AppTheme.Colors.brandBlue)
                }

                VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                    HStack(spacing: 4) {
                        Text(summary.packageHint)
                            .fontWeight(.semibold)
                        Text(String(localized: "Learn more."))
                            .foregroundStyle(AppTheme.Colors.accentCoral)
                    }
                    .font(.subheadline)

                    HStack(spacing: 4) {
                        Text(summary.inviteHint)
                            .fontWeight(.semibold)
                        Text(String(localized: "Learn more."))
                            .foregroundStyle(AppTheme.Colors.accentCoral)
                    }
                    .font(.subheadline)
                }
                .foregroundStyle(AppTheme.Colors.textPrimary)

                Divider()

                VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                    Text(String(localized: "Redeem Promo or Gift Code"))
                        .font(.title3.weight(.semibold))

                    HStack(spacing: AppTheme.Spacing.xs) {
                        TextField(String(localized: "Enter code"), text: $promoCode)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .padding(AppTheme.Spacing.s)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(AppTheme.Colors.divider, lineWidth: 1)
                            )

                        Button(String(localized: "Redeem")) {
                            redeemCode()
                        }
                        .font(.body.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, AppTheme.Spacing.m)
                        .padding(.vertical, AppTheme.Spacing.s)
                        .background(promoCode.isEmpty ? AppTheme.Colors.textSecondary : AppTheme.Colors.brandBlue)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .disabled(promoCode.isEmpty)
                    }

                    if let promoMessage {
                        Text(promoMessage)
                            .font(.caption)
                            .foregroundStyle(promoIsError ? AppTheme.Colors.destructive : .green)
                    }
                }

                Divider()
                Spacer()
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(String(localized: "Credits"))
        .navigationBarTitleDisplayMode(.inline)
    }

    private func redeemCode() {
        if let error = session.redeemPromoCode(promoCode) {
            promoMessage = error
            promoIsError = true
        } else {
            promoMessage = String(localized: "Code redeemed successfully! Credits added.")
            promoIsError = false
            promoCode = ""
        }
    }
}

// MARK: - Invite Friends (with Share Sheet)

private struct InviteFriendsView: View {
    @EnvironmentObject private var session: BookingSessionStore
    let summary = MockData.inviteSummary

    @State private var isCopied = false
    @State private var isShowingShareSheet = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                Text(summary.headline)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .fixedSize(horizontal: false, vertical: true)

                HStack {
                    Text(String(format: String(localized: "%@:"), summary.inviteCodeLabel))
                    Text(session.inviteCode)
                        .fontWeight(.semibold)
                    Spacer()
                    Button(isCopied ? String(localized: "Copied!") : String(localized: "Copy")) {
                        UIPasteboard.general.string = session.inviteCode
                        isCopied = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            isCopied = false
                        }
                    }
                    .font(.body.weight(.semibold))
                    .foregroundStyle(isCopied ? .green : AppTheme.Colors.brandBlue)
                }
                .font(.subheadline)
                .padding(AppTheme.Spacing.s)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(AppTheme.Colors.divider, lineWidth: 1)
                )

                VStack(spacing: AppTheme.Spacing.m) {
                    Text(String(format: String(localized: "You have %@ Credits"), formatJOD(session.creditsBalance)))
                        .font(.system(size: 28, weight: .bold, design: .rounded))

                    Button {
                        isShowingShareSheet = true
                    } label: {
                        HStack(spacing: AppTheme.Spacing.xs) {
                            Image(systemName: "square.and.arrow.up")
                            Text(String(localized: "Share with Friends"))
                        }
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppTheme.Spacing.m)
                        .foregroundStyle(.white)
                        .background(AppTheme.Colors.brandBlue)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.button, style: .continuous))
                    }
                    .buttonStyle(.plain)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                        Text(String(localized: "YOUR INVITES"))
                            .font(.headline)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                        Divider()
                        Text(summary.invitesDescription)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(String(localized: "Invite Friends"))
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $isShowingShareSheet) {
            let shareText = String(
                format: String(localized: "Try BeautyOnCall! Use my invite code %@ and get JOD 15 off your first booking."),
                session.inviteCode
            )
            ShareSheet(items: [shareText])
        }
    }
}

private struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) { }
}

// MARK: - Settings

private struct SettingsView: View {
    @EnvironmentObject private var session: BookingSessionStore

    var body: some View {
        Form {
            Section(String(localized: "Notifications")) {
                Toggle(String(localized: "Push Notifications"), isOn: $session.notificationsEnabled)
                    .tint(AppTheme.Colors.brandBlue)
            }

            Section(String(localized: "About")) {
                HStack {
                    Text(String(localized: "Version"))
                    Spacer()
                    Text(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0")
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                }

                HStack {
                    Text(String(localized: "Build"))
                    Spacer()
                    Text(Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "1")
                        .foregroundStyle(AppTheme.Colors.textSecondary)
                }
            }

            Section {
                Link(destination: URL(string: "https://beautyoncall.com/terms")!) {
                    HStack {
                        Text(String(localized: "Terms of Service"))
                            .foregroundStyle(AppTheme.Colors.textPrimary)
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }

                Link(destination: URL(string: "https://beautyoncall.com/privacy")!) {
                    HStack {
                        Text(String(localized: "Privacy Policy"))
                            .foregroundStyle(AppTheme.Colors.textPrimary)
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }
            }
        }
        .navigationTitle(String(localized: "Settings"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Bundles

private struct BundlesView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @State private var selectedBundleCategory: ServiceCategory = .hair

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                ZStack(alignment: .bottomLeading) {
                    PlaceholderAssetImage(imageName: "bundle-hero", fallbackSystemName: "gift")
                        .frame(height: 230)
                        .clipped()

                    Text(String(localized: "Bundle your beauty"))
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .padding(AppTheme.Spacing.l)
                        .shadow(radius: 4)
                }
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))

                Text(String(localized: "Our beauty packages are the perfect way to enjoy more of the signature services you love at amazing prices."))
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.Colors.textSecondary)

                HStack {
                    Image(systemName: "mappin.and.ellipse")
                    Text(session.selectedCity)
                    Spacer()
                    Image(systemName: "chevron.down")
                }
                .font(.body)
                .padding(AppTheme.Spacing.m)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(AppTheme.Colors.divider, lineWidth: 1)
                )

                HStack(spacing: AppTheme.Spacing.s) {
                    bundleCategoryPill(String(localized: "Hair + Makeup"), isSelected: selectedBundleCategory == .hair) {
                        selectedBundleCategory = .hair
                    }
                    bundleCategoryPill(String(localized: "Hair"), isSelected: selectedBundleCategory == .makeup) {
                        selectedBundleCategory = .makeup
                    }
                }

                ForEach(MockData.bundlePackages) { package in
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                        HStack(alignment: .top) {
                            Text(package.title)
                                .font(.body.weight(.bold))
                            Spacer()
                            Text(formatJOD(package.priceJOD))
                                .font(.title3.weight(.semibold))
                        }

                        HStack(spacing: AppTheme.Spacing.xs) {
                            Text(package.discountLabel)
                                .foregroundStyle(AppTheme.Colors.accentCoral)
                                .font(.subheadline.weight(.bold))
                            Text(package.valueLabel)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.Colors.textSecondary)
                        }

                        HStack {
                            Spacer()
                            Image(systemName: "chevron.forward")
                                .font(.subheadline.weight(.semibold))
                        }
                    }
                    .padding(.vertical, AppTheme.Spacing.s)
                    Divider()
                }

                Text(String(localized: "Learn more about packages"))
                    .font(.body.weight(.medium))
                    .foregroundStyle(AppTheme.Colors.brandBlue)
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(String(localized: "Bundle"))
        .navigationBarTitleDisplayMode(.inline)
    }

    private func bundleCategoryPill(_ title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, AppTheme.Spacing.m)
                .padding(.vertical, AppTheme.Spacing.xs)
                .background(isSelected ? AppTheme.Colors.brandBlue : .clear)
                .foregroundStyle(isSelected ? .white : AppTheme.Colors.textSecondary)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous)
                        .stroke(AppTheme.Colors.divider, lineWidth: isSelected ? 0 : 1)
                )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Gifts

private struct GiftsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                ZStack(alignment: .bottomLeading) {
                    PlaceholderAssetImage(imageName: "gifts-hero", fallbackSystemName: "gift.fill")
                        .frame(height: 230)
                        .clipped()

                    Text(String(localized: "Give the Gift\nof Glam"))
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .padding(AppTheme.Spacing.l)
                        .shadow(radius: 4)
                }
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))

                Text(String(localized: "Our range of gifts are sure to brighten anyone's day. Whether the recipient is new to BeautyOnCall or a devoted client, it is easy to deliver a beautiful surprise."))
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.Colors.textSecondary)

                ForEach(MockData.giftOptions) { option in
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                        HStack {
                            Text(option.title)
                                .font(.title3.weight(.bold))
                            Spacer()
                            Image(systemName: "chevron.forward")
                                .font(.body.weight(.semibold))
                        }

                        Text(option.subtitle)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.Colors.textSecondary)

                        Divider().padding(.top, AppTheme.Spacing.s)
                    }
                }
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle(String(localized: "Gifts"))
        .navigationBarTitleDisplayMode(.inline)
    }
}
