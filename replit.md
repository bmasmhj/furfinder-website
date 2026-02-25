# PetReunite - Lost & Found Pets App

## Overview
PetReunite is a comprehensive mobile application designed to help reunite lost pets with their owners and assist in finding homes for found animals. The platform provides tools for users to report lost or found pets, view them on an interactive map, and proactively register their own pets.

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

**Backend:**
-   **Framework:** Express + TypeScript running on port 5000.
-   **Authentication:** JWT-based authentication with bcryptjs for password hashing and 30-day token expiry.
-   **API:** Provides comprehensive CRUD (Create, Read, Update, Delete) routes for reports, profiles, comments, likes, boosting, reuniting pets, and notifications.

**AI Integration:**
-   Leverages Replit AI Integrations for OpenAI (gpt-5.2) for advanced matching.
-   **AI Matching:** Matches lost/found reports and registered profiles based on breed, color, markings, size, location, and descriptions. Uses vision-based AI for photo comparison (face shape, markings, coat patterns).
-   **Scan Online Posts:** Extracts pet details from pasted text (e.g., social media posts) and matches them against app data.
-   **Biometric ID Scanning:** Allows owners to register close-up photos (nose, eyes, face) for enhanced AI matching. A "Quick Snap" feature enables matching spotted pets against biometric scans.
-   **Efficiency:** Pre-filters candidates by pet type, opposite status, and a 5km GPS radius before AI analysis.

**Monetization:**
-   **Subscription Model:** Free tier with limited features; Premium tier ($4.99/month or $49.99/year) unlocks unlimited reports/profiles, AI matching, scan posts, and multi-photo uploads.
-   **Implementation:** RevenueCat SDK (`react-native-purchases`) for in-app subscriptions, with feature gating via a `useSubscription()` hook.

## External Dependencies
-   **Database:** PostgreSQL (cloud) with `pg` driver.
-   **AI Services:** OpenAI (via Replit AI Integrations) for AI matching, post scanning, and biometric analysis.
-   **In-app Purchases:** RevenueCat SDK for managing subscriptions.
-   **Mapping:** `react-native-maps` for interactive map views.
-   **Local Storage:** `AsyncStorage` for persisting local preferences.