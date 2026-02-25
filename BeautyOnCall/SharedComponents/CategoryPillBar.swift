import SwiftUI

struct CategoryPillBar: View {
    @Binding var selection: ServiceCategory

    var body: some View {
        HStack(spacing: AppTheme.Spacing.s) {
            ForEach(ServiceCategory.allCases) { category in
                Button {
                    selection = category
                } label: {
                    Text(category.rawValue)
                        .font(.title3.weight(.semibold))
                        .padding(.horizontal, AppTheme.Spacing.m)
                        .padding(.vertical, AppTheme.Spacing.xs)
                        .foregroundStyle(selection == category ? AppTheme.Colors.brandBlue : .white)
                        .background(selection == category ? .white : .clear)
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous))
                }
                .buttonStyle(.plain)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, AppTheme.Spacing.l)
        .padding(.vertical, AppTheme.Spacing.s)
        .background(AppTheme.Colors.brandBlue)
    }
}
