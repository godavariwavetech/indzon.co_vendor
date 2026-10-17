# Vendor API restoration on Indz_dynamic

The Vendor App now executes the original API integrations from `main`. This document supersedes the previous offline-demo instructions. Existing release APKs in `releases/` are historical artifacts and do not contain these changes.

## Implementation

- `src/redux/reducers/auth.js` imports real Redux Toolkit thunks directly. Demo snapshots and demo synchronization cannot populate the authentication reducer.
- The original endpoint constants and base URL in `src/config/config.ts` remain unchanged: `https://amaraa.co.in:2026/`.
- Original HTTP methods, payload names, category/filter mappings, product data, order item mappings, payment data, and response status checks remain in place.
- Axios and the legacy fetch helper no longer block network requests. Axios retains its original Bearer header; the legacy helper retains its original Authorization header convention.
- Login requires the original successful response and vendor identifier at `data[0].id`. A server-provided top-level token is retained when available, matching the token field referenced in main. No token is fabricated; live token issuance remains unverified.
- Session identity uses the original `root` persistence key. Only identity fields are persisted going forward. Demo storage uses a separate historical key and is not loaded. Logout clears cached vendor data; HTTP 401 clears the session. Vendor routes require a vendor identity.
- Scoped request errors are displayed on orders, menu, reports, and earnings. Loading tracks concurrent requests. Existing empty states, offline handling, and refresh controls are retained.
- Product edits/availability changes require backend success, then reload products. Failed availability changes do not flip the local switch. Orders accept/reject using the original status values `1`/`5`, then reload current orders. Reports, menu, and earnings refresh when revisited.
- Bill Summary now fetches the original order-details endpoint and uses real order totals instead of the original hardcoded bill.
- Firebase foreground/background notifications, permissions, and FCM token submission are re-enabled. Token submission uses the same vendor ID as login. Notification links with an order ID no longer assume a full order object was supplied. Startup and notification setup check for the default Firebase app before accessing messaging, so a missing configuration does not crash the API application. Tests cover both missing and configured Firebase startup.
- Indzon branding, theme, icons, screen styles, navigation destinations, and compatible keyboard/export improvements are retained. No Delivery App or other project was modified.

## Features absent from main

`main` has no product creation/deletion API or numeric stock update API. AddFoodScreen was an unavailable placeholder. The demo-only creation, deletion, and stock actions are removed from normal execution rather than assigned invented endpoints. Product listing, price/discount editing, and availability updates use the original APIs.

`main` supports push notifications, but has no notification-history or mark-as-read endpoint. The demo inbox no longer presents fictional notifications or a simulated mark-as-read action. The original terms/privacy implementations are unavailable placeholders; no policy backend was invented. Profile details/password changes, registration, recovery, account deletion, common support settings, categories, subcategories, filters, orders, history, earnings, and transactions use the original services.

## Verification on 2026-10-17

- Branch verified as `Indz_dynamic`; no branch creation, reset, or merge.
- Jest: 36 tests passed across 4 suites, covering 23 original request contracts, login/session behavior, rejected mutations, transport failures, Authorization headers, and the application provider mount. Backend responses and native hosts are mocked. Redux Persist's existing five-second timeout produces an open-handle warning; the diagnostic run exits successfully.
- ESLint: zero errors; existing warnings remain. See the final task report for the final warning count.
- Android Metro release bundle: successful. This validates JS bundling, not device behavior.
- Android native build: blocked at `:app:processDebugGoogleServices`. Application ID is `com.indzon.vendor`, but `android/app/google-services.json` only registers `com.amaraamerchant`. A Firebase configuration registered for the current app ID is required. Existing identity/credentials were not replaced and Google Services validation remains enabled.
- Read-only live probe of `https://amaraa.co.in:2026/vendor_app/application_common_api`: HTTP 404 outside the network sandbox. The configured URL was preserved. No authenticated writes or real account deletion were attempted.
- Backend credentials were not supplied. Login, profile loading, product updates, order updates, earnings, and actual push delivery have not been verified end to end.
- iOS build/device verification requires macOS/Xcode and was not run.
- TypeScript has existing i18n import/type errors and a missing `react-native-restart` dependency; unrelated localization changes are outside this restoration.

Run `npm.cmd test -- --runInBand`, `npm.cmd run lint`, and `npx.cmd tsc --noEmit`. Bundle with `npx.cmd react-native bundle --platform android --dev false --entry-file index.js --bundle-output .demo-build/vendor.android.bundle --assets-dest .demo-build/assets`. Once Firebase configuration is corrected, run `android/gradlew.bat assembleDebug` from `android` and verify authenticated workflows using an authorized backend account.
