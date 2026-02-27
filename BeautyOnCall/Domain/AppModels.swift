import Foundation

enum AppTab: Hashable {
    case home
    case services
    case appointments
    case profile
}

enum ServiceCategory: String, CaseIterable, Identifiable, Hashable {
    case hair = "Hair"
    case makeup = "Makeup"
    case weddings = "Weddings"
    case events = "Events"

    var id: String { rawValue }

    var localizedTitle: String {
        switch self {
        case .hair:
            return String(localized: "Hair")
        case .makeup:
            return String(localized: "Makeup")
        case .weddings:
            return String(localized: "Weddings")
        case .events:
            return String(localized: "Events")
        }
    }
}

struct ServiceAddOn: Identifiable, Hashable {
    let id: UUID
    let name: String
    let priceJOD: Double

    init(id: UUID = UUID(), name: String, priceJOD: Double) {
        self.id = id
        self.name = name
        self.priceJOD = priceJOD
    }
}

struct OfferCard: Identifiable, Hashable {
    let id: UUID
    let title: String
    let subtitle: String
    let discountLabel: String
    let rating: Double
    let startingPriceJOD: Double
    let imageName: String

    init(
        id: UUID = UUID(),
        title: String,
        subtitle: String,
        discountLabel: String,
        rating: Double,
        startingPriceJOD: Double,
        imageName: String
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.discountLabel = discountLabel
        self.rating = rating
        self.startingPriceJOD = startingPriceJOD
        self.imageName = imageName
    }
}

struct ServiceCard: Identifiable, Hashable {
    let id: UUID
    let category: ServiceCategory
    let title: String
    let description: String
    let durationMinutes: Int?
    let startingPriceJOD: Double
    let imageName: String?

    init(
        id: UUID = UUID(),
        category: ServiceCategory,
        title: String,
        description: String,
        durationMinutes: Int? = nil,
        startingPriceJOD: Double,
        imageName: String? = nil
    ) {
        self.id = id
        self.category = category
        self.title = title
        self.description = description
        self.durationMinutes = durationMinutes
        self.startingPriceJOD = startingPriceJOD
        self.imageName = imageName
    }
}

struct ServiceDetail: Identifiable, Hashable {
    let id: UUID
    let serviceCard: ServiceCard
    let longDescription: String
    let addOns: [ServiceAddOn]
}

struct BundlePackage: Identifiable, Hashable {
    let id: UUID
    let title: String
    let discountLabel: String
    let valueLabel: String
    let priceJOD: Double

    init(id: UUID = UUID(), title: String, discountLabel: String, valueLabel: String, priceJOD: Double) {
        self.id = id
        self.title = title
        self.discountLabel = discountLabel
        self.valueLabel = valueLabel
        self.priceJOD = priceJOD
    }
}

struct GiftOption: Identifiable, Hashable {
    let id: UUID
    let title: String
    let subtitle: String

    init(id: UUID = UUID(), title: String, subtitle: String) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
    }
}

struct InviteSummary: Hashable {
    let headline: String
    let inviteCodeLabel: String
    let inviteCode: String
    let creditBalance: Double
    let invitesDescription: String
}

struct CreditSummary: Hashable {
    let headline: String
    let packageHint: String
    let inviteHint: String
    let redeemRowTitle: String
}

struct AccountItem: Identifiable, Hashable {
    enum Kind: Hashable {
        case name
        case email
        case phoneNumber
        case changePassword
        case deleteAccount
    }

    let id: UUID
    let kind: Kind
    let title: String

    init(id: UUID = UUID(), kind: Kind, title: String) {
        self.id = id
        self.kind = kind
        self.title = title
    }
}

struct ExploreCategoryTile: Identifiable, Hashable {
    let id: UUID
    let title: String
    let category: ServiceCategory?
    let imageName: String

    init(id: UUID = UUID(), title: String, category: ServiceCategory?, imageName: String) {
        self.id = id
        self.title = title
        self.category = category
        self.imageName = imageName
    }
}

struct UserProfile: Codable, Hashable {
    var name: String
    var email: String
    var phoneNumber: String

    static let empty = UserProfile(name: "", email: "", phoneNumber: "")

    var initials: String {
        let parts = name.split(separator: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts.last!.prefix(1) : ""
        let result = "\(first)\(last)".uppercased()
        return result.isEmpty ? "?" : result
    }

    var isComplete: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !email.trimmingCharacters(in: .whitespaces).isEmpty
    }
}

struct Booking: Identifiable, Hashable {
    let id: UUID
    let backendBookingId: String?
    let service: ServiceCard
    let dateTime: Date
    let address: String
    let city: String?
    let latitude: Double?
    let longitude: Double?
    let addOns: [ServiceAddOn]
    let totalPriceJOD: Double
    let createdAt: Date

    init(
        id: UUID = UUID(),
        backendBookingId: String? = nil,
        service: ServiceCard,
        dateTime: Date,
        address: String,
        city: String? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil,
        addOns: [ServiceAddOn],
        totalPriceJOD: Double,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.backendBookingId = backendBookingId
        self.service = service
        self.dateTime = dateTime
        self.address = address
        self.city = city
        self.latitude = latitude
        self.longitude = longitude
        self.addOns = addOns
        self.totalPriceJOD = totalPriceJOD
        self.createdAt = createdAt
    }
}
