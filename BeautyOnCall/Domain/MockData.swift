import Foundation

enum MockData {
    static let defaultCity = "Amman"

    static let offers: [OfferCard] = [
        OfferCard(
            title: "Blowout",
            subtitle: "From sleek lengths to beachy waves, your best hair day awaits.",
            discountLabel: "JOD 10 OFF",
            rating: 4.9,
            startingPriceJOD: 45,
            imageName: "offer-hair"
        ),
        OfferCard(
            title: "Makeup",
            subtitle: "Put your best face forward with day or night makeup by our pros.",
            discountLabel: "JOD 12 OFF",
            rating: 4.8,
            startingPriceJOD: 65,
            imageName: "offer-makeup"
        ),
        OfferCard(
            title: "Bridal Trial",
            subtitle: "A consultation with your bridal-certified beauty pro.",
            discountLabel: "JOD 15 OFF",
            rating: 4.9,
            startingPriceJOD: 90,
            imageName: "offer-weddings"
        )
    ]

    static let homeExploreTiles: [ExploreCategoryTile] = [
        ExploreCategoryTile(title: "Hair", category: .hair, imageName: "explore-hair"),
        ExploreCategoryTile(title: "Makeup", category: .makeup, imageName: "explore-makeup"),
        ExploreCategoryTile(title: "Weddings", category: .weddings, imageName: "explore-weddings"),
        ExploreCategoryTile(title: "Events", category: .events, imageName: "explore-events"),
        ExploreCategoryTile(title: "Bundles", category: nil, imageName: "explore-bundles"),
        ExploreCategoryTile(title: "Gift Cards", category: nil, imageName: "explore-gifts")
    ]

    static let serviceCards: [ServiceCard] = [
        ServiceCard(
            category: .hair,
            title: "Blowout",
            description: "From sleek lengths to beachy waves, your best hair day awaits.",
            durationMinutes: 45,
            startingPriceJOD: 45,
            imageName: "service-hair-blowout"
        ),
        ServiceCard(
            category: .hair,
            title: "Silk Press",
            description: "Achieve smooth, glossy hair from roots to ends.",
            durationMinutes: 75,
            startingPriceJOD: 65,
            imageName: "service-hair-silkpress"
        ),
        ServiceCard(
            category: .hair,
            title: "Dry Styling",
            description: "Skip the shower and revive your look with a fresh style.",
            durationMinutes: 30,
            startingPriceJOD: 35,
            imageName: "service-hair-dry"
        ),
        ServiceCard(
            category: .makeup,
            title: "Soft Glam",
            description: "Natural glow makeup for daytime events and meetings.",
            durationMinutes: 45,
            startingPriceJOD: 55,
            imageName: "service-makeup-soft"
        ),
        ServiceCard(
            category: .makeup,
            title: "Full Glam",
            description: "High-impact glam with defined eyes and long-wear finish.",
            durationMinutes: 60,
            startingPriceJOD: 70,
            imageName: "service-makeup-full"
        ),
        ServiceCard(
            category: .weddings,
            title: "Bridal Hair Trial",
            description: "Consultation and styling trial with your bridal beauty pro.",
            durationMinutes: 90,
            startingPriceJOD: 90,
            imageName: "service-wedding-trial"
        ),
        ServiceCard(
            category: .weddings,
            title: "Bridal Makeup",
            description: "Wedding day glam customized to your look and venue.",
            durationMinutes: 90,
            startingPriceJOD: 120,
            imageName: "service-wedding-makeup"
        ),
        ServiceCard(
            category: .events,
            title: "Group Glam",
            description: "For small groups looking for polished hair and makeup.",
            durationMinutes: nil,
            startingPriceJOD: 0,
            imageName: "service-event-group"
        ),
        ServiceCard(
            category: .events,
            title: "Private Events",
            description: "For groups needing customized beauty experiences.",
            durationMinutes: nil,
            startingPriceJOD: 0,
            imageName: "service-event-private"
        ),
        ServiceCard(
            category: .events,
            title: "Corporate Events",
            description: "Elevated beauty services for teams, clients, and VIPs.",
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
                    ServiceAddOn(name: "Extra Volume", priceJOD: 6),
                    ServiceAddOn(name: "Iron Curls", priceJOD: 8)
                ]
            case .makeup:
                addOns = [
                    ServiceAddOn(name: "Lashes", priceJOD: 10),
                    ServiceAddOn(name: "Touch-Up Kit", priceJOD: 7)
                ]
            case .weddings:
                addOns = [
                    ServiceAddOn(name: "Veil Placement", priceJOD: 12),
                    ServiceAddOn(name: "Second Look", priceJOD: 25)
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
        AccountItem(kind: .name, title: "Name"),
        AccountItem(kind: .email, title: "Email"),
        AccountItem(kind: .phoneNumber, title: "Phone Number"),
        AccountItem(kind: .changePassword, title: "Change Password"),
        AccountItem(kind: .deleteAccount, title: "Delete Account")
    ]

    static let bundlePackages: [BundlePackage] = [
        BundlePackage(title: "5 Blowouts + 5 Makeup Applications", discountLabel: "10% Off", valueLabel: "(JOD 500 value)", priceJOD: 450),
        BundlePackage(title: "10 Blowouts + 10 Makeup Applications", discountLabel: "15% Off", valueLabel: "(JOD 1,000 value)", priceJOD: 850)
    ]

    static let giftOptions: [GiftOption] = [
        GiftOption(title: "E-Gift Cards", subtitle: "JOD 30, JOD 50, JOD 75, JOD 100 or custom"),
        GiftOption(title: "Packages", subtitle: "Gift our signature services at preferred prices")
    ]

    static let inviteSummary = InviteSummary(
        headline: "Give a friend JOD 15 to try BeautyOnCall and get JOD 15 credit when they book.",
        inviteCodeLabel: "Invite Code",
        inviteCode: "beautyoncall2026",
        creditBalance: 0,
        invitesDescription: "You haven't invited anyone yet."
    )

    static let creditSummary = CreditSummary(
        headline: "No Credits",
        packageHint: "Save up to 20% with packages.",
        inviteHint: "Invite friends and earn credits.",
        redeemRowTitle: "+ Redeem Promo or Gift Code"
    )

    static func services(for category: ServiceCategory) -> [ServiceCard] {
        serviceCards.filter { $0.category == category }
    }
}
