# NexusFinance Mobile App (Android APK)

Expo WebView shell that loads the NexusFinance web app
(`https://nexusfinancefintech.vercel.app`) inside a native Android app.

## Setup

```bash
cd mobile
npm install
```

## Build the APK (cloud build via EAS — no Android Studio needed)

1. Create a free account at https://expo.dev
2. Log in from the CLI:
   ```bash
   eas login
   ```
3. Configure the project (creates the EAS project on your account):
   ```bash
   eas build:configure
   ```
4. Build the APK:
   ```bash
   eas build --platform android --profile preview
   ```

The `preview` profile in `eas.json` produces a directly-installable `.apk`.
After the build completes, EAS prints a download link — download the APK,
transfer it to your Android phone, and install it.

> First build may queue ~10-20 minutes on the free tier. Later builds are
> faster because of caching.

## Test locally

```bash
npm start
```

Scan the QR code with the Expo Go app on your phone to preview the shell.

## Requirements

- The deployed site at `nexusfinancefintech.vercel.app` must be online
  (Vercel free/hobby projects pause after inactivity — restore it from the
  Vercel dashboard if it's paused).
- The backend API is proxied automatically via `vercel.json`, so no code
  changes are needed.

## Notes

- Google OAuth login is hidden in the app (it uses a redirect flow that does
  not work inside WebViews). Email + password login is fully supported.
- External links (`bakong://`, `tel:`, `mailto:`) open in the system apps.