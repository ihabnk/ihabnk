import SwiftUI
import UIKit

struct PlaceholderAssetImage: View {
    let imageName: String
    let fallbackSystemName: String

    var body: some View {
        if let uiImage = UIImage(named: imageName) {
            Image(uiImage: uiImage)
                .resizable()
                .scaledToFill()
        } else {
            ZStack {
                LinearGradient(
                    colors: [
                        AppTheme.Colors.brandBlue.opacity(0.85),
                        AppTheme.Colors.accentCoral.opacity(0.6)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                Image(systemName: fallbackSystemName)
                    .font(.system(size: 42, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.85))
            }
        }
    }
}
