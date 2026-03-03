import pool from './db';

const USER_ID = 'fb7bab5c-4ef6-4956-9c30-5b4d0839a87b';
const TOTAL = 10_000;
const BATCH_SIZE = 500;

const PET_TYPES = [
  ...Array(50).fill('dog'),
  ...Array(35).fill('cat'),
  ...Array(8).fill('bird'),
  ...Array(4).fill('rabbit'),
  ...Array(3).fill('other'),
];

const DOG_BREEDS = ['Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Boxer', 'Shih Tzu', 'Border Collie', 'Cavalier King Charles', 'Kelpie', 'Australian Shepherd', 'Husky', 'Staffordshire Bull Terrier', 'Greyhound', 'Jack Russell Terrier', 'Maltese', 'Pug'];
const CAT_BREEDS = ['Domestic Shorthair', 'Domestic Longhair', 'Tabby', 'Siamese', 'Persian', 'Ragdoll', 'Bengal', 'Maine Coon', 'Burmese', 'British Shorthair', 'Abyssinian', 'Russian Blue', 'Tonkinese', 'Birman', 'Sphynx'];
const BIRD_BREEDS = ['Budgerigar', 'Cockatiel', 'Galah', 'Rainbow Lorikeet', 'Cockatoo', 'African Grey', 'Conure', 'Lovebird'];
const RABBIT_BREEDS = ['Dwarf', 'Lop', 'Rex', 'Holland Lop', 'Flemish Giant', 'Angora', 'Mini Rex'];
const SIZES = ['small', 'medium', 'large'];
const COLORS = ['black', 'white', 'brown', 'grey', 'golden', 'cream', 'orange', 'black and white', 'brown and white', 'tricolor', 'tabby', 'ginger', 'chocolate', 'silver', 'tortoiseshell'];
const MARKINGS = ['', 'white chest', 'white paws', 'black muzzle', 'spotted', 'striped tail', 'floppy ears', 'bushy tail', 'notched left ear', 'white blaze on face', 'tan eyebrows', 'white tip on tail', ''];
const STATUSES = ['lost', 'found'];
const DOG_NAMES = ['Max', 'Bella', 'Charlie', 'Luna', 'Buddy', 'Daisy', 'Rocky', 'Molly', 'Bear', 'Coco', 'Jack', 'Poppy', 'Duke', 'Ruby', 'Tucker', 'Stella', 'Zeus', 'Rosie', 'Toby', 'Lola', 'Archie', 'Mia', 'Oscar', 'Lily', 'Leo', 'Sadie'];
const CAT_NAMES = ['Whiskers', 'Shadow', 'Mittens', 'Oliver', 'Luna', 'Simba', 'Nala', 'Tiger', 'Felix', 'Cleo', 'Leo', 'Bella', 'Jasper', 'Misty', 'Oreo', 'Pumpkin', 'Mochi', 'Salem', 'Willow', 'Ash'];
const BIRD_NAMES = ['Coco', 'Tweety', 'Polly', 'Sky', 'Blue', 'Sunny', 'Rio', 'Kiwi', 'Mango', 'Pepper'];
const RABBIT_NAMES = ['Biscuit', 'Thumper', 'Snowball', 'Cinnamon', 'Oreo', 'Hazel', 'Clover', 'Peanut'];
const OTHER_NAMES = ['Fluffy', 'Spot', 'Patches', 'Nibbles', 'Hammy', 'Goldie'];

const AUSTRALIAN_AREAS = [
  { name: 'Sydney CBD', lat: -33.8688, lng: 151.2093, suburb: 'Sydney' },
  { name: 'Bondi Beach', lat: -33.8915, lng: 151.2767, suburb: 'Bondi' },
  { name: 'Parramatta', lat: -33.8150, lng: 151.0011, suburb: 'Parramatta' },
  { name: 'Manly', lat: -33.7963, lng: 151.2872, suburb: 'Manly' },
  { name: 'Chatswood', lat: -33.7975, lng: 151.1819, suburb: 'Chatswood' },
  { name: 'Melbourne CBD', lat: -37.8136, lng: 144.9631, suburb: 'Melbourne' },
  { name: 'St Kilda', lat: -37.8676, lng: 144.9829, suburb: 'St Kilda' },
  { name: 'Richmond', lat: -37.8183, lng: 145.0015, suburb: 'Richmond' },
  { name: 'Fitzroy', lat: -37.7991, lng: 144.9780, suburb: 'Fitzroy' },
  { name: 'Footscray', lat: -37.8013, lng: 144.8993, suburb: 'Footscray' },
  { name: 'Brisbane CBD', lat: -27.4698, lng: 153.0251, suburb: 'Brisbane' },
  { name: 'South Bank', lat: -27.4820, lng: 153.0202, suburb: 'South Bank' },
  { name: 'Fortitude Valley', lat: -27.4561, lng: 153.0340, suburb: 'Fortitude Valley' },
  { name: 'Indooroopilly', lat: -27.4988, lng: 152.9695, suburb: 'Indooroopilly' },
  { name: 'Toowong', lat: -27.4885, lng: 152.9869, suburb: 'Toowong' },
  { name: 'Perth CBD', lat: -31.9505, lng: 115.8605, suburb: 'Perth' },
  { name: 'Fremantle', lat: -32.0569, lng: 115.7439, suburb: 'Fremantle' },
  { name: 'Subiaco', lat: -31.9465, lng: 115.8268, suburb: 'Subiaco' },
  { name: 'Joondalup', lat: -31.7495, lng: 115.7662, suburb: 'Joondalup' },
  { name: 'Mandurah', lat: -32.5269, lng: 115.7217, suburb: 'Mandurah' },
  { name: 'Adelaide CBD', lat: -34.9285, lng: 138.6007, suburb: 'Adelaide' },
  { name: 'Glenelg', lat: -34.9817, lng: 138.5152, suburb: 'Glenelg' },
  { name: 'Norwood', lat: -34.9181, lng: 138.6264, suburb: 'Norwood' },
  { name: 'Unley', lat: -34.9476, lng: 138.6009, suburb: 'Unley' },
  { name: 'Gold Coast', lat: -28.0167, lng: 153.4000, suburb: 'Gold Coast' },
  { name: 'Sunshine Coast', lat: -26.6500, lng: 153.0667, suburb: 'Sunshine Coast' },
  { name: 'Cairns', lat: -16.9186, lng: 145.7781, suburb: 'Cairns' },
  { name: 'Hobart', lat: -42.8821, lng: 147.3272, suburb: 'Hobart' },
  { name: 'Darwin', lat: -12.4634, lng: 130.8456, suburb: 'Darwin' },
  { name: 'Canberra', lat: -35.2809, lng: 149.1300, suburb: 'Canberra' },
  { name: 'Newcastle', lat: -32.9267, lng: 151.7789, suburb: 'Newcastle' },
  { name: 'Wollongong', lat: -34.4278, lng: 150.8931, suburb: 'Wollongong' },
  { name: 'Geelong', lat: -38.1499, lng: 144.3617, suburb: 'Geelong' },
  { name: 'Ballarat', lat: -37.5622, lng: 143.8503, suburb: 'Ballarat' },
  { name: 'Toowoomba', lat: -27.5598, lng: 151.9507, suburb: 'Toowoomba' },
];

const DESCRIPTIONS = [
  'Very friendly and responds to name. Was wearing a red collar when last seen.',
  'Indoor pet, never been outside before. Very scared. May be hiding.',
  'Has a distinctive limping gait in left rear leg. Very docile.',
  'Microchipped. Responds to its name. Last seen near the park.',
  'Escaped through a gap in the backyard fence. Very food motivated.',
  'Was spooked by fireworks and bolted. Usually stays close to home.',
  'Senior pet, moves slowly. Very gentle. May approach strangers.',
  'Recently desexed, still wearing vet bandage on right foreleg.',
  'Very timid around strangers. Unlikely to approach people.',
  'Neutered male. Has a small scar above left eye from old injury.',
  'Found wandering near railway station. Well-groomed, appears cared for.',
  'Found at local park, friendly and approachable. No collar.',
  'Appeared in our backyard. Very hungry. Eating and resting now.',
  'Found on main road, safely contained. Seems disoriented.',
  'Appeared at our door. Well socialised, likely escaped nearby.',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(base: number, rangeKm: number): number {
  const degreePerKm = 1 / 111;
  return base + (Math.random() - 0.5) * 2 * rangeKm * degreePerKm;
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

async function seed() {
  const existing = await pool.query('SELECT COUNT(*) FROM pet_reports');
  const current = parseInt(existing.rows[0].count);
  const needed = Math.max(0, TOTAL - current);

  if (needed === 0) {
    console.log(`Already have ${current} reports — nothing to seed.`);
    return;
  }

  console.log(`Seeding ${needed} reports (${current} already exist)...`);

  const batches = Math.ceil(needed / BATCH_SIZE);

  for (let b = 0; b < batches; b++) {
    const batchCount = Math.min(BATCH_SIZE, needed - b * BATCH_SIZE);
    const values: any[] = [];
    const placeholders: string[] = [];
    let idx = 1;

    for (let i = 0; i < batchCount; i++) {
      const petType = rand(PET_TYPES);
      const status = rand(STATUSES);
      const area = rand(AUSTRALIAN_AREAS);
      const lat = jitter(area.lat, 8);
      const lng = jitter(area.lng, 8);

      values.push(
        USER_ID,
        status,
        petType,
        getName(petType),
        getBreed(petType),
        rand(SIZES),
        rand(COLORS),
        rand(MARKINGS),
        rand(DESCRIPTIONS),
        lat,
        lng,
        `${area.suburb}, ${area.name}`,
        randomDate(90),
        JSON.stringify([])
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

    const done = Math.min((b + 1) * BATCH_SIZE, needed);
    process.stdout.write(`\r  Inserted ${done}/${needed} reports...`);
  }

  const final = await pool.query('SELECT COUNT(*) FROM pet_reports');
  console.log(`\nDone. Total reports in DB: ${final.rows[0].count}`);
}

seed()
  .catch((err) => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => pool.end());
