# Azalea Aircon Services

Aircon service booking and management platform built with Next.js 16.

## What We Built — July 18, 2026

Overhauled the email notification system and added several features:

### Email System (Resend → Brevo → EmailJS)
- Started with **Resend** (domain verification required — blocked by DKIM)
- Switched to **Brevo SMTP** (free tier — blocked by Gmail/Yahoo sender requirements for free domains)
- Settled on **EmailJS** (free tier: 200 emails/month) — sends through your connected Gmail with full DKIM/SPF, no domain needed
- Removed `src/app/api/send-email/route.ts` and `src/app/api/test-email/route.ts`
- Removed `resend`, `nodemailer`, `@types/nodemailer` packages
- Installed `@emailjs/nodejs`

### Email Template Setup (EmailJS)
- Created a single "Generic HTML Email" template with professional branding:
  - **Blue gradient header**: Azalea Aircon Services
  - **White content card**: renders dynamic HTML from server
  - **Footer**: automated message + contact info
- Template body: full HTML structure with `{{{html_content}}}` placeholder
- All email types (booking confirmation, welcome, service updates, reminders, admin notifications) use the same template — the server generates the specific content

### Fetch-to-Self Email Pattern Removed
Previously, server actions called `fetch('/api/send-email')` which depended on `NEXT_PUBLIC_SITE_URL`. This broke on localhost or production if the env var was wrong. Now all actions import and call email functions directly:
- `src/app/actions/leads.ts` — `submitLead`, `acceptLead`, `acceptLeadAsRepair`, `acceptLeadAsMaintenance`, `convertLeadToClient`
- `src/app/actions/admin.ts` — `sendCompleteEmail`, `sendDelayEmail`, `sendCancelEmail`, `addClient`, `sendReminder`, `convertLead`, warranty expiry, maintenance reminders
- `src/app/actions/user.ts` — `requestService`, `rescheduleService`, `sendMessageToAdmin`

### Booking Confirmation Email for Dashboard
When a logged-in client requests a service from the dashboard (`requestService`), they now receive a booking confirmation email (previously only the public booking form sent one).

### Admin Email Notifications
When a client requests a service via the dashboard, the admin (`azaleaairconsystem@gmail.com`) also gets notified with full details (client name, email, phone, service type, date, time).

### Removed Dead Code
- Removed unused `getCorporateLeads()` function from `src/app/actions/leads.ts`
- Corporate leads remain visible via the "Corporate" filter dropdown in the admin Leads view
- Removed `src/app/api/send-email/route.ts` and `src/app/api/test-email/route.ts`

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Env Variables

All env vars are in `.env` (committed) and override in `.env.local` (gitignored).

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | Supabase database URL |
| `EMAILJS_SERVICE_ID` | EmailJS service ID (free at emailjs.com) |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `EMAILJS_PUBLIC_KEY` | EmailJS public API key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private API key |
| `ADMIN_EMAIL` | Email address for admin notifications |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` locally, production URL live |

### Getting EmailJS Credentials (Free)
1. Sign up at [emailjs.com](https://www.emailjs.com) (free tier: 200 emails/month)
2. **Email Services** → Add New Service → Gmail → authorize with Google → copy **Service ID**
3. **Email Templates** → Create New Template:
   - Subject: `{{subject}}`
   - Toggle **"Render as HTML"** ON
   - Body: paste the professional HTML template (blue header, white card, footer) with `{{{html_content}}}` in the content area
   - Save → copy **Template ID**
4. **Account → API Keys** → copy **Public Key** and **Private Key**

## Email Types (All Server-Generated)

| Type | Trigger | Sent To |
|------|---------|---------|
| Booking confirmation | Booking form or dashboard "Request Service" | Client |
| Welcome + password | New account created via booking form or admin | Client |
| Service complete | Admin marks job done | Client |
| Service rescheduled | Admin or client reschedules | Client |
| Service cancelled | Admin cancels job | Client |
| Client message | Client sends message from dashboard | Admin |
| Reminder | Admin sends custom reminder | Client |
| Warranty expiry | Auto-cron when warranty expires in 7 days | Client |
| Maintenance reminder | Auto-cron when maintenance is due | Client |
| New service request | Client requests service from dashboard | Admin |

## Password Reset

Uses **Supabase Auth's built-in email** (free). Configure in Supabase Dashboard:
1. **Authentication → Settings → URL Configuration**
2. Site URL: `https://azelea.vercel.app`
3. Redirect URLs: add `https://azelea.vercel.app/reset-password`
4. Ensure "Enable email confirmations" is ON

## Deploy to Vercel

Project auto-deploys from `main` branch via GitHub integration.

Required env vars in **Vercel → Settings → Environment Variables**:
- All Supabase keys
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_SITE_URL` = https://azelea.vercel.app

### Live Site
https://azelea.vercel.app

## Reverting

```bash
git log --oneline -10
git checkout <commit-hash>
```
