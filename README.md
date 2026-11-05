# Transmaa Logistics Booking Platform (React + Firebase)

Transmaa uses two Firebase Authentication methods that work with the Firebase Spark (free) plan:
1. **Google Login** — secure Google OAuth popup sign-in.
2. **Email + Password** — account creation, sign-in, and password reset email.

Phone OTP/SMS login has been removed from the website. It is not needed for the two login methods above.

## Security & Admin Authorization Architecture
- Unauthenticated users cannot access `/dashboard`, bookings, customer/driver data, or `/admin`.
- Normal registration strictly validates roles to `customer` or `driver` only (enforced in `database.rules.json`).
- Public registration never grants admin access.
- To authorize an admin, add `/admins/<YOUR_ADMIN_UID>: true` in Firebase Realtime Database using an authorized console account, or assign a Firebase Custom Claim `{ admin: true }` with Firebase Admin SDK.
- Publish the contents of `database.rules.json` in Realtime Database → Rules.

## Quick Start
```bash
npm install
npm run dev
```

## Required Firebase Console setup
1. Open Firebase Console → Authentication → Sign-in method.
2. Enable **Email/Password**.
3. Enable **Google** and configure the support email if Firebase asks.
4. Authentication → Settings → Authorized domains: ensure `localhost` and your deployed website domain are listed.
5. Realtime Database → Rules: publish the contents of `database.rules.json`.

No phone SMS billing or Blaze upgrade is required for Google and Email/Password sign-in.

## Account behavior
- Email + password creates a Transmaa account in Firebase Authentication and a matching profile in Realtime Database. The password is a Transmaa password; the user's actual Gmail password is never requested or stored.
- Google sign-in uses Google's secure OAuth popup and creates a Transmaa profile on first successful sign-in.
- A person using Google and Email/Password with the same email may still have separate Firebase UIDs unless the providers are explicitly linked. Do not assume automatic account merging.
- Admin access is never granted from the public registration form.

## Multi-page workspace update

This version includes public pages (`/`, `/about`, `/services`, `/contact`), account pages (`/login`, `/profile`), customer pages (`/dashboard`, `/customer/new-booking`, `/customer/bookings`, `/customer/track`), driver onboarding and operations (`/driver/register`, `/driver/loads`, `/driver/deliveries`), and `/admin`.

Customer and driver access are designed around the same Firebase Authentication UID. A new signup starts as a customer. The user submits driver details from Driver registration; an administrator reviews the application and sets `users/{uid}/driverStatus` to `approved`. The user can then switch to Driver mode without creating a second login. The selected workspace mode is stored locally per UID; it is not a security credential.

### Important deployment/security work still required

- Publish and test Firebase Realtime Database Security Rules before using real customer data. The starter rules in this repository are not production-safe for the complete multi-role workflow; in particular, broad booking reads and client-side status writes need a server-authoritative design.
- Driver acceptance currently checks the booking before updating it from the client. For a production dispatch system, move assignment into a trusted Cloud Function / server transaction so two drivers cannot win a race.
- Admin access must be provisioned manually at `admins/{uid}: true` in a protected environment or through Firebase Admin SDK custom claims. Never expose admin creation in public signup.
- This frontend does not yet upload licence/vehicle documents or delivery proof. Add Firebase Storage and server-side validation before collecting those documents.
- Configure Firebase Authentication authorized domains and verify Google + Email/Password providers in Firebase Console.

Run `npm install` and `npm run build` on your machine, then deploy the `dist` directory with Vercel. The build could not be verified in this environment because the uploaded archive's `node_modules` did not contain a runnable Vite installation and dependency installation timed out.
