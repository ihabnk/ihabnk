// Using OpenStreetMap Nominatim - free, no API key required

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "BeautyOnCall/1.0";
const ROAD_DISTANCE_FACTOR = 1.3;
const AVG_CITY_SPEED_KMH = 30;

export async function geocodeAddress(address) {
  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Nominatim geocode failed: ${response.status}`);
  }

  const results = await response.json();

  if (!results.length) {
    return null;
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    displayName: results[0].display_name,
  };
}

export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
  });

  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Nominatim reverse geocode failed: ${response.status}`);
  }

  const result = await response.json();

  return {
    displayName: result.display_name ?? "",
    city:
      result.address?.city ??
      result.address?.town ??
      result.address?.village ??
      null,
    country: result.address?.country ?? null,
  };
}

export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  const estimatedRoad = straightLine * ROAD_DISTANCE_FACTOR;
  const estimatedMinutes = (estimatedRoad / AVG_CITY_SPEED_KMH) * 60;

  return {
    straightLineKm: Math.round(straightLine * 100) / 100,
    estimatedRoadKm: Math.round(estimatedRoad * 100) / 100,
    estimatedMinutes: Math.round(estimatedMinutes),
  };
}
