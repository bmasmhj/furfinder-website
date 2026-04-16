var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  default: () => db_default
});
import pg from "pg";
var pool, db_default;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL
    });
    pool.on("error", (err) => {
      console.error("Unexpected database error:", err);
    });
    db_default = pool;
  }
});

// server/push.ts
async function clearPushToken(userId, pushToken) {
  try {
    await _dbQuery(
      "UPDATE users SET push_token = NULL WHERE id = $1 AND push_token = $2",
      [userId, pushToken]
    );
    console.log(`[Push] Cleared stale token for user ${userId}`);
  } catch (err) {
    console.error("[Push] Failed to clear stale token:", err);
  }
}
async function checkPushReceipt(ticketId, userId, pushToken) {
  try {
    const res = await _fetch(EXPO_RECEIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ ids: [ticketId] })
    });
    if (!res.ok) return;
    const json = await res.json();
    const receipt = json?.data?.[ticketId];
    if (receipt?.status === "error") {
      const errorType = receipt?.details?.error;
      console.error(
        `[Push] Receipt error for ticket ${ticketId}: ${receipt.message} (${errorType})`
      );
      if (errorType && PERMANENT_ERRORS.has(errorType)) {
        await clearPushToken(userId, pushToken);
      }
    }
  } catch (err) {
    console.error("[Push] Receipt check error:", err);
  }
}
async function sendPushNotification(pushToken, userId, title, body, data) {
  if (!pushToken || !pushToken.startsWith("ExponentPushToken[")) return;
  let ticketId = null;
  for (let attempt = 1; attempt <= PUSH_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await _fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Encoding": "gzip, deflate"
        },
        body: JSON.stringify({
          to: pushToken,
          title,
          body,
          data: data || {},
          sound: "default",
          priority: "high"
        })
      });
      if (!res.ok) {
        throw new Error(`Expo push API HTTP ${res.status}`);
      }
      const json = await res.json();
      const tickets = Array.isArray(json?.data) ? json.data : [json?.data];
      const ticket = tickets[0];
      if (ticket?.status === "error") {
        const errorType = ticket?.details?.error;
        console.error(`[Push] Send error for user ${userId}: ${ticket.message} (${errorType})`);
        if (errorType && PERMANENT_ERRORS.has(errorType)) {
          await clearPushToken(userId, pushToken);
        }
        return;
      }
      if (ticket?.status === "ok" && ticket.id) {
        ticketId = ticket.id;
        console.log(`[Push] Sent to user ${userId}, ticket ${ticketId}`);
      }
      break;
    } catch (err) {
      console.error(
        `[Push] Attempt ${attempt}/${PUSH_MAX_ATTEMPTS} failed for user ${userId}:`,
        err
      );
      if (attempt < PUSH_MAX_ATTEMPTS) {
        await new Promise((resolve3) => setTimeout(resolve3, 1e3 * attempt));
      }
    }
  }
  if (ticketId) {
    const capturedTicketId = ticketId;
    const timer = setTimeout(() => {
      checkPushReceipt(capturedTicketId, userId, pushToken).catch(() => {
      });
    }, PUSH_RECEIPT_DELAY_MS);
    timer.unref();
  }
}
var PUSH_MAX_ATTEMPTS, PUSH_RECEIPT_DELAY_MS, EXPO_PUSH_URL, EXPO_RECEIPT_URL, PERMANENT_ERRORS, _dbQuery, _fetch;
var init_push = __esm({
  "server/push.ts"() {
    "use strict";
    init_db();
    PUSH_MAX_ATTEMPTS = 3;
    PUSH_RECEIPT_DELAY_MS = 3e4;
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    EXPO_RECEIPT_URL = "https://exp.host/--/api/v2/push/getReceipts";
    PERMANENT_ERRORS = /* @__PURE__ */ new Set(["DeviceNotRegistered", "InvalidCredentials"]);
    _dbQuery = async (sql, params) => {
      await db_default.query(sql, params);
    };
    _fetch = fetch;
  }
});

// server/batch-match.ts
var batch_match_exports = {};
__export(batch_match_exports, {
  batchRunning: () => batchRunning,
  lastRunResult: () => lastRunResult,
  runBatchMatch: () => runBatchMatch,
  scheduleBatchMatch: () => scheduleBatchMatch
});
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function getRowPhotos(row) {
  const uris = typeof row.photo_uris === "string" ? JSON.parse(row.photo_uris || "[]") : Array.isArray(row.photo_uris) ? row.photo_uris : [];
  const photos = uris.length > 0 ? uris : row.photo_uri ? [row.photo_uri] : [];
  return photos.filter((p) => p && (p.startsWith("data:") || p.startsWith("http")));
}
async function runBatchMatch() {
  if (batchRunning) {
    console.log("[BatchMatch] Already running \u2014 skipping");
    return { processed: 0, newMatches: 0, startedAt: (/* @__PURE__ */ new Date()).toISOString(), finishedAt: (/* @__PURE__ */ new Date()).toISOString() };
  }
  batchRunning = true;
  const startedAt = (/* @__PURE__ */ new Date()).toISOString();
  let processed = 0;
  let newMatches = 0;
  try {
    console.log("[BatchMatch] Starting run...");
    await db_default.query(`
      CREATE TABLE IF NOT EXISTS admin_match_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lost_report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
        found_report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
        confidence INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ,
        UNIQUE(lost_report_id, found_report_id)
      )
    `);
    const lostRows = await db_default.query(
      `SELECT id, pet_type, pet_name, breed, size, color, markings, description,
              latitude, longitude, location_name, last_seen_date, photo_uri, photo_uris, user_id
       FROM pet_reports
       WHERE status = 'lost'
         AND created_at > NOW() - INTERVAL '90 days'
       ORDER BY created_at DESC
       LIMIT $1`,
      [MAX_LOST_PER_RUN]
    );
    const foundRows = await db_default.query(
      `SELECT id, pet_type, pet_name, breed, size, color, markings, description,
              latitude, longitude, location_name, last_seen_date, photo_uri, photo_uris
       FROM pet_reports
       WHERE status = 'found'
         AND created_at > NOW() - INTERVAL '90 days'
       ORDER BY created_at DESC
       LIMIT $1`,
      [MAX_FOUND_POOL]
    );
    const lostReports = lostRows.rows;
    const foundReports = foundRows.rows;
    console.log(`[BatchMatch] ${lostReports.length} lost, ${foundReports.length} found`);
    for (const lost of lostReports) {
      const filterByRadius = (maxKm) => foundReports.filter((found) => {
        if (found.pet_type !== lost.pet_type) return false;
        if (lost.latitude && lost.longitude && found.latitude && found.longitude) {
          if (getDistance(lost.latitude, lost.longitude, found.latitude, found.longitude) > maxKm) {
            return false;
          }
        }
        return true;
      });
      let nearby = filterByRadius(PRIMARY_RADIUS_KM);
      let radiusUsed = PRIMARY_RADIUS_KM;
      if (nearby.length === 0) {
        nearby = filterByRadius(EXTENDED_RADIUS_KM);
        radiusUsed = EXTENDED_RADIUS_KM;
        if (nearby.length > 0) {
          console.log(`[BatchMatch] No candidates within ${PRIMARY_RADIUS_KM}km for "${lost.pet_name}" \u2014 expanding to ${EXTENDED_RADIUS_KM}km, found ${nearby.length}`);
        }
      }
      if (nearby.length === 0) continue;
      const existingResult = await db_default.query(
        `SELECT found_report_id FROM admin_match_queue WHERE lost_report_id = $1`,
        [lost.id]
      );
      const alreadyChecked = new Set(existingResult.rows.map((r) => r.found_report_id));
      const unprocessed = nearby.filter((f) => !alreadyChecked.has(f.id)).slice(0, CANDIDATES_PER_REPORT);
      if (unprocessed.length === 0) continue;
      processed++;
      const targetSummary = `LOST ${lost.pet_type.toUpperCase()} "${lost.pet_name}", breed: ${lost.breed}, size: ${lost.size}, color: ${lost.color}, markings: "${lost.markings}", location: ${lost.location_name}, date: ${lost.last_seen_date}, description: "${lost.description}"`;
      const radiusNote = radiusUsed > PRIMARY_RADIUS_KM ? ` [NOTE: No candidates found within ${PRIMARY_RADIUS_KM}km \u2014 these candidates are within the expanded ${radiusUsed}km search radius.]` : ` [Candidates are within ${radiusUsed}km.]`;
      const userContent = [
        { type: "text", text: `TARGET (LOST PET):
${targetSummary}
${radiusNote}` }
      ];
      for (const photo of getRowPhotos(lost).slice(0, 2)) {
        userContent.push({ type: "image_url", image_url: { url: photo, detail: "low" } });
      }
      for (let i = 0; i < unprocessed.length; i++) {
        const c = unprocessed[i];
        userContent.push({
          type: "text",
          text: `
CANDIDATE ${i + 1} (id: ${c.id}) \u2014 FOUND ${c.pet_type} "${c.pet_name || "unknown"}", breed: ${c.breed}, size: ${c.size}, color: ${c.color}, markings: "${c.markings}", location: ${c.location_name}, date: ${c.last_seen_date}`
        });
        for (const photo of getRowPhotos(c).slice(0, 1)) {
          userContent.push({ type: "image_url", image_url: { url: photo, detail: "low" } });
        }
      }
      try {
        return {
          processed,
          newMatches,
          startedAt,
          finishedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (err) {
        console.error(`[BatchMatch] AI error for lost report ${lost.id}:`, err);
        await new Promise((resolve3) => setTimeout(resolve3, AI_DELAY_MS));
      }
    }
    console.log(`[BatchMatch] Done. Processed ${processed}, new matches: ${newMatches}`);
    if (newMatches > 0) {
      const admins = await db_default.query(`SELECT id, push_token FROM users WHERE role = 'admin'`);
      const title = `${newMatches} probable pet match${newMatches !== 1 ? "es" : ""} found`;
      const message = `The automated scan found ${newMatches} new potential match${newMatches !== 1 ? "es" : ""} to review in your admin panel.`;
      for (const admin of admins.rows) {
        try {
          await db_default.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'ai_match', $2, $3)`,
            [admin.id, title, message]
          );
          sendPushNotification(admin.push_token, admin.id, title, message, {
            type: "admin_batch_match"
          }).catch((err) => console.error("[BatchMatch] Push error:", err));
        } catch (err) {
          console.error("[BatchMatch] Admin notify error:", err);
        }
      }
    }
  } catch (err) {
    console.error("[BatchMatch] Fatal error:", err);
  } finally {
    batchRunning = false;
  }
  const finishedAt = (/* @__PURE__ */ new Date()).toISOString();
  lastRunResult = { processed, newMatches, startedAt, finishedAt };
  return lastRunResult;
}
function scheduleBatchMatch() {
  function msUntil3am() {
    const now = /* @__PURE__ */ new Date();
    const next3am = /* @__PURE__ */ new Date();
    next3am.setHours(3, 0, 0, 0);
    if (next3am <= now) next3am.setDate(next3am.getDate() + 1);
    return next3am.getTime() - now.getTime();
  }
  function scheduleNext() {
    const ms = msUntil3am();
    const nextRun = new Date(Date.now() + ms);
    console.log(`[BatchMatch] Scheduled daily run at ${nextRun.toISOString()}`);
    setTimeout(() => {
      runBatchMatch().then((r) => console.log("[BatchMatch] Daily run result:", r)).catch((err) => console.error("[BatchMatch] Daily run failed:", err)).finally(scheduleNext);
    }, ms).unref();
  }
  scheduleNext();
}
var PRIMARY_RADIUS_KM, EXTENDED_RADIUS_KM, MAX_LOST_PER_RUN, MAX_FOUND_POOL, CANDIDATES_PER_REPORT, AI_DELAY_MS, lastRunResult, batchRunning;
var init_batch_match = __esm({
  "server/batch-match.ts"() {
    "use strict";
    init_db();
    init_push();
    PRIMARY_RADIUS_KM = 10;
    EXTENDED_RADIUS_KM = 50;
    MAX_LOST_PER_RUN = 40;
    MAX_FOUND_POOL = 300;
    CANDIDATES_PER_REPORT = 10;
    AI_DELAY_MS = 1500;
    lastRunResult = null;
    batchRunning = false;
  }
});

// server/production-seed.ts
var production_seed_exports = {};
__export(production_seed_exports, {
  runProductionSeed: () => runProductionSeed
});
import bcrypt2 from "bcryptjs";
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function jitter(base, rangeKm) {
  return base + (Math.random() - 0.5) * 2 * rangeKm / 111;
}
function getBreed(petType) {
  switch (petType) {
    case "dog":
      return rand(DOG_BREEDS);
    case "cat":
      return rand(CAT_BREEDS);
    case "bird":
      return rand(BIRD_BREEDS);
    case "rabbit":
      return rand(RABBIT_BREEDS);
    default:
      return "Mixed";
  }
}
function getName(petType) {
  switch (petType) {
    case "dog":
      return rand(DOG_NAMES);
    case "cat":
      return rand(CAT_NAMES);
    case "bird":
      return rand(BIRD_NAMES);
    case "rabbit":
      return rand(RABBIT_NAMES);
    default:
      return rand(OTHER_NAMES);
  }
}
function randomDate(daysAgo) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().split("T")[0];
}
function generateReferralCode2() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
async function ensureUser(email, password, display_name, phone, role) {
  const existing = await db_default.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    await db_default.query("UPDATE users SET role = $1 WHERE email = $2", [role, email.toLowerCase()]);
    return existing.rows[0].id;
  }
  const passwordHash = await bcrypt2.hash(password, 10);
  const result = await db_default.query(
    `INSERT INTO users (email, password_hash, display_name, phone, consent_privacy, consent_terms, consent_ai, consent_data_storage, consent_date, role, referral_code)
     VALUES ($1, $2, $3, $4, true, true, true, true, NOW(), $5, $6)
     RETURNING id`,
    [email.toLowerCase(), passwordHash, display_name, phone, role, generateReferralCode2()]
  );
  return result.rows[0].id;
}
async function runProductionSeed() {
  try {
    const reportCount = await db_default.query("SELECT COUNT(*) FROM pet_reports");
    const count = parseInt(reportCount.rows[0].count);
    const reviewUserId = await ensureUser(REVIEW_EMAIL, REVIEW_PASSWORD, REVIEW_DISPLAY_NAME, REVIEW_PHONE, "user");
    console.log(`[Seed] Review user ready: ${REVIEW_EMAIL} (id: ${reviewUserId})`);
    const adminUserId = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME, "", "admin");
    console.log(`[Seed] Admin user ready: ${ADMIN_EMAIL} (id: ${adminUserId})`);
    const profileCount = await db_default.query("SELECT COUNT(*) FROM pet_profiles WHERE user_id = $1", [reviewUserId]);
    if (parseInt(profileCount.rows[0].count) === 0) {
      await db_default.query(
        `INSERT INTO pet_profiles (user_id, pet_type, pet_name, breed, size, color, markings, suburb, owner_name, owner_phone)
         VALUES ($1, 'dog', 'Buddy', 'Golden Retriever', 'large', 'golden', 'white chest', 'Bondi', $2, $3),
                ($1, 'cat', 'Mittens', 'Domestic Shorthair', 'medium', 'grey', 'white paws', 'Bondi', $2, $3)`,
        [reviewUserId, REVIEW_DISPLAY_NAME, REVIEW_PHONE]
      );
      console.log("[Seed] Created 2 pet profiles for review user");
    }
    if (count >= 50) {
      console.log(`[Seed] Already have ${count} reports \u2014 skipping report seed.`);
      return;
    }
    const needed = 100 - count;
    console.log(`[Seed] Seeding ${needed} pet reports...`);
    const values = [];
    const placeholders = [];
    let idx = 1;
    const userIds = [reviewUserId];
    for (let i = 0; i < 4; i++) {
      const fakeId = await ensureUser(
        `testuser${i + 1}@thefurfinder.com`,
        "TestUser2026!",
        ["Sarah Mitchell", "James Cooper", "Emily Watson", "David Chen"][i],
        `040000000${i + 1}`,
        "user"
      );
      userIds.push(fakeId);
    }
    for (let i = 0; i < needed; i++) {
      const petType = rand(PET_TYPES);
      const status = rand(["lost", "found"]);
      const area = rand(AREAS);
      const userId = rand(userIds);
      values.push(
        userId,
        status,
        petType,
        getName(petType),
        getBreed(petType),
        rand(SIZES),
        rand(COLORS),
        rand(MARKINGS),
        rand(DESCRIPTIONS),
        jitter(area.lat, 5),
        jitter(area.lng, 5),
        area.name,
        randomDate(60),
        JSON.stringify([])
      );
      placeholders.push(
        `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
      );
    }
    await db_default.query(
      `INSERT INTO pet_reports (user_id, status, pet_type, pet_name, breed, size, color, markings, description, latitude, longitude, location_name, last_seen_date, photo_uris)
       VALUES ${placeholders.join(",")}`,
      values
    );
    console.log(`[Seed] Inserted ${needed} pet reports. Total: ${count + needed}`);
  } catch (err) {
    console.error("[Seed] Production seed error:", err);
  }
}
var REVIEW_EMAIL, REVIEW_PASSWORD, REVIEW_DISPLAY_NAME, REVIEW_PHONE, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME, PET_TYPES, DOG_BREEDS, CAT_BREEDS, BIRD_BREEDS, RABBIT_BREEDS, SIZES, COLORS, MARKINGS, DOG_NAMES, CAT_NAMES, BIRD_NAMES, RABBIT_NAMES, OTHER_NAMES, AREAS, DESCRIPTIONS;
var init_production_seed = __esm({
  "server/production-seed.ts"() {
    "use strict";
    init_db();
    REVIEW_EMAIL = "googlereview@thefurfinder.com";
    REVIEW_PASSWORD = "PetReunite2026Review!";
    REVIEW_DISPLAY_NAME = "App Reviewer";
    REVIEW_PHONE = "0400000000";
    ADMIN_EMAIL = "admin@thefurfinder.com";
    ADMIN_PASSWORD = "FurFinderAdmin2026!";
    ADMIN_DISPLAY_NAME = "Fur Finder Admin";
    PET_TYPES = ["dog", "dog", "dog", "cat", "cat", "cat", "bird", "rabbit", "other"];
    DOG_BREEDS = ["Labrador", "Golden Retriever", "German Shepherd", "Bulldog", "Poodle", "Beagle", "Kelpie", "Border Collie", "Cavalier King Charles", "Staffordshire Bull Terrier"];
    CAT_BREEDS = ["Domestic Shorthair", "Tabby", "Siamese", "Ragdoll", "Bengal", "Maine Coon", "Burmese", "British Shorthair"];
    BIRD_BREEDS = ["Budgerigar", "Cockatiel", "Galah", "Rainbow Lorikeet"];
    RABBIT_BREEDS = ["Dwarf", "Lop", "Rex", "Holland Lop"];
    SIZES = ["small", "medium", "large"];
    COLORS = ["black", "white", "brown", "grey", "golden", "cream", "orange", "black and white", "tricolor", "ginger"];
    MARKINGS = ["", "white chest", "white paws", "spotted", "striped tail", "white blaze on face", "tan eyebrows", ""];
    DOG_NAMES = ["Max", "Bella", "Charlie", "Luna", "Buddy", "Daisy", "Rocky", "Molly", "Bear", "Coco", "Jack", "Poppy", "Duke", "Ruby", "Archie", "Mia"];
    CAT_NAMES = ["Whiskers", "Shadow", "Mittens", "Oliver", "Luna", "Simba", "Nala", "Tiger", "Felix", "Cleo", "Misty", "Oreo"];
    BIRD_NAMES = ["Coco", "Tweety", "Polly", "Sky", "Blue", "Sunny"];
    RABBIT_NAMES = ["Biscuit", "Thumper", "Snowball", "Cinnamon", "Hazel"];
    OTHER_NAMES = ["Fluffy", "Spot", "Patches", "Nibbles"];
    AREAS = [
      { name: "Sydney CBD", lat: -33.8688, lng: 151.2093 },
      { name: "Bondi Beach", lat: -33.8915, lng: 151.2767 },
      { name: "Parramatta", lat: -33.815, lng: 151.0011 },
      { name: "Melbourne CBD", lat: -37.8136, lng: 144.9631 },
      { name: "St Kilda", lat: -37.8676, lng: 144.9829 },
      { name: "Brisbane CBD", lat: -27.4698, lng: 153.0251 },
      { name: "Gold Coast", lat: -28.0167, lng: 153.4 },
      { name: "Perth CBD", lat: -31.9505, lng: 115.8605 },
      { name: "Adelaide CBD", lat: -34.9285, lng: 138.6007 },
      { name: "Canberra", lat: -35.2809, lng: 149.13 }
    ];
    DESCRIPTIONS = [
      "Very friendly and responds to name. Was wearing a red collar when last seen.",
      "Indoor pet, never been outside before. Very scared. May be hiding.",
      "Has a distinctive limping gait in left rear leg. Very docile.",
      "Microchipped. Responds to its name. Last seen near the park.",
      "Escaped through a gap in the backyard fence. Very food motivated.",
      "Was spooked by fireworks and bolted. Usually stays close to home.",
      "Senior pet, moves slowly. Very gentle. May approach strangers.",
      "Very timid around strangers. Unlikely to approach people.",
      "Found wandering near railway station. Well-groomed, appears cared for.",
      "Found at local park, friendly and approachable. No collar.",
      "Appeared in our backyard. Very hungry. Eating and resting now.",
      "Found on main road, safely contained. Seems disoriented."
    ];
  }
});

// server/index.ts
import express2 from "express";
import { createServer } from "node:http";

// server/routes.ts
init_db();
import * as path from "path";
import express from "express";
import rateLimit from "express-rate-limit";

// server/auth.ts
init_db();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.SESSION_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  return "thefurfinder-dev-secret";
})();
var TOKEN_EXPIRY = "30d";
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
    }
  }
  next();
}
function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}
async function registerUser(req, res) {
  const { email, password, display_name, phone, consent_privacy, consent_terms, consent_ai, consent_data_storage, referralCode } = req.body;
  if (!email || !password || !display_name) {
    return res.status(400).json({ message: "Email, password, and display name are required" });
  }
  if (!consent_privacy || !consent_terms || !consent_ai || !consent_data_storage) {
    return res.status(400).json({ message: "All consent checkboxes must be accepted" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  try {
    const existing = await db_default.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    let referrerId = null;
    if (referralCode) {
      const referrer = await db_default.query("SELECT id FROM users WHERE referral_code = $1", [referralCode.toUpperCase()]);
      if (referrer.rows.length > 0) {
        referrerId = referrer.rows[0].id;
      }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newCode = generateReferralCode();
    const result = await db_default.query(
      `INSERT INTO users (email, password_hash, display_name, phone, consent_privacy, consent_terms, consent_ai, consent_data_storage, consent_date, referral_code, referred_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
       RETURNING id, email, display_name, phone, referral_code, role`,
      [email.toLowerCase(), passwordHash, display_name, phone || "", consent_privacy, consent_terms, consent_ai, consent_data_storage, newCode, referrerId]
    );
    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      display_name: result.rows[0].display_name,
      phone: result.rows[0].phone,
      role: result.rows[0].role || "user"
    };
    if (referrerId) {
      const referralCount = await db_default.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE referred_by = $1",
        [referrerId]
      );
      const count = referralCount.rows[0].count;
      if (count === 3) {
        await awardPremiumDays(referrerId, 7, "referral", "Referred 3 friends - earned 1 free week");
      }
      if (count === 5) {
        await awardPremiumDays(referrerId, 30, "referral", "Referred 5 friends - earned 1 free month");
      }
      if (count === 10) {
        await awardPremiumDays(referrerId, 30, "referral", "Referred 10 friends - earned another free month");
      }
      await awardPremiumDays(user.id, 3, "referral_bonus", "Welcome bonus - joined via referral code");
    }
    const token = generateToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Failed to create account" });
  }
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const result = await db_default.query(
      "SELECT id, email, password_hash, display_name, phone, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const row = result.rows[0];
    const validPassword = await bcrypt.compare(password, row.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = {
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      phone: row.phone,
      role: row.role || "user"
    };
    const token = generateToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Failed to login" });
  }
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
async function awardPremiumDays(userId, days, type, reason) {
  const current = await db_default.query("SELECT premium_until FROM users WHERE id = $1", [userId]);
  const now = /* @__PURE__ */ new Date();
  const currentPremium = current.rows[0]?.premium_until;
  const baseDate = currentPremium && new Date(currentPremium) > now ? new Date(currentPremium) : now;
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1e3);
  await db_default.query("UPDATE users SET premium_until = $1 WHERE id = $2", [newExpiry.toISOString(), userId]);
  await db_default.query(
    "INSERT INTO referral_rewards (user_id, type, days_awarded, reason) VALUES ($1, $2, $3, $4)",
    [userId, type, days, reason]
  );
}
async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const result = await db_default.query(
      "SELECT id, email, display_name, phone, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const row = result.rows[0];
    return res.json({
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      phone: row.phone,
      role: row.role || "user"
    });
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ message: "Failed to get user" });
  }
}

// server/moderation.ts
var BLOCKED_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "dick",
  "cunt",
  "bastard",
  "damn",
  "piss",
  "cock",
  "whore",
  "slut",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "kill yourself",
  "kys",
  "die",
  "rape",
  "scam",
  "phishing",
  "send money",
  "wire transfer",
  "bitcoin",
  "crypto wallet",
  "click here",
  "free iphone",
  "you won",
  "hate",
  "threat",
  "bomb",
  "attack"
];
var REPLACEMENT_CHAR = "*";
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function moderateContent(text) {
  const reasons = [];
  let filteredText = text;
  let flagged = false;
  const lowerText = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(escapeRegex(word), "gi");
    if (regex.test(lowerText)) {
      flagged = true;
      reasons.push(`Contains inappropriate language`);
      filteredText = filteredText.replace(regex, REPLACEMENT_CHAR.repeat(word.length));
    }
  }
  const leetMap = {
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    "$": "s"
  };
  const deLeet = lowerText.replace(/[013457@$]/g, (c) => leetMap[c] || c);
  if (deLeet !== lowerText) {
    for (const word of BLOCKED_WORDS) {
      if (deLeet.includes(word)) {
        flagged = true;
        reasons.push("Contains disguised inappropriate language");
        break;
      }
    }
  }
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  if (urlRegex.test(text)) {
    flagged = true;
    reasons.push("Contains external links");
    filteredText = filteredText.replace(urlRegex, "[link removed]");
  }
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const allCaps = text.replace(/[^a-zA-Z]/g, "");
  if (allCaps.length > 10 && allCaps === allCaps.toUpperCase()) {
    reasons.push("Excessive use of capitals");
  }
  const repeatedChars = /(.)\1{5,}/;
  if (repeatedChars.test(text)) {
    reasons.push("Repeated characters detected");
  }
  const uniqueReasons = [...new Set(reasons)];
  return {
    allowed: true,
    filteredText,
    flagged,
    reasons: uniqueReasons
  };
}

// server/routes.ts
init_push();
init_batch_match();

// server/discord-errors.ts
function createSender() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return () => {
    };
  }
  return async (error, context = {}) => {
    try {
      const err = error instanceof Error ? error : new Error(String(error));
      const title = (err.message || "Unknown error").slice(0, 256);
      const stack = (err.stack || "No stack trace").slice(0, 4e3);
      const fields = [
        { name: "Source", value: context.source || "unknown", inline: true },
        { name: "Timestamp", value: (/* @__PURE__ */ new Date()).toISOString(), inline: true }
      ];
      if (context.method) {
        fields.push({ name: "Method", value: context.method, inline: true });
      }
      if (context.path) {
        fields.push({ name: "Path", value: context.path, inline: true });
      }
      if (context.screen) {
        fields.push({ name: "Screen", value: context.screen, inline: true });
      }
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title,
              description: `\`\`\`
${stack}
\`\`\``,
              color: 16711680,
              fields
            }
          ]
        })
      });
    } catch {
    }
  };
}
var sendErrorToDiscord = createSender();

// server/routes.ts
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});
var aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 30,
  message: { message: "AI request limit reached. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false
});
var writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 60,
  message: { message: "Too many requests. Please slow down and try again shortly." },
  standardHeaders: true,
  legacyHeaders: false
});
function getDistance2(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
var RADIUS_KM = 5;
var MAX_VISION_CANDIDATES = 15;
function getReportPhotos(report) {
  const photos = [];
  if (report.photo_uris && report.photo_uris.length > 0) {
    photos.push(...report.photo_uris);
  } else if (report.photo_uri) {
    photos.push(report.photo_uri);
  }
  return photos.filter((p) => p && (p.startsWith("data:") || p.startsWith("http")));
}
function getProfilePhotos(profile) {
  return (profile.photo_uris || []).filter((p) => p && (p.startsWith("data:") || p.startsWith("http")));
}
function getProfileBiometricPhotos(profile) {
  return (profile.biometricphoto_uris || []).filter((p) => p && (p.startsWith("data:") || p.startsWith("http")));
}
function mapReportRow(row, isOwner, likedByMe) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    petType: row.pet_type,
    pet_name: row.pet_name,
    breed: row.breed,
    size: row.size,
    color: row.color,
    markings: row.markings,
    photo_uri: row.photo_uri,
    photo_uris: typeof row.photo_uris === "string" ? JSON.parse(row.photo_uris) : row.photo_uris || [],
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    location_name: row.location_name,
    lastSeenDate: row.last_seen_date,
    reward: row.reward,
    rewardPool: row.reward_pool || 0,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    showContactPublic: row.show_contact_public ?? true,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    isOwner,
    comments: [],
    timeline: [],
    reunionMessage: row.reunion_message || void 0,
    reunion_date: row.reunion_date ? row.reunion_date instanceof Date ? row.reunion_date.toISOString() : row.reunion_date : void 0,
    likes: row.likes || 0,
    likedByMe,
    isBoosted: row.is_boosted || false,
    boostedAt: row.boosted_at ? row.boosted_at instanceof Date ? row.boosted_at.toISOString() : row.boosted_at : void 0,
    boostExpiresAt: row.boost_expires_at ? row.boost_expires_at instanceof Date ? row.boost_expires_at.toISOString() : row.boost_expires_at : void 0
  };
}
function mapProfileRow(row) {
  return {
    id: row.id,
    petType: row.pet_type,
    pet_name: row.pet_name,
    breed: row.breed,
    size: row.size,
    color: row.color,
    markings: row.markings,
    photo_uris: typeof row.photo_uris === "string" ? JSON.parse(row.photo_uris) : row.photo_uris || [],
    biometricphoto_uris: typeof row.biometric_photo_uris === "string" ? JSON.parse(row.biometric_photo_uris) : row.biometric_photo_uris || [],
    microchipNumber: row.microchip_number,
    medicalNotes: row.medical_notes,
    suburb: row.suburb,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at
  };
}
async function getOrgAnimalCandidates(petType, excludeOrgId) {
  const query = excludeOrgId ? `SELECT oa.*, o.name AS org_name, o.type AS org_type, o.latitude AS org_latitude, o.longitude AS org_longitude FROM organisation_animals oa
       JOIN organisations o ON o.id = oa.org_id
       WHERE o.status = 'approved' AND oa.status = 'available' AND oa.pet_type = $1 AND o.id != $2` : `SELECT oa.*, o.name AS org_name, o.type AS org_type, o.latitude AS org_latitude, o.longitude AS org_longitude FROM organisation_animals oa
       JOIN organisations o ON o.id = oa.org_id
       WHERE o.status = 'approved' AND oa.status = 'available' AND oa.pet_type = $1`;
  const params = excludeOrgId ? [petType, excludeOrgId] : [petType];
  const result = await db_default.query(query, params);
  return result.rows;
}
var errorReportLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 10,
  message: { message: "Too many error reports. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
async function registerRoutes(app2) {
  app2.post("/api/errors/report", errorReportLimiter, (req, res) => {
    const { message, stack, source, screen } = req.body;
    const err = new Error(message || "Unknown frontend error");
    err.stack = stack || err.stack;
    sendErrorToDiscord(err, { source: source || "frontend", screen });
    res.status(200).json({ ok: true });
  });
  app2.use("/store-assets", express.static(path.resolve(process.cwd(), "assets", "store")));
  app2.use("/app-assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.get("/download-assets", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><head><title>Download Assets</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body{font-family:sans-serif;padding:20px;text-align:center}img{max-width:100%;margin:10px 0;border:2px solid #ccc;border-radius:8px}h2{color:#FF6B4A}p{color:#666;font-size:14px}</style>
    </head><body>
    <h2>App Icon</h2>
    <p>Long-press and save this image:</p>
    <img src="/app-assets/icon-option5.png" alt="App Icon"/>
    <h2>Feature Graphic - RECOMMENDED</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-final2.png" alt="Feature Graphic Final"/>
    <h2>Feature Graphic - FINAL (The Fur Finder)</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-split5.png" alt="Feature Graphic Final"/>
    <h2>Feature Graphic - Without Brand Name</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-split4.png" alt="Feature Graphic Split Clean"/>
    <h2>Feature Graphic - Split Reunion (no text)</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-split.png" alt="Feature Graphic Split"/>
    <h2>Feature Graphic - Detective Dog</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-v5.png" alt="Feature Graphic"/>
    <h2>Feature Graphic - Your Dogs</h2>
    <p>Long-press and save this image:</p>
    <img src="/store-assets/feature-graphic-dogs.png" alt="Feature Graphic Dogs"/>
    </body></html>`);
  });
  async function notifyMatchedReportOwners(matches, scannerUserId, confidenceThreshold = 50) {
    const reportMatches = matches.filter(
      (m) => m.type === "report" && m.confidence >= confidenceThreshold
    );
    for (const match of reportMatches) {
      try {
        const reportResult = await db_default.query(
          `SELECT pr.id, pr.pet_name, pr.pet_type, pr.status, pr.user_id,
                  u.push_token
           FROM pet_reports pr
           JOIN users u ON u.id = pr.user_id
           WHERE pr.id = $1 AND pr.status = 'lost'`,
          [match.id]
        );
        if (reportResult.rows.length === 0) continue;
        const row = reportResult.rows[0];
        if (scannerUserId && row.user_id === scannerUserId) continue;
        const dedup = await db_default.query(
          `SELECT id FROM notifications
           WHERE user_id = $1 AND type = 'ai_match' AND report_id = $2
             AND created_at > NOW() - INTERVAL '4 hours'
           LIMIT 1`,
          [row.user_id, match.id]
        );
        if (dedup.rows.length > 0) continue;
        const pet_name = row.pet_name || "your pet";
        const title = `Possible match found for ${pet_name}!`;
        const message = `Someone spotted a pet nearby that our AI thinks could be a match for your lost ${pet_name}. Open The Fur Finder to review the details \u2014 it may not be exact, but it's worth checking.`;
        await db_default.query(
          `INSERT INTO notifications (user_id, type, title, message, report_id)
           VALUES ($1, 'ai_match', $2, $3, $4)`,
          [row.user_id, title, message, match.id]
        );
        sendPushNotification(row.push_token, row.user_id, title, message, {
          type: "ai_match",
          reportId: match.id
        }).catch((err) => console.error("[Push] AI match notification error:", err));
        console.log(`[Match] Notified user ${row.user_id} of probable match for report ${match.id} (confidence ${match.confidence}%)`);
      } catch (err) {
        console.error("[Match] Failed to notify report owner:", err);
      }
    }
  }
  app2.post("/api/match", aiLimiter, optionalAuth, async (req, res) => {
    try {
      const { report, reports, profiles, radiusKm } = req.body;
      const searchRadius = radiusKm && radiusKm > 0 ? radiusKm : RADIUS_KM;
      if (!report) {
        return res.status(400).json({ error: "Report is required" });
      }
      const oppositeStatus = report.status === "lost" ? "found" : "lost";
      const matchingReports = (reports || []).filter((r) => {
        if (r.id === report.id) return false;
        if (r.status !== oppositeStatus) return false;
        if (r.petType !== report.petType) return false;
        if (r.latitude && r.longitude && report.latitude && report.longitude) {
          const dist = getDistance2(report.latitude, report.longitude, r.latitude, r.longitude);
          if (dist > searchRadius) return false;
        }
        return true;
      });
      const matchingProfiles = (profiles || []).filter((p) => p.petType === report.petType);
      const candidates = [];
      for (const r of matchingReports) {
        const dist = getDistance2(report.latitude, report.longitude, r.latitude, r.longitude);
        candidates.push({
          type: "report",
          id: r.id,
          summary: `[Report] ${r.status.toUpperCase()} ${r.petType} named "${r.pet_name}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.location_name}, distance: ${dist.toFixed(1)}km, date: ${r.lastSeenDate}, description: "${r.description}"`,
          photos: getReportPhotos(r),
          distance: dist
        });
      }
      for (const p of matchingProfiles) {
        const profilePhotos = getProfilePhotos(p);
        const biometricPhotos = getProfileBiometricPhotos(p);
        const allPhotos = [...profilePhotos, ...biometricPhotos];
        candidates.push({
          type: "profile",
          id: p.id,
          summary: `[Registered Pet] ${p.petType} named "${p.pet_name}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, microchip: ${p.microchipNumber || "none"}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s) (close-up nose/eyes/face)` : ""}`,
          photos: allPhotos
        });
      }
      const orgAnimals = await getOrgAnimalCandidates(report.petType);
      for (const oa of orgAnimals) {
        const photos = Array.isArray(oa.photo_uris) ? oa.photo_uris : typeof oa.photo_uris === "string" ? JSON.parse(oa.photo_uris) : [];
        const orgLabel = oa.org_type === "vet" ? "Vet Clinic" : oa.org_type === "rescue" ? "Rescue Group" : "Shelter";
        let dist;
        if (oa.org_latitude && oa.org_longitude && report.latitude && report.longitude) {
          dist = getDistance2(report.latitude, report.longitude, oa.org_latitude, oa.org_longitude);
        }
        candidates.push({
          type: "org_animal",
          id: oa.id,
          summary: `[${orgLabel}: ${oa.org_name}] ${oa.pet_type} named "${oa.pet_name}", breed: ${oa.breed}, size: ${oa.size}, color: ${oa.color}, markings: "${oa.markings}", intake: ${oa.intake_type}, microchip: ${oa.microchip_number || "none"}, desexed: ${oa.desexed ? "yes" : "no"}, description: "${oa.description}"`,
          photos: photos.slice(0, 3),
          distance: dist
        });
      }
      if (candidates.length === 0) {
        return res.json({ matches: [] });
      }
      candidates.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
      const visionCandidates = candidates.slice(0, MAX_VISION_CANDIDATES);
      const targetPhotos = getReportPhotos(report);
      const hasPhotos = targetPhotos.length > 0 || visionCandidates.some((c) => c.photos.length > 0);
      const targetSummary = `${report.status.toUpperCase()} ${report.petType} named "${report.pet_name}", breed: ${report.breed}, size: ${report.size}, color: ${report.color}, markings: "${report.markings}", location: ${report.location_name}, date: ${report.lastSeenDate}, description: "${report.description}"`;
      const candidateList = visionCandidates.map(
        (c, i) => `${i + 1}. (${c.type}:${c.id}) ${c.summary} | Has ${c.photos.length} photo(s)`
      ).join("\n");
      const systemPrompt = hasPhotos ? `You are an expert veterinary-grade AI pet identification system. You perform rigorous visual and textual analysis to match lost and found pets with the highest possible accuracy.

VISUAL ANALYSIS PROTOCOL (primary \u2014 most important when photos are available):
1. BIOMETRIC FEATURES (highest confidence signal):
   - Nose print texture: unique ridge patterns, nostril shape, pigmentation \u2014 as unique as human fingerprints
   - Eye patterns: iris color, pupil shape, eye spacing, heterochromia
   - Facial geometry: muzzle length, forehead width, jaw shape, ear set angle
2. COAT ANALYSIS:
   - Color distribution map: exact locations of color patches, transitions, and gradients
   - Pattern type: solid, bicolor, tricolor, tabby, brindle, merle, tuxedo, pointed
   - Unique markings: spots, patches, stripes \u2014 note exact position (left ear, right paw, chest, etc.)
3. BODY STRUCTURE:
   - Build type and proportions relative to breed standard
   - Tail length/shape/carriage, leg proportions
   - Ear shape: erect, floppy, semi-erect, cropped
4. DISTINGUISHING FEATURES:
   - Scars, healed injuries, missing fur patches
   - Collar, harness, or tag visible
   - Eye conditions (cherry eye, cloudiness)
   - Ear notches or tattoos

TEXT ANALYSIS (secondary):
- Breed: exact match is strongest; cross-breed similarity considered
- Color and markings description alignment with visual evidence
- Size category match (small/medium/large)
- Geographic proximity: distance in km \u2014 closer is stronger (within ${searchRadius}km radius)
- Timeline plausibility: when was the pet lost vs. found
- Description details: temperament, behaviour, any unique habits mentioned

SCORING GUIDE:
- 90-100: Virtually certain \u2014 biometric features confirm identity, text details fully align
- 80-89: Very strong \u2014 photos show very likely the same animal, multiple unique features match
- 65-79: Good \u2014 visually similar with most text details aligning, some distinguishing features match
- 50-64: Moderate \u2014 breed and color match, some visual resemblance but limited distinguishing evidence
- 35-49: Weak but possible \u2014 general similarities warrant human review
- Below 35: Unlikely match, do not include

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": the candidate's id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing SPECIFIC visual features compared (e.g., "White chest patch shape matches", "Nose pigmentation pattern consistent") and text alignment

Note: "org_animal" candidates are animals currently in the care of verified partner organisations (vet clinics, shelters, rescue groups). They should be matched with the same rigour as other candidates.

Only include candidates with confidence >= 30. Return at most 10 matches.
Return ONLY valid JSON, no markdown formatting.` : `You are an expert AI pet matching system. Given a target pet report and candidates, perform thorough analysis to determine match likelihood.

Analyse these factors with rigorous attention to detail:
- Breed: exact match is strongest signal; note if mixed breed descriptions could overlap
- Color: compare primary and secondary colors, patterns (e.g., "tan with black saddle" vs "black and tan")
- Markings: specific marking locations (face blaze, chest patch, paw markings)
- Size: must be same category (small/medium/large)
- Geographic proximity: closer is better (within ${searchRadius}km radius)
- Timeline: date proximity between lost and found events
- Description: behavioural traits, age estimates, distinctive features

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": the candidate's id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing specific matching factors

Note: "org_animal" candidates are animals currently in the care of verified partner organisations (vet clinics, shelters, rescue groups).

Only include candidates with confidence >= 30. Return at most 10 matches.
Return ONLY valid JSON, no markdown formatting.`;
      const matches = [];
      res.json({ matches });
      if (report.status === "found") {
        notifyMatchedReportOwners(matches, req.user?.id || null).catch(
          (err) => console.error("[Match] notifyMatchedReportOwners error:", err)
        );
      }
      return;
    } catch (error) {
      console.error("Match error:", error);
      return res.status(500).json({ error: "Failed to find matches" });
    }
  });
  app2.post("/api/quick-snap-match", aiLimiter, optionalAuth, async (req, res) => {
    try {
      const { photo_uri, petType, reports, profiles } = req.body;
      if (!photo_uri) {
        return res.status(400).json({ error: "A photo is required" });
      }
      const validPhoto = photo_uri.startsWith("data:") || photo_uri.startsWith("http");
      if (!validPhoto) {
        return res.status(400).json({ error: "Invalid photo format" });
      }
      const lostReports = (reports || []).filter((r) => {
        if (r.status !== "lost") return false;
        if (petType && r.petType !== petType) return false;
        return true;
      });
      const allProfiles = (profiles || []).filter((p) => {
        if (petType && p.petType !== petType) return false;
        return true;
      });
      const candidates = [];
      for (const r of lostReports) {
        candidates.push({
          type: "report",
          id: r.id,
          summary: `[Lost Report] ${r.petType} named "${r.pet_name}", breed: ${r.breed}, size: ${r.size}, color: ${r.color}, markings: "${r.markings}", location: ${r.location_name}, date: ${r.lastSeenDate}`,
          photos: getReportPhotos(r)
        });
      }
      for (const p of allProfiles) {
        const profilePhotos = getProfilePhotos(p);
        const biometricPhotos = getProfileBiometricPhotos(p);
        candidates.push({
          type: "profile",
          id: p.id,
          summary: `[Registered Pet] ${p.petType} named "${p.pet_name}", breed: ${p.breed}, size: ${p.size}, color: ${p.color}, markings: "${p.markings}", suburb: ${p.suburb}, owner: ${p.ownerName}${biometricPhotos.length > 0 ? `, has ${biometricPhotos.length} biometric ID scan(s) (close-up nose/eyes/face)` : ""}`,
          photos: [...profilePhotos, ...biometricPhotos]
        });
      }
      const orgAnimals = await getOrgAnimalCandidates(petType || "dog");
      for (const oa of orgAnimals) {
        const photos = Array.isArray(oa.photo_uris) ? oa.photo_uris : typeof oa.photo_uris === "string" ? JSON.parse(oa.photo_uris) : [];
        const orgLabel = oa.org_type === "vet" ? "Vet Clinic" : oa.org_type === "rescue" ? "Rescue Group" : "Shelter";
        candidates.push({
          type: "org_animal",
          id: oa.id,
          summary: `[${orgLabel}: ${oa.org_name}] ${oa.pet_type} named "${oa.pet_name}", breed: ${oa.breed}, size: ${oa.size}, color: ${oa.color}, markings: "${oa.markings}", intake: ${oa.intake_type}, microchip: ${oa.microchip_number || "none"}, description: "${oa.description}"`,
          photos: photos.slice(0, 3)
        });
      }
      if (candidates.length === 0) {
        return res.json({ matches: [] });
      }
      const visionCandidates = candidates.slice(0, MAX_VISION_CANDIDATES);
      const snapSystemPrompt = `You are an expert veterinary-grade AI pet identification system specializing in visual biometric matching. A person has spotted a pet in the wild and taken a quick photo. Your critical task is to determine if this pet matches any lost pet reports or registered pet profiles using the highest standard of visual analysis.

BIOMETRIC IDENTIFICATION PROTOCOL (highest priority \u2014 treat like forensic analysis):

1. NOSE PRINT ANALYSIS (most reliable \u2014 unique to each animal like fingerprints):
   - Ridge pattern topology: bumps, grooves, texture map
   - Nostril shape: round, oval, asymmetric differences
   - Bridge width and pigmentation: color variations, spots on nose leather
   - Nose leather texture: smooth, rough, cracked patterns

2. EYE IDENTIFICATION:
   - Iris color: exact shade (amber, hazel, brown, blue, green, heterochromia)
   - Eye shape and size relative to head
   - Eye spacing: wide-set vs. close-set
   - Sclera visibility, tear staining patterns

3. FACIAL GEOMETRY (high reliability):
   - Muzzle length-to-width ratio
   - Forehead slope and width
   - Jaw shape: square, rounded, narrow
   - Ear set angle, ear shape (erect, folded, rose, button, pendulous)
   - Ear size relative to head, inner ear hair/coloring

4. COAT FORENSICS:
   - Color distribution map: document exact position of every color zone
   - Pattern classification: solid, bicolor, tricolor, tabby (mackerel/classic/spotted), brindle, merle, roan, ticking
   - Unique marking positions: left vs. right asymmetry, chest shapes (star, blaze, bib), leg socks
   - Coat texture visible: smooth, wiry, fluffy, double-coat evidence

5. BODY & DISTINGUISHING FEATURES:
   - Build: compact, athletic, stocky, leggy
   - Tail: length, curl, plume, bob, carriage
   - Scars, healed injuries, ear notches, tattoos
   - Collar, harness, tags visible

TEXT COMPARISON (secondary):
- Breed consistency with visual assessment
- Color and size match
- Markings alignment with what is visible

SCORING (be precise \u2014 lives depend on accuracy):
- 90-100: Virtually certain \u2014 multiple biometric features confirm (nose + eyes + unique markings align)
- 80-89: Very strong \u2014 clear biometric similarity, unique markings match
- 65-79: Good \u2014 multiple visual features match, breed and build consistent
- 50-64: Moderate \u2014 same breed/color, some features match but cannot confirm unique identity
- 35-49: Weak but possible \u2014 general similarity, worth human review
- Below 30: Do not include

Return a JSON object with "matches" array sorted by confidence (highest first). Each match:
- "id": candidate id
- "type": "report", "profile", or "org_animal"
- "confidence": 0-100
- "reason": 2-3 sentence explanation citing SPECIFIC biometric and visual features compared (e.g., "Nose ridge pattern shows matching topology", "Distinctive white blaze on forehead matches in shape and position")

Note: "org_animal" candidates are animals in the care of verified partner organisations (vet clinics, shelters, rescue groups).

Only include confidence >= 30. Return at most 10 matches.
Return ONLY valid JSON, no markdown.`;
      const matches = [];
      res.json({ matches });
      notifyMatchedReportOwners(matches, req.user?.id || null).catch(
        (err) => console.error("[QuickSnap] notifyMatchedReportOwners error:", err)
      );
      return;
    } catch (error) {
      console.error("Quick snap match error:", error);
      return res.status(500).json({ error: "Failed to process snap match" });
    }
  });
  app2.post("/api/auth/register", authLimiter, registerUser);
  app2.post("/api/auth/login", authLimiter, loginUser);
  app2.get("/api/auth/me", authMiddleware, getMe);
  app2.get("/api/reports", optionalAuth, async (req, res) => {
    try {
      const isPaginated = req.query.page !== void 0;
      const limit = Math.min(parseInt(req.query.limit) || (isPaginated ? 20 : 100), 500);
      const page = parseInt(req.query.page) || 0;
      const offset = isPaginated ? page * limit : parseInt(req.query.offset) || 0;
      const statusFilter = req.query.status;
      const userId = req.query.userId;
      const suburbFilter = req.query.suburb;
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radiusKm = parseFloat(req.query.radius);
      const hasGeo = !isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm) && radiusKm > 0;
      const innerConditions = [];
      const params = [];
      if (statusFilter && statusFilter !== "all" && ["lost", "found", "reunited"].includes(statusFilter)) {
        params.push(statusFilter);
        innerConditions.push(`r.status = $${params.length}`);
      } else {
        innerConditions.push(`r.status != 'reunited'`);
      }
      if (userId) {
        params.push(userId);
        innerConditions.push(`r.user_id = $${params.length}`);
      }
      if (suburbFilter) {
        params.push(`%${suburbFilter.toLowerCase()}%`);
        innerConditions.push(`LOWER(r.location_name) LIKE $${params.length}`);
      }
      if (hasGeo) {
        const delta = radiusKm / 111;
        params.push(lat - delta);
        params.push(lat + delta);
        innerConditions.push(`r.latitude BETWEEN $${params.length - 1} AND $${params.length}`);
        params.push(lng - delta);
        params.push(lng + delta);
        innerConditions.push(`r.longitude BETWEEN $${params.length - 1} AND $${params.length}`);
      }
      const whereClause = innerConditions.length > 0 ? `WHERE ${innerConditions.join(" AND ")}` : "";
      const distanceExpr = hasGeo ? `(6371 * acos(GREATEST(-1.0, LEAST(1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))))` : "NULL::float";
      const outerWhere = hasGeo ? `WHERE distance < ${radiusKm}` : "";
      const orderClause = hasGeo ? `ORDER BY distance ASC` : `ORDER BY CASE WHEN is_boosted = true AND boost_expires_at > NOW() THEN 0 ELSE 1 END, created_at DESC`;
      const limitIdx = params.length + 1;
      const offsetIdx = params.length + 2;
      params.push(limit);
      params.push(offset);
      const mainQuery = `
        SELECT * FROM (
          SELECT r.*,
            COALESCE((SELECT COUNT(*) FROM report_likes WHERE report_id = r.id), 0)::int AS likes,
            ${distanceExpr} AS distance
          FROM pet_reports r
          ${whereClause}
        ) sub
        ${outerWhere}
        ${orderClause}
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `;
      const result = await db_default.query(mainQuery, params);
      const reports = result.rows.map((row) => {
        const isOwner = req.user ? row.user_id === req.user.id : false;
        const mapped = mapReportRow(row, isOwner, false);
        if (hasGeo && row.distance !== null) {
          mapped.distanceKm = parseFloat(parseFloat(row.distance).toFixed(1));
        }
        return mapped;
      });
      if (req.user) {
        const likedResult = await db_default.query(
          "SELECT report_id FROM report_likes WHERE user_id = $1",
          [req.user.id]
        );
        const likedIds = new Set(likedResult.rows.map((r) => r.report_id));
        reports.forEach((r) => {
          r.likedByMe = likedIds.has(r.id);
        });
      }
      if (isPaginated) {
        const countParams = params.slice(0, params.length - 2);
        const countQuery = `
          SELECT COUNT(*) FROM (
            SELECT r.id, ${distanceExpr} AS distance
            FROM pet_reports r
            ${whereClause}
          ) sub
          ${outerWhere}
        `;
        const countResult = await db_default.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        return res.json({ reports, total, page, hasMore: (page + 1) * limit < total });
      }
      return res.json(reports);
    } catch (err) {
      console.error("Get reports error:", err);
      return res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  app2.get("/api/reports/:id", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db_default.query(
        `SELECT r.*,
          COALESCE((SELECT COUNT(*) FROM report_likes WHERE report_id = r.id), 0)::int AS likes
        FROM pet_reports r WHERE r.id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }
      const row = result.rows[0];
      const isOwner = req.user ? row.user_id === req.user.id : false;
      let likedByMe = false;
      if (req.user) {
        const likeCheck = await db_default.query(
          "SELECT id FROM report_likes WHERE report_id = $1 AND user_id = $2",
          [id, req.user.id]
        );
        likedByMe = likeCheck.rows.length > 0;
      }
      const commentsResult = await db_default.query(
        "SELECT * FROM comments WHERE report_id = $1 ORDER BY created_at ASC",
        [id]
      );
      const timelineResult = await db_default.query(
        "SELECT * FROM timeline_events WHERE report_id = $1 ORDER BY created_at ASC",
        [id]
      );
      const report = mapReportRow(row, isOwner, likedByMe);
      report.comments = commentsResult.rows.map((c) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        createdAt: c.created_at.toISOString()
      }));
      report.timeline = timelineResult.rows.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        createdAt: t.created_at.toISOString()
      }));
      return res.json(report);
    } catch (err) {
      console.error("Get report error:", err);
      return res.status(500).json({ message: "Failed to fetch report" });
    }
  });
  app2.post("/api/reports", authMiddleware, writeLimiter, async (req, res) => {
    try {
      const b = req.body;
      const result = await db_default.query(
        `INSERT INTO pet_reports (user_id, status, pet_type, pet_name, breed, size, color, markings, photo_uri, photo_uris, description, latitude, longitude, location_name, last_seen_date, reward, contact_name, contact_phone, show_contact_public)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING *`,
        [req.user.id, b.status, b.petType, b.pet_name, b.breed || "", b.size || "medium", b.color || "", b.markings || "", b.photo_uri || "", JSON.stringify(b.photo_uris || []), b.description || "", b.latitude || 0, b.longitude || 0, b.location_name || "", b.lastSeenDate || "", b.reward || "", b.contactName || "", b.contactPhone || "", b.showContactPublic !== false]
      );
      const reportId = result.rows[0].id;
      await db_default.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'created', $2)`,
        [reportId, `Report created by ${b.contactName || req.user.display_name}`]
      );
      return res.status(201).json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Create report error:", err);
      return res.status(500).json({ message: "Failed to create report" });
    }
  });
  app2.put("/api/reports/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db_default.query("SELECT user_id FROM pet_reports WHERE id = $1", [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: "Not authorised" });
      const b = req.body;
      const fields = [];
      const values = [];
      let idx = 1;
      const updatable = {
        status: "status",
        pet_name: "pet_name",
        breed: "breed",
        size: "size",
        color: "color",
        markings: "markings",
        photo_uri: "photo_uri",
        description: "description",
        latitude: "latitude",
        longitude: "longitude",
        location_name: "location_name",
        lastSeenDate: "last_seen_date",
        reward: "reward",
        contactName: "contact_name",
        contactPhone: "contact_phone",
        showContactPublic: "show_contact_public",
        reunionMessage: "reunion_message"
      };
      for (const [key, col] of Object.entries(updatable)) {
        if (b[key] !== void 0) {
          fields.push(`${col} = $${idx}`);
          values.push(b[key]);
          idx++;
        }
      }
      if (b.photo_uris !== void 0) {
        fields.push(`photo_uris = $${idx}`);
        values.push(JSON.stringify(b.photo_uris));
        idx++;
      }
      if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });
      values.push(id);
      const result = await db_default.query(
        `UPDATE pet_reports SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Update report error:", err);
      return res.status(500).json({ message: "Failed to update report" });
    }
  });
  app2.delete("/api/reports/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db_default.query("SELECT user_id FROM pet_reports WHERE id = $1", [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: "Not authorised" });
      await db_default.query("DELETE FROM pet_reports WHERE id = $1", [id]);
      return res.json({ message: "Report deleted" });
    } catch (err) {
      console.error("Delete report error:", err);
      return res.status(500).json({ message: "Failed to delete report" });
    }
  });
  app2.post("/api/reports/:id/boost", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db_default.query("SELECT user_id FROM pet_reports WHERE id = $1", [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: "Not authorised" });
      const result = await db_default.query(
        `UPDATE pet_reports SET is_boosted = true, boosted_at = NOW(), boost_expires_at = NOW() + INTERVAL '7 days' WHERE id = $1 RETURNING *`,
        [id]
      );
      await db_default.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'status_change', 'Report boosted to priority listing for 7 days')`,
        [id]
      );
      return res.json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Boost report error:", err);
      return res.status(500).json({ message: "Failed to boost report" });
    }
  });
  app2.post("/api/reports/:id/reunite", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { message: reunionMsg } = req.body;
      const existing = await db_default.query("SELECT user_id, pet_name FROM pet_reports WHERE id = $1", [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: "Not authorised" });
      const msg = reunionMsg || `${existing.rows[0].pet_name} has been reunited with their owner!`;
      const result = await db_default.query(
        `UPDATE pet_reports SET status = 'reunited', reunion_message = $1, reunion_date = NOW() WHERE id = $2 RETURNING *`,
        [msg, id]
      );
      await db_default.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'status_change', 'Pet reunited with owner!')`,
        [id]
      );
      return res.json(mapReportRow(result.rows[0], true, false));
    } catch (err) {
      console.error("Reunite error:", err);
      return res.status(500).json({ message: "Failed to mark as reunited" });
    }
  });
  app2.post("/api/reports/:id/comments", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { author, text } = req.body;
      if (!text) return res.status(400).json({ message: "Comment text is required" });
      const moderation = moderateContent(text);
      const cleanText = moderation.filteredText;
      const authorName = author || (req.user ? req.user.display_name : "Anonymous");
      const result = await db_default.query(
        "INSERT INTO comments (report_id, user_id, author, text) VALUES ($1, $2, $3, $4) RETURNING *",
        [id, req.user?.id || null, authorName, cleanText]
      );
      await db_default.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'comment', $2)`,
        [id, `${authorName} commented: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`]
      );
      const c = result.rows[0];
      return res.status(201).json({ id: c.id, author: c.author, text: c.text, createdAt: c.created_at.toISOString() });
    } catch (err) {
      console.error("Add comment error:", err);
      return res.status(500).json({ message: "Failed to add comment" });
    }
  });
  app2.delete("/api/comments/:commentId", authMiddleware, async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      const existing = await db_default.query("SELECT * FROM comments WHERE id = $1", [commentId]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Comment not found" });
      const comment = existing.rows[0];
      const isOwner = comment.user_id === userId;
      const isAdmin = userRole === "admin";
      const reportResult = await db_default.query("SELECT user_id FROM pet_reports WHERE id = $1", [comment.report_id]);
      const isReportOwner = reportResult.rows.length > 0 && reportResult.rows[0].user_id === userId;
      if (!isOwner && !isAdmin && !isReportOwner) {
        return res.status(403).json({ message: "Not authorised to delete this comment" });
      }
      await db_default.query("DELETE FROM comments WHERE id = $1", [commentId]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Delete comment error:", err);
      return res.status(500).json({ message: "Failed to delete comment" });
    }
  });
  app2.put("/api/users/push-token", authMiddleware, async (req, res) => {
    try {
      const { pushToken } = req.body;
      if (!pushToken) return res.status(400).json({ message: "Push token is required" });
      await db_default.query("UPDATE users SET push_token = $1 WHERE id = $2", [pushToken, req.user.id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Save push token error:", err);
      return res.status(500).json({ message: "Failed to save push token" });
    }
  });
  app2.patch("/api/user/profile", authMiddleware, async (req, res) => {
    try {
      const { phone } = req.body;
      await db_default.query("UPDATE users SET phone = $1 WHERE id = $2", [phone ?? null, req.user.id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/reports/:id/like", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db_default.query(
        "SELECT id FROM report_likes WHERE report_id = $1 AND user_id = $2",
        [id, req.user.id]
      );
      if (existing.rows.length > 0) {
        await db_default.query("DELETE FROM report_likes WHERE report_id = $1 AND user_id = $2", [id, req.user.id]);
      } else {
        await db_default.query("INSERT INTO report_likes (report_id, user_id) VALUES ($1, $2)", [id, req.user.id]);
      }
      const countResult = await db_default.query("SELECT COUNT(*)::int AS count FROM report_likes WHERE report_id = $1", [id]);
      return res.json({ likes: countResult.rows[0].count, likedByMe: existing.rows.length === 0 });
    } catch (err) {
      console.error("Like error:", err);
      return res.status(500).json({ message: "Failed to toggle like" });
    }
  });
  app2.post("/api/reports/:id/reward", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
      const result = await db_default.query(
        "UPDATE pet_reports SET reward_pool = reward_pool + $1 WHERE id = $2 RETURNING *",
        [amount, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: "Report not found" });
      await db_default.query(
        `INSERT INTO timeline_events (report_id, type, description) VALUES ($1, 'sighting', $2)`,
        [id, `$${amount} added to reward pool`]
      );
      return res.json({ rewardPool: result.rows[0].reward_pool });
    } catch (err) {
      console.error("Reward error:", err);
      return res.status(500).json({ message: "Failed to add reward" });
    }
  });
  app2.get("/api/profiles", authMiddleware, async (req, res) => {
    try {
      const result = await db_default.query(
        "SELECT * FROM pet_profiles WHERE user_id = $1 ORDER BY created_at DESC",
        [req.user.id]
      );
      return res.json(result.rows.map(mapProfileRow));
    } catch (err) {
      console.error("Get profiles error:", err);
      return res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });
  app2.get("/api/profiles/all", optionalAuth, async (_req, res) => {
    try {
      const result = await db_default.query("SELECT * FROM pet_profiles ORDER BY created_at DESC");
      return res.json(result.rows.map(mapProfileRow));
    } catch (err) {
      console.error("Get all profiles error:", err);
      return res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });
  app2.get("/api/suburbs", optionalAuth, async (_req, res) => {
    try {
      const result = await db_default.query(
        `SELECT suburb, COUNT(*)::int AS count, 
         array_agg(DISTINCT pet_type) AS pet_types
         FROM pet_profiles 
         WHERE suburb IS NOT NULL AND suburb != ''
         GROUP BY suburb 
         ORDER BY count DESC, suburb ASC`
      );
      return res.json(result.rows.map((r) => ({
        suburb: r.suburb,
        count: r.count,
        petTypes: r.pet_types || []
      })));
    } catch (err) {
      console.error("Get suburbs error:", err);
      return res.status(500).json({ message: "Failed to fetch suburbs" });
    }
  });
  app2.get("/api/profiles/suburb/:suburb", optionalAuth, async (req, res) => {
    try {
      const { suburb } = req.params;
      const result = await db_default.query(
        `SELECT pp.id, pp.pet_type, pp.pet_name, pp.breed, pp.size, pp.color, pp.markings,
                pp.photo_uris, pp.suburb, pp.microchip_number, pp.created_at,
                u.display_name as owner_display_name 
         FROM pet_profiles pp 
         JOIN users u ON pp.user_id = u.id 
         WHERE LOWER(pp.suburb) = LOWER($1) 
         ORDER BY pp.created_at DESC`,
        [suburb]
      );
      return res.json(result.rows.map((row) => ({
        id: row.id,
        petType: row.pet_type,
        pet_name: row.pet_name,
        breed: row.breed,
        size: row.size,
        color: row.color,
        markings: row.markings,
        photo_uris: typeof row.photo_uris === "string" ? JSON.parse(row.photo_uris) : row.photo_uris || [],
        suburb: row.suburb,
        hasChip: !!row.microchip_number,
        ownerdisplay_name: row.owner_display_name,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
      })));
    } catch (err) {
      console.error("Get profiles by suburb error:", err);
      return res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });
  app2.post("/api/profiles", authMiddleware, async (req, res) => {
    try {
      const b = req.body;
      const result = await db_default.query(
        `INSERT INTO pet_profiles (user_id, pet_type, pet_name, breed, size, color, markings, photo_uris, biometric_photo_uris, microchip_number, medical_notes, suburb, owner_name, owner_phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [req.user.id, b.petType, b.pet_name, b.breed || "", b.size || "medium", b.color || "", b.markings || "", JSON.stringify(b.photo_uris || []), JSON.stringify(b.biometricphoto_uris || []), b.microchipNumber || "", b.medicalNotes || "", b.suburb || "", b.ownerName || "", b.ownerPhone || ""]
      );
      return res.status(201).json(mapProfileRow(result.rows[0]));
    } catch (err) {
      console.error("Create profile error:", err);
      return res.status(500).json({ message: "Failed to create profile" });
    }
  });
  app2.put("/api/profiles/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db_default.query("SELECT user_id FROM pet_profiles WHERE id = $1", [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
      if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: "Not authorised" });
      const b = req.body;
      const fields = [];
      const values = [];
      let idx = 1;
      const updatable = {
        petType: "pet_type",
        pet_name: "pet_name",
        breed: "breed",
        size: "size",
        color: "color",
        markings: "markings",
        microchipNumber: "microchip_number",
        medicalNotes: "medical_notes",
        suburb: "suburb",
        ownerName: "owner_name",
        ownerPhone: "owner_phone"
      };
      for (const [key, col] of Object.entries(updatable)) {
        if (b[key] !== void 0) {
          fields.push(`${col} = $${idx}`);
          values.push(b[key]);
          idx++;
        }
      }
      if (b.photo_uris !== void 0) {
        fields.push(`photo_uris = $${idx}`);
        values.push(JSON.stringify(b.photo_uris));
        idx++;
      }
      if (b.biometricphoto_uris !== void 0) {
        fields.push(`biometric_photo_uris = $${idx}`);
        values.push(JSON.stringify(b.biometricphoto_uris));
        idx++;
      }
      fields.push(`updated_at = NOW()`);
      if (fields.length <= 1) return res.status(400).json({ message: "No fields to update" });
      values.push(id);
      const result = await db_default.query(
        `UPDATE pet_profiles SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.json(mapProfileRow(result.rows[0]));
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.delete("/api/profiles/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db_default.query("SELECT user_id FROM pet_profiles WHERE id = $1", [id]);
      if (existing.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
      if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: "Not authorised" });
      await db_default.query("DELETE FROM pet_profiles WHERE id = $1", [id]);
      return res.json({ message: "Profile deleted" });
    } catch (err) {
      console.error("Delete profile error:", err);
      return res.status(500).json({ message: "Failed to delete profile" });
    }
  });
  app2.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const result = await db_default.query(
        "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
        [req.user.id]
      );
      return res.json(result.rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        reportId: n.report_id,
        profileId: n.profile_id,
        read: n.read,
        createdAt: n.created_at.toISOString()
      })));
    } catch (err) {
      console.error("Get notifications error:", err);
      return res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.put("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      await db_default.query(
        "UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2",
        [req.params.id, req.user.id]
      );
      return res.json({ message: "Marked as read" });
    } catch (err) {
      console.error("Mark read error:", err);
      return res.status(500).json({ message: "Failed to mark as read" });
    }
  });
  app2.post("/api/notifications/read-all", authMiddleware, async (req, res) => {
    try {
      await db_default.query("UPDATE notifications SET read = true WHERE user_id = $1", [req.user.id]);
      return res.json({ message: "All marked as read" });
    } catch (err) {
      console.error("Mark all read error:", err);
      return res.status(500).json({ message: "Failed to mark all as read" });
    }
  });
  app2.delete("/api/notifications", authMiddleware, async (req, res) => {
    try {
      await db_default.query("DELETE FROM notifications WHERE user_id = $1", [req.user.id]);
      return res.json({ message: "Notifications cleared" });
    } catch (err) {
      console.error("Clear notifications error:", err);
      return res.status(500).json({ message: "Failed to clear notifications" });
    }
  });
  app2.post("/api/users/:id/block", authMiddleware, async (req, res) => {
    try {
      const blockedId = req.params.id;
      if (blockedId === req.user.id) {
        return res.status(400).json({ message: "You cannot block yourself" });
      }
      try {
        await db_default.query(
          "INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2)",
          [req.user.id, blockedId]
        );
      } catch (e) {
        if (e.code === "23505") {
          return res.json({ message: "User already blocked" });
        }
        throw e;
      }
      return res.json({ message: "User blocked" });
    } catch (err) {
      console.error("Block user error:", err);
      return res.status(500).json({ message: "Failed to block user" });
    }
  });
  app2.delete("/api/users/:id/block", authMiddleware, async (req, res) => {
    try {
      await db_default.query(
        "DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2",
        [req.user.id, req.params.id]
      );
      return res.json({ message: "User unblocked" });
    } catch (err) {
      console.error("Unblock user error:", err);
      return res.status(500).json({ message: "Failed to unblock user" });
    }
  });
  app2.get("/api/users/blocked", authMiddleware, async (req, res) => {
    try {
      const result = await db_default.query(
        `SELECT b.blocked_id, u.display_name, b.created_at
         FROM blocked_users b JOIN users u ON u.id = b.blocked_id
         WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`,
        [req.user.id]
      );
      return res.json(result.rows.map((r) => ({
        id: r.blocked_id,
        display_name: r.display_name,
        blockedAt: r.created_at.toISOString()
      })));
    } catch (err) {
      console.error("Get blocked users error:", err);
      return res.status(500).json({ message: "Failed to fetch blocked users" });
    }
  });
  app2.post("/api/content-report", authMiddleware, async (req, res) => {
    try {
      const { reportId, commentId, reason, details } = req.body;
      if (!reason) return res.status(400).json({ message: "Reason is required" });
      if (!reportId && !commentId) return res.status(400).json({ message: "Must specify a report or comment to flag" });
      await db_default.query(
        "INSERT INTO content_reports (reporter_id, report_id, comment_id, reason, details) VALUES ($1, $2, $3, $4, $5)",
        [req.user.id, reportId || null, commentId || null, reason, details || null]
      );
      return res.json({ message: "Content reported. We will review it shortly." });
    } catch (err) {
      console.error("Content report error:", err);
      return res.status(500).json({ message: "Failed to report content" });
    }
  });
  app2.get("/api/referral", authMiddleware, async (req, res) => {
    try {
      const userResult = await db_default.query(
        "SELECT referral_code, premium_until FROM users WHERE id = $1",
        [req.user.id]
      );
      const referralCode = userResult.rows[0]?.referral_code || "";
      const premiumUntil = userResult.rows[0]?.premium_until;
      const referralCount = await db_default.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE referred_by = $1",
        [req.user.id]
      );
      const rewardsResult = await db_default.query(
        "SELECT type, days_awarded, reason, created_at FROM referral_rewards WHERE user_id = $1 ORDER BY created_at DESC",
        [req.user.id]
      );
      const now = /* @__PURE__ */ new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const sharesResult = await db_default.query(
        "SELECT platform, shared_date FROM social_shares WHERE user_id = $1 AND shared_date >= $2 ORDER BY shared_date DESC",
        [req.user.id, startOfMonth.toISOString()]
      );
      const totalSharesThisMonth = sharesResult.rows.length;
      return res.json({
        referralCode,
        referralCount: referralCount.rows[0].count,
        premiumUntil: premiumUntil ? new Date(premiumUntil).toISOString() : null,
        rewards: rewardsResult.rows.map((r) => ({
          type: r.type,
          daysAwarded: r.days_awarded,
          reason: r.reason,
          createdAt: r.created_at.toISOString()
        })),
        sharesThisMonth: totalSharesThisMonth,
        shares: sharesResult.rows.map((s) => ({
          platform: s.platform,
          date: s.shared_date
        }))
      });
    } catch (err) {
      console.error("Get referral info error:", err);
      return res.status(500).json({ message: "Failed to fetch referral info" });
    }
  });
  app2.post("/api/referral/log-share", authMiddleware, async (req, res) => {
    try {
      const { platform } = req.body;
      if (!platform) return res.status(400).json({ message: "Platform is required" });
      const validPlatforms = ["instagram", "facebook", "tiktok"];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ message: "Invalid platform" });
      }
      try {
        await db_default.query(
          "INSERT INTO social_shares (user_id, platform) VALUES ($1, $2)",
          [req.user.id, platform]
        );
      } catch (e) {
        if (e.code === "23505") {
          return res.status(409).json({ message: "You already logged a share on this platform today" });
        }
        throw e;
      }
      const now = /* @__PURE__ */ new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const countResult = await db_default.query(
        "SELECT COUNT(*)::int AS count FROM social_shares WHERE user_id = $1 AND shared_date >= $2",
        [req.user.id, startOfMonth.toISOString()]
      );
      const totalShares = countResult.rows[0].count;
      if (totalShares === 20) {
        await awardPremiumDays(req.user.id, 7, "ambassador", "Social ambassador - 20 shares this month - earned 1 free week");
      }
      return res.json({
        message: "Share logged",
        sharesThisMonth: totalShares,
        rewardEarned: totalShares === 20
      });
    } catch (err) {
      console.error("Log share error:", err);
      return res.status(500).json({ message: "Failed to log share" });
    }
  });
  app2.delete("/api/account", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      await db_default.query("DELETE FROM comments WHERE user_id = $1", [userId]);
      await db_default.query("DELETE FROM report_likes WHERE user_id = $1", [userId]);
      await db_default.query("DELETE FROM notifications WHERE user_id = $1", [userId]);
      await db_default.query("DELETE FROM content_reports WHERE reporter_id = $1", [userId]);
      await db_default.query("DELETE FROM blocked_users WHERE blocker_id = $1 OR blocked_id = $1", [userId]);
      await db_default.query("DELETE FROM referral_shares WHERE user_id = $1", [userId]);
      const profileIds = await db_default.query("SELECT id FROM pet_profiles WHERE user_id = $1", [userId]);
      for (const p of profileIds.rows) {
        await db_default.query("DELETE FROM biometric_scans WHERE profile_id = $1", [p.id]);
      }
      await db_default.query("DELETE FROM pet_profiles WHERE user_id = $1", [userId]);
      const reportIds = await db_default.query("SELECT id FROM pet_reports WHERE user_id = $1", [userId]);
      for (const r of reportIds.rows) {
        await db_default.query("DELETE FROM timeline_events WHERE report_id = $1", [r.id]);
        await db_default.query("DELETE FROM comments WHERE report_id = $1", [r.id]);
        await db_default.query("DELETE FROM report_likes WHERE report_id = $1", [r.id]);
      }
      await db_default.query("DELETE FROM pet_reports WHERE user_id = $1", [userId]);
      await db_default.query("DELETE FROM users WHERE id = $1", [userId]);
      return res.json({ message: "Account and all associated data deleted successfully" });
    } catch (err) {
      console.error("Delete account error:", err);
      return res.status(500).json({ message: "Failed to delete account" });
    }
  });
  app2.post("/api/org/register", authMiddleware, writeLimiter, async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, type, abn, address, phone, email, website, latitude, longitude, description, logoUri } = req.body;
      if (!name || !type || !address || !phone || !email) {
        return res.status(400).json({ message: "Name, type, address, phone, and email are required" });
      }
      if (!["vet", "shelter", "rescue"].includes(type)) {
        return res.status(400).json({ message: "Type must be vet, shelter, or rescue" });
      }
      const existing = await db_default.query("SELECT id FROM organisations WHERE user_id = $1", [userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: "You already have a registered organisation" });
      }
      const result = await db_default.query(
        `INSERT INTO organisations (user_id, name, type, abn, address, phone, email, website, latitude, longitude, description, logo_uri)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [userId, name, type, abn || null, address, phone, email, website || null, latitude || 0, longitude || 0, description || null, logoUri || null]
      );
      await db_default.query("UPDATE users SET role = 'org' WHERE id = $1", [userId]);
      const org = result.rows[0];
      return res.status(201).json({
        id: org.id,
        userId: org.user_id,
        name: org.name,
        type: org.type,
        abn: org.abn,
        address: org.address,
        phone: org.phone,
        email: org.email,
        website: org.website,
        latitude: org.latitude,
        longitude: org.longitude,
        description: org.description,
        logoUri: org.logo_uri,
        status: org.status,
        approvedAt: org.approved_at,
        createdAt: org.created_at
      });
    } catch (err) {
      console.error("Org register error:", err);
      return res.status(500).json({ message: "Failed to register organisation" });
    }
  });
  app2.get("/api/org/me", authMiddleware, async (req, res) => {
    try {
      const result = await db_default.query("SELECT * FROM organisations WHERE user_id = $1", [req.user.id]);
      if (result.rows.length === 0) {
        return res.json(null);
      }
      const org = result.rows[0];
      const animalCount = await db_default.query("SELECT COUNT(*)::int AS count FROM organisation_animals WHERE org_id = $1", [org.id]);
      return res.json({
        id: org.id,
        userId: org.user_id,
        name: org.name,
        type: org.type,
        abn: org.abn,
        address: org.address,
        phone: org.phone,
        email: org.email,
        website: org.website,
        latitude: org.latitude,
        longitude: org.longitude,
        description: org.description,
        logoUri: org.logo_uri,
        status: org.status,
        approvedAt: org.approved_at,
        createdAt: org.created_at,
        animalCount: animalCount.rows[0].count
      });
    } catch (err) {
      console.error("Get org error:", err);
      return res.status(500).json({ message: "Failed to get organisation" });
    }
  });
  app2.put("/api/org/me", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const org = await db_default.query("SELECT id FROM organisations WHERE user_id = $1", [userId]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const orgId = org.rows[0].id;
      const { name, type, abn, address, phone, email, website, latitude, longitude, description, logoUri } = req.body;
      if (type && !["vet", "shelter", "rescue"].includes(type)) {
        return res.status(400).json({ message: "Type must be vet, shelter, or rescue" });
      }
      const result = await db_default.query(
        `UPDATE organisations SET name = COALESCE($1, name), type = COALESCE($2, type), abn = $3, address = COALESCE($4, address),
         phone = COALESCE($5, phone), email = COALESCE($6, email), website = $7, latitude = COALESCE($8, latitude),
         longitude = COALESCE($9, longitude), description = $10, logo_uri = $11
         WHERE id = $12 RETURNING *`,
        [name, type, abn || null, address, phone, email, website || null, latitude, longitude, description || null, logoUri || null, orgId]
      );
      const o = result.rows[0];
      return res.json({
        id: o.id,
        userId: o.user_id,
        name: o.name,
        type: o.type,
        abn: o.abn,
        address: o.address,
        phone: o.phone,
        email: o.email,
        website: o.website,
        latitude: o.latitude,
        longitude: o.longitude,
        description: o.description,
        logoUri: o.logo_uri,
        status: o.status,
        approvedAt: o.approved_at,
        createdAt: o.created_at
      });
    } catch (err) {
      console.error("Update org error:", err);
      return res.status(500).json({ message: "Failed to update organisation" });
    }
  });
  app2.get("/api/org/animals", authMiddleware, async (req, res) => {
    try {
      const org = await db_default.query("SELECT id FROM organisations WHERE user_id = $1", [req.user.id]);
      if (org.rows.length === 0) {
        return res.json([]);
      }
      const result = await db_default.query(
        "SELECT * FROM organisation_animals WHERE org_id = $1 ORDER BY created_at DESC",
        [org.rows[0].id]
      );
      return res.json(result.rows.map((a) => ({
        id: a.id,
        orgId: a.org_id,
        petType: a.pet_type,
        pet_name: a.pet_name,
        breed: a.breed,
        size: a.size,
        color: a.color,
        markings: a.markings,
        photo_uris: a.photo_uris || [],
        description: a.description,
        intakeDate: a.intake_date,
        intakeType: a.intake_type,
        microchipNumber: a.microchip_number,
        desexed: a.desexed,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      })));
    } catch (err) {
      console.error("Get org animals error:", err);
      return res.status(500).json({ message: "Failed to get animals" });
    }
  });
  app2.get("/api/org/animals/:id", authMiddleware, async (req, res) => {
    try {
      const org = await db_default.query("SELECT id FROM organisations WHERE user_id = $1", [req.user.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const result = await db_default.query(
        "SELECT * FROM organisation_animals WHERE id = $1 AND org_id = $2",
        [req.params.id, org.rows[0].id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Animal not found" });
      }
      const a = result.rows[0];
      return res.json({
        id: a.id,
        orgId: a.org_id,
        petType: a.pet_type,
        pet_name: a.pet_name,
        breed: a.breed,
        size: a.size,
        color: a.color,
        markings: a.markings,
        photo_uris: a.photo_uris || [],
        description: a.description,
        intakeDate: a.intake_date,
        intakeType: a.intake_type,
        microchipNumber: a.microchip_number,
        desexed: a.desexed,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      });
    } catch (err) {
      console.error("Get org animal error:", err);
      return res.status(500).json({ message: "Failed to get animal" });
    }
  });
  app2.post("/api/org/animals", authMiddleware, async (req, res) => {
    try {
      const org = await db_default.query("SELECT id, status FROM organisations WHERE user_id = $1", [req.user.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      if (org.rows[0].status !== "approved") {
        return res.status(403).json({ message: "Organisation must be approved to add animals" });
      }
      const orgId = org.rows[0].id;
      const { petType, pet_name, breed, size, color, markings, photo_uris, description, intakeDate, intakeType, microchipNumber, desexed } = req.body;
      if (!petType) {
        return res.status(400).json({ message: "Pet type is required" });
      }
      if (!["dog", "cat", "bird", "rabbit", "other"].includes(petType)) {
        return res.status(400).json({ message: "Invalid pet type" });
      }
      if (size && !["small", "medium", "large"].includes(size)) {
        return res.status(400).json({ message: "Invalid size" });
      }
      if (intakeType && !["stray", "surrendered", "rescue", "transferred"].includes(intakeType)) {
        return res.status(400).json({ message: "Invalid intake type" });
      }
      const result = await db_default.query(
        `INSERT INTO organisation_animals (org_id, pet_type, pet_name, breed, size, color, markings, photo_uris, description, intake_date, intake_type, microchip_number, desexed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [orgId, petType, pet_name || "", breed || "", size || "medium", color || "", markings || "", JSON.stringify(photo_uris || []), description || "", intakeDate || null, intakeType || "stray", microchipNumber || null, desexed || false]
      );
      const a = result.rows[0];
      return res.status(201).json({
        id: a.id,
        orgId: a.org_id,
        petType: a.pet_type,
        pet_name: a.pet_name,
        breed: a.breed,
        size: a.size,
        color: a.color,
        markings: a.markings,
        photo_uris: a.photo_uris || [],
        description: a.description,
        intakeDate: a.intake_date,
        intakeType: a.intake_type,
        microchipNumber: a.microchip_number,
        desexed: a.desexed,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      });
    } catch (err) {
      console.error("Add org animal error:", err);
      return res.status(500).json({ message: "Failed to add animal" });
    }
  });
  app2.put("/api/org/animals/:id", authMiddleware, async (req, res) => {
    try {
      const animalId = req.params.id;
      const org = await db_default.query("SELECT id FROM organisations WHERE user_id = $1", [req.user.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const animal = await db_default.query("SELECT id FROM organisation_animals WHERE id = $1 AND org_id = $2", [animalId, org.rows[0].id]);
      if (animal.rows.length === 0) {
        return res.status(404).json({ message: "Animal not found" });
      }
      const { petType, pet_name, breed, size, color, markings, photo_uris, description, intakeDate, intakeType, microchipNumber, desexed, status } = req.body;
      if (petType && !["dog", "cat", "bird", "rabbit", "other"].includes(petType)) {
        return res.status(400).json({ message: "Invalid pet type" });
      }
      if (size && !["small", "medium", "large"].includes(size)) {
        return res.status(400).json({ message: "Invalid size" });
      }
      if (intakeType && !["stray", "surrendered", "rescue", "transferred"].includes(intakeType)) {
        return res.status(400).json({ message: "Invalid intake type" });
      }
      if (status && !["available", "adopted", "on_hold", "fostered"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const result = await db_default.query(
        `UPDATE organisation_animals SET pet_type = COALESCE($1, pet_type), pet_name = COALESCE($2, pet_name),
         breed = COALESCE($3, breed), size = COALESCE($4, size), color = COALESCE($5, color),
         markings = COALESCE($6, markings), photo_uris = COALESCE($7, photo_uris),
         description = COALESCE($8, description), intake_date = $9, intake_type = COALESCE($10, intake_type),
         microchip_number = $11, desexed = COALESCE($12, desexed), status = COALESCE($13, status),
         updated_at = NOW() WHERE id = $14 RETURNING *`,
        [petType, pet_name, breed, size, color, markings, photo_uris ? JSON.stringify(photo_uris) : null, description, intakeDate || null, intakeType, microchipNumber || null, desexed, status, animalId]
      );
      const a = result.rows[0];
      return res.json({
        id: a.id,
        orgId: a.org_id,
        petType: a.pet_type,
        pet_name: a.pet_name,
        breed: a.breed,
        size: a.size,
        color: a.color,
        markings: a.markings,
        photo_uris: a.photo_uris || [],
        description: a.description,
        intakeDate: a.intake_date,
        intakeType: a.intake_type,
        microchipNumber: a.microchip_number,
        desexed: a.desexed,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      });
    } catch (err) {
      console.error("Update org animal error:", err);
      return res.status(500).json({ message: "Failed to update animal" });
    }
  });
  app2.delete("/api/org/animals/:id", authMiddleware, async (req, res) => {
    try {
      const org = await db_default.query("SELECT id FROM organisations WHERE user_id = $1", [req.user.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "No organisation found" });
      }
      const result = await db_default.query("DELETE FROM organisation_animals WHERE id = $1 AND org_id = $2 RETURNING id", [req.params.id, org.rows[0].id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Animal not found" });
      }
      return res.json({ message: "Animal deleted" });
    } catch (err) {
      console.error("Delete org animal error:", err);
      return res.status(500).json({ message: "Failed to delete animal" });
    }
  });
  app2.get("/api/org/public", async (_req, res) => {
    try {
      const result = await db_default.query(
        `SELECT o.*, COUNT(oa.id)::int AS animal_count
         FROM organisations o
         LEFT JOIN organisation_animals oa ON oa.org_id = o.id AND oa.status = 'available'
         WHERE o.status = 'approved'
         GROUP BY o.id
         ORDER BY o.name`
      );
      return res.json(result.rows.map((o) => ({
        id: o.id,
        userId: o.user_id,
        name: o.name,
        type: o.type,
        abn: o.abn,
        address: o.address,
        phone: o.phone,
        email: o.email,
        website: o.website,
        latitude: o.latitude,
        longitude: o.longitude,
        description: o.description,
        logoUri: o.logo_uri,
        status: o.status,
        approvedAt: o.approved_at,
        createdAt: o.created_at,
        animalCount: o.animal_count
      })));
    } catch (err) {
      console.error("Get public orgs error:", err);
      return res.status(500).json({ message: "Failed to get organisations" });
    }
  });
  app2.get("/api/org/:id/animals", async (req, res) => {
    try {
      const org = await db_default.query("SELECT id, name, type, status FROM organisations WHERE id = $1 AND status = 'approved'", [req.params.id]);
      if (org.rows.length === 0) {
        return res.status(404).json({ message: "Organisation not found" });
      }
      const result = await db_default.query(
        "SELECT * FROM organisation_animals WHERE org_id = $1 AND status = 'available' ORDER BY created_at DESC",
        [req.params.id]
      );
      return res.json(result.rows.map((a) => ({
        id: a.id,
        orgId: a.org_id,
        petType: a.pet_type,
        pet_name: a.pet_name,
        breed: a.breed,
        size: a.size,
        color: a.color,
        markings: a.markings,
        photo_uris: a.photo_uris || [],
        description: a.description,
        intakeDate: a.intake_date,
        intakeType: a.intake_type,
        microchipNumber: a.microchip_number,
        desexed: a.desexed,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        orgName: org.rows[0].name,
        orgType: org.rows[0].type
      })));
    } catch (err) {
      console.error("Get org animals public error:", err);
      return res.status(500).json({ message: "Failed to get animals" });
    }
  });
  app2.get("/api/admin/org/pending", authMiddleware, requireRole("admin"), async (_req, res) => {
    try {
      const result = await db_default.query(
        `SELECT o.*, u.email AS registrant_email, u.display_name AS registrant_name
         FROM organisations o JOIN users u ON u.id = o.user_id
         WHERE o.status = 'pending' ORDER BY o.created_at`
      );
      return res.json(result.rows.map((o) => ({
        id: o.id,
        userId: o.user_id,
        name: o.name,
        type: o.type,
        abn: o.abn,
        address: o.address,
        phone: o.phone,
        email: o.email,
        website: o.website,
        latitude: o.latitude,
        longitude: o.longitude,
        description: o.description,
        logoUri: o.logo_uri,
        status: o.status,
        createdAt: o.created_at,
        registrantEmail: o.registrant_email,
        registrantName: o.registrant_name
      })));
    } catch (err) {
      console.error("Get pending orgs error:", err);
      return res.status(500).json({ message: "Failed to get pending organisations" });
    }
  });
  app2.post("/api/admin/org/:id/approve", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const result = await db_default.query(
        "UPDATE organisations SET status = 'approved', approved_at = NOW() WHERE id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Organisation not found" });
      }
      return res.json({ message: "Organisation approved", id: req.params.id });
    } catch (err) {
      console.error("Approve org error:", err);
      return res.status(500).json({ message: "Failed to approve" });
    }
  });
  app2.post("/api/admin/org/:id/reject", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const result = await db_default.query(
        "UPDATE organisations SET status = 'rejected' WHERE id = $1 RETURNING *",
        [req.params.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Organisation not found" });
      }
      return res.json({ message: "Organisation rejected", id: req.params.id });
    } catch (err) {
      console.error("Reject org error:", err);
      return res.status(500).json({ message: "Failed to reject" });
    }
  });
  app2.get("/api/conversations", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await db_default.query(
        `SELECT c.*,
          u1.display_name AS participant1_name,
          u2.display_name AS participant2_name,
          pr.pet_name AS report_pet_name,
          pr.status AS report_status,
          pr.photo_uri AS report_photo,
          (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.read_at IS NULL) AS unread_count
         FROM conversations c
         JOIN users u1 ON u1.id = c.participant1_id
         JOIN users u2 ON u2.id = c.participant2_id
         LEFT JOIN pet_reports pr ON pr.id = c.report_id
         WHERE c.participant1_id = $1 OR c.participant2_id = $1
         ORDER BY c.last_message_at DESC`,
        [userId]
      );
      return res.json(result.rows.map((r) => ({
        id: r.id,
        reportId: r.report_id,
        reportpet_name: r.report_pet_name || null,
        reportStatus: r.report_status || null,
        reportPhoto: r.report_photo || null,
        otherUserId: r.participant1_id === userId ? r.participant2_id : r.participant1_id,
        otherUserName: r.participant1_id === userId ? r.participant2_name : r.participant1_name,
        lastMessageText: r.last_message_text,
        lastMessageAt: r.last_message_at instanceof Date ? r.last_message_at.toISOString() : r.last_message_at,
        unreadCount: r.unread_count,
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at
      })));
    } catch (err) {
      console.error("Get conversations error:", err);
      return res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/conversations/unread-count", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await db_default.query(
        `SELECT COUNT(*)::int AS count FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
         AND m.sender_id != $1 AND m.read_at IS NULL`,
        [userId]
      );
      return res.json({ count: result.rows[0]?.count || 0 });
    } catch (err) {
      console.error("Unread count error:", err);
      return res.status(500).json({ message: "Failed to get unread count" });
    }
  });
  app2.post("/api/conversations", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { reportId, recipientId } = req.body;
      if (!recipientId) return res.status(400).json({ message: "recipientId is required" });
      if (recipientId === userId) return res.status(400).json({ message: "Cannot message yourself" });
      const p1 = userId < recipientId ? userId : recipientId;
      const p2 = userId < recipientId ? recipientId : userId;
      const existing = await db_default.query(
        reportId ? `SELECT id FROM conversations WHERE report_id = $1 AND participant1_id = $2 AND participant2_id = $3` : `SELECT id FROM conversations WHERE report_id IS NULL AND participant1_id = $1 AND participant2_id = $2`,
        reportId ? [reportId, p1, p2] : [p1, p2]
      );
      if (existing.rows.length > 0) {
        return res.json({ conversationId: existing.rows[0].id, existing: true });
      }
      const result = await db_default.query(
        `INSERT INTO conversations (report_id, participant1_id, participant2_id) VALUES ($1, $2, $3) RETURNING id`,
        [reportId || null, p1, p2]
      );
      return res.status(201).json({ conversationId: result.rows[0].id, existing: false });
    } catch (err) {
      console.error("Create conversation error:", err);
      return res.status(500).json({ message: "Failed to create conversation" });
    }
  });
  app2.get("/api/conversations/:id/messages", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const conv = await db_default.query(
        `SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)`,
        [id, userId]
      );
      if (conv.rows.length === 0) return res.status(404).json({ message: "Conversation not found" });
      await db_default.query(
        `UPDATE messages SET read_at = NOW() WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
        [id, userId]
      );
      const result = await db_default.query(
        `SELECT m.*, u.display_name AS sender_name FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC`,
        [id]
      );
      return res.json(result.rows.map((r) => ({
        id: r.id,
        senderId: r.sender_id,
        senderName: r.sender_name,
        text: r.text,
        isMe: r.sender_id === userId,
        readAt: r.read_at ? r.read_at instanceof Date ? r.read_at.toISOString() : r.read_at : null,
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at
      })));
    } catch (err) {
      console.error("Get messages error:", err);
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/conversations/:id/messages", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { text } = req.body;
      if (!text || !text.trim()) return res.status(400).json({ message: "Message text is required" });
      const conv = await db_default.query(
        `SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)`,
        [id, userId]
      );
      if (conv.rows.length === 0) return res.status(404).json({ message: "Conversation not found" });
      const result = await db_default.query(
        `INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *`,
        [id, userId, text.trim()]
      );
      await db_default.query(
        `UPDATE conversations SET last_message_text = $1, last_message_at = NOW() WHERE id = $2`,
        [text.trim().substring(0, 200), id]
      );
      const otherId = conv.rows[0].participant1_id === userId ? conv.rows[0].participant2_id : conv.rows[0].participant1_id;
      const senderName = req.user.display_name;
      await db_default.query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, 'message', $2, $3)`,
        [otherId, `New message from ${senderName}`, text.trim().substring(0, 100)]
      );
      const msg = result.rows[0];
      res.status(201).json({
        id: msg.id,
        senderId: msg.sender_id,
        senderName,
        text: msg.text,
        isMe: true,
        readAt: null,
        createdAt: msg.created_at instanceof Date ? msg.created_at.toISOString() : msg.created_at
      });
      const recipientResult = await db_default.query("SELECT push_token FROM users WHERE id = $1", [otherId]);
      const recipientToken = recipientResult.rows[0]?.push_token || null;
      sendPushNotification(
        recipientToken,
        otherId,
        `New message from ${senderName}`,
        text.trim().substring(0, 100)
      ).catch((err) => console.error("[Push] Unhandled error:", err));
    } catch (err) {
      console.error("Send message error:", err);
      return res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.post("/api/analytics/event", optionalAuth, async (req, res) => {
    try {
      const { eventName, properties = {}, sessionId, platform } = req.body;
      if (!eventName || typeof eventName !== "string") {
        return res.status(400).json({ message: "eventName required" });
      }
      const safeName = eventName.slice(0, 100);
      const userId = req.user?.id || null;
      const safeProps = typeof properties === "object" && !Array.isArray(properties) ? { ...properties } : {};
      delete safeProps.email;
      delete safeProps.phone;
      delete safeProps.password;
      delete safeProps.name;
      await db_default.query(
        `INSERT INTO analytics_events (event_name, properties, user_id, session_id, platform)
         VALUES ($1, $2, $3, $4, $5)`,
        [safeName, JSON.stringify(safeProps), userId, sessionId || null, platform || null]
      );
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error("Analytics event error:", err);
      return res.status(500).json({ message: "Failed to log event" });
    }
  });
  app2.get("/api/admin/analytics", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const summary = await db_default.query(
        `SELECT event_name, COUNT(*) AS total, COUNT(DISTINCT user_id) AS unique_users
         FROM analytics_events
         WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
         GROUP BY event_name
         ORDER BY total DESC`,
        [days]
      );
      const daily = await db_default.query(
        `SELECT DATE(created_at) AS day, COUNT(*) AS events, COUNT(DISTINCT user_id) AS users
         FROM analytics_events
         WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
         GROUP BY DATE(created_at)
         ORDER BY day DESC`,
        [days]
      );
      return res.json({ summary: summary.rows, daily: daily.rows, days });
    } catch (err) {
      console.error("Analytics summary error:", err);
      return res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/ads/submit", authMiddleware, async (req, res) => {
    try {
      const { businessName, businessType, contactName, contactEmail, contactPhone, website, imageUri, linkUrl, description, placement } = req.body;
      if (!businessName || !imageUri) {
        return res.status(400).json({ message: "Business name and ad image are required" });
      }
      const result = await db_default.query(
        `INSERT INTO ads (user_id, business_name, business_type, contact_name, contact_email, contact_phone, website, image_uri, link_url, description, placement)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [req.user.id, businessName, businessType || "other", contactName || "", contactEmail || "", contactPhone || "", website || "", imageUri, linkUrl || "", description || "", placement || "feed"]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Submit ad error:", err);
      return res.status(500).json({ message: "Failed to submit ad" });
    }
  });
  app2.get("/api/ads/active", async (_req, res) => {
    try {
      const settingsResult = await db_default.query("SELECT value FROM app_settings WHERE key = 'ads_enabled'");
      const adsEnabled = settingsResult.rows[0]?.value !== "false";
      if (!adsEnabled) return res.json([]);
      const result = await db_default.query(
        `SELECT id, business_name, business_type, image_uri, link_url, description, website, placement
         FROM ads
         WHERE status = 'approved'
           AND (start_date IS NULL OR start_date <= NOW())
           AND (end_date IS NULL OR end_date > NOW())
         ORDER BY RANDOM()`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error("Fetch active ads error:", err);
      return res.status(500).json({ message: "Failed to fetch ads" });
    }
  });
  app2.get("/api/admin/ads/pending", authMiddleware, requireRole("admin"), async (_req, res) => {
    try {
      const result = await db_default.query(
        `SELECT a.*, u.display_name as registrant_name, u.email as registrant_email
         FROM ads a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.status = 'pending'
         ORDER BY a.created_at ASC`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error("Fetch pending ads error:", err);
      return res.status(500).json({ message: "Failed to fetch pending ads" });
    }
  });
  app2.get("/api/admin/ads/all", authMiddleware, requireRole("admin"), async (_req, res) => {
    try {
      const settingsResult = await db_default.query("SELECT value FROM app_settings WHERE key = 'ads_enabled'");
      const result = await db_default.query(
        `SELECT a.*, u.display_name as registrant_name, u.email as registrant_email
         FROM ads a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC`
      );
      return res.json({ ads: result.rows, adsEnabled: settingsResult.rows[0]?.value !== "false" });
    } catch (err) {
      console.error("Fetch all ads error:", err);
      return res.status(500).json({ message: "Failed to fetch ads" });
    }
  });
  app2.post("/api/admin/ads/:id/approve", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { durationDays } = req.body;
      const days = durationDays || 30;
      const now = /* @__PURE__ */ new Date();
      const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1e3);
      await db_default.query(
        `UPDATE ads SET status = 'approved', start_date = $1, end_date = $2, duration_days = $3, approved_at = $1, approved_by = $4 WHERE id = $5`,
        [now, endDate, days, req.user.id, id]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("Approve ad error:", err);
      return res.status(500).json({ message: "Failed to approve ad" });
    }
  });
  app2.post("/api/admin/ads/:id/reject", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await db_default.query("UPDATE ads SET status = 'rejected' WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err) {
      console.error("Reject ad error:", err);
      return res.status(500).json({ message: "Failed to reject ad" });
    }
  });
  app2.post("/api/admin/ads/:id/pause", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await db_default.query("UPDATE ads SET status = 'paused' WHERE id = $1 AND status = 'approved'", [id]);
      return res.json({ success: true });
    } catch (err) {
      console.error("Pause ad error:", err);
      return res.status(500).json({ message: "Failed to pause ad" });
    }
  });
  app2.post("/api/admin/ads/:id/resume", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await db_default.query("UPDATE ads SET status = 'approved' WHERE id = $1 AND status = 'paused'", [id]);
      return res.json({ success: true });
    } catch (err) {
      console.error("Resume ad error:", err);
      return res.status(500).json({ message: "Failed to resume ad" });
    }
  });
  app2.delete("/api/admin/ads/:id", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await db_default.query("DELETE FROM ads WHERE id = $1", [id]);
      return res.json({ success: true });
    } catch (err) {
      console.error("Delete ad error:", err);
      return res.status(500).json({ message: "Failed to delete ad" });
    }
  });
  app2.post("/api/admin/ads/toggle", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { enabled } = req.body;
      await db_default.query(
        "INSERT INTO app_settings (key, value, updated_at) VALUES ('ads_enabled', $1, NOW()) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()",
        [enabled ? "true" : "false"]
      );
      return res.json({ success: true, enabled });
    } catch (err) {
      console.error("Toggle ads error:", err);
      return res.status(500).json({ message: "Failed to toggle ads" });
    }
  });
  app2.get("/api/admin/match-queue", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const status = req.query.status || "pending";
      const page = parseInt(req.query.page || "1", 10);
      const limit = 20;
      const offset = (page - 1) * limit;
      const result = await db_default.query(
        `SELECT
           q.id, q.confidence, q.reason, q.status, q.created_at, q.reviewed_at,
           l.id AS lost_id, l.pet_name AS lost_pet_name, l.pet_type AS lost_pet_type,
           l.breed AS lost_breed, l.color AS lost_color, l.location_name AS lost_location,
           l.last_seen_date AS lost_date, l.photo_uri AS lost_photo_uri, l.photo_uris AS lost_photo_uris,
           lu.id AS lost_user_id, lu.username AS lost_username, lu.email AS lost_email, lu.push_token AS lost_push_token,
           f.id AS found_id, f.pet_name AS found_pet_name, f.pet_type AS found_pet_type,
           f.breed AS found_breed, f.color AS found_color, f.location_name AS found_location,
           f.last_seen_date AS found_date, f.photo_uri AS found_photo_uri, f.photo_uris AS found_photo_uris,
           fu.username AS found_username, fu.email AS found_email
         FROM admin_match_queue q
         JOIN pet_reports l ON l.id = q.lost_report_id
         JOIN pet_reports f ON f.id = q.found_report_id
         JOIN users lu ON lu.id = l.user_id
         JOIN users fu ON fu.id = f.user_id
         WHERE q.status = $1
         ORDER BY q.confidence DESC, q.created_at DESC
         LIMIT $2 OFFSET $3`,
        [status, limit, offset]
      );
      const countResult = await db_default.query(
        `SELECT COUNT(*) FROM admin_match_queue WHERE status = $1`,
        [status]
      );
      const rows = result.rows.map((r) => {
        const lostUris = typeof r.lost_photo_uris === "string" ? JSON.parse(r.lost_photo_uris || "[]") : r.lost_photo_uris || [];
        const foundUris = typeof r.found_photo_uris === "string" ? JSON.parse(r.found_photo_uris || "[]") : r.found_photo_uris || [];
        const lostThumb = lostUris.find((u) => u.startsWith("data:") || u.startsWith("http")) || r.lost_photo_uri || null;
        const foundThumb = foundUris.find((u) => u.startsWith("data:") || u.startsWith("http")) || r.found_photo_uri || null;
        return {
          id: r.id,
          confidence: r.confidence,
          reason: r.reason,
          status: r.status,
          createdAt: r.created_at,
          reviewedAt: r.reviewed_at,
          lostReport: {
            id: r.lost_id,
            pet_name: r.lost_pet_name,
            petType: r.lost_pet_type,
            breed: r.lost_breed,
            color: r.lost_color,
            location: r.lost_location,
            date: r.lost_date,
            thumbnail: lostThumb,
            ownerName: r.lost_username,
            ownerEmail: r.lost_email,
            ownerPushToken: r.lost_push_token,
            ownerId: r.lost_user_id
          },
          foundReport: {
            id: r.found_id,
            pet_name: r.found_pet_name,
            petType: r.found_pet_type,
            breed: r.found_breed,
            color: r.found_color,
            location: r.found_location,
            date: r.found_date,
            thumbnail: foundThumb,
            reporterName: r.found_username,
            reporterEmail: r.found_email
          }
        };
      });
      return res.json({
        items: rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit
      });
    } catch (err) {
      console.error("Get match queue error:", err);
      return res.status(500).json({ message: "Failed to fetch match queue" });
    }
  });
  app2.put("/api/admin/match-queue/:id/status", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["reviewed", "dismissed", "actioned"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      await db_default.query(
        `UPDATE admin_match_queue SET status = $1, reviewed_at = NOW() WHERE id = $2`,
        [status, id]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("Update match queue status error:", err);
      return res.status(500).json({ message: "Failed to update status" });
    }
  });
  app2.post("/api/admin/match-queue/:id/notify-owner", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const queueRow = await db_default.query(
        `SELECT q.lost_report_id, q.found_report_id, q.confidence, q.reason,
                l.pet_name, l.user_id AS owner_id,
                u.push_token AS owner_push_token, u.username AS owner_name
         FROM admin_match_queue q
         JOIN pet_reports l ON l.id = q.lost_report_id
         JOIN users u ON u.id = l.user_id
         WHERE q.id = $1`,
        [id]
      );
      if (queueRow.rows.length === 0) {
        return res.status(404).json({ message: "Match not found" });
      }
      const match = queueRow.rows[0];
      const title = `Possible match found for ${match.pet_name}!`;
      const message = `Our team reviewed a potential match for your lost pet. Open The Fur Finder to see the details \u2014 it could be yours!`;
      await db_default.query(
        `INSERT INTO notifications (user_id, type, title, message, report_id)
         VALUES ($1, 'ai_match', $2, $3, $4)`,
        [match.owner_id, title, message, match.lost_report_id]
      );
      sendPushNotification(match.owner_push_token, match.owner_id, title, message, {
        type: "ai_match",
        reportId: match.lost_report_id
      }).catch((err) => console.error("Notify owner push error:", err));
      await db_default.query(
        `UPDATE admin_match_queue SET status = 'actioned', reviewed_at = NOW() WHERE id = $1`,
        [id]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("Notify owner error:", err);
      return res.status(500).json({ message: "Failed to notify owner" });
    }
  });
  app2.get("/api/admin/batch-match/status", authMiddleware, requireRole("admin"), async (_req, res) => {
    try {
      const pendingCount = await db_default.query(
        `SELECT COUNT(*) FROM admin_match_queue WHERE status = 'pending'`
      ).catch(() => ({ rows: [{ count: "0" }] }));
      const totalCount = await db_default.query(
        `SELECT COUNT(*) FROM admin_match_queue`
      ).catch(() => ({ rows: [{ count: "0" }] }));
      return res.json({
        running: batchRunning,
        lastRun: lastRunResult,
        pendingCount: parseInt(pendingCount.rows[0].count, 10),
        totalCount: parseInt(totalCount.rows[0].count, 10)
      });
    } catch (err) {
      console.error("Batch match status error:", err);
      return res.status(500).json({ message: "Failed to get status" });
    }
  });
  app2.post("/api/admin/batch-match/run", authMiddleware, requireRole("admin"), async (_req, res) => {
    if (batchRunning) {
      return res.status(409).json({ message: "A scan is already running. Please wait." });
    }
    res.json({ success: true, message: "Batch scan started. Check back in a few minutes." });
    runBatchMatch().then((r) => console.log("[BatchMatch] Manual run complete:", r)).catch((err) => console.error("[BatchMatch] Manual run error:", err));
  });
}

// server/index.ts
import * as fs from "fs";
import * as path2 from "path";
import dotenv from "dotenv";
var app = express2();
var log = console.log;
dotenv.config();
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    origins.add(`http://${process.env.WEB_APP_DOMAIN}`);
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express2.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express2.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const privacyPolicyHtml = fs.readFileSync(
    path2.resolve(process.cwd(), "server", "templates", "privacy-policy.html"),
    "utf-8"
  );
  const termsOfUseHtml = fs.readFileSync(
    path2.resolve(process.cwd(), "server", "templates", "terms-of-use.html"),
    "utf-8"
  );
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.get("/privacy-policy", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(privacyPolicyHtml);
  });
  app2.get("/terms-of-use", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(termsOfUseHtml);
  });
  const deleteAccountHtml = fs.readFileSync(
    path2.resolve(process.cwd(), "server", "templates", "delete-account.html"),
    "utf-8"
  );
  app2.get("/delete-account", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(deleteAccountHtml);
  });
  const appFeaturesHtml = fs.readFileSync(
    path2.resolve(process.cwd(), "server", "templates", "app-features.html"),
    "utf-8"
  );
  app2.get("/app-features", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(appFeaturesHtml);
  });
  const colourPreviewHtml = fs.readFileSync(
    path2.resolve(process.cwd(), "server", "templates", "colour-preview.html"),
    "utf-8"
  );
  app2.get("/colour-preview", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(colourPreviewHtml);
  });
  app2.use("/store-assets", express2.static(path2.resolve(process.cwd(), "assets", "store")));
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express2.static(path2.resolve(process.cwd(), "assets")));
  app2.use(express2.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    sendErrorToDiscord(err, { source: "backend", method: _req.method, path: _req.path });
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
var httpServer = createServer(app);
var port = parseInt(process.env.PORT || "3000", 10);
setupCors(app);
setupBodyParsing(app);
setupRequestLogging(app);
app.get("/api/healthcheck", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var appReady = false;
app.use((req, res, next) => {
  if (!appReady && req.path === "/") {
    return res.status(200).send("OK");
  }
  next();
});
httpServer.listen(
  {
    port,
    host: "localhost"
  },
  () => {
    log(`express server serving on port ${port}`);
    (async () => {
      try {
        configureExpoAndLanding(app);
      } catch (err) {
        console.error("Expo/Landing setup error (non-fatal):", err);
      }
      try {
        await registerRoutes(app);
      } catch (err) {
        console.error("Route registration error (non-fatal):", err);
      }
      setupErrorHandler(app);
      appReady = true;
      log("Routes loaded, app fully ready");
      try {
        const schemaPaths = [
          path2.resolve(process.cwd(), "server_dist", "schema.sql"),
          path2.resolve(process.cwd(), "server", "schema.sql")
        ];
        let schemaApplied = false;
        for (const sp of schemaPaths) {
          if (fs.existsSync(sp)) {
            const schemaSql = fs.readFileSync(sp, "utf-8");
            const pool2 = (await Promise.resolve().then(() => (init_db(), db_exports))).default;
            await pool2.query(schemaSql);
            log("Database schema applied successfully from " + sp);
            schemaApplied = true;
            break;
          }
        }
        if (!schemaApplied) {
          log("Warning: schema.sql not found, skipping schema init");
        }
        const { runProductionSeed: runProductionSeed2 } = await Promise.resolve().then(() => (init_production_seed(), production_seed_exports));
        await runProductionSeed2();
      } catch (err) {
        console.error("Schema/seed init error (non-fatal):", err);
      }
      try {
        const { scheduleBatchMatch: scheduleBatchMatch2 } = await Promise.resolve().then(() => (init_batch_match(), batch_match_exports));
        scheduleBatchMatch2();
      } catch (err) {
        console.error("BatchMatch schedule error (non-fatal):", err);
      }
      log("All startup tasks completed");
    })();
  }
);
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  sendErrorToDiscord(err, { source: "backend-uncaughtException" });
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  sendErrorToDiscord(reason, { source: "backend-unhandledRejection" });
});
