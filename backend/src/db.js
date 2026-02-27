import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dataDir = path.resolve(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "beautyoncall.db");
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  service_title TEXT NOT NULL,
  service_category TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  latitude REAL,
  longitude REAL,
  date_time_iso TEXT NOT NULL,
  add_ons_json TEXT NOT NULL,
  total_price_jod REAL NOT NULL,
  created_at_iso TEXT NOT NULL,
  updated_at_iso TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date_time_iso);
`);

const insertBookingStmt = db.prepare(`
INSERT INTO bookings (
  id,
  client_id,
  service_title,
  service_category,
  address,
  city,
  latitude,
  longitude,
  date_time_iso,
  add_ons_json,
  total_price_jod,
  created_at_iso,
  updated_at_iso
) VALUES (
  @id,
  @clientId,
  @serviceTitle,
  @serviceCategory,
  @address,
  @city,
  @latitude,
  @longitude,
  @dateTimeISO,
  @addOnsJSON,
  @totalPriceJOD,
  @createdAtISO,
  @updatedAtISO
);
`);

const listBookingsStmt = db.prepare(`
SELECT
  id,
  client_id AS clientId,
  service_title AS serviceTitle,
  service_category AS serviceCategory,
  address,
  city,
  latitude,
  longitude,
  date_time_iso AS dateTimeISO,
  add_ons_json AS addOnsJSON,
  total_price_jod AS totalPriceJOD,
  created_at_iso AS createdAtISO,
  updated_at_iso AS updatedAtISO
FROM bookings
WHERE client_id = ?
ORDER BY date_time_iso ASC;
`);

const rescheduleStmt = db.prepare(`
UPDATE bookings
SET
  date_time_iso = @dateTimeISO,
  updated_at_iso = @updatedAtISO
WHERE id = @id AND client_id = @clientId;
`);

export function createBooking(payload) {
  insertBookingStmt.run(payload);
}

export function listBookingsByClientId(clientId) {
  return listBookingsStmt.all(clientId).map((row) => ({
    ...row,
    addOns: JSON.parse(row.addOnsJSON)
  }));
}

export function rescheduleBooking({ id, clientId, dateTimeISO, updatedAtISO }) {
  return rescheduleStmt.run({ id, clientId, dateTimeISO, updatedAtISO });
}
