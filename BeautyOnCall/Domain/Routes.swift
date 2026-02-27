import Foundation

enum HomeRoute: Hashable {
    case address
    case exploreCategory(ExploreCategoryTile)
}

enum ServicesRoute: Hashable {
    case serviceDetail(ServiceDetail)
    case payment(Booking)
}

enum ProfileRoute: Hashable {
    case accountDetails
    case credits
    case inviteFriends
    case bundles
    case gifts
    case bookingHistory
    case settings
}
