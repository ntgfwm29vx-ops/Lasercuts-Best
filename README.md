# Laser Cuts Website

Marketing site and quote intake flow for Laser Cuts, built with TanStack Start and Convex.

## Stack

- TanStack Start + React 19
- Convex for quote storage and background email delivery
- Resend for quote notification emails
- Tailwind CSS 4 for styling

## Local Setup

1. Install dependencies:
   `npm install`
2. Copy env values from [.env.example](/Users/treytorres/Downloads/gaser/.env.example) into your local env files as needed.
3. Start Convex local development:
   `npx convex dev`
4. Start the app:
   `npm run dev`

## Required Environment Variables

- `VITE_SITE_URL`
  Use your production site URL for canonical and social metadata.
- `VITE_CONVEX_URL`
  Convex client URL used by the frontend.
- `RESEND_API_KEY`
  Secret key used by Convex email delivery actions.
- `RESEND_FROM_EMAIL`
  Verified sender address in Resend. Do not keep the onboarding sender for production.
- `RESEND_TEXT_TO`
  Optional SMS alert destination using your carrier email-to-text gateway. For AT&T, use `2604426772@txt.att.net`.
- `TELEGRAM_BOT_TOKEN`
  Optional Telegram bot token used to send instant quote alerts to your Telegram account or group.
- `TELEGRAM_CHAT_ID`
  Telegram chat ID that should receive quote alerts from the bot.

## Quote Flow

- The landing page submits quote requests to Convex.
- Convex stores the request, rate-limits repeat submissions by fingerprint, and tracks email delivery state.
- Email delivery retries up to 3 times before leaving the quote marked as `failed`.

## Commands

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`

## Deployment Checklist

- Set `VITE_SITE_URL` to the real production domain.
- Configure `RESEND_API_KEY` in Convex and your deployment environment.
- Configure `RESEND_FROM_EMAIL` with a verified custom domain in Resend.
- Configure `RESEND_TEXT_TO` if you want a text alert for every new quote.
- Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` if you want Telegram alerts for every new quote.
- Confirm `robots.txt`, `sitemap.xml`, canonical tags, and social preview metadata point at the final domain.
- Run `npm run lint`
- Run `npm run test`
- Run `npm run build`

## CI

GitHub Actions runs lint, tests, and build on pushes to `main` and on pull requests via [.github/workflows/ci.yml](/Users/treytorres/Downloads/gaser/.github/workflows/ci.yml).
