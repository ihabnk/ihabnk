import SwiftUI

struct OfferCarouselCard: View {
    let offer: OfferCard

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            PlaceholderAssetImage(imageName: offer.imageName, fallbackSystemName: "sparkles")
                .frame(height: 200)
                .clipped()

            VStack(alignment: .leading, spacing: AppTheme.Spacing.s) {
                HStack(alignment: .top) {
                    Text(offer.title)
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                        .lineLimit(1)
                    Spacer()
                    HStack(spacing: 6) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(AppTheme.Colors.accentCoral)
                        Text(String(format: "%.1f", offer.rating))
                    }
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.Colors.textSecondary)
                }

                Text(offer.subtitle)
                    .font(.title3)
                    .foregroundStyle(AppTheme.Colors.textSecondary)
                    .lineLimit(2)

                HStack(spacing: AppTheme.Spacing.s) {
                    Text(offer.discountLabel)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, AppTheme.Spacing.s)
                        .padding(.vertical, AppTheme.Spacing.xs)
                        .background(AppTheme.Colors.accentCoral)

                    Text("Starting at \(formatJOD(offer.startingPriceJOD))")
                        .font(.title3.weight(.medium))
                }
            }
            .padding(AppTheme.Spacing.m)
            .background(AppTheme.Colors.cardBackground)
        }
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
    }
}
