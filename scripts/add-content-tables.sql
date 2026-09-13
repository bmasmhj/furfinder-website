INSERT INTO blogs (slug, title, excerpt, content, author_name, category, is_published, published_at) VALUES
(
  'lost-pet-safety-tips',
  'Essential Safety Tips for Finding Your Lost Pet',
  'Discover proven strategies and safety measures to help you reunite with your lost pet quickly and safely.',
  'When your beloved pet goes missing, it&apos;s natural to feel panicked. However, taking immediate and strategic action significantly increases the chances of a safe reunion. Here are the essential steps you should follow...',
  'FurFinder Team',
  'Safety',
  TRUE,
  NOW()
),
(
  'microchipping-saves-lives',
  'Why Microchipping is a Lifesaver for Pets',
  'Learn how microchipping can be the key to reuniting with your pet if they ever go missing.',
  'A microchip is a small, rice-sized electronic chip that is implanted under your pet&apos;s skin. This permanent form of identification has reunited thousands of lost pets with their owners. Let&apos;s explore why every pet owner should consider microchipping...',
  'FurFinder Team',
  'Pet Care',
  TRUE,
  NOW()
),
(
  'community-reunite-success-stories',
  'How Community Power Brings Pets Home',
  'Read inspiring stories of how community support helped reunite lost pets with their families.',
  'The power of community is remarkable when it comes to reuniting lost pets with their families. When one person cares enough to share a lost pet&apos;s information, it creates a ripple effect across neighborhoods. Here are some heartwarming success stories...',
  'FurFinder Team',
  'Community',
  TRUE,
  NOW()
);

INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
(
  'How long do lost pets typically stay missing?',
  'Studies show that most lost pets are found within 30 days. However, the first 24-48 hours are critical. Immediate action through social media, local shelters, and community networks significantly increases reunion chances.',
  'General',
  1,
  TRUE
),
(
  'What should I do immediately after my pet goes missing?',
  'First, search your immediate neighborhood thoroughly. Then contact local animal shelters, vets, and post on FurFinder and social media immediately. Create flyers, check lost pet databases, and notify friends and neighbors. Time is critical in the first 24 hours.',
  'Missing Pets',
  2,
  TRUE
),
(
  'Is microchipping painful for my pet?',
  'Microchipping is a quick procedure similar to a vaccination. It takes just a few seconds and causes minimal discomfort. The microchip is about the size of a grain of rice and is implanted under the skin, typically between the shoulder blades.',
  'Pet Care',
  3,
  TRUE
),
(
  'How does FurFinder help find lost pets?',
  'FurFinder uses community power, location-based alerts, and a network of shelters to help reunite lost pets with their owners. Post your lost pet&apos;s details with photos and location, and we&apos;ll notify people in your area and help coordinate the search.',
  'General',
  4,
  TRUE
),
(
  'What if my pet has been missing for months?',
  'Don&apos;t lose hope. Pets have been found months or even years after going missing. Continue checking shelters, post on social media periodically, and register your pet as lost in local databases. Keep your contact information updated with shelters.',
  'Missing Pets',
  5,
  TRUE
);

INSERT INTO features (title, description, icon_name, display_order, is_active) VALUES
(
  'Real-Time Alerts',
  'Get instant notifications when lost pets in your area are posted. Location-based alerts help you help others in your community.',
  'bell',
  1,
  TRUE
),
(
  'Pet Profiles',
  'Create detailed profiles for your pets including photos, medical information, and microchip numbers for easy identification.',
  'user-check',
  2,
  TRUE
),
(
  'Community Network',
  'Connect with thousands of pet lovers and community members dedicated to reuniting lost pets with their families.',
  'users',
  3,
  TRUE
),
(
  'Shelter Integration',
  'Automatically notify local shelters and rescue organizations when you post a lost pet, expanding your reach.',
  'shield-alert',
  4,
  TRUE
),
(
  'Safety Resources',
  'Access comprehensive guides on pet safety, microchipping, and prevention strategies to keep your pets safe.',
  'book-open',
  5,
  TRUE
),
(
  'Success Stories',
  'Get inspired by heartwarming reunion stories from pet owners who found their beloved companions with FurFinder.',
  'heart',
  6,
  TRUE
);

INSERT INTO pricing_plans (name, description, price_aud, billing_period, features, is_popular, is_active, display_order) VALUES
(
  'Free',
  'Perfect for getting started with FurFinder',
  0,
  'forever',
  '["Post up to 1 lost/found pet", "Community alerts", "Basic shelter notifications", "Access to resources"]',
  FALSE,
  TRUE,
  1
),
(
  'Premium',
  'Enhanced features for serious pet seekers',
  4.99,
  'monthly',
  '["Unlimited lost/found posts", "Priority alerts in 5km radius", "Featured pet listings", "Direct shelter messaging", "Advanced search filters"]',
  TRUE,
  TRUE,
  2
),
(
  'Community Plus',
  'Best for shelters and rescue organizations',
  19.99,
  'monthly',
  '["Unlimited posts", "Organization dashboard", "Community features", "Direct integration", "Priority support", "Custom branding"]',
  FALSE,
  TRUE,
  3
);

INSERT INTO how_it_works_steps (step_number, title, description, icon_name, is_active) VALUES
(
  1,
  'Report Your Lost Pet',
  'Post your lost pet&apos;s details with clear photos and location. Include distinguishing features and any special markings.',
  'file-text',
  TRUE
),
(
  2,
  'Alert Your Community',
  'FurFinder notifies people in your area through push notifications and local community alerts. Our network grows your reach exponentially.',
  'send',
  TRUE
),
(
  3,
  'Connect with Others',
  'Communicate directly with people who have spotted your pet or have helpful information. FurFinder facilitates safe connections.',
  'message-square',
  TRUE
),
(
  4,
  'Reunite with Your Pet',
  'Once your pet is found, celebrate the reunion! Our success stories prove that FurFinder brings families back together.',
  'check-circle',
  TRUE
);

INSERT INTO who_its_for_segments (title, description, icon_name, use_cases, display_order, is_active) VALUES
(
  'Pet Owners',
  'If you have a beloved pet, FurFinder helps you protect them and quickly reunite if they ever go missing.',
  'home',
  '["Report lost pets", "Create pet profiles", "Receive community alerts", "Find microchip services"]',
  1,
  TRUE
),
(
  'Community Members',
  'Be a hero in your community. Help reunite lost pets with their owners and receive updates on success stories.',
  'users',
  '["Get neighborhood alerts", "Share pet sightings", "Help search efforts", "Build community connections"]',
  2,
  TRUE
),
(
  'Shelters & Rescues',
  'Integrate with FurFinder to reach more people, coordinate rescue efforts, and increase reunion success rates.',
  'shield-check',
  '["Manage found animals", "Coordinate with community", "Direct messaging with finders", "Track reunions"]',
  3,
  TRUE
),
(
  'Veterinarians',
  'Recommend FurFinder to your clients to help them protect their pets and contribute to lost pet reunions.',
  'heart-handshake',
  '["Refer clients", "Promote microchipping", "Share resources", "Partner with community"]',
  4,
  TRUE
);

INSERT INTO reunited_stories (slug, pet_name, pet_type, owner_name, story_title, story_content, reunion_date, lost_duration_days, location_lost, location_found, how_they_reunited, featured_on_homepage, is_published) VALUES
(
  'max-golden-retriever-reunion',
  'Max',
  'Dog',
  'Sarah Johnson',
  'Max&apos;s 15-Day Adventure: A Golden Retriever&apos;s Journey Home',
  'Max, our beloved 3-year-old Golden Retriever, went missing during a neighborhood walk on April 15th. We immediately posted on FurFinder and notified our local community. After 15 days of searching, a local resident spotted Max near a park about 3km from our home. FurFinder&apos;s alert system had kept the community engaged, and the finder recognized Max from our posting. This reunion would not have been possible without the support and vigilance of our FurFinder community.',
  NOW() - INTERVAL '15 days',
  15,
  'Riverside Park, Sydney',
  'Old Mill Reserve, Sydney',
  'A community member recognized Max at a local park after seeing his photo on FurFinder. They checked his microchip and contacted us immediately.',
  TRUE,
  TRUE
),
(
  'whiskers-tabby-cat-found',
  'Whiskers',
  'Cat',
  'Emma and Tom Chen',
  'Whiskers Come Home: A Cat&apos;s 8-Month Journey',
  'We thought we had lost Whiskers forever when she disappeared from our garden in January. Eight months later, a rescue shelter reached out through FurFinder - Whiskers had been found and brought to their facility. Her microchip was registered with our information, making identification instant. This story reminds us why microchipping and registering on FurFinder is so important for cat owners.',
  NOW() - INTERVAL '8 months',
  240,
  'Petersham, Sydney',
  'Local Animal Rescue Shelter',
  'A Good Samaritan brought the injured cat to a shelter where staff scanned her microchip. The shelter found our FurFinder profile.',
  FALSE,
  TRUE
),
(
  'bella-missing-puppy-safe',
  'Bella',
  'Dog',
  'Marcus Williams',
  'Bella&apos;s Safe Return: Community Power in Action',
  'When 6-month-old Bella went missing, I thought my heart would break. FurFinder&apos;s immediate alert system got her information to hundreds of people within hours. Within 2 days, someone spotted her and we were reunited. The FurFinder community showed incredible support and compassion throughout this experience.',
  NOW() - INTERVAL '2 days',
  2,
  'Newtown, Sydney',
  'Newtowner Park',
  'Community member spotted Bella within 2km of her home and recognized her from the FurFinder alert.',
  TRUE,
  TRUE
);
