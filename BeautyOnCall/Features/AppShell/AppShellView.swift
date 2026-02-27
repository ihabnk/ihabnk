import SwiftUI

struct AppShellView: View {
    @StateObject private var session = BookingSessionStore()
    @State private var selectedTab: AppTab = .home

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeRootView(selectedTab: $selectedTab)
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .tag(AppTab.home)

            ServicesRootView()
                .tabItem {
                    Label("Services", systemImage: "sparkles")
                }
                .tag(AppTab.services)

            AppointmentsRootView(selectedTab: $selectedTab)
                .tabItem {
                    Label("Appointments", systemImage: "calendar")
                }
                .tag(AppTab.appointments)

            ProfileRootView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(AppTab.profile)
        }
        .tint(AppTheme.Colors.brandBlue)
        .environmentObject(session)
        .task {
            await session.refreshUpcomingBookingsFromBackend()
        }
    }
}
