import Foundation

enum MockData {
    static nonisolated(unsafe) let defaultCity = String(localized: "Amman")

    static let offers: [OfferCard] = [
        OfferCard(
            title: String(localized: "Blowout"),
            subtitle: String(localized: "From sleek lengths to beachy waves, your best hair day awaits."),
            discountLabel: String(localized: "JOD 10 OFF"),
            rating: 4.9,
            startingPriceJOD: 45,
            imageName: "offer-hair"
        ),
        OfferCard(
            title: String(localized: "Makeup"),
            subtitle: String(localized: "Put your best face forward with day or night makeup by our pros."),
            discountLabel: String(localized: "JOD 12 OFF"),
            rating: 4.8,
            startingPriceJOD: 65,
            imageName: "offer-makeup"
        ),
        OfferCard(
            title: String(localized: "Bridal Trial"),
            subtitle: String(localized: "A consultation with your bridal-certified beauty pro."),
            discountLabel: String(localized: "JOD 15 OFF"),
            rating: 4.9,
            startingPriceJOD: 90,
            imageName: "offer-weddings"
        )
    ]

    static let homeExploreTiles: [ExploreCategoryTile] = [
        ExploreCategoryTile(title: String(localized: "Hair"), category: .hair, imageName: "explore-hair"),
        ExploreCategoryTile(title: String(localized: "Makeup"), category: .makeup, imageName: "explore-makeup"),
        ExploreCategoryTile(title: String(localized: "Weddings"), category: .weddings, imageName: "explore-weddings"),
        ExploreCategoryTile(title: String(localized: "Events"), category: .events, imageName: "explore-events"),
        ExploreCategoryTile(title: String(localized: "Bundles"), category: nil, imageName: "explore-bundles"),
        ExploreCategoryTile(title: String(localized: "Gift Cards"), category: nil, imageName: "explore-gifts")
    ]

    static let serviceCards: [ServiceCard] = [
        ServiceCard(
            category: .hair,
            title: String(localized: "Blowout"),
            description: String(localized: "From sleek lengths to beachy waves, your best hair day awaits."),
            durationMinutes: 45,
            startingPriceJOD: 45,
            imageName: "service-hair-blowout"
        ),
        ServiceCard(
            category: .hair,
            title: String(localized: "Silk Press"),
            description: String(localized: "Achieve smooth, glossy hair from roots to ends."),
            durationMinutes: 75,
            startingPriceJOD: 65,
            imageName: "service-hair-silkpress"
        ),
        ServiceCard(
            category: .hair,
            title: String(localized: "Dry Styling"),
            description: String(localized: "Skip the shower and revive your look with a fresh style."),
            durationMinutes: 30,
            startingPriceJOD: 35,
            imageName: "service-hair-dry"
        ),
        ServiceCard(
            category: .makeup,
            title: String(localized: "Soft Glam"),
            description: String(localized: "Natural glow makeup for daytime events and meetings."),
            durationMinutes: 45,
            startingPriceJOD: 55,
            imageName: "service-makeup-soft"
        ),
        ServiceCard(
            category: .makeup,
            title: String(localized: "Full Glam"),
            description: String(localized: "High-impact glam with defined eyes and long-wear finish."),
            durationMinutes: 60,
            startingPriceJOD: 70,
            imageName: "service-makeup-full"
        ),
        ServiceCard(
            category: .weddings,
            title: String(localized: "Bridal Hair Trial"),
            description: String(localized: "Consultation and styling trial with your bridal beauty pro."),
            durationMinutes: 90,
            startingPriceJOD: 90,
            imageName: "service-wedding-trial"
        ),
        ServiceCard(
            category: .weddings,
            title: String(localized: "Bridal Makeup"),
            description: String(localized: "Wedding day glam customized to your look and venue."),
            durationMinutes: 90,
            startingPriceJOD: 120,
            imageName: "service-wedding-makeup"
        ),
        ServiceCard(
            category: .events,
            title: String(localized: "Group Glam"),
            description: String(localized: "For small groups looking for polished hair and makeup."),
            durationMinutes: nil,
            startingPriceJOD: 0,
            imageName: "service-event-group"
        ),
        ServiceCard(
            category: .events,
            title: String(localized: "Private Events"),
            description: String(localized: "For groups needing customized beauty experiences."),
            durationMinutes: nil,
            startingPriceJOD: 0,
            imageName: "service-event-private"
        ),
        ServiceCard(
            category: .events,
            title: String(localized: "Corporate Events"),
            description: String(localized: "Elevated beauty services for teams, clients, and VIPs."),
            durationMinutes: nil,
            startingPriceJOD: 0,
            imageName: "service-event-corporate"
        )
    ]

    static let serviceDetails: [UUID: ServiceDetail] = {
        let withAddOns = serviceCards.map { card in
            let addOns: [ServiceAddOn]
            switch card.category {
            case .hair:
                addOns = [
                    ServiceAddOn(name: String(localized: "Extra Volume"), priceJOD: 6),
                    ServiceAddOn(name: String(localized: "Iron Curls"), priceJOD: 8)
                ]
            case .makeup:
                addOns = [
                    ServiceAddOn(name: String(localized: "Lashes"), priceJOD: 10),
                    ServiceAddOn(name: String(localized: "Touch-Up Kit"), priceJOD: 7)
                ]
            case .weddings:
                addOns = [
                    ServiceAddOn(name: String(localized: "Veil Placement"), priceJOD: 12),
                    ServiceAddOn(name: String(localized: "Second Look"), priceJOD: 25)
                ]
            case .events:
                addOns = []
            }

            return ServiceDetail(
                id: card.id,
                serviceCard: card,
                longDescription: card.description,
                addOns: addOns
            )
        }

        return Dictionary(uniqueKeysWithValues: withAddOns.map { ($0.id, $0) })
    }()

    static let accountItems: [AccountItem] = [
        AccountItem(kind: .name, title: String(localized: "Name")),
        AccountItem(kind: .email, title: String(localized: "Email")),
        AccountItem(kind: .phoneNumber, title: String(localized: "Phone Number")),
        AccountItem(kind: .changePassword, title: String(localized: "Change Password")),
        AccountItem(kind: .deleteAccount, title: String(localized: "Delete Account"))
    ]

    static let bundlePackages: [BundlePackage] = [
        BundlePackage(title: String(localized: "5 Blowouts + 5 Makeup Applications"), discountLabel: String(localized: "10% Off"), valueLabel: String(localized: "(JOD 500 value)"), priceJOD: 450),
        BundlePackage(title: String(localized: "10 Blowouts + 10 Makeup Applications"), discountLabel: String(localized: "15% Off"), valueLabel: String(localized: "(JOD 1,000 value)"), priceJOD: 850)
    ]

    static let giftOptions: [GiftOption] = [
        GiftOption(title: String(localized: "E-Gift Cards"), subtitle: String(localized: "JOD 30, JOD 50, JOD 75, JOD 100 or custom")),
        GiftOption(title: String(localized: "Packages"), subtitle: String(localized: "Gift our signature services at preferred prices"))
    ]

    static nonisolated(unsafe) let inviteSummary = InviteSummary(
        headline: String(localized: "Give a friend JOD 15 to try BeautyOnCall and get JOD 15 credit when they book."),
        inviteCodeLabel: String(localized: "Invite Code"),
        inviteCode: "beautyoncall2026",
        creditBalance: 0,
        invitesDescription: String(localized: "You haven't invited anyone yet.")
    )

    static let creditSummary = CreditSummary(
        headline: String(localized: "No Credits"),
        packageHint: String(localized: "Save up to 20% with packages."),
        inviteHint: String(localized: "Invite friends and earn credits."),
        redeemRowTitle: String(localized: "+ Redeem Promo or Gift Code")
    )

    static func services(for category: ServiceCategory) -> [ServiceCard] {
        serviceCards.filter { $0.category == category }
    }
}
