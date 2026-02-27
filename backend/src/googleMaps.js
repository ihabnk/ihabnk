import { config } from "./config.js";

class GoogleMapsConfigError extends Error {}

function requireApiKey() {
  if (!config.googleMapsApiKey) {
    throw new GoogleMapsConfigError("GOOGLE_MAPS_API_KEY is missing");
  }
}

async function fetchGoogle(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Maps request failed with status ${response.status}`);
  }

  const json = await response.json();
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(`Google Maps error: ${json.status}`);
  }

  return json;
}

function extractCity(addressComponents = []) {
  const locality = addressComponents.find((component) => component.types?.includes("locality"));
  if (locality?.long_name) {
    return locality.long_name;
  }

  const adminArea = addressComponents.find((component) => component.types?.includes("administrative_area_level_1"));
  return adminArea?.long_name ?? null;
}

export async function reverseGeocode({ latitude, longitude, language = "en" }) {
  requireApiKey();
  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: config.googleMapsApiKey,
    language
  });

  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const json = await fetchGoogle(url);

  if (!json.results?.length) {
    return null;
  }

  const first = json.results[0];
  return {
    address: first.formatted_address,
    city: extractCity(first.address_components),
    placeId: first.place_id,
    latitude: first.geometry?.location?.lat ?? latitude,
    longitude: first.geometry?.location?.lng ?? longitude
  };
}

export async function autocompletePlace({ input, language = "en", country }) {
  requireApiKey();
  const params = new URLSearchParams({
    input,
    key: config.googleMapsApiKey,
    language
  });

  if (country) {
    params.set("components", `country:${country}`);
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
  const json = await fetchGoogle(url);

  return (json.predictions ?? []).map((item) => ({
    placeId: item.place_id,
    description: item.description
  }));
}

export async function getPlaceDetails({ placeId, language = "en" }) {
  requireApiKey();
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "formatted_address,address_component,geometry,place_id,name",
    key: config.googleMapsApiKey,
    language
  });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
  const json = await fetchGoogle(url);

  const result = json.result;
  if (!result) {
    return null;
  }

  return {
    placeId: result.place_id,
    name: result.name,
    address: result.formatted_address,
    city: extractCity(result.address_components),
    latitude: result.geometry?.location?.lat,
    longitude: result.geometry?.location?.lng
  };
}

export { GoogleMapsConfigError };
