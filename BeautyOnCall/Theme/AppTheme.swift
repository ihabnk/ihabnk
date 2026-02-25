import SwiftUI

enum AppTheme {
    enum Colors {
        static let brandBlue = Color(red: 0.08, green: 0.18, blue: 0.66)
        static let accentCoral = Color(red: 0.96, green: 0.39, blue: 0.34)
        static let pageBackground = Color(red: 0.94, green: 0.93, blue: 0.92)
        static let cardBackground = Color.white
        static let textPrimary = Color.black
        static let textSecondary = Color(red: 0.38, green: 0.38, blue: 0.40)
        static let divider = Color(red: 0.86, green: 0.86, blue: 0.86)
        static let tileTint = Color(red: 0.97, green: 0.89, blue: 0.87)
        static let destructive = Color(red: 0.82, green: 0.11, blue: 0.18)
    }

    enum Radius {
        static let card: CGFloat = 16
        static let pill: CGFloat = 999
        static let button: CGFloat = 30
    }

    enum Spacing {
        static let xxs: CGFloat = 6
        static let xs: CGFloat = 10
        static let s: CGFloat = 14
        static let m: CGFloat = 18
        static let l: CGFloat = 24
        static let xl: CGFloat = 32
    }
}

func formatJOD(_ value: Double) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = "JOD"
    formatter.currencySymbol = "JOD "
    formatter.maximumFractionDigits = 0
    formatter.minimumFractionDigits = 0
    return formatter.string(from: NSNumber(value: value)) ?? "JOD \(Int(value))"
}
