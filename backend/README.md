# BeautyOnCall Backend

This backend provides:
- Google Maps geolocation APIs (reverse geocode, autocomplete, place details)
- Booking persistence (SQLite)

## 1) Setup

```bash
cd backend
cp .env.example .env
npm install
```

Set your `.env` values:
- `GOOGLE_MAPS_API_KEY`: server-side Google Maps key with Geocoding API + Places API enabled
- `PORT`: default `8080`

## 2) Run

```bash
npm run dev
```

## 3) Endpoints

- `GET /health`
- `GET /api/location/reverse-geocode?lat=31.95&lng=35.91&language=ar`
- `GET /api/location/autocomplete?input=amman&language=ar&country=jo`
- `GET /api/location/place-details?placeId=...&language=ar`
- `POST /api/bookings`
- `GET /api/bookings?clientId=...`
- `PATCH /api/bookings/:id/reschedule`

## Notes

- SQLite DB file is stored at `backend/data/beautyoncall.db`.
- Keep your Google API key on the backend only.
