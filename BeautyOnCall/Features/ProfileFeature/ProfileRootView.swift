import SwiftUI
import UIKit

struct ProfileRootView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @State private var path: [ProfileRoute] = []

    var body: some View {
        NavigationStack(path: $path) {
            List {
                profileLink(title: "Account Details", route: .accountDetails)
                profileLink(title: "Credits", route: .credits)
                profileLink(title: "Invite Friends", route: .inviteFriends)
                profileLink(title: "Bundles", route: .bundles)
                profileLink(title: "Gifts", route: .gifts)
            }
            .listStyle(.plain)
            .navigationTitle("Profile")
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
                }
            }
            .background(AppTheme.Colors.pageBackground)
        }
    }

    private func profileLink(title: String, route: ProfileRoute) -> some View {
        Button {
            path.append(route)
        } label: {
            ProfileRowItem(title: title)
        }
        .buttonStyle(.plain)
    }
}

private struct AccountDetailsView: View {
    var body: some View {
        List {
            ForEach(MockData.accountItems) { item in
                HStack {
                    ProfileRowItem(
                        title: item.title,
                        tint: item.kind == .deleteAccount ? AppTheme.Colors.destructive : AppTheme.Colors.textPrimary
                    )
                }
            }
        }
        .listStyle(.plain)
        .navigationTitle("Account Details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct CreditsView: View {
    let summary = MockData.creditSummary

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
            Text(summary.headline)
                .font(.system(size: 64, weight: .bold, design: .rounded))

            VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                HStack(spacing: 4) {
                    Text(summary.packageHint)
                        .fontWeight(.semibold)
                    Text("Learn more.")
                        .foregroundStyle(AppTheme.Colors.accentCoral)
                }
                .font(.title2)

                HStack(spacing: 4) {
                    Text(summary.inviteHint)
                        .fontWeight(.semibold)
                    Text("Learn more.")
                        .foregroundStyle(AppTheme.Colors.accentCoral)
                }
                .font(.title2)
            }
            .foregroundStyle(AppTheme.Colors.textPrimary)

            Divider()
            Text(summary.redeemRowTitle)
                .font(.title2)
                .foregroundStyle(AppTheme.Colors.brandBlue)
            Divider()

            Spacer()
        }
        .padding(AppTheme.Spacing.l)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle("Credits")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct InviteFriendsView: View {
    @EnvironmentObject private var session: BookingSessionStore
    let summary = MockData.inviteSummary

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                Text(summary.headline)
                    .font(.system(size: 52, weight: .bold, design: .rounded))
                    .fixedSize(horizontal: false, vertical: true)

                HStack {
                    Text("\(summary.inviteCodeLabel):")
                    Text(session.inviteCode)
                        .fontWeight(.semibold)
                    Spacer()
                    Button("Copy") {
                        UIPasteboard.general.string = session.inviteCode
                    }
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.Colors.brandBlue)
                }
                .font(.title3)
                .padding(AppTheme.Spacing.s)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(AppTheme.Colors.divider, lineWidth: 1)
                )

                VStack(spacing: AppTheme.Spacing.m) {
                    Text("You have \(formatJOD(session.creditsBalance)) Credits")
                        .font(.system(size: 56, weight: .bold, design: .rounded))

                    Button {
                    } label: {
                        Text("Invite Friends")
                            .font(.title2.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppTheme.Spacing.m)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.Radius.button, style: .continuous)
                                    .stroke(AppTheme.Colors.divider, lineWidth: 2)
                            )
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(AppTheme.Colors.brandBlue)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                        Text("YOUR INVITES")
                            .font(.headline)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                        Divider()
                        Text(summary.invitesDescription)
                            .font(.title3)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
                }
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle("Invite Friends")
        .navigationBarTitleDisplayMode(.inline)
    }
}

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

                    Text("Bundle your beauty")
                        .font(.system(size: 64, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .padding(AppTheme.Spacing.l)
                        .shadow(radius: 4)
                }
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))

                Text("Our beauty packages are the perfect way to enjoy more of the signature services you love at amazing prices.")
                    .font(.title3)
                    .foregroundStyle(AppTheme.Colors.textSecondary)

                HStack {
                    Image(systemName: "mappin.and.ellipse")
                    Text(session.selectedCity)
                    Spacer()
                    Image(systemName: "chevron.down")
                }
                .font(.title2)
                .padding(AppTheme.Spacing.m)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(AppTheme.Colors.divider, lineWidth: 1)
                )

                HStack(spacing: AppTheme.Spacing.s) {
                    Button {
                        selectedBundleCategory = .hair
                    } label: {
                        Text("Hair + Makeup")
                            .font(.title3.weight(.medium))
                            .padding(.horizontal, AppTheme.Spacing.m)
                            .padding(.vertical, AppTheme.Spacing.xs)
                            .background(selectedBundleCategory == .hair ? AppTheme.Colors.brandBlue : .clear)
                            .foregroundStyle(selectedBundleCategory == .hair ? .white : AppTheme.Colors.textSecondary)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous)
                                    .stroke(AppTheme.Colors.divider, lineWidth: selectedBundleCategory == .hair ? 0 : 1)
                            )
                    }
                    .buttonStyle(.plain)

                    Button {
                        selectedBundleCategory = .makeup
                    } label: {
                        Text("Hair")
                            .font(.title3.weight(.medium))
                            .padding(.horizontal, AppTheme.Spacing.m)
                            .padding(.vertical, AppTheme.Spacing.xs)
                            .background(selectedBundleCategory == .makeup ? AppTheme.Colors.brandBlue : .clear)
                            .foregroundStyle(selectedBundleCategory == .makeup ? .white : AppTheme.Colors.textSecondary)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous)
                                    .stroke(AppTheme.Colors.divider, lineWidth: selectedBundleCategory == .makeup ? 0 : 1)
                            )
                    }
                    .buttonStyle(.plain)
                }

                ForEach(MockData.bundlePackages) { package in
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                        HStack(alignment: .top) {
                            Text(package.title)
                                .font(.title2.weight(.bold))
                            Spacer()
                            Text(formatJOD(package.priceJOD))
                                .font(.title.weight(.semibold))
                        }

                        HStack(spacing: AppTheme.Spacing.xs) {
                            Text(package.discountLabel)
                                .foregroundStyle(AppTheme.Colors.accentCoral)
                                .font(.title3.weight(.bold))
                            Text(package.valueLabel)
                                .font(.title3)
                                .foregroundStyle(AppTheme.Colors.textSecondary)
                        }

                        HStack {
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.title3.weight(.semibold))
                        }
                    }
                    .padding(.vertical, AppTheme.Spacing.s)
                    Divider()
                }

                Text("Learn more about packages")
                    .font(.title2.weight(.medium))
                    .foregroundStyle(AppTheme.Colors.brandBlue)
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle("Bundle")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct GiftsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.l) {
                ZStack(alignment: .bottomLeading) {
                    PlaceholderAssetImage(imageName: "gifts-hero", fallbackSystemName: "gift.fill")
                        .frame(height: 230)
                        .clipped()

                    Text("Give the Gift\nof Glam")
                        .font(.system(size: 64, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .padding(AppTheme.Spacing.l)
                        .shadow(radius: 4)
                }
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))

                Text("Our range of gifts are sure to brighten anyone's day. Whether the recipient is new to BeautyOnCall or a devoted client, it is easy to deliver a beautiful surprise.")
                    .font(.title3)
                    .foregroundStyle(AppTheme.Colors.textSecondary)

                ForEach(MockData.giftOptions) { option in
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                        HStack {
                            Text(option.title)
                                .font(.system(size: 56, weight: .bold, design: .rounded))
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.title2.weight(.semibold))
                        }

                        Text(option.subtitle)
                            .font(.title3)
                            .foregroundStyle(AppTheme.Colors.textSecondary)

                        Divider().padding(.top, AppTheme.Spacing.s)
                    }
                }
            }
            .padding(AppTheme.Spacing.l)
        }
        .background(AppTheme.Colors.pageBackground)
        .navigationTitle("Gifts")
        .navigationBarTitleDisplayMode(.inline)
    }
}
