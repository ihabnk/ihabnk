import SwiftUI

struct ServiceCardView: View {
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
                .font(.system(size: 42, weight: .bold, design: .rounded))
                .minimumScaleFactor(0.85)
                .lineLimit(2)

            Text(service.description)
                .font(.title3)
                .foregroundStyle(AppTheme.Colors.textSecondary)

            HStack(spacing: AppTheme.Spacing.s) {
                if let duration = service.durationMinutes {
                    HStack(spacing: 6) {
                        Image(systemName: "clock")
                        Text("\(duration) min")
                    }
                    .font(.title3.weight(.medium))
                    .padding(.horizontal, AppTheme.Spacing.s)
                    .padding(.vertical, AppTheme.Spacing.xs)
                    .background(AppTheme.Colors.pageBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }

                if service.startingPriceJOD > 0 {
                    Text("Starting at \(formatJOD(service.startingPriceJOD))")
                        .font(.title3.weight(.medium))
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
