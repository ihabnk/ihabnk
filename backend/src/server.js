import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { createBooking, listBookingsByClientId, rescheduleBooking } from "./db.js";
import {
  autocompletePlace,
  getPlaceDetails,
  GoogleMapsConfigError,
  reverseGeocode
} from "./googleMaps.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: config.corsOrigin }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, nowISO: new Date().toISOString() });
});

app.get("/api/location/reverse-geocode", async (req, res) => {
  try {
    const latitude = Number.parseFloat(String(req.query.lat ?? ""));
    const longitude = Number.parseFloat(String(req.query.lng ?? ""));
    const language = String(req.query.language ?? "en");

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ error: "lat and lng query params are required" });
    }

    const result = await reverseGeocode({ latitude, longitude, language });
    if (!result) {
      return res.status(404).json({ error: "No address found for this coordinate" });
    }

    return res.json(result);
  } catch (error) {
    if (error instanceof GoogleMapsConfigError) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(502).json({ error: "Failed to reverse geocode location" });
  }
});

app.get("/api/location/autocomplete", async (req, res) => {
  try {
    const input = String(req.query.input ?? "").trim();
    const language = String(req.query.language ?? "en");
    const country = req.query.country ? String(req.query.country) : undefined;

    if (!input) {
      return res.status(400).json({ error: "input query param is required" });
    }

    const predictions = await autocompletePlace({ input, language, country });
    return res.json({ predictions });
  } catch (error) {
    if (error instanceof GoogleMapsConfigError) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(502).json({ error: "Failed to fetch autocomplete suggestions" });
  }
});

app.get("/api/location/place-details", async (req, res) => {
  try {
    const placeId = String(req.query.placeId ?? "").trim();
    const language = String(req.query.language ?? "en");

    if (!placeId) {
      return res.status(400).json({ error: "placeId query param is required" });
    }

    const details = await getPlaceDetails({ placeId, language });
    if (!details) {
      return res.status(404).json({ error: "Place not found" });
    }

    return res.json(details);
  } catch (error) {
    if (error instanceof GoogleMapsConfigError) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(502).json({ error: "Failed to fetch place details" });
  }
});

app.post("/api/bookings", (req, res) => {
  const {
    clientId,
    serviceTitle,
    serviceCategory,
    address,
    city,
    latitude,
    longitude,
    dateTimeISO,
    addOns,
    totalPriceJOD
  } = req.body ?? {};

  if (!clientId || !serviceTitle || !serviceCategory || !address || !dateTimeISO) {
    return res.status(400).json({
      error: "clientId, serviceTitle, serviceCategory, address, and dateTimeISO are required"
    });
  }

  const bookingId = crypto.randomUUID();
  const nowISO = new Date().toISOString();

  createBooking({
    id: bookingId,
    clientId,
    serviceTitle,
    serviceCategory,
    address,
    city: city ?? null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    dateTimeISO,
    addOnsJSON: JSON.stringify(Array.isArray(addOns) ? addOns : []),
    totalPriceJOD: Number.isFinite(totalPriceJOD) ? totalPriceJOD : 0,
    createdAtISO: nowISO,
    updatedAtISO: nowISO
  });

  return res.status(201).json({ bookingId, createdAtISO: nowISO });
});

app.get("/api/bookings", (req, res) => {
  const clientId = String(req.query.clientId ?? "").trim();
  if (!clientId) {
    return res.status(400).json({ error: "clientId query param is required" });
  }

  const bookings = listBookingsByClientId(clientId);
  return res.json({ bookings });
});

app.patch("/api/bookings/:id/reschedule", (req, res) => {
  const bookingId = String(req.params.id ?? "").trim();
  const clientId = String(req.body?.clientId ?? "").trim();
  const dateTimeISO = String(req.body?.dateTimeISO ?? "").trim();

  if (!bookingId || !clientId || !dateTimeISO) {
    return res.status(400).json({ error: "id, clientId and dateTimeISO are required" });
  }

  const updatedAtISO = new Date().toISOString();
  const info = rescheduleBooking({ id: bookingId, clientId, dateTimeISO, updatedAtISO });

  if (!info.changes) {
    return res.status(404).json({ error: "Booking not found" });
  }

  return res.json({ ok: true, updatedAtISO });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
});

app.listen(config.port, () => {
  console.log(`BeautyOnCall backend listening on :${config.port}`);
});
