import SwiftUI

struct CategoryPillBar: View {
    @Binding var selection: ServiceCategory

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppTheme.Spacing.s) {
                ForEach(ServiceCategory.allCases) { category in
                    Button {
                        selection = category
                    } label: {
                        Text(category.localizedTitle)
                            .font(.title3.weight(.semibold))
                            .lineLimit(1)
                            .fixedSize(horizontal: true, vertical: false)
                            .padding(.horizontal, AppTheme.Spacing.m)
                            .padding(.vertical, AppTheme.Spacing.xs)
                            .foregroundStyle(selection == category ? AppTheme.Colors.brandBlue : .white)
                            .background(selection == category ? .white : .clear)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.pill, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, AppTheme.Spacing.l)
            .padding(.vertical, AppTheme.Spacing.s)
        }
        .background(AppTheme.Colors.brandBlue)
    }
}
