import type { ReactNode } from 'react'

export const supportEmail = 'support@thefurfinder.com'
export const partnershipsEmail = 'partnerships@thefurfinder.com'
export const privacyEmail = 'privacy@thefurfinder.com'

export const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/app-features', label: 'Full Feature List' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/about', label: 'Our Story' },
]

export const heroTrustItems = [
  'Free to report pets',
  'No account needed to browse',
  'Australia-wide coverage',
]

export const featureCards = [
  {
    icon: '📸',
    iconClassName: 'bg-[#fff1ed]',
    title: 'AI Photo Matching',
    description:
      'Upload a photo and our AI compares it with eligible reports, using visible characteristics and report details to suggest possible matches for you to verify.',
  },
  {
    icon: '📍',
    iconClassName: 'bg-[#e8f8f7]',
    title: 'GPS Location Matching',
    description:
      'Reports are matched inside your local radius so a found pet a few kilometres away gets flagged fast without manual searching.',
  },
  {
    icon: '🗺️',
    iconClassName: 'bg-[#eef2ff]',
    title: 'Interactive Map',
    description:
      'Browse live lost and found reports alongside vets, shelters, and rescue organisations across Australia in one map view.',
  },
  {
    icon: '🔎',
    iconClassName: 'bg-[#fff1ed]',
    title: 'Scan Online Posts',
    description:
      'Paste text you are authorised to use from a community post and let AI extract details that can be compared with eligible reports. The Fur Finder does not automatically scan social networks.',
  },
  {
    icon: '📱',
    iconClassName: 'bg-[#fff7e8]',
    title: 'Biometric ID Scanning',
    description:
      "Register close-up photos of your pet's face, eyes, and nose to improve identification when someone finds them.",
  },
  {
    icon: '🏥',
    iconClassName: 'bg-[#e8f8f7]',
    title: 'Vet & Shelter Directory',
    description:
      'Find nearby clinics, shelters, and rescue partners without leaving the app or opening a second search.',
  },
  {
    icon: '🔔',
    iconClassName: 'bg-[#eef2ff]',
    title: 'Area Alerts',
    description:
      'Get notified as soon as a matching lost or found pet is reported in your area so you can act quickly.',
  },
  {
    icon: '💬',
    iconClassName: 'bg-[#ebfbf1]',
    title: 'In-App Messaging',
    description:
      'Connect securely inside the app instead of sharing personal phone numbers with strangers during a stressful moment.',
  },
  {
    icon: '🎉',
    iconClassName: 'bg-[#fceef5]',
    title: 'Happy Tails Stories',
    description:
      'Celebrate successful reunions and give other families hope with stories from real pet owners.',
  },
]

export const audienceCards = [
  {
    emoji: '😢',
    title: 'My Pet Is Lost',
    description:
      "Your pet is missing and every minute feels heavy. Here's how the app helps you respond immediately.",
    items: [
      'Post a report in under 2 minutes',
      'Run AI matching against found pets nearby',
      'Create a printable flyer from your report',
      'Message people who report sightings',
      'Boost your report for extra visibility',
    ],
  },
  {
    emoji: '😊',
    title: 'I Found a Pet',
    description:
      'You found an animal and want to get them home safely without guessing where to start.',
    items: [
      'Post a found report with photos',
      'Check AI matches against lost pets',
      'Use quick biometric scans',
      'Find nearby vets and shelters',
      'Contact owners safely in-app',
    ],
  },
  {
    emoji: '🌱',
    title: 'I Want to Help',
    description:
      'You care about animals in your suburb and want to help reunite them with their people.',
    items: [
      'Browse the live map near you',
      'Get suburb-based alerts',
      'Leave tips on reports you recognise',
      'Share reports to local groups',
      'Support reward pools when needed',
    ],
  },
]

export const steps = [
  {
    title: 'Create a Report',
    description:
      'Upload photos, describe the pet, choose a relevant map location, and review the information before publishing.',
  },
  {
    title: 'AI Scans for Matches',
    description:
      'The app compares available photos, markings, breed details, and location information to suggest possible matches.',
  },
  {
    title: 'Connect and Reunite',
    description:
      'When a likely match appears, both sides are notified and can coordinate a safe reunion through in-app messaging.',
  },
]

export const petTypes = ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Reptiles', 'Small Animals', 'Any Other Pet']

export const pricingPlans = [
  {
    name: 'Free',
    price: 'Free',
    note: 'Always free, no credit card needed',
    cta: 'Get Started Free',
    href: "/download",
    featured: false,
    features: [
      { included: true, label: 'Post lost and found reports' },
      { included: true, label: 'Browse the interactive map' },
      { included: true, label: 'Vet and shelter directory' },
      { included: true, label: 'Community tips on reports' },
      { included: true, label: 'In-app messaging' },
      { included: true, label: 'Printable flyer generator' },
      { included: false, label: 'AI photo matching' },
      { included: false, label: 'Scan online posts' },
      { included: false, label: 'Biometric ID scanning' },
      { included: false, label: 'Multi-photo upload (up to 5)' },
    ],
  },
  {
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    note: 'or $49.99/year — save 2 months',
    cta: 'Start Premium Trial',
    href: "/download",
    featured: true,
    badge: 'Most Popular',
    features: [
      { included: true, label: 'Everything in Free' },
      { included: true, label: 'AI photo matching' },
      { included: true, label: 'Scan online posts with AI' },
      { included: true, label: 'Biometric ID scanning' },
      { included: true, label: 'Multi-photo upload (up to 5 photos)' },
      { included: true, label: 'Unlimited reports and pet profiles' },
      { included: true, label: 'Area alerts for nearby pets' },
      { included: true, label: 'Boost report for extra visibility' },
    ],
  },
]

export const faqItems = [
  {
    question: 'Which permissions does The Fur Finder request?',
    answer:
      'Location supports map pins and nearby alerts; camera and photo access support pet reports and optional biometric pet images; notifications support report and match alerts. You can deny or later change permissions in device settings, although related features may not work.',
  },
  {
    question: 'Are AI matches guaranteed?',
    answer:
      'No. AI results are suggestions based on available images and report details. Always verify ownership, markings, records, and microchip information before handing over a pet.',
  },
  {
    question: 'How do I report or block someone?',
    answer:
      'Use the report or block controls on the relevant profile, message, comment, Quick Snap, or report. For urgent safety issues, contact local emergency services first and then email support@thefurfinder.com.',
  },
  {
    question: 'How do subscriptions and cancellations work?',
    answer:
      'Subscriptions renew unless cancelled through the store account used to purchase them. Deleting your Fur Finder account does not cancel an App Store or Google Play subscription.',
  },
  {
    question: 'How do I restore a purchase?',
    answer:
      'Sign in with the same store account used for the purchase, then use Restore Purchases in the app. If access is not restored, contact support with the platform and purchase date, but do not send full payment-card details.',
  },
  {
    question: 'What are credits?',
    answer:
      'Credits are limited, in-service units for eligible features. They are not money, cannot be redeemed for cash, and may be subject to expiry or promotional terms disclosed when issued.',
  },
  {
    question: 'How is my information used?',
    answer:
      'Information is used to operate reports, matching, alerts, messaging, purchases, safety, analytics, and advertising where applicable. See the Privacy Policy for the full list of data categories, sharing, retention, and your rights.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'In the app, go to Settings → Account → Delete Account. You can also request deletion by emailing support@thefurfinder.com from your account email. Store subscriptions must be cancelled separately.',
  },
]

export const founderStory = [
  'Last year, my own dog Lucky went missing for two days, and I was devastated. I felt completely broken, unable to eat, and overwhelmed with fear and anxiety. I visited every vet, shelter, pound, and local park. I walked the streets, knocked on doors, and scoured Facebook lost and found pages, as well as community pages across different suburbs. But everything was scattered, and there was not one centralised place to get all the information I needed.',
  'Time was critical in locating Lucky. We live in an area with busy roads and reckless drivers, and I was terrified that he might be hurt. When I finally found him after two and a half days, he was traumatised, hungry, thirsty, and in pain. I was incredibly lucky to have found him, but not everyone is.',
  'Every minute counts when a pet is lost. Too often these animals end up in far-away pounds, shelters, or with people who do not know how to reunite them quickly. That experience is what pushed me to create The Fur Finder.',
  'The app brings lost and found information into one place, adds AI to reduce the searching burden, and helps families act faster when panic is highest. I hope it helps reunite as many pets with their families as possible.',
]

export const appFeatureSections: Array<{
  title: string
  intro?: string
  highlight?: { tone: 'coral' | 'teal'; title: string; body: string }
  items?: Array<{ title: string; body: string }>
}> = [
  {
    title: '1. App Overview',
    intro:
      'The Fur Finder is a mobile app designed to reunite lost pets with their owners across Australia. It combines AI-powered photo matching, community tools, GPS-based search, and pet registration into one experience on iOS and Android.',
    highlight: {
      tone: 'coral',
      title: 'Mission',
      body: 'Reduce the number of lost pets, minimise shelter intake, and build a compassionate community of pet lovers through technology.',
    },
  },
  {
    title: '2. Core Features',
    items: [
      {
        title: 'Report Lost or Found Pets',
        body: 'Quick reporting, multi-photo upload, detailed pet information, GPS location tagging, contact details, and optional reward support.',
      },
      {
        title: 'Home Feed',
        body: 'A live feed of active lost and found reports with filters for type, pet category, and proximity.',
      },
      {
        title: 'Interactive Map',
        body: 'Colour-coded map markers for lost pets, found pets, vets, shelters, and rescue organisations with adjustable search radius.',
      },
      {
        title: 'Pet Profile Registration',
        body: 'Pre-register pets with photos, biometric images, suburb tags, and medical notes so owners can act faster if a pet goes missing.',
      },
      {
        title: 'My Pets Dashboard',
        body: 'Manage registered pets and active reports in one place, with status tracking for boosted and reunited reports.',
      },
    ],
  },
  {
    title: '3. AI-Powered Features',
    highlight: {
      tone: 'teal',
      title: 'Technology',
      body: 'Powered by OpenAI vision-enabled workflows for both text and image analysis.',
    },
    items: [
      {
        title: 'AI Pet Matching',
        body: 'Compares photos, descriptions, GPS radius, and profile details to return confidence-based matches between lost, found, and registered pets.',
      },
      {
        title: 'Scan Online Posts',
        body: 'Extracts structured pet information from pasted social posts or URLs and checks it against live app data.',
      },
    ],
  },
]

export const privacySections = [
  {
    title: '1. Account, Contact, and Pet Information',
    body:
      'We collect account identifiers and contact details such as your name, email address, phone number, login credentials, support correspondence, and communication preferences. Pet profiles and reports may include names, species, breed, age, sex, colour, markings, ownership details, medical notes, microchip information, and lost, found, or reunion details.',
  },
  {
    title: '2. Location, Photos, Camera, and Biometric Pet Images',
    body:
      'With permission, we process precise or approximate location to place reports on maps, calculate proximity, and provide nearby alerts. Camera and photo-library access lets you upload report images and optional close-up images of a pet’s face, eyes, nose, or other features. These pet images may be analysed as biometric-style identifiers for pet matching; they are not used to identify a person.',
  },
  {
    title: '3. Community Content and Communications',
    body:
      'We process content you submit, including comments, chats, reports, sightings, moderation reports, and Quick Snaps. Content intended for the community may be visible to other users. Private messages are available to their participants and may be reviewed when reported or when reasonably necessary for safety, support, fraud prevention, or legal compliance.',
  },
  {
    title: '4. Device, Notification, Purchase, and Usage Data',
    body:
      'We may collect push-notification tokens, device and app identifiers, operating system, app version, language, IP address, crash and diagnostic data, and feature activity. We process subscription status, purchase history, credit balances, and transaction identifiers, but app-store providers process full payment-card details. We may also process analytics and advertising interactions, subject to applicable consent and platform settings.',
  },
  {
    title: '5. How We Use Information',
    body:
      'We use information to provide accounts, publish and match pet reports, send nearby and service alerts, enable communications, process entitlements and credits, prevent abuse, moderate content, provide support, improve performance, measure usage, comply with law, and display or measure advertising where enabled. AI results are generated from available inputs and are suggestions requiring user verification.',
  },
  {
    title: '6. Sharing and Service Providers',
    body:
      'We share information with other users when you publish a report or community content, and with service providers that support hosting, databases, authentication, AI processing, mapping, notifications, analytics, customer support, security, advertising, and payment entitlement verification. We may also disclose information to authorities or professional advisers where required by law or reasonably necessary to protect users, animals, rights, or safety. We do not sell personal information for money.',
  },
  {
    title: '7. Retention and Account Deletion',
    body:
      'We retain information while your account is active and as needed for the purposes described above. After a verified deletion request, account and user-generated content are removed or de-identified from active systems, generally within 30 days. Encrypted backups may persist for up to 90 days before normal rotation. Purchase, tax, fraud-prevention, dispute, safety, and legal records may be retained where required or permitted by law. See the Delete Account page for instructions.',
  },
  {
    title: '8. Your Choices and Rights',
    body:
      'Depending on your location, you may request access, correction, portability, restriction, objection, or deletion, and may withdraw consent where processing relies on consent. You can manage location, camera, photos, notifications, and advertising permissions through the app or device settings. You may lodge a complaint with your local privacy regulator. We may need to verify your identity before completing a request.',
  },
  {
    title: '9. Children’s Privacy',
    body:
      'The service is not directed to children under 13, and children who cannot legally consent in their location should use it only with a parent or guardian. We do not knowingly collect personal information from a child in violation of applicable law. A parent or guardian can contact us to request review or deletion.',
  },
  {
    title: '10. Cross-Border Storage and Processing',
    body:
      'Our service providers may store or process information in Australia, the United States, and other countries where they operate. Privacy protections may differ from those in your home country. We use contractual, technical, and organisational safeguards appropriate to the information and applicable law.',
  },
  {
    title: '11. Security and Policy Changes',
    body:
      'We use reasonable administrative, technical, and organisational safeguards, but no system is completely secure. We may update this policy as the service or law changes. Material updates will be identified by a new effective date and version and, where appropriate, communicated in the app or website.',
  },
]

export const termsSections = [
  {
    title: '1. Acceptance of Terms',
    body:
      'By downloading or using The Fur Finder, you agree to these terms and to Australian consumer law requirements that apply to the service.',
  },
  {
    title: '2. Description of Service',
    body:
      'The app provides lost and found pet reporting, pet profile registration, AI-assisted matching, community messaging, and rescue organisation support tools.',
  },
  {
    title: '3. User Responsibilities',
    body:
      'You must provide accurate information, use the service lawfully, respect privacy and intellectual-property rights, and use pet reports and communications only for legitimate pet reunification, care, safety, partnership, or approved advertising purposes. You are responsible for activity on your account.',
  },
  {
    title: '4. User-Generated Content Rules',
    body:
      'You may not post illegal, fraudulent, threatening, abusive, hateful, sexually exploitative, graphic, deceptive, harassing, privacy-invasive, infringing, spam, malware, or dangerous content. Do not publish another person’s sensitive information without permission, impersonate others, solicit prohibited transactions, or use pet reports to facilitate theft or harm. You grant The Fur Finder a limited licence to host, display, process, and distribute content as needed to operate and promote the service.',
  },
  {
    title: '5. Moderation, Reporting, and Blocking',
    body:
      'We may review, restrict, remove, preserve, or report content and may warn, suspend, or terminate accounts when we reasonably believe these terms, law, safety, or platform rules have been violated. Users can report or block profiles, messages, comments, Quick Snaps, and reports using in-app controls. Blocking limits direct interaction but may not remove content already shared publicly. Urgent threats should be reported to local emergency services.',
  },
  {
    title: '6. AI and Matching Disclaimer',
    body:
      'AI-generated matches, confidence indicators, extracted details, and other automated results are suggestions, not guarantees. Results may be incomplete, delayed, or wrong. Verify identity using distinctive markings, ownership records, veterinary or microchip checks, and safe direct communication before relying on a result.',
  },
  {
    title: '7. Ownership and Meeting Safety',
    body:
      'A report or match does not prove ownership. Finders should ask for reasonable evidence without publicly revealing every identifying feature. Meet in a safe, public, well-lit place or through a vet, shelter, council, or police station where appropriate. Do not send deposits or hand over a pet based only on messages, payment claims, or an AI result.',
  },
  {
    title: '8. Subscriptions, Renewal, and Cancellation',
    body:
      'Paid subscriptions may renew automatically at the price and interval shown before purchase unless cancelled at least 24 hours before renewal or as otherwise stated by the applicable store. Manage or cancel through the store account used to subscribe. Deleting your Fur Finder account does not automatically cancel a subscription. Feature availability and pricing may change prospectively with notice required by law or the store.',
  },
  {
    title: '9. iOS Payments, Refunds, and Credits',
    body:
      'Apple processes iOS in-app purchases, subscription billing, cancellation, and refund requests under Apple’s terms and policies. The Fur Finder does not receive full payment-card details and cannot directly issue an Apple refund. Credits are limited service units, have no cash value, are not transferable unless stated, and cannot be redeemed for money. Promotional credits may expire under the terms shown when issued.',
  },
  {
    title: '10. External Links, Partners, and Advertisers',
    body:
      'External destinations must use valid public https:// links and may be reviewed or removed for safety, accuracy, legality, or policy compliance. Advertiser and partner content does not constitute our endorsement. Report malicious, misleading, or inappropriate destinations through in-app reporting or support. We may moderate campaigns, links, and organisation content before or after publication.',
  },
  {
    title: '11. Service Changes and Liability',
    body:
      'The service may change, be interrupted, or contain errors. To the extent permitted by law, The Fur Finder is not responsible for user conduct, the accuracy of reports or AI suggestions, unsuccessful reunions, third-party destinations, or in-person interactions. Nothing in these terms excludes rights or remedies that cannot lawfully be excluded, including applicable consumer guarantees.',
  },
  {
    title: '12. Privacy and Support',
    body:
      'Our Privacy Policy explains how personal information is handled. For account, safety, billing, moderation, or legal support, use the Support page or email support@thefurfinder.com.',
  },
]

export const deleteAccountCards: Array<{ title: string; content: ReactNode }> = [
  {
    title: 'Delete Your Account',
    content:
      'You can request permanent deletion of your The Fur Finder account at any time. Deletion removes or de-identifies your profile, contact details, pet profiles, pet photos and biometric pet images, reports, comments, chats, Quick Snaps, saved items, push tokens, credit balance, and other account-linked content from active systems.',
  },
  {
    title: 'How to Delete Your Account',
    content:
      'In the app, go to Settings → Account → Delete Account and follow the confirmation prompts. If you cannot access the app, email support@thefurfinder.com from the address associated with your account and use the subject “Account Deletion Request.”',
  },
  {
    title: 'Identity Verification and Timing',
    content:
      'To protect accounts from unauthorised deletion, we may ask you to confirm your email, sign in again, or provide limited information that matches the account. We generally complete verified requests within 30 days. Encrypted backup copies may remain inaccessible in normal operations for up to 90 days before rotation.',
  },
  {
    title: 'Records We May Retain',
    content:
      'We may retain limited purchase, subscription, tax, fraud-prevention, chargeback, dispute, moderation, safety, and legal-compliance records where required or permitted by law. These records are access-restricted and are not kept for ordinary product use. Aggregated or de-identified analytics may also remain.',
  },
  {
    title: 'Cancel Store Subscriptions Separately',
    content:
      'Deleting your account does not cancel an App Store or Google Play subscription. Cancel through the store account used to subscribe before deleting your account to prevent future renewals. Apple handles iOS subscription cancellation and refund requests under its policies.',
  },
]
