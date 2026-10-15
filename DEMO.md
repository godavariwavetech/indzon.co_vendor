# Offline vendor demo

Run this project with `npm start` and, in a second terminal, `npm run android`. Both scripts use Metro port `8090` to avoid loading the Delivery App's bundle. For a USB device, `adb reverse tcp:8090 tcp:8090` forwards that port. If an installed debug build still points to another server, set its development server host to `localhost:8090`.

The app is branded Indzon.co and its Android application ID is `com.indzon.co`. Android reads `DEMO_MODE` from `src/demo/config.js` and skips the Google Services plugin for demo builds, so the retained production `google-services.json` is not required. Before disabling demo mode, supply a Firebase configuration registered for the current application ID.

Demo mode is enabled by `src/demo/config.js`. The existing screen layouts and production thunks remain in place. All thunk actions run through `src/demo/store.js`; unknown actions fail locally. Axios and the legacy fetch helper also refuse network calls in demo mode. Firebase handlers, token registration, connectivity gates and external support actions are bypassed. `firebase.json` disables automatic native messaging registration and analytics; the production notification setup explicitly re-enables messaging when demo mode is disabled.

The app opens to Sign In on each fresh launch. Enter a valid 10-digit mobile number and a non-blank password to enter the predefined vendor session. Missing or invalid fields show a validation modal. Logout returns to Sign In. Registration and password recovery are simulated without a server or OTP.

Demo vendor: Indzon.co Kitchen, vendor ID `101`, phone `9000000101`, email `kitchen@example.com`. Example login: mobile `9000000101`, password `Indzon@123`. The local login validates a 10-digit number and a non-blank password; it does not verify credentials against a server. These details identify fictional local data, not a backend account.

The Menu tab groups eight seeded products into four categories. Search, edit price/name/description/stock, toggle availability, add a product, and delete locally. Existing order lines retain historical names and prices. Orders can be accepted, prepared, completed or rejected. Acceptance reserves stock atomically; rejection of an accepted order restores it. Completion updates reports, settlement history and earnings once. Reports include all existing workflow statuses and support date filters and local Excel export. Earnings includes settlement details. More exposes profile, local notifications, support, terms and privacy. Bill Summary is reachable from order payment details.

All changes are in memory and survive navigation and refresh; restarting resets the demo. Demo persistence uses a separate key and does not load production credentials or save demo records. Delete Account resets only fictional data. Sample dates follow the launch day so default report filters show records. Contacts and registration are simulated; no real messages or payments are sent. Product thumbnails use the existing bundled image so they work offline.

To restore production, set `DEMO_MODE` to `false` and rebuild. Production data calls remain in `src/redux/reducers/auth.js`. Restore Firebase auto-initialization settings in `firebase.json` if automatic startup registration is required. Original placeholder policy implementations are retained beside their demo versions.

Validation commands:

- `npm.cmd test -- --runInBand __tests__/demo.test.js`
- `npm.cmd run lint -- --quiet`
- `cd android` then `.\gradlew.bat app:assembleRelease --offline --max-workers=1 -PreactNativeArchitectures=arm64-v8a -PdemoRelease=true`

`-PdemoRelease=true` explicitly signs the offline release APK with the existing development key when the production keystore is unavailable. This option is rejected when `DEMO_MODE` is off. The resulting ARM64 APK is intended for direct installation on compatible Android phones; production distribution requires the production signing key.

A release APK bundles JavaScript and assets and can run without Metro or a backend. Debug builds normally still need Metro. iOS builds require macOS/Xcode.

Verification (2026-10-15): all nine Jest tests across three suites and ESLint pass. Jest reports an asynchronous handle warning after passing. The application mount test mocks native hosts and navigation. A connected Android device displayed seeded Orders, Menu, Reports, Earnings and More screens, the credential-free login screen, and order details. This is a smoke check of the installed app, not exhaustive device coverage of the current source. Fixed the Orders focus callback depending on the entire shop object, which caused local refreshes to trigger repeated focus loads. TypeScript is currently blocked by existing i18n.ts import/type errors and the missing react-native-restart dependency. The initial full Android release build exhausted host memory during Reanimated CMake configuration; the single-worker ARM64 retry has bundled JavaScript and assets and is compiling native libraries.
