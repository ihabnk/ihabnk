import SwiftUI

struct HomeRootView: View {
    @EnvironmentObject private var session: BookingSessionStore
    @Binding var selectedTab: AppTab

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
                        SimpleInfoView(title: tile.title, bodyText: "This flow is ready for your branded content and backend wiring.")
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
                    title: "Add your address",
                    subtitle: session.address == "Add your address" ? "Services vary by location." : session.address
                ) {
                    path.append(.address)
                }

                StepActionCard(
                    icon: "sparkles",
                    title: "Select your services",
                    subtitle: "Now for the fun part."
                ) {
                    selectedTab = .services
                }

                StepActionCard(
                    icon: "calendar",
                    title: "Choose date + time",
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
                trustPoint(icon: "medal", text: "Fully licensed hair and makeup artists")
                trustPoint(icon: "number.circle", text: "Averaging 7 years of experience")
                trustPoint(icon: "checkmark.seal", text: "Always background-checked")
            }

            PrimaryCTAButton(title: "Book Now") {
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
                                .font(.system(size: 52, weight: .bold, design: .rounded))
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

    var body: some View {
        Form {
            Section("Address") {
                TextField("Amman - Building, Street, Floor", text: $session.address)
                    .textInputAutocapitalization(.words)
            }

            Section("City") {
                TextField("City", text: $session.selectedCity)
                    .textInputAutocapitalization(.words)
            }
        }
        .navigationTitle("Add your address")
        .navigationBarTitleDisplayMode(.inline)
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
        .navigationTitle(category.rawValue)
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
