import SwiftUI

struct ProfileRowItem: View {
    let title: String
    let tint: Color

    init(title: String, tint: Color = AppTheme.Colors.textPrimary) {
        self.title = title
        self.tint = tint
    }

    var body: some View {
        HStack {
            Text(title)
                .font(.title2.weight(.medium))
                .foregroundStyle(tint)
            Spacer()
            Image(systemName: "chevron.forward")
                .foregroundStyle(AppTheme.Colors.textPrimary)
                .font(.title3.weight(.semibold))
        }
        .padding(.vertical, AppTheme.Spacing.m)
    }
}
