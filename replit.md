# The Fur Finder - Lost & Found Pets App

## Overview
The Fur Finder is a comprehensive mobile application designed to help reunite lost pets with their owners and assist in finding homes for found animals. The platform provides tools for users to report lost or found pets, view them on an interactive map, and proactively register their own pets.

The vision is to become the leading platform for pet recovery and community support, leveraging advanced AI for matching and identification. The project aims to reduce the number of lost pets, minimize shelter intake, and foster a compassionate community of pet lovers.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the folder `lib/`. Do not make changes to the file `constants/colors.ts`.

## System Architecture
The application is built with a React Native (Expo) frontend and an Express.js (TypeScript) backend.

**Frontend:**
-   **Frameworks:** Expo Router for file-based routing, React Native for UI, and React Query for data fetching and caching.
-   **State Management:** React Context (`lib/pet-context.tsx`) backed by a cloud API for pet reports and profiles. `AsyncStorage` is used for local preferences like search radius.
-   **UI/UX:** Features a Coral (#FF6B4A) and Teal (#2CBCB6) color scheme with the Poppins font family.
-   **Core Features:**
    -   Home feed displaying lost/found pet cards.
    -   Interactive map with pet sightings and markers for vets, shelters, and rescue organizations.
    -   Multi-photo upload (up to 5 photos) for pet reports.
    -   Pet profile registration for owners, including microchip numbers and medical notes.
    -   Quick "Report as Lost" functionality from registered pet profiles.
    -   Combined "My Pets" tab for managing registered pets and active reports.
    -   Swipeable multi-photo galleries and social sharing for pet reports.
    -   Community comments ("Community Tips") and a visual timeline for each report.
    -   Safety Tips Guide and a comprehensive Vet & Shelter Directory.
    -   Reward pooling system for lost pets.
    -   In-app area alerts for nearby lost/found pets.
    -   "Boost Report" feature to increase visibility.
    -   "Happy Tails" section for reunion stories.
    -   Printable flyer generator from pet reports.
    -   "How It Works" guide and an FAQ section.
    -   Referral & Ambassador program for earning premium features.
    -   Suburb Directory: Browse all registered pets by suburb. Users can search suburbs and view pet profiles in their neighbourhood. Privacy-safe — only shows public info (no phone, medical notes).
    -   Partner Organisations: Vets, shelters, and rescue groups can register, list animals in their care, and have those animals included in AI matching results. Self-registration with admin approval workflow.
    -   In-App Messaging: Users can message report owners directly through the app via a "Message in App" button on report detail pages. Full conversations inbox accessible from Settings > My Messages. Chat screen with inverted FlatList, optimistic message sending, and 5-second polling for new messages.
    -   Onboarding Flow: 3-slide onboarding screen shown on first launch (stored in AsyncStorage). Slides cover emotional benefit, AI matching, and community power. Skip option and post-onboarding CTA to register pet or browse.
    -   Comment Moderation: Admins and report owners can delete comments via a trash icon. DELETE /api/comments/:id enforces role and ownership checks.
    -   Push Notifications: expo-notifications integrated. Push tokens registered on login and stored in users.push_token DB column. Real push notifications sent server-side (Expo Push API) when messages are received.

**Backend:**
-   **Framework:** Express + TypeScript running on port 5000.
-   **Authentication:** JWT-based authentication with bcryptjs for password hashing and 30-day token expiry. Role-based access control (user/org/admin) with `requireRole()` middleware.
-   **API:** Provides comprehensive CRUD routes for reports, profiles, comments, likes, boosting, reuniting pets, notifications, and partner organisations (registration, animal management, admin approval).

**AI Integration:**
-   Leverages Replit AI Integrations for OpenAI (gpt-5.2) for advanced matching.
-   **AI Matching:** Matches lost/found reports and registered profiles based on breed, color, markings, size, location, and descriptions. Uses vision-based AI for photo comparison (face shape, markings, coat patterns).
-   **Scan Online Posts:** Extracts pet details from pasted text (e.g., social media posts) and matches them against app data.
-   **Biometric ID Scanning:** Allows owners to register close-up photos (nose, eyes, face) for enhanced AI matching. A "Quick Snap" feature enables matching spotted pets against biometric scans.
-   **Efficiency:** Pre-filters candidates by pet type, opposite status, and a 5km GPS radius before AI analysis.

**Monetization:**
-   **Subscription Model:** Free tier with limited features; Premium tier ($4.99/month or $49.99/year) unlocks unlimited reports/profiles, AI matching, scan posts, and multi-photo uploads.
-   **Implementation:** RevenueCat SDK (`react-native-purchases`) for in-app subscriptions, with feature gating via a `useSubscription()` hook.

## Post-Launch Tasks (v1.1 — After iOS Submission)
These are confirmed features to build after the iOS App Store submission is complete:
1. **Dark Mode** — Full dark theme across all 30+ screens. Requires a complete colour system refactor using `useColorScheme()`. Estimated 3-4 hours.
2. **Analytics Tracking** — In-app event logging for report submissions, match success rate, referral conversions, and feature usage. Must comply with Australian Privacy Act. Estimated 2 hours.

## Debugging Rules (Non-Negotiable)

When a screen shows empty data or a fetch appears to do nothing:
1. **Read the source code first.** Trace the full data path: how the URL is built → how the fetch is called → what the server receives. Do not rely on logs alone.
2. **Check URL construction.** `getApiUrl()` returns a trailing slash (`https://domain/`). String concatenation like `${getApiUrl()}/api/route` creates a double-slash (`https://domain//api/route`) that browsers silently drop. Always use `new URL('/api/route', getApiUrl()).toString()` instead.
3. **Use `expo/fetch` not the global `fetch`.** Import `fetch` from `'expo/fetch'` in all screens that make API calls. The global fetch behaves differently across platforms.
4. **Never conclude "the API is broken" without first verifying the request actually reached the server.** If the backend log has no record of the request, the bug is in the frontend URL or fetch call, not the server.

## Known Bugs & Patterns (Lessons Learned — Do Not Repeat)

### Database
- **Always verify column names against the real DB schema before using them in queries.** The `is_reunited` column does not exist — reunited status is tracked via `status = 'reunited'`. Never assume a column name; check `information_schema.columns` first.

### Photos & Images
- **Never store `file://` URIs in the database.** They are temporary local device paths that disappear when cache clears or on any other device. Always set `base64: true` in every `ImagePicker.launchCameraAsync()` and `launchImageLibraryAsync()` call, then store as `data:image/jpeg;base64,...`.
- **Use `expo-image`'s `Image` component for all thumbnails and cards**, not `Animated.Image` from reanimated. `expo-image` handles `file://`, `data:`, `https://` and cached URIs consistently. `Animated.Image` does not.
- **Filter `file://` URIs before rendering** in any list or directory screen. Use `.filter(u => !u.startsWith('file://'))` to avoid broken image placeholders from old data.

### Navigation
- **Always use `router.canGoBack() ? router.back() : router.replace(fallback)`** on every back button. `router.back()` silently does nothing if there is no navigation history (e.g. screen opened via direct URL in a browser). Every custom back button must have a fallback route.
- Fallback destinations by screen type: Settings-linked screens → `/(tabs)/settings`, Pet detail/feed screens → `/(tabs)`, My Pet screens → `/(tabs)/my-reports`.

### React Query / Data Fetching
- **Screens that must show fresh data on every visit** (directories, lists that users add to) must set `staleTime: 0` on their queries. The default `staleTime: Infinity` means data never refreshes, so newly added items won't appear.
- **Pull-to-refresh:** Add `RefreshControl` with `queryClient.invalidateQueries()` to any FlatList where the user might expect to see new data without navigating away.

### Location Detection
- **Always call `Location.hasServicesEnabledAsync()` first.** If location services are off at the OS level, all subsequent calls will hang or fail silently.
- **Always check `canAskAgain`** after `requestForegroundPermissionsAsync()`. If `canAskAgain` is false, show the user the exact path to fix it in iPhone Settings — do not just show a generic "permission needed" message.
- **Always set a timeout on `getCurrentPositionAsync`.** Without one it hangs forever indoors. Use `Promise.race()` with a 15-second timeout and `Accuracy.Lowest` (fastest, WiFi/cell-based). Try `getLastKnownPositionAsync({ maxAge: 300000 })` first as it's instant.

### Paywalls & Subscriptions
- **Do not gate `purchasePackage()` behind an `offerings.length > 0` check.** The subscription context already handles the case where RevenueCat isn't configured (preview/dev mode) — it grants premium directly. The paywall must always call `purchasePackage()` and let the context decide.
- **Always add `insets.bottom` to ScrollView `contentContainerStyle` padding** on any screen with a CTA button at the bottom. Without it the button can be hidden behind the iPhone home indicator.

### Backend API Changes
- **Check the actual DB column list before writing any new SQL filter condition.** Run a quick `SELECT column_name FROM information_schema.columns WHERE table_name = '...'` before adding WHERE clauses with new column names.

## External Dependencies
-   **Database:** PostgreSQL (cloud) with `pg` driver.
-   **AI Services:** OpenAI (via Replit AI Integrations) for AI matching, post scanning, and biometric analysis.
-   **In-app Purchases:** RevenueCat SDK for managing subscriptions.
-   **Mapping:** `react-native-maps` for interactive map views.
-   **Local Storage:** `AsyncStorage` for persisting local preferences.