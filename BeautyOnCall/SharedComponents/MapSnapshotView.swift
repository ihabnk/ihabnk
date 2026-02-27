import MapKit
import SwiftUI

struct MapSnapshotView: View {
    let coordinate: CLLocationCoordinate2D
    var spanDelta: Double = 0.02
    var width: CGFloat = 360
    var height: CGFloat = 180

    @State private var snapshotImage: UIImage?
    @State private var isLoading = true

    var body: some View {
        ZStack {
            if let snapshotImage {
                Image(uiImage: snapshotImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: width, height: height)
                    .clipped()
            } else if isLoading {
                RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous)
                    .fill(AppTheme.Colors.divider.opacity(0.5))
                    .frame(width: width, height: height)
                    .overlay { ProgressView() }
            } else {
                RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous)
                    .fill(AppTheme.Colors.divider.opacity(0.3))
                    .frame(width: width, height: height)
                    .overlay {
                        Label(String(localized: "Map unavailable"), systemImage: "map")
                            .font(.caption)
                            .foregroundStyle(AppTheme.Colors.textSecondary)
                    }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
        .task(id: "\(coordinate.latitude),\(coordinate.longitude)") {
            await generateSnapshot()
        }
    }

    private func generateSnapshot() async {
        isLoading = true
        defer { isLoading = false }

        let options = MKMapSnapshotter.Options()
        options.region = MKCoordinateRegion(
            center: coordinate,
            span: MKCoordinateSpan(latitudeDelta: spanDelta, longitudeDelta: spanDelta)
        )
        options.size = CGSize(width: width * UIScreen.main.scale, height: height * UIScreen.main.scale)
        options.mapType = .standard

        let snapshotter = MKMapSnapshotter(options: options)

        do {
            let snapshot = try await snapshotter.start()
            let image = snapshot.image

            let renderer = UIGraphicsImageRenderer(size: image.size)
            let annotated = renderer.image { context in
                image.draw(at: .zero)

                let point = snapshot.point(for: coordinate)
                let pinSize: CGFloat = 12
                let rect = CGRect(
                    x: point.x - pinSize / 2,
                    y: point.y - pinSize / 2,
                    width: pinSize,
                    height: pinSize
                )
                UIColor.systemBlue.setFill()
                UIBezierPath(ovalIn: rect).fill()
                UIColor.white.setStroke()
                let stroke = UIBezierPath(ovalIn: rect)
                stroke.lineWidth = 2
                stroke.stroke()
            }

            snapshotImage = annotated
        } catch {
            snapshotImage = nil
        }
    }
}
