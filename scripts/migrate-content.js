import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

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
const USER_NAMES = [
  "Aarav",
  "Liam",
  "Noah",
  "Emma",
  "Olivia",
  "Ava",
  "Sophia",
  "Isabella",
  "Mason",
  "Ethan",
  "Lucas",
  "Mia",
  "Amelia",
  "Harper",
  "Evelyn",
  "Abigail",
  "James",
  "Benjamin",
  "Elijah",
  "William",
  "Henry",
  "Alexander",
  "Michael",
  "Daniel",
  "Matthew",
  "Sebastian",
  "Jackson",
  "David",
  "Logan",
  "Joseph",
  "Samuel",
  "Carter",
  "Owen",
  "Wyatt",
  "John",
  "Jack",
  "Luke",
  "Jayden",
  "Dylan",
  "Grayson",
  "Levi",
  "Isaac",
  "Gabriel",
  "Julian",
  "Mateo",
  "Anthony",
  "Jaxon",
  "Lincoln",
  "Joshua",
  "Christopher"
];

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



const REUNITED_MESSAGE = [
`{name} is finally back home safe after what felt like the longest three days of our lives.

He went missing late in the evening when a gate was accidentally left open. We searched the neighborhood for hours, calling his name and checking every corner we could think of.

The next morning, we started posting everywhere and asking friends and neighbors to help spread the word. The support we received was overwhelming and gave us hope.

A kind stranger spotted him wandering near a nearby street and contacted us right away. We rushed over, and the moment we saw him, we knew everything would be okay.

We are beyond grateful for everyone who helped, shared, and cared. {name} is now resting at home, safe and loved more than ever.`,

`{name} has been found and is finally back where she belongs.

She slipped out during a busy afternoon and disappeared before we even realized what had happened. We searched endlessly, calling her name and checking all her usual spots.

As the hours turned into days, we refused to give up. We shared her story online and received so much encouragement from people around us.

Someone recognized her from a post and reached out after seeing her a few kilometers away. That message changed everything for us.

Now {name} is safe, happy, and surrounded by love again. Thank you to everyone who helped bring her home.`,

`{name} is back with us, and our hearts feel whole again.

He went missing during a walk when he suddenly got scared and ran off. We searched immediately but couldn’t find any trace of him.

We spent days putting up posters, talking to locals, and checking nearby areas. It was an incredibly stressful and emotional time.

Thankfully, a kind stranger recognized him and contacted us after seeing one of our posts. Their quick action made all the difference.

We are so thankful for the kindness of others. {name} is now safe at home, and we couldn’t be happier.`,

`{name} has finally returned home after being missing for a full week.

He wandered off during a quiet evening, and we didn’t realize he was gone until it was too late. Panic set in quickly as we searched everywhere.

Each day felt longer than the last, but we kept sharing his story and hoping someone would spot him. The community support kept us going.

After seven days, we got the call we had been waiting for. Someone had found him and kept him safe.

We are beyond grateful and relieved. Milo is home, safe, and getting all the love he missed.`,

`{name} is safe and back home with us.

She went missing near a park and didn’t return like she usually does. We immediately started searching and asking around.

We posted her photos everywhere and hoped someone would recognize her. The waiting was incredibly difficult.

A family found her and took care of her until they could reach us. Their kindness meant everything.

Now {name} is back home, safe and happy. We are so thankful for everyone who helped along the way.`,

`{name} has been reunited with us, and we couldn’t be more relieved.

He disappeared अचानक during a walk, and we spent hours retracing our steps trying to find him. It was a terrifying experience.

We reached out online and in the community, hoping someone had seen him. The support we received kept our spirits up.

Eventually, someone contacted us after spotting him nearby. That moment brought so much relief.

{name} is now back home, safe and sound. Thank you to everyone who helped us find him.`,

`{name} is finally home after 10 long days away.

She went missing unexpectedly, and we searched tirelessly every single day. It felt like a never-ending nightmare.

We kept sharing her story and asking people to keep an eye out. The kindness from others gave us strength.

After many days, we finally got a message that someone had found her. It was the best news we could have hoped for.

{name} is now safe at home, and we are forever grateful for everyone who helped bring her back.`,

`{name} has been found and safely returned to us.

She disappeared and we had no idea where she could have gone. We searched everywhere and refused to give up.

We shared her information online and received so much support from the community. It truly meant a lot.

A wonderful family found her and took care of her until we could come. Their kindness will never be forgotten.

{name} is now back home, happy and safe. Thank you to everyone who helped.`,

`{name} is back home after quite an unexpected journey.

He went missing and somehow traveled much farther than we ever imagined. We were worried sick.

We searched day and night, spreading the word as much as possible. The uncertainty was incredibly hard.

Finally, someone found him and contacted us after recognizing him. That moment changed everything.

{name} is now safe and resting at home. We are so thankful for the support we received.`,

`{name} has been reunited with us, and we are so relieved.

She went missing without warning, and we spent days trying to find her. It was an emotional time for our family.

We shared her story widely, hoping someone would recognize her. The community really came through for us.

Eventually, someone spotted her and reached out. That message gave us so much joy.

{name} is now back home, safe and surrounded by love. Thank you to everyone who helped.`,

`{name} is home safe and sound after a scary experience.

He went missing during a storm, and we were incredibly worried about his safety. We searched despite the weather.

We shared updates and asked everyone to keep an eye out. The support meant everything during that time.

A kind person found him and made sure he was safe before contacting us. We are so grateful.

{name} is now back home, warm and safe. Thank you to everyone who helped us find him.`,

`{name} has been found, and we are beyond relieved.

He disappeared unexpectedly, leaving us searching everywhere for him. It was a stressful and emotional time.

We kept sharing his story and hoping for the best. The community support helped us stay hopeful.

Eventually, someone found him and contacted us. That moment brought so much happiness.

{name} is now back home, safe and loved. Thank you all for your help.`,

`{name} is finally back with us after nearly two weeks.

She went missing without any warning, and we searched tirelessly every day. It was incredibly difficult.

We shared her story far and wide, hoping someone would see her. The support we received was amazing.

After many days, someone found her and reached out. We rushed to bring her home.

{name} is now safe and resting. We are so thankful to everyone who helped us.`,

`{name} is safe and back home with us.

He went missing suddenly, and we immediately started searching for him. We were very worried.

We posted everywhere and asked people to keep an eye out. The community really supported us.

A local shop owner spotted him and contacted us. Their help made all the difference.

{name} is now home, safe and happy. We are incredibly grateful.`,

`{name} has been reunited with our family.

She disappeared unexpectedly, and we searched everywhere trying to find her. It was a very emotional time.

We shared her story online and received so much support. It gave us hope.

Someone found her and reached out after recognizing her. We were overjoyed.

{name} is now back home, safe and loved. Thank you to everyone who helped.`,

`{name} is finally back home after getting lost.

He went missing during a walk, and we couldn’t find him despite searching for hours. It was very stressful.

We shared his information and asked for help from the community. The support was incredible.

Eventually, someone found him and contacted us. That moment brought so much relief.

{name} is now safe at home. We are so thankful for everyone’s help.`,

`{name} has been found safe and returned home.

She went missing suddenly, and we searched everywhere for her. It was a very difficult time.

We kept sharing her story and asking for help. The community support meant everything.

Someone found her and contacted us, which brought so much relief.

{name} is now safe and resting at home. Thank you to everyone who helped.`,

`{name} is home again, and we are so relieved.

He went missing without warning, and we searched day and night. It was incredibly stressful.

We shared his story and asked for help from everyone we could. The support kept us going.

Finally, someone found him and reached out to us. We were overjoyed.

{name} is now safe at home. Thank you all for your help and support.`,

`{name} has been reunited with us, and we couldn’t be happier.

She disappeared unexpectedly, and we searched everywhere trying to find her. It was very emotional.

We shared her story widely and received amazing support. It gave us hope.

Eventually, someone found her and contacted us. That moment meant everything.

{name} is now safe at home. Thank you to everyone who helped bring her back.`,

`{name} is finally back home, safe and sound.

He went missing suddenly, and we searched tirelessly for him. It was a very stressful time.

We shared his story and asked for help from the community. The support was incredible.

Someone eventually found him and contacted us. We were so relieved.

{name} is now back home, safe and happy. Thank you to everyone who helped us find him.`
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(base, rangeKm) {
  const degreePerKm = 1 / 111;
  return base + (Math.random() - 0.5) * 2 * rangeKm * degreePerKm;
}

function getBreed(petType) {
  switch (petType) {
    case 'dog': return rand(DOG_BREEDS);
    case 'cat': return rand(CAT_BREEDS);
    case 'bird': return rand(BIRD_BREEDS);
    case 'rabbit': return rand(RABBIT_BREEDS);
    default: return 'Mixed';
  }
}

function getName(petType) {
  switch (petType) {
    case 'dog': return rand(DOG_NAMES);
    case 'cat': return rand(CAT_NAMES);
    case 'bird': return rand(BIRD_NAMES);
    case 'rabbit': return rand(RABBIT_NAMES);
    default: return rand(OTHER_NAMES);
  }
}

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().split('T')[0];
}

// create 40 random users 
// create random pet_reports for each user make 20 pet in same lost and found to be reunited later
// create pet reunite stories of those 20 pets and add reunited_id and update the same ones to status reunited
/* 
 main logic 

 user A adds found pets
 user B adds lost pet 

 user B mark as pet reuntied and write some stories 
 A's found and B's Lost are interconnected with story

*/

async function runMigration() {
  console.log('Starting content migration/seeding...');

  // 1. Create 40 users
  console.log('Creating 40 random users...');
  const users = [];
  for (let i = 0; i < 40; i++) {
    const email = `user_${Date.now()}_${i}@example.com`;
    const name = rand(USER_NAMES);
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, display_name) VALUES ($1, 'dummy_hash_123', $2) RETURNING id`,
      [email, name]
    );
    users.push({ id: res.rows[0].id, name });
  }

  const existingUsersQuery = await pool.query('SELECT id, display_name FROM users');
  const allUsers = existingUsersQuery.rows.map(r => ({ id: r.id, name: r.display_name }));
  const userPool = allUsers.length > 0 ? allUsers : users;

  // 2. Create 20 interconnected lost and found pets
  console.log('Creating 20 interconnected reunited pets & stories...');
  for (let i = 0; i < 20; i++) {
    const petType = rand(PET_TYPES);
    const pet_name = getName(petType);
    const breed = getBreed(petType);
    const area = rand(AUSTRALIAN_AREAS);

    const userLost = rand(userPool);
    let userFound = rand(userPool);
    while (userPool.length > 1 && userFound.id === userLost.id) userFound = rand(userPool);

    const lostDate = new Date();
    lostDate.setDate(lostDate.getDate() - Math.floor(Math.random() * 90) - 10);
    const foundDate = new Date(lostDate);
    const daysLost = Math.floor(Math.random() * 9) + 1;
    foundDate.setDate(foundDate.getDate() + daysLost);

    const reunitedStoryText = REUNITED_MESSAGE[i % REUNITED_MESSAGE.length].replace(/{name}/g, pet_name);
    const slug = `${pet_name.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const storyRes = await pool.query(
      `INSERT INTO reunited_stories (slug, pet_name, pet_type, owner_name, story_title, story_content, before_image_url, after_image_url, reunion_date, lost_duration_days, location_lost, location_found, is_published, featured_on_homepage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, true) RETURNING id`,
      [
        slug, 
        pet_name, 
        petType, 
        userLost.name, 
        `${pet_name} Found!`, 
        reunitedStoryText, 
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop', 
        'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=400&fit=crop',
        foundDate.toISOString().split('T')[0],
        daysLost,
        area.suburb, 
        area.suburb
      ]
    );
    const reunitedId = storyRes.rows[0].id;

    // Lost Report
    await pool.query(
      `INSERT INTO pet_reports (user_id, status, pet_type, pet_name, breed, size, color, markings, description, latitude, longitude, location_name, last_seen_date, photo_uris, pet_reunited_id) 
       VALUES ($1, 'reunited', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        userLost.id, petType, pet_name, breed, rand(SIZES), rand(COLORS), rand(MARKINGS), rand(DESCRIPTIONS),
        jitter(area.lat, 8), jitter(area.lng, 8), area.name, lostDate.toISOString().split('T')[0], '[]', reunitedId
      ]
    );

    // Found Report
    await pool.query(
      `INSERT INTO pet_reports (user_id, status, pet_type, pet_name, breed, size, color, markings, description, latitude, longitude, location_name, last_seen_date, photo_uris, pet_reunited_id) 
       VALUES ($1, 'reunited', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        userFound.id, petType, pet_name, breed, rand(SIZES), rand(COLORS), rand(MARKINGS), rand(DESCRIPTIONS),
        jitter(area.lat, 8), jitter(area.lng, 8), area.name, foundDate.toISOString().split('T')[0], '[]', reunitedId
      ]
    );
  }

  // 3. Create random random reports up to TOTAL
  const existing = await pool.query('SELECT COUNT(*) FROM pet_reports');
  const current = parseInt(existing.rows[0].count, 10);
  const needed = Math.max(0, TOTAL - current);

  if (needed > 0) {
    console.log(`Seeding ${needed} additional random reports (already have ${current})...`);
    const batches = Math.ceil(needed / BATCH_SIZE);

    for (let b = 0; b < batches; b++) {
      const batchCount = Math.min(BATCH_SIZE, needed - b * BATCH_SIZE);
      const values = [];
      const placeholders = [];
      let idx = 1;

      for (let i = 0; i < batchCount; i++) {
        const petType = rand(PET_TYPES);
        const status = rand(STATUSES);
        const area = rand(AUSTRALIAN_AREAS);
        const lat = jitter(area.lat, 8);
        const lng = jitter(area.lng, 8);
        const user = rand(userPool);

        values.push(
          user.id,
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
      process.stdout.write(`\r  Inserted ${done}/${needed} random reports...`);
    }
  }
  
  const finalCount = await pool.query('SELECT COUNT(*) FROM pet_reports');
  console.log(`\\n✓ Migration completed. Total reports in DB: ${finalCount.rows[0].count}`);
}

runMigration()
  .catch((err) => { console.error('\\nMigration failed:', err); process.exit(1); })
  .finally(() => pool.end());
