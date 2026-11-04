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
