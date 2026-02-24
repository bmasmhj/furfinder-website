# PetReunite - Lost & Found Pets App

## Overview
A comprehensive lost and found pets mobile app built with Expo + React Native (frontend) and Express + TypeScript (backend). Users can browse/report lost/found pets, view them on a map, proactively register their own pets, and manage everything from a unified "My Pets" tab.

## Architecture
- **Frontend**: Expo Router (file-based routing), React Native, React Query
- **Backend**: Express + TypeScript on port 5000
- **State**: React Context with AsyncStorage persistence (pet-context.tsx)
- **Styling**: Coral (#FF6B4A) + Teal (#2CBCB6) color scheme, Poppins font family

## Key Features
1. Home feed with lost/found pet cards
2. Interactive map view (platform-specific: react-native-maps on mobile, web fallback) with vet/shelter/rescue markers
3. Report lost/found pets with **multi-photo upload** (up to 5 photos) + GPS location
4. **Pet Profile Registration**: Owners can pre-register pets with photos, microchip number, breed, suburb, medical notes
5. Quick "Report as Lost" from registered pet profiles (pre-fills report form)
6. Combined "My Pets" tab with sub-tabs for registered pets and active reports
7. **AI Matching**: Uses OpenAI (via Replit AI Integrations) to find potential matches between lost/found reports and registered profiles based on breed, color, markings, size, location, and descriptions
8. **Scan Online Posts**: Paste text from Facebook, Instagram, Nextdoor, or any online lost/found pet post - AI extracts pet details and matches against app data
9. **Biometric ID Scanning**: Pet owners register close-up photos of nose, eyes, and face for enhanced AI matching. Strangers can use "Quick Snap" to photograph a spotted pet and match against biometric scans + regular photos
10. **Photo Gallery**: Swipeable multi-photo gallery on pet detail view with dot indicators
10. **Social Sharing**: Share pet reports via native Share API with pet details
11. **Community Comments**: "Community Tips" section on each report for public comments
12. **Timeline**: Visual timeline tracking all report events (created, status changes, comments, sightings)
13. **Safety Tips Guide**: Comprehensive pet safety guide with tips for lost/found situations, prevention, emergency contacts
14. **Vet & Shelter Directory**: Map markers and web listing of nearby vets, shelters, and rescue organizations
15. **Reward Pool**: Community reward pooling for lost pets with contribution system
16. **Area Alerts**: In-app notifications when a lost/found pet is reported near registered pet profiles (matched by suburb, pet type, and 10km proximity radius)

## Subscription / Monetization
- **RevenueCat** SDK (`react-native-purchases`) for in-app subscriptions
- **Free Tier**: 1 report, 1 profile, 1 photo per report, standard alerts
- **Premium ($4.99/month or $29.99/year)**: Unlimited reports/profiles, AI matching, scan posts, multi-photo (up to 5), priority alerts
- Subscription context: `lib/subscription-context.tsx` - manages premium state with AsyncStorage persistence
- Paywall screen: `app/paywall.tsx` - plan selection, purchase, restore flow
- Feature gating via `useSubscription()` hook: `canUseAIMatching()`, `canUseScanPost()`, `canUseMultiPhoto()`, `canAddReport()`, `canAddProfile()`
- RevenueCat loads dynamically (non-web only); web uses local state for testing
- User needs to configure RevenueCat API keys before publishing to stores

## Project Structure
- `app/(tabs)/` - Tab screens: index (home), map, report, my-reports (renamed to "My Pets")
- `app/report-form.tsx` - Lost/found report form (supports pre-fill from profile via `fromProfileId` param)
- `app/register-pet.tsx` - Pet registration/edit form (supports edit via `editId` param)
- `app/my-pet/[id].tsx` - Registered pet detail view
- `app/pet/[id].tsx` - Pet report detail view (includes "Find AI Matches" button)
- `app/matches.tsx` - AI matches results screen
- `app/scan-post.tsx` - Scan online posts screen (paste text/URL, AI extracts pet info and matches)
- `app/quick-snap.tsx` - Quick Snap screen (photograph a spotted pet for biometric AI matching)
- `app/safety-tips.tsx` - Pet safety guide with tips for lost/found situations
- `lib/pet-context.tsx` - State management for reports + profiles
- `lib/types.ts` - TypeScript types (PetReport, PetProfile with biometricPhotoUris, PetMatch, VetShelter)
- `lib/helpers.ts` - Utility functions
- `lib/query-client.ts` - API client with getApiUrl(), apiRequest()
- `lib/vet-shelters.ts` - Vet, shelter, and rescue organization data
- `constants/colors.ts` - App color constants
- `components/` - Shared components (MapViewNative, EmptyState, ErrorBoundary)
- `server/routes.ts` - Backend API routes (POST /api/match for AI matching)
- `server/replit_integrations/` - OpenAI AI Integrations (chat, image, audio, batch modules)

## Data Types
- **PetReport**: Lost/found reports with status, location, contact info
- **PetProfile**: Registered pet profiles with photoUris[], microchipNumber, suburb, medicalNotes, owner details
- **PetMatch**: AI match result with id, type (report/profile), confidence (0-100), reason

## AI Integration
- Uses Replit AI Integrations for OpenAI access (no separate API key needed, billed to credits)
- Model: gpt-5.2 for matching analysis (supports text + image inputs for vision)
- Endpoint: POST /api/match - accepts target report + all reports/profiles, returns ranked matches with confidence scores
- Endpoint: POST /api/scan-post - accepts pasted text or URL from online posts, extracts pet info, then matches against app data
- Pre-filters candidates by pet type, opposite status, AND 5km GPS radius before sending to AI
- Vision-based matching: compares actual pet photos (face shape, markings, coat patterns) when photos are available
- GPS distance filtering: uses Haversine formula to calculate km distance, filters to 5km radius
- Max 15 candidates sent for vision analysis to keep API calls efficient
- Photos must be data URIs or HTTP URLs for vision API; local file:// paths are filtered out gracefully

## Recent Changes
- 2026-02-21: Added "Scan Online Post" feature to match Facebook/social media posts against app data
- 2026-02-21: Added AI-powered matching feature with OpenAI integration
- 2026-02-21: Added matches screen with confidence scores and AI reasoning
- 2026-02-21: Added "Find AI Matches" button on pet report detail screen
- 2026-02-21: Added pet profile registration feature with microchip, photos, suburb
- 2026-02-21: Transformed "My Reports" tab into combined "My Pets" tab with sub-tabs
- 2026-02-21: Added "Report as Lost" quick action from registered pet profiles
- 2026-02-21: Added pet profile detail view with edit/delete capabilities
- 2026-02-21: Added multi-photo upload (up to 5 photos) on report form with thumbnail carousel
- 2026-02-21: Added swipeable photo gallery with dot indicators on pet detail view
- 2026-02-21: Added social sharing via native Share API on pet detail view
- 2026-02-21: Added Community Tips (comments) section on pet detail view
- 2026-02-21: Added visual timeline tracking report events on pet detail view
- 2026-02-21: Added reward pool with community contribution system on pet detail view
- 2026-02-21: Added Safety Tips Guide screen with 4 categories of pet safety advice
- 2026-02-21: Added vet/shelter/rescue markers on map with toggle and legend
- 2026-02-21: Added Nearby Services directory on web map fallback
- 2026-02-21: Added area-based notification alerts for lost/found pets near registered profiles
- 2026-02-21: Added notifications screen with bell icon badge on home header
- 2026-02-21: Added premium subscription system with RevenueCat ($2.99/month, $24.99/year)
- 2026-02-21: Added paywall screen with plan comparison, feature list, purchase/restore flow
- 2026-02-21: Added feature gating for AI matching, scan post, multi-photo, unlimited reports/profiles
- 2026-02-21: Added upgrade entry points on home screen, My Pets tab, and premium-locked features
- 2026-02-22: Added Privacy Policy screen (Australian Privacy Act compliant, 11 sections)
- 2026-02-22: Added Terms of Use screen (14 sections, Australian Consumer Law compliant)
- 2026-02-22: Added first-launch consent screen with 3 checkboxes (privacy, terms, AI disclosure)
- 2026-02-22: Added consent context (lib/consent-context.tsx) with AsyncStorage persistence
- 2026-02-22: Added Settings screen with data management, consent info, delete all data, revoke consent
- 2026-02-22: Added AI disclaimer notices on matches screen and scan post screen
- 2026-02-22: Added settings gear icon to home screen header
- 2026-02-22: Upgraded AI matching to use OpenAI Vision (gpt-5.2) for visual photo comparison
- 2026-02-22: Added GPS distance pre-filtering (5km radius) to narrow candidate pool before AI analysis
- 2026-02-22: Vision matching compares face shape, markings, coat patterns alongside text analysis
- 2026-02-22: Updated scan-post endpoint with same vision + photo comparison capabilities
- 2026-02-22: Expanded vet/shelter/rescue directory from 8 Sydney entries to 89 Australia-wide entries
- 2026-02-22: Directory now covers all 8 states/territories: NSW(20), VIC(15), QLD(13), WA(12), SA(10), TAS(7), NT(6), ACT(6)
- 2026-02-24: Added Biometric ID Scanning — owners can register close-up photos (nose, eyes, face) on pet profiles
- 2026-02-24: Added Quick Snap screen for strangers to photograph spotted pets and match via AI biometric analysis
- 2026-02-24: Added Quick Snap button to home screen header (teal bubble with camera-iris icon)
- 2026-02-24: Updated AI matching prompts (match + scan-post + new quick-snap endpoint) to prioritize biometric features
- 2026-02-24: Biometric photos included in candidate matching — nose print patterns, iris details, facial structure
- 2026-02-24: New endpoint POST /api/quick-snap-match for photo-based pet identification
- 2026-02-24: Added Happy Tails reunion stories feed — green gradient theme (#22C55E), story cards with REUNITED badges, like/share/comment engagement
- 2026-02-24: Updated "Mark as Reunited" flow to capture reunion story message via dedicated input card
- 2026-02-24: Added Happy Tails tab to tab bar with heart-circle icon (5 tabs total: Home, Map, Report, Happy Tails, My Pets)
- 2026-02-24: Added Happy Tail story detail screen with photo gallery, pet details grid, reunion message card, community messages
- 2026-02-24: Added social sharing buttons: Facebook (deep link), Instagram, TikTok, and "Share to Any App" via native Share API
- 2026-02-24: Extended PetReport with reunionMessage, reunionDate, likes, likedByMe fields; added markReunited() and toggleLike() to pet-context
