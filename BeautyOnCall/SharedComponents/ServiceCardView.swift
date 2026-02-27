import SwiftUI

struct ServiceCardView: View {
    @Environment(\.layoutDirection) private var layoutDirection
    let service: ServiceCard

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
            if let imageName = service.imageName {
                PlaceholderAssetImage(imageName: imageName, fallbackSystemName: "wand.and.stars")
                    .frame(height: 170)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
            }

            Text(service.title)
                .font(.system(size: 36, weight: .bold))
                .minimumScaleFactor(0.85)
                .lineLimit(2)
                .multilineTextAlignment(layoutDirection == .rightToLeft ? .trailing : .leading)
                .frame(maxWidth: .infinity, alignment: layoutDirection == .rightToLeft ? .trailing : .leading)

            Text(service.description)
                .font(.title3)
                .foregroundStyle(AppTheme.Colors.textSecondary)
                .lineLimit(2)
                .multilineTextAlignment(layoutDirection == .rightToLeft ? .trailing : .leading)
                .frame(maxWidth: .infinity, alignment: layoutDirection == .rightToLeft ? .trailing : .leading)

            HStack(spacing: AppTheme.Spacing.s) {
                if let duration = service.durationMinutes {
                    HStack(spacing: 6) {
                        Image(systemName: "clock")
                        Text(String(format: String(localized: "%d min"), duration))
                    }
                    .font(.title3.weight(.medium))
                    .padding(.horizontal, AppTheme.Spacing.s)
                    .padding(.vertical, AppTheme.Spacing.xs)
                    .background(AppTheme.Colors.pageBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }

                if service.startingPriceJOD > 0 {
                    Text(String(format: String(localized: "Starting at %@"), formatJOD(service.startingPriceJOD)))
                        .font(.title3.weight(.medium))
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                } else {
                    Text("Learn more")
                        .font(.title3.weight(.semibold))
                }
            }
        }
        .padding(AppTheme.Spacing.m)
        .background(AppTheme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
    }
}
