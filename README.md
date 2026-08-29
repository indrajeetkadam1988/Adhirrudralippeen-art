# Lippeen Art

A cross-platform (iOS + Android) mobile app for a Lippan (Kutchi mud & mirror relief)
art business. Customers sign up, browse a ready-made catalog, place paid orders, and
submit custom art requests with reference photos. The business owner manages every
order and custom request in real time from an admin view inside the same app.

Built with **Expo + React Native**, **Firebase** (Auth, Firestore, Storage, Cloud
Functions), and **Stripe** for payments.

## What's implemented

- Email/password sign up, login, password reset (Firebase Auth)
- Ready-made product catalog with real-time updates (Firestore)
- Cart, shipping address, and real card checkout (Stripe PaymentSheet)
- Order creation + live order status tracking for the customer
- Custom art request form with photo upload (Firebase Storage)
- Admin view (role-gated) to update order status and send quotes on custom
  requests, in real time — no separate app or dashboard needed
- Firestore/Storage security rules enforcing per-user data access and admin-only writes
- A seed script with a sample 6-item Lippan art catalog

## What you still need to do before this is "done"

I can build and wire up the whole app, but three things are outside what I can do for
you and need your/your client's own accounts:

1. **Firebase project** — free to create, takes 5 minutes.
2. **Stripe account** — for your client's business, so payouts land in their bank
   account. See the note on India below.
3. **Apple Developer Program** ($99/yr) and **Google Play Console** ($25 one-time) —
   required to publish. I can prepare the build and walk you through submission, but
   creating these accounts and clicking "Submit for review" has to be your client.

Real product photos and branding (app icon, splash screen) are also still placeholders
— see "Branding" below.

---

## 1. Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. In the new project, add a **Web app** (</> icon) — this gives you the config values
   for `.env`.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Enable **Firestore Database** (start in production mode — the rules in this repo
   handle access control).
5. Enable **Storage**.
6. Copy `.env.example` to `.env` and fill in the Firebase values from step 2, plus your
   Stripe **publishable** key (see section 3).

```bash
cp .env.example .env
```

7. Install the Firebase CLI if you don't have it, then link this folder to your project:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

8. Deploy the security rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 2. Seed the product catalog + create the admin account

1. In Firebase console → **Project settings → Service accounts → Generate new private
   key**. Save the downloaded file as `serviceAccountKey.json` in the project root
   (it's already in `.gitignore` — never commit it).
2. Sign up for a normal account in the app once (so the user exists in Firebase Auth) —
   this will be your client's admin login.
3. Run the seed script, pointing `ADMIN_EMAIL` at that account:

```bash
ADMIN_EMAIL=owner@example.com npm run seed
```

This adds 6 sample Lippan-art catalog items and grants that account the `admin` role,
which unlocks the **Admin** tab in the app (order + custom-request management).
Re-run any time to add more products, or edit products directly in the Firestore
console under the `products` collection.

## 3. Stripe setup

Card payments need a small server component (Cloud Functions) because the secret key
must never ship inside the app.

1. Create a [Stripe account](https://dashboard.stripe.com/register) for your client's
   business.
2. From the Stripe dashboard, grab the **Publishable key** (`pk_...`) and put it in
   `.env` as `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Grab the **Secret key** (`sk_...`) — this goes to Cloud Functions only, never into
   `.env` or the app:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

4. Deploy the functions (this requires the Firebase project to be on the pay-as-you-go
   **Blaze** plan — it has a generous free tier, but Cloud Functions with outbound
   network calls like Stripe require it):

```bash
cd functions
npm install
npm run deploy
```

5. In the Stripe dashboard → **Developers → Webhooks**, add an endpoint pointing at the
   deployed `stripeWebhook` function URL (printed after deploy, looks like
   `https://<region>-<project-id>.cloudfunctions.net/stripeWebhook`). Subscribe it to
   `charge.refunded` and `payment_intent.payment_failed`.
6. Copy the webhook's **Signing secret** (`whsec_...`) and set it too:

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase deploy --only functions
```

**A note on India:** Stripe has not been onboarding all new India-registered
businesses in recent years — availability depends on your client's business type and
registration. If Stripe isn't available to them, the checkout code in
[app/checkout.tsx](app/checkout.tsx) and [functions/src/index.ts](functions/src/index.ts)
is isolated enough to swap for [Razorpay](https://razorpay.com) (the standard choice
for Indian merchants) without touching the rest of the app — ask me and I can do that
swap.

## 4. Running the app locally

```bash
npm install
npx expo start
```

**Important:** because this app uses Stripe's native SDK, it will **not** run inside
the plain Expo Go app. You need a "development build" (a custom Expo Go with your
native modules baked in):

```bash
npx expo run:android   # requires Android Studio
npx expo run:ios       # requires a Mac + Xcode
```

or, without installing Android Studio/Xcode locally, build a development client in the
cloud with EAS (see below) and install it on your phone.

## 5. Building for the App Store and Play Store (EAS Build)

1. Create a free [Expo account](https://expo.dev/signup) and install EAS CLI:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

2. Update the placeholders in [app.json](app.json):
   - `ios.bundleIdentifier` and `android.package` are set to `com.lippeenart.app` —
     change this to whatever reverse-domain identifier your client wants to own
     permanently (it can't be changed after the first store submission).
3. Build:

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

EAS will prompt to generate signing credentials for you (recommended) or let you
provide your own.

4. Submit to the stores once your client has the developer accounts set up:

```bash
eas submit --platform android
eas submit --platform ios
```

### Store accounts your client needs

- **Apple Developer Program** — $99/year, enroll at
  [developer.apple.com](https://developer.apple.com/programs/enroll/). Required for iOS.
- **Google Play Console** — $25 one-time, enroll at
  [play.google.com/console](https://play.google.com/console/). Required for Android.
- Both stores will require a **privacy policy URL** before approving an app with
  accounts and payments — this needs to be a real page describing what data the app
  collects (email, name, address, order history) and how it's used.
- Apple also asks for **App Privacy** "nutrition label" answers and may ask for a demo
  account during review — the admin account you created in step 2 works for that.

## 6. Branding

Replace these before submitting (currently the default Expo placeholder icons):

- `assets/icon.png` — app icon (1024x1024)
- `assets/splash-icon.png` — splash screen
- `assets/android-icon-foreground.png` / `-background.png` / `-monochrome.png` —
  Android adaptive icon layers
- `assets/favicon.png` — web favicon

Also replace the placeholder product photos (`https://placehold.co/...` URLs in
[scripts/seed.ts](scripts/seed.ts)) with real photos of your client's pieces — upload
them to Firebase Storage or any image host and update the `images` field on each
product (in the Firestore console, or by re-running an updated seed script).

## Project structure

```
app/                  Screens (Expo Router - file-based routing)
  (auth)/              Login, signup, forgot password
  (tabs)/              Shop, Custom order, Cart, Orders, Profile, Admin
  product/[id].tsx      Product detail
  order/[id].tsx         Order detail + live status tracking
  checkout.tsx            Stripe checkout
src/
  firebase/            Firestore/Auth/Storage/Functions helpers
  context/              Auth + Cart React context
  components/            Shared UI
  types/                  Shared TypeScript types
functions/             Cloud Functions (Stripe PaymentIntent + webhook)
scripts/seed.ts        Seeds sample products + grants admin role
firestore.rules / storage.rules   Security rules
```

## Currency

Defaults to INR. Change `EXPO_PUBLIC_CURRENCY` in `.env` and `SEED_CURRENCY` when
running the seed script if your client sells in a different currency.
