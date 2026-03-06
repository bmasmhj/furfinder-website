import pool from './db';
import bcrypt from 'bcryptjs';

const REVIEW_EMAIL = 'googlereview@thefurfinder.com';
const REVIEW_PASSWORD = 'PetReunite2026Review!';
const REVIEW_DISPLAY_NAME = 'App Reviewer';
const REVIEW_PHONE = '0400000000';

const ADMIN_EMAIL = 'admin@thefurfinder.com';
const ADMIN_PASSWORD = 'FurFinderAdmin2026!';
const ADMIN_DISPLAY_NAME = 'Fur Finder Admin';

const PET_TYPES = ['dog', 'dog', 'dog', 'cat', 'cat', 'cat', 'bird', 'rabbit', 'other'];
const DOG_BREEDS = ['Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle', 'Kelpie', 'Border Collie', 'Cavalier King Charles', 'Staffordshire Bull Terrier'];
const CAT_BREEDS = ['Domestic Shorthair', 'Tabby', 'Siamese', 'Ragdoll', 'Bengal', 'Maine Coon', 'Burmese', 'British Shorthair'];
const BIRD_BREEDS = ['Budgerigar', 'Cockatiel', 'Galah', 'Rainbow Lorikeet'];
const RABBIT_BREEDS = ['Dwarf', 'Lop', 'Rex', 'Holland Lop'];
const SIZES = ['small', 'medium', 'large'];
const COLORS = ['black', 'white', 'brown', 'grey', 'golden', 'cream', 'orange', 'black and white', 'tricolor', 'ginger'];
const MARKINGS = ['', 'white chest', 'white paws', 'spotted', 'striped tail', 'white blaze on face', 'tan eyebrows', ''];
const DOG_NAMES = ['Max', 'Bella', 'Charlie', 'Luna', 'Buddy', 'Daisy', 'Rocky', 'Molly', 'Bear', 'Coco', 'Jack', 'Poppy', 'Duke', 'Ruby', 'Archie', 'Mia'];
const CAT_NAMES = ['Whiskers', 'Shadow', 'Mittens', 'Oliver', 'Luna', 'Simba', 'Nala', 'Tiger', 'Felix', 'Cleo', 'Misty', 'Oreo'];
const BIRD_NAMES = ['Coco', 'Tweety', 'Polly', 'Sky', 'Blue', 'Sunny'];
const RABBIT_NAMES = ['Biscuit', 'Thumper', 'Snowball', 'Cinnamon', 'Hazel'];
const OTHER_NAMES = ['Fluffy', 'Spot', 'Patches', 'Nibbles'];

const AREAS = [
  { name: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
  { name: 'Bondi Beach', lat: -33.8915, lng: 151.2767 },
  { name: 'Parramatta', lat: -33.8150, lng: 151.0011 },
  { name: 'Melbourne CBD', lat: -37.8136, lng: 144.9631 },
  { name: 'St Kilda', lat: -37.8676, lng: 144.9829 },
  { name: 'Brisbane CBD', lat: -27.4698, lng: 153.0251 },
  { name: 'Gold Coast', lat: -28.0167, lng: 153.4000 },
  { name: 'Perth CBD', lat: -31.9505, lng: 115.8605 },
  { name: 'Adelaide CBD', lat: -34.9285, lng: 138.6007 },
  { name: 'Canberra', lat: -35.2809, lng: 149.1300 },
];

const DESCRIPTIONS = [
  'Very friendly and responds to name. Was wearing a red collar when last seen.',
  'Indoor pet, never been outside before. Very scared. May be hiding.',
  'Has a distinctive limping gait in left rear leg. Very docile.',
  'Microchipped. Responds to its name. Last seen near the park.',
  'Escaped through a gap in the backyard fence. Very food motivated.',
  'Was spooked by fireworks and bolted. Usually stays close to home.',
  'Senior pet, moves slowly. Very gentle. May approach strangers.',
  'Very timid around strangers. Unlikely to approach people.',
  'Found wandering near railway station. Well-groomed, appears cared for.',
  'Found at local park, friendly and approachable. No collar.',
  'Appeared in our backyard. Very hungry. Eating and resting now.',
  'Found on main road, safely contained. Seems disoriented.',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(base: number, rangeKm: number): number {
  return base + (Math.random() - 0.5) * 2 * rangeKm / 111;
}

function getBreed(petType: string): string {
  switch (petType) {
    case 'dog': return rand(DOG_BREEDS);
    case 'cat': return rand(CAT_BREEDS);
    case 'bird': return rand(BIRD_BREEDS);
    case 'rabbit': return rand(RABBIT_BREEDS);
    default: return 'Mixed';
  }
}

function getName(petType: string): string {
  switch (petType) {
    case 'dog': return rand(DOG_NAMES);
    case 'cat': return rand(CAT_NAMES);
    case 'bird': return rand(BIRD_NAMES);
    case 'rabbit': return rand(RABBIT_NAMES);
    default: return rand(OTHER_NAMES);
  }
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().split('T')[0];
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function ensureUser(email: string, password: string, displayName: string, phone: string, role: string): Promise<string> {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', [role, email.toLowerCase()]);
    return existing.rows[0].id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, display_name, phone, consent_privacy, consent_terms, consent_ai, consent_data_storage, consent_date, role, referral_code)
     VALUES ($1, $2, $3, $4, true, true, true, true, NOW(), $5, $6)
     RETURNING id`,
    [email.toLowerCase(), passwordHash, displayName, phone, role, generateReferralCode()]
  );
  return result.rows[0].id;
}

export async function runProductionSeed() {
  try {
    const reportCount = await pool.query('SELECT COUNT(*) FROM pet_reports');
    const count = parseInt(reportCount.rows[0].count);

    const reviewUserId = await ensureUser(REVIEW_EMAIL, REVIEW_PASSWORD, REVIEW_DISPLAY_NAME, REVIEW_PHONE, 'user');
    console.log(`[Seed] Review user ready: ${REVIEW_EMAIL} (id: ${reviewUserId})`);

    const adminUserId = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME, '', 'admin');
    console.log(`[Seed] Admin user ready: ${ADMIN_EMAIL} (id: ${adminUserId})`);

    const profileCount = await pool.query('SELECT COUNT(*) FROM pet_profiles WHERE user_id = $1', [reviewUserId]);
    if (parseInt(profileCount.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO pet_profiles (user_id, pet_type, pet_name, breed, size, color, markings, suburb, owner_name, owner_phone)
         VALUES ($1, 'dog', 'Buddy', 'Golden Retriever', 'large', 'golden', 'white chest', 'Bondi', $2, $3),
                ($1, 'cat', 'Mittens', 'Domestic Shorthair', 'medium', 'grey', 'white paws', 'Bondi', $2, $3)`,
        [reviewUserId, REVIEW_DISPLAY_NAME, REVIEW_PHONE]
      );
      console.log('[Seed] Created 2 pet profiles for review user');
    }

    if (count >= 50) {
      console.log(`[Seed] Already have ${count} reports — skipping report seed.`);
      return;
    }

    const needed = 100 - count;
    console.log(`[Seed] Seeding ${needed} pet reports...`);

    const values: any[] = [];
    const placeholders: string[] = [];
    let idx = 1;

    const userIds = [reviewUserId];
    for (let i = 0; i < 4; i++) {
      const fakeId = await ensureUser(
        `testuser${i + 1}@thefurfinder.com`,
        'TestUser2026!',
        ['Sarah Mitchell', 'James Cooper', 'Emily Watson', 'David Chen'][i],
        `040000000${i + 1}`,
        'user'
      );
      userIds.push(fakeId);
    }

    for (let i = 0; i < needed; i++) {
      const petType = rand(PET_TYPES);
      const status = rand(['lost', 'found']);
      const area = rand(AREAS);
      const userId = rand(userIds);

      values.push(
        userId, status, petType, getName(petType), getBreed(petType),
        rand(SIZES), rand(COLORS), rand(MARKINGS), rand(DESCRIPTIONS),
        jitter(area.lat, 5), jitter(area.lng, 5), area.name,
        randomDate(60), JSON.stringify([])
      );

      placeholders.push(
        `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
      );
    }

    await pool.query(
      `INSERT INTO pet_reports (user_id, status, pet_type, pet_name, breed, size, color, markings, description, latitude, longitude, location_name, last_seen_date, photo_uris)
       VALUES ${placeholders.join(',')}`,
      values
    );

    console.log(`[Seed] Inserted ${needed} pet reports. Total: ${count + needed}`);
  } catch (err) {
    console.error('[Seed] Production seed error:', err);
  }
}
