import SwiftUI

struct TopLocationBar: View {
    let city: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xs) {
            Image(systemName: "mappin.and.ellipse")
                .font(.title3)
            Text("BeautyOnCall in")
            Text(city)
                .foregroundStyle(AppTheme.Colors.accentCoral)
            Spacer()
        }
        .font(.title3.weight(.semibold))
        .foregroundStyle(.white)
        .padding(.horizontal, AppTheme.Spacing.l)
        .padding(.top, AppTheme.Spacing.l)
        .padding(.bottom, AppTheme.Spacing.m)
        .background(AppTheme.Colors.brandBlue)
    }
}
