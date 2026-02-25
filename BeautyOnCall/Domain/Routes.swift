import Foundation

enum HomeRoute: Hashable {
    case address
    case exploreCategory(ExploreCategoryTile)
}

enum ServicesRoute: Hashable {
    case serviceDetail(ServiceDetail)
}

enum ProfileRoute: Hashable {
    case accountDetails
    case credits
    case inviteFriends
    case bundles
    case gifts
}
