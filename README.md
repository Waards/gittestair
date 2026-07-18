# Azalea Aircon Services - Aircon One Website

A full-stack Next.js application for aircon service booking and management.

## Changelog — July 17, 2026

### Email system: Resend → Brevo → EmailJS
- Switched from `resend` to `nodemailer` (Brevo SMTP), then to `@emailjs/nodejs`
- EmailJS sends through your connected Gmail — proper DKIM/SPF, no domain needed
- Free tier: 200 emails/month
- New env vars:
  - `EMAILJS_SERVICE_ID` — from EmailJS dashboard
  - `EMAILJS_TEMPLATE_ID` — from EmailJS dashboard
  - `EMAILJS_PUBLIC_KEY` — from EmailJS dashboard
  - `EMAILJS_PRIVATE_KEY` — from EmailJS dashboard
- Removed `src/app/api/send-email/route.ts` and `src/app/api/test-email/route.ts`

### Removed fetch-to-self email pattern
All server actions (`user.ts`, `leads.ts`, `admin.ts`) now import and call email functions directly instead of doing `fetch('/api/send-email')`. This eliminates the `NEXT_PUBLIC_SITE_URL` dependency — emails work on localhost and production without environment-specific config.

### Added booking confirmation email to dashboard
When a logged-in client requests a service from the dashboard (`requestService`), they now receive a booking confirmation email (same as the public booking form).

### Deleted dead code
- Removed unused `getCorporateLeads()` function from `src/app/actions/leads.ts`
- Corporate leads are still visible via the "Corporate" filter dropdown in the admin Leads view

### To revert
```bash
git log --oneline -5          # find the commits before changes
git checkout <commit-hash>    # restore to that state
```

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Env Variables

Copy `.env` to `.env.local` and fill in real values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `EMAILJS_SERVICE_ID` | EmailJS service ID (free at emailjs.com) |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `EMAILJS_PUBLIC_KEY` | EmailJS public API key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private API key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` locally, your Vercel URL in production |

### Getting EmailJS credentials (free)
1. Sign up at https://www.emailjs.com (free tier: 200 emails/month)
2. **Add Email Service** → Select Gmail → authorize with your Google account → note the **Service ID** (e.g. `service_xxx`)
3. **Create Email Template**:
   - Template name: "Generic HTML Email"
   - Subject: `{{subject}}`
   - Body (check "Render as HTML"):
     ```
     {{{html_content}}}
     ```
   - Save → note the **Template ID** (e.g. `template_xxx`)
4. **Account → API Keys** → copy your **Public Key** and **Private Key**

> The template uses `{{{html_content}}}` (triple braces) to render raw HTML without escaping. All email designs are generated server-side by `email-service.ts`.

## Password Reset

The forgot password flow uses **Supabase Auth's built-in email** (free). To make it work:

1. Go to **Supabase Dashboard → Authentication → Settings**
2. Under **URL Configuration**, add your site URLs:
   - Site URL: `https://your-domain.vercel.app` (production) or `http://localhost:3001` (local)
   - Redirect URLs: add `https://your-domain.vercel.app/reset-password` and `http://localhost:3001/reset-password`
3. Ensure **Enable email confirmations** is on

Supabase sends password resets via its built-in email service (no custom SMTP needed).

## Deploy to Vercel

Add these env vars in **Vercel → Project Settings → Environment Variables**:
- All Supabase keys
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`
- `NEXT_PUBLIC_SITE_URL` = your Vercel domain (e.g. `https://azelea.vercel.app`)
