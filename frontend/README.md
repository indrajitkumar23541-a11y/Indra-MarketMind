# Indra-MarketMind • Next.js 16 Production Frontend

Unified Dark Sci-Fi Web Terminal & Algorithmic Trading Suite built on Next.js 16 (Turbopack), Tailwind CSS v4, Framer Motion, and Clerk Authentication.

---

## ⚡ Core Frontend Subsystems

1. **🔐 ChatGPT-Style 3-Way Authentication**:
   - 1-Click Google Login (`<GoogleOneTap />` & OAuth).
   - Phone Number Login with SMS OTP (country codes `+91`, `+1`, `+44`, `+971`, etc.).
   - Passwordless Email OTP Verification.
   - Persistent device sessions across desktop and mobile.

2. **🔔 Real-Time Live News & Volatility Alert Push Engine**:
   - Sub-second background wire polling (`/api/data/news/live-feed`).
   - Floating audio-visual toast notifications with chime (`LiveNotificationToast.tsx`).
   - HTML5 native browser push notification support.
   - Mobile-responsive popover interface.

3. **🛡️ Enterprise CyberShield Security**:
   - Strict HTTP security headers: CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
   - Edge sliding-window rate limiting in `middleware.ts` (100 req/min general, 25 req/min AI Copilot).
   - Input sanitization, ticker regex validation, and 100KB POST body payload guard.
   - Masked server technology fingerprints (`poweredByHeader: false`).

4. **👥 Admin Registration Alert Engine**:
   - Automatically detects new trader registrations.
   - Dispatches instant notifications to `indrajitkumar23541@gmail.com` and admin's Telegram phone bot.
   - Manages a persistent server ledger (`registered_users.json`) with an Admin API (`/api/admin/users`).

5. **⚙️ Terminal Settings & Multilingual i18n**:
   - Full interface localization in English, Hindi, and Hinglish.
   - Multi-currency switcher (`INR`, `USD`, `EUR`, `GBP`, `AED`).
   - AI Copilot diagnostic tuner with interactive real-time preview simulation.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Compile production bundle
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the terminal.

