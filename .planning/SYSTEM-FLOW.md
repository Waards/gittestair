# Aircon One System Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Vercel)                               │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Public    │    │  Dashboard  │    │   Client    │    │   Admin     │  │
│  │   Website   │    │   (Login)   │    │  Dashboard  │    │   Panel     │  │
│  │             │    │             │    │             │    │             │  │
│  │  - Landing  │    │             │    │  - Services │    │  - Manage   │  │
│  │  - Booking  │    │             │    │  - History  │    │  - Complete │  │
│  │  - Contact  │    │             │    │  - Profile  │    │  - Notify   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
└─────────┼──────────────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │                  │
          └──────────────────┴──────────────────┴──────────────────┘
                                   │
                                   ▼
┌──────────────────────���──────────────────────────────────────────────────────┐
│                           BACKEND (Next.js API)                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        SERVER ACTIONS                                │    │
│  │                                                                      │    │
│  │  leads.ts          admin.ts            user.ts                      │    │
│  │  - submitLead      - markComplete      - getProfile                 │    │
│  │  - getLeads        - createClient      - getNotifications          │    │
│  │  - convertLead     - manageJobs        - updateProfile              │    │
│  │                                                                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │    │
│  │  │ /api/send-  │  │ /api/push-  │  │ /api/warranty│                │    │
│  │  │   email     │  │   notify    │  │   -expiry   │                 │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │    │
│  └─────────┼────────────────┼─────────────────┼─────────────────────────┘    │
└────────────┼────────────────┼─────────────────┼────────────────────────────────┘
             │                │                 │
             ▼                ▼                 ▼
┌───────────────────────────────���─────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Supabase   │    │   Resend    │    │  Firebase   │    │   Stripe    │    │
│  │ (Database)  │    │  (Email)    │    │  (Push)     │    │ (Payments)  │    │
│  │             │    │             │    │             │    │             │    │
│  │  - Leads    │    │  - Service  │    │  - Browser  │    │  - Checkout │    │
│  │  - Clients  │    │    Complete │    │    Push     │    │  - Invoices │    │
│  │  - Jobs     │    │  - Booking  │    │             │    │             │    │
│  │  - Units    │    │    Confirm  │    │             │    │             │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                                              │
│  Domain: azelea.aircon.services.com (pending verification)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Booking Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BOOKING FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │ Customer│
    │  Visits │
    │ Website │
    └────┬────┘
         │
         ▼
    ┌─────────────────┐
    │ Fills Booking   │
    │ Form (Landing)  │
    │                 │
    │ - Name          │
    │ - Email         │
    │ - Phone         │
    │ - Address       │
    │ - Service Type  │
    │ - Preferred Date│
    └────┬───────────┘
         │
         ▼
    ┌─────────────────┐
    │ submitLead()    │
    │ (leads.ts)      │
    └────┬───────────┘
         │
         ├──► ┌──────────────┐
         │    │ Insert to    │
         │    │ leads table  │
         │    └──────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Send Email via  │──────► Resend ─────► Customer Email
    │ send-email API  │       (booking       (Confirmation)
    └─────────────────┘        confirmation)
         │
         ▼
    ┌─────────────────┐
    │ Show Success    │──────► Toast: "Check email (or spam)"
    │ Toast Message   │
    └─────────────────┘
```

---

## Service Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE COMPLETION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌─────────────���────┐
│      Admin       │     │    Backend       │     │     Customer     │
│   (Admin Panel)  │     │   (Server Act)   │     │    (Dashboard)   │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │ Click "Complete"       │                        │
         ▼                        │                        │
┌──────────────────┐              │                        │
│ markRepairComplete│◄────────────┤                        │
│ markInstallation │              │                        │
│ markMaintenance  │              │                        │
└────────┬─────────┘              │                        │
         │                        │                        │
         │ Update Status          │                        │
         ▼                        │                        │
┌──────────────────┐              │                        │
│ status =         │              │                        │
│ 'Completed'      │              │                        │
└────────┬─────────┘              │                        │
         │                        │                        │
         │                        ▼                        │
         │              ┌──────────────────┐               │
         │              │ sendCompletion   │               │
         │              │ Email()          │               │
         │              └────────┬─────────┘               │
         │                       │                        │
         │                       ▼                        │
         │              ┌──────────────────┐              │
         └──────────────►│   Resend API     │◄────────────┘
                         │                  │
                         │ - Service Type   │
                         │ - Date/Time     │
                         │ - Notes         │
                         │ - Customer Email│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Customer's Email │
                         │                  │
                         │ Subject: "Your   │
                         │ [Service] is     │
                         │ Complete!"       │
                         └──────────────────┘
```

---

## Push Notification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PUSH NOTIFICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   Client    │
    │  Dashboard  │
    │  (Settings) │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────┐
    │ Click "Enable"  │
    │ Notifications   │
    └──────┬──────────┘
           │
           ▼
    ┌─────────────────┐
    │ Browser Asks:   │
    │ "Allow          │
    │  Notifications?"│
    └──────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
  ┌─▼──────────┐  ┌─▼──────────┐
  │  Allow     │  │   Block    │
  └─────┬──────┘  ��───────────┘
        │
        ▼
  ┌─────────────────┐
  │ Get FCM Token   │
  │ (Firebase)      │
  └──────┬──────────┘
         │
         ▼
  ┌─────────────────┐
  │ Save Token to   │──────► Supabase
  │ user_fcm_tokens  │         (user_fcm_tokens table)
  └─────────────────┘

    ┌─────────────┐
    │    Admin    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────┐
    │ POST /api/push- │──────► Firebase ─────► Browser Push
    │   notify        │        FCM             Notification
    │                  │         │
    │ { userId,       │         │
    │   title,        │         │
    │   body }        │         │
    └─────────────────┘         ▼
                         ┌─────────────────┐
                         │ Show Browser    │
                         │ Notification    │
                         └─────────────────┘
```

---

## Database Schema (Key Tables)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE TABLES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   profiles  │   │    leads    │   │    jobs     │   │  client_    │
│             │   │             │   │(installations│  │   units     │
├────────��────┤   ├─────────────┤   │ /repairs /  │   ├─────────────┤
│ id          │   │ id          │   │ maintenance)│   │ id          │
│ email       │◄──│ email       │   │             │   │ client_id   │◄─┐
│ full_name   │   │ full_name   │   │ id          │   │ unit_name   │  │
│ role        │   │ phone       │   │ client_name │   │ brand       │  │
│ client_type │   │ status      │◄──│ status      │   │ warranty_   │  │
└─────────────┘   │ service_type│   │ date/time   │   │   end_date  │  │
                  │ preferred_  │   │ progress    │   └─────────────┘  │
                  │   date/time │   │ notes       │                    │
                  └─────────────┘   └─────────────┘                    │
                                                                        │
┌─────────────┐   ┌─────────────┐   ┌─────────────┐                    │
│notifications│   │user_fcm_    │   │ maintenance_│                    │
│             │   │  tokens     │   │    items    │                    │
├─────────────┤   ├─────────────┤   ├─────────────┤                    │
│ id          │   │ id          │   │ id          │                    │
│ user_id     │   │ user_id     │   │ unit_id     │◄───────────────────┘
│ title       │   │ token       │   │ next_       │    (Foreign Key)
│ message     │   │ is_active   │   │   cleaning_ │
│ is_read     │   └─────────────┘   │   date       │
│ type        │                     └─────────────┘
└─────────────┘
```

---

## Email Templates

| Event | Subject | Status |
|-------|---------|--------|
| **Booking Confirmation** | "Booking Confirmed: [Service] on [Date]" | ✅ Active |
| **Service Completed** | "Your [Service] Service is Complete!" | ✅ Active |
| **Service Delayed** | "Your [Service] Service Has Been Rescheduled" | ⚠️ Needs UI |
| **Service Cancelled** | "Your [Service] Service Has Been Cancelled" | ⚠️ Needs UI |

---

## Environment Variables

| Variable | Value | Used For |
|----------|-------|----------|
| `RESEND_API_KEY` | re_YydR4LJe_... | Email sending |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | BCv_5mwQFwdPkB... | Push notifications |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Database connection |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Client-side DB access |
| `STRIPE_SECRET_KEY` | Stripe API key | Payments |

---

## Service Status Flow

```
                    ┌─────────────────────┐
                    │       PENDING       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    SCHEDULED        │
                    │  (or In Progress)   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      COMPLETED       │──────► Email Sent
                    │      (progress:100)  │       Push Notification
                    └─────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/actions/leads.ts` | Booking submission, lead management |
| `src/app/actions/admin.ts` | Service completion, client management |
| `src/app/actions/user.ts` | Client dashboard data |
| `src/lib/email-service.ts` | Email templates (Resend) |
| `src/hooks/usePushNotifications.ts` | Push notification hook |
| `src/components/notification-toggle.tsx` | Client notification settings UI |
| `src/app/api/send-email/route.ts` | Email API endpoint |
| `src/app/api/push-notify/route.ts` | Push notification API endpoint |

---

## Deployment

| Component | Platform | Cost |
|-----------|----------|------|
| App | Vercel | Free |
| Database | Supabase | Free |
| Email | Resend | Free (3k/mo) |
| Push | Firebase FCM | Free |