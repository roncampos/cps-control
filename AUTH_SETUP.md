# Authentication Setup Guide

Authentication has been added to CPS Control using Clerk.

## Quick Setup (5 minutes)

### 1. Create a Clerk Account
1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application
4. Choose "Email & Password" as the authentication method

### 2. Get Your API Keys
1. In Clerk dashboard, go to "API Keys"
2. Copy both keys:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

### 3. Update Environment Variables

**Local development (.env.local):**
Replace these values in `/Users/nuq/.openclaw/workspace/cps-control/.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

**Vercel deployment:**
1. Go to https://vercel.com/ranulfo-campos-projects/cps-control/settings/environment-variables
2. Add these environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = your publishable key
   - `CLERK_SECRET_KEY` = your secret key
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/`

### 4. Redeploy
After adding the env vars to Vercel, redeploy:
```bash
cd /Users/nuq/.openclaw/workspace/cps-control
npx vercel --prod
```

## How It Works

- **Protected routes:** All pages except `/sign-in` and `/sign-up` require authentication
- **First user:** The first person to sign up becomes an admin
- **Adding users:** Sign up additional users through Clerk dashboard or invite them

## Security Features Now Active

✅ Email/password authentication
✅ Session management
✅ Secure API routes
✅ Protected dashboard pages
✅ User management via Clerk dashboard

## Next Steps (Optional)

- Enable 2FA in Clerk dashboard
- Add Google/GitHub OAuth
- Set up user roles and permissions
- Customize the sign-in page theme
