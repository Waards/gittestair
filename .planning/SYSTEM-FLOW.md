# Aircon One System Flow

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND (Next.js 16)                              │
│                                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │   Public Pages   │  │  Client Auth     │  │ Client Dashboard│  │  Admin Panel  │ │
│  │                  │  │                  │  │                 │  │               │ │
│  │ /               │  │ /login           │  │ /dashboard      │  │ /admin        │ │
│  │  - Landing/Hero  │  │ /forgot-password │  │  - My Services  │  │  - Leads      │ │
│  │  - Booking Form  │  │ /reset-password  │  │  - Job History  │  │  - Clients    │ │
│  │  - Services      │  │                  │  │  - My Profile   │  │  - Jobs x3    │ │
│  │  - Contact       │  │                  │  │  - My Units     │  │  - Units      │ │
│  │                  │  │                  │  │  - Notifications│  │  - Techs      │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬───────┘  │  - Settings   │ │
│           │                     │                      │          │  - Calendar   │ │
│           │                     │                      │          └───────┬───────┘ │
│           └─────────────────────┴──────────────────────┴──────────────────┘        │
│                                                                                    │
│  Components: booking-form.tsx, admin-sidebar.tsx, client-sidebar.tsx,              │
│              notification-toggle.tsx, ErrorReporter.tsx, + 53 shadcn/ui            │
│  Sections: navigation.tsx, hero.tsx, services.tsx, why-choose-us.tsx,              │
│            cta.tsx, footer.tsx                                                     │
└────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Next.js Server Actions)                        │
│                                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐      │
│  │  src/app/actions/                                                        │      │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐ │      │
│  │  │     leads.ts         │  │      admin.ts        │  │     user.ts       │ │      │
│  │  │  (824 lines)         │  │  (1700+ lines)       │  │  (811 lines)      │ │      │
│  │  │                     │  │                      │  │                   │ │      │
│  │  │ submitLead()        │  │ getClients()         │  │ signIn()          │ │      │
│  │  │ getLeads()          │  │ createClient()       │  │ getProfile()      │ │      │
│  │  │ acceptLead()        │  │ updateClient()       │  │ getNotifications()│ │      │
│  │  │ acceptLeadAsRepair()│  │ deleteClient()       │  │ updateProfile()   │ │      │
│  │  │ acceptLeadAsMainte- │  │ getUnits()           │  │ getUnits()        │ │      │
│  │  │   nance()           │  │ createUnit()         │  │ submitRequest()   │ │      │
│  │  │ rejectLead()        │  │ getInstallations()   │  │ rescheduleJob()   │ │      │
│  │  │ convertLeadToClient()│  │ createInstallation() │  │ saveFCMToken()    │ │      │
│  │  │ updateLeadStatus()  │  │ markInstallComplete()│  │ requestService()  │ │      │
│  │  │ deleteLead()        │  │ getRepairs() ...     │  │ addClientUnit()   │ │      │
│  │  │ getCorporateLeads() │  │ getTechnicians()     │  │                   │ │      │
│  │  └─────────────────────┘  │ updateSettings()     │  └───────────────────┘ │      │
│  │                           └─────────────────────┘                          │      │
│  └─────────────────────────────────────────────────────────────────────────┘      │
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐     │
│  │                          API Routes (/api/*)                              │     │
│  │                                                                           │     │
│  │  POST /api/send-email           POST /api/maintenance-notify              │     │
│  │  POST /api/push-notify          GET  /api/health                          │     │
│  │  POST /api/warranty-expiry      POST /api/test-* (4 test endpoints)      │     │
│  └──────────────────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────────┐
│     Supabase         │ │      Resend           │ │    Firebase FCM          │
│   (Database + Auth)   │ │    (Email)            │ │   (Push Notifications)   │
│                      │ │                       │ │                          │
│  15 tables           │ │  Booking Confirmation  │ │  Browser push via        │
│  Auth: Supabase Auth │ │  Service Complete      │ │  @firebase/messaging     │
│  + better-auth       │ │  Service Delayed       │ │  Tokens in               │
│  Service Role: ✓     │ │  Service Cancelled     │ │  user_fcm_tokens table   │
│  Row Level: admin    │ │  Warranty Expiry       │ │                          │
│                      │ │  Maintenance Reminder  │ │  Stripe (reserved)       │
└──────────────────────┘ └──────────────────────┘ └──────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION (Supabase Auth + Proxy)                │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
   │  Request     │          │  proxy.ts     │          │  Supabase    │
   │  to /admin   │────────► │  Middleware    │────────► │  Auth        │
   │  or /dashboard│         │  (matcher:    │          │  getUser()   │
   └─────────────┘          │   all routes) │          └──────┬───────┘
                            └──────┬────────┘                 │
                                   │                          │
                          ┌────────┴─────────┐                │
                          │  Has Session?    │◄───────────────┘
                          └──┬───────────┬───┘
                    No /      │           │  Yes
                    Redirect │           │
                    to /login│           │
                             ▼           ▼
                     ┌────────────┐ ┌──────────────────┐
                     │ /login     │ │ Check profile    │
                     │ (Unauthed)  │ │ role from DB     │
                     └────────────┘ └────────┬─────────┘
                                             │
                                    ┌────────┴────────┐
                                    │                  │
                              admin ▼                  ▼ client
                            ┌────────────┐   ┌──────────────┐
                            │ /admin     │   │ /dashboard   │
                            │ Panel      │   │ Dashboard    │
                            └────────────┘   └──────────────┘

   Note: proxy.ts uses @supabase/ssr createServerClient with cookie-based sessions.
   Service role bypasses RLS for all server-side data operations.
```

---

## Booking Flow (Public)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC BOOKING FLOW (Landing Page)                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌───────────────────┐    ┌───────────────────┐
  │ Customer  │    │  booking-form.tsx  │    │  leads.ts          │
  │ visits /  │───►│  (src/components/   │───►│  submitLead()      │
  │ Landing   │    │   booking-form.tsx) │    │                    │
  └──────────┘    └───────────────────┘    └──────────┬─────────┘
                                                       │
              ┌────────────────────────────────────────┼────────────┐
              │                                        │            │
              ▼                                        ▼            ▼
   ┌──────────────────┐                  ┌──────────────────────┐
   │ 1. Client fills:  │                  │ Validation & Security│
   │ - Full Name       │                  │                      │
   │ - Email           │                  │ sanitizedString()    │
   │ - Phone (PH #)    │                  │ sanitizedEmail()     │
   │ - Street/Barangay │                  │ sanitizedPhone()     │
   │   /City/Zip       │                  │ phoneSchema (09xx)   │
   │ - Client Type     │                  │ timeSlotSchema       │
   │   (Res/Corp)      │                  └──────────────────────┘
   │ - Service Type    │                              │
   │ - Date/Time Slot  │                              ▼
   │ - Aircon Specs    │                  ┌──────────────────────┐
   │   (brand, type,   │                  │ Availability Check   │
   │    HP, BTU)       │                  │ Max 4 bookings/date  │
   │ - Corporate fields│                  └──────────┬───────────┘
   │   (if Corp)       │                              │
   └──────────────────┘                              ▼
                                           ┌──────────────────────┐
                                           │ Insert into `leads`  │
                                           │ status: 'Pending'    │
                                           │ inspection_required  │
                                           │   = true if Corp     │
                                           └──────────┬───────────┘
                                                       │
                                           ┌───────────┴───────────┐
                                           │ Auto-create Profile   │
                                           │ (Supabase Auth +      │
                                           │  profiles table)      │
                                           │ + welcome notification │
                                           └───────────┬───────────┘
                                                       │
                                           ┌───────────┴───────────┐
                                           │ Send Email via        │
                                           │ /api/send-email       │
                                           │ (Resend)              │
                                           │ Booking Confirmation  │
                                           └───────────┬───────────┘
                                                       │
                                                       ▼
                                           ┌──────────────────────┐
                                           │ Success Toast:       │
                                           │ "Check email/spam"   │
                                           └──────────────────────┘
```

---

## Lead Management Flow (Admin)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LEAD MANAGEMENT FLOW (Admin Panel)                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌────────────┐    ┌──────────────────────┐
  │   Admin    │    │   Leads Dashboard    │
  │  Opens /  │───►│   (Admin Panel)      │
  │   admin   │    └──────────┬───────────┘
  └────────────┘               │
                               │ Load leads from getLeads()
                               │ Sorted: created_at DESC
                               ▼
                     ┌─────────────────────┐
                     │ List of Pending      │
                     │ Leads with actions:  │
                     │                      │
                     │ [Accept] [Accept as  │
                     │  Repair] [Accept as  │
                     │  Maintenance]        │
                     │ [Reject] [Convert]   │
                     │ [Delete]             │
                     └──┬──────┬──────┬────┘
                        │      │      │
         ┌──────────────┘      │      └──────────────┐
         ▼                     ▼                     ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │ Accept Lead  │    │ Reject Lead  │    │ Convert to   │
   │ (creates job) │    │ (updates     │    │ Client only   │
   │              │    │  status +     │    │ (creates auth │
   │ - Installation│   │  optional     │    │  user +       │
   │ - Repair     │    │  reason)      │    │  profile +    │
   │ - Maintenance│   └──────────────┘    │  auto job)    │
   └──────┬───────┘                      └──────┬───────┘
          │                                     │
          ▼                                     ▼
   ┌───────────────────┐              ┌───────────────────┐
   │ Job created in    │              │ Supabase Auth:    │
   │ installations /   │              │ admin.createUser() │
   │ repairs /         │              │ + profile insert   │
   │ maintenance table │              │ + auto job create  │
   │ lead status →     │              │ lead status→Convert │
   │ 'Accepted'        │              └───────────────────┘
   └───────────────────┘
          │
          ▼
   ┌───────────────────┐
   │ Notifications:    │
   │ - In-app notify   │
   │ - FCM push (if    │
   │   token exists)   │
   │ - Resend email    │
   │   (booking_conf)  │
   └───────────────────┘
```

---

## Service Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE COMPLETION FLOW (Admin)                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌────────────┐    ┌──────────────────────┐    ┌──────────────────┐
  │   Admin    │    │   Job Detail View    │    │  admin.ts         │
  │  Opens /  │───►│  Installations /     │───►│ markInstallComp-  │
  │   admin   │    │  Repairs / Maintenance│    │ lete() /          │
  └────────────┘    └──────────────────────┘    │ markRepairComplete│
                                                │ markMaintenance-  │
                                                │ Complete()        │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ Update status →   │
                                                │ 'Completed'       │
                                                │ progress → 100    │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ POST /api/send-  │
                                                │ email            │
                                                │ type: 'complete' │
                                                │                  │
                                                │ Subject: "Your   │
                                                │ [Service] is     │
                                                │ Complete!"       │
                                                └──────────────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ Resend sends to  │
                                                │ customer email   │
                                                │ (HTML template   │
                                                │  with service    │
                                                │  details)        │
                                                └──────────────────┘
```

---

## Push Notification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PUSH NOTIFICATION FLOW (Firebase FCM)                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐    ┌───────────────────┐    ┌───────────────────┐
  │   Client    │    │  usePushNotific-  │    │  /api/push-notify │
  │  Dashboard  │───►│  ations hook:     │    │  (called by       │
  │  /dashboard │    │  - Request perm   │    │   admin actions)  │
  └─────────────┘    │  - Get FCM token   │    └────────┬─────────┘
                     │  - Save to DB      │             │
                     │  - Listen for msgs │             │
                     └────────┬──────────┘             │
                              │                         │
                              ▼                         ▼
                     ┌───────────────────┐    ┌───────────────────┐
                     │ Firebase Messaging│    │  Firebase Admin   │
                     │ (Client SDK)      │    │  sendEachForMult- │
                     │                   │    │  icasToken()      │
                     │ OnMessage() →     │    │                   │
                     │ Show notification │    │  Requires:        │
                     └───────────────────┘    │  - userId lookup  │
                                              │  - token from DB  │
                                              └───────────────────┘

   Storage: user_fcm_tokens table
   - user_id, token, device_type, is_active, created_at
   - One user can have multiple tokens (multiple devices)
```

---

## Admin Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (src/app/admin/page.tsx)                      │
│                     ~5000+ lines, single file (monolithic)                   │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────┐
   │  Sidebar (admin-sidebar.tsx)                                     │
   │  ┌────────────────────────────────────────────────────────────┐ │
   │  │  📊 Dashboard (summary stats)                               │ │
   │  │  📋 Leads (Pending / All leads list)                        │ │
   │  │  👥 Clients (Manage, search, create, archive)               │ │
   │  │  🔧 Installations (View, create, complete, edit)            │ │
   │  │  🛠️ Repairs (View, create, complete, edit)                  │ │
   │  │  🔄 Maintenance (View, create, complete, edit)              │ │
   │  │  📅 Calendar (Appointments view)                            │ │
   │  │  🧊 Client Units (Asset registry per client)                │ │
   │  │  👨‍🔧 Technicians (Manage workforce)                         │ │
   │  │  🔔 Notifications (View system notifications)               │ │
   │  │  ⚙️ Settings (Company info, toggles, security)               │ │
   │  └────────────────────────────────────────────────────────────┘ │
   └──────────────────────────────────────────────────────────────────┘

   Key features in admin panel:
   - Lead acceptance creates jobs (Installation/Repair/Maintenance)
   - Lead conversion auto-creates auth user + profile + job
   - Job management: create, edit, mark complete (with email + push notify)
   - Client management: CRUD, archive, search by name/email/phone
   - Unit management: register units with warranty tracking, multi-unit support
   - Technician management: CRUD, assign to jobs
   - Settings: company info, notification toggles, reminder config, security
   - Calendar: timeline view of appointments
   - Stats dashboard: counts of leads, clients, jobs, technicians
```

---

## Client Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  CLIENT DASHBOARD (src/app/dashboard/page.tsx)               │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────┐
   │  Sidebar (client-sidebar.tsx)                                    │
   │  ┌────────────────────────────────────────────────────────────┐ │
   │  │  📊 My Services (active jobs with status/progress)          │ │
   │  │  📋 Job History (completed jobs)                            │ │
   │  │  🧊 My Units (registered aircon units, warranty)            │ │
   │  │  📝 Request Service (submit new service request)            │ │
   │  │  👤 My Profile (update name, address, phone)                │ │
   │  │  🔔 Notifications (in-app notification list)                │ │
   │  │  ⚙️ Settings (notification toggle, push enable/disable)      │ │
   │  └────────────────────────────────────────────────────────────┘ │
   └──────────────────────────────────────────────────────────────────┘

   Key client actions:
   - View active job status/progress
   - Request reschedule for jobs
   - Register new aircon unit (brand, type, serials, warranty)
   - Submit service request (filtered through admin approval)
   - Enable/disable push notifications (saves FCM token to DB)
   - View warranty status for each unit
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE TABLES (15 total)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  profiles          │  id (PK), email, full_name, role (admin|client),        │
│                    │  client_type (Res|Corp), phone, address, street,        │
│  9 cols            │  barangay, city, zip_code, is_archived, password,       │
│                    │  created_at                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  leads             │  id (PK), full_name, email, phone_number,               │
│                    │  service_address, client_type, service_type,            │
│  28 cols           │  preferred_date, preferred_time, additional_info,       │
│                    │  status (Pending|Contacted|Converted|Accepted|Rejected), │
│                    │  aircon_brand, aircon_type, horsepower, btu,            │
│                    │  street, barangay, city, zip_code, unit_brand_type,     │
│                    │  company_name, contact_person, building_name, floor,    │
│                    │  province, designation, number_of_units,                │
│                    │  special_instructions, inspection_required, created_at  │
├──────────────────────────────────────────────────────────────────────────────┤
│  appointments     │  id (PK), client_name, email, phone, address,           │
│                    │  service_type, date, time, status, notes,              │
│  10 cols           │  priority, is_corporate, created_at, reschedule_count  │
├──────────────────────────────────────────────────────────────────────────────┤
│  installations    │  id (PK), title, client_name, location, technician,     │
│                    │  date, time, status (Scheduled|In Progress|Completed),  │
│  13 cols           │  progress (0-100), cost, notes, type, priority,        │
│                    │  is_corporate, created_at                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  repairs           │  id (PK), title, client_name, location, technician,    │
│                    │  date, time, status, progress, cost, notes, type,      │
│  13 cols           │  priority, is_corporate, created_at                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  maintenance       │  id (PK), title, client_name, location, technician,    │
│                    │  date, time, cost, notes, type, status, progress,      │
│  14 cols           │  is_multi_unit, client_id, priority, is_corporate,     │
│                    │  created_at, updated_at                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  client_units      │  id (PK), client_id (FK→profiles), unit_name, brand,  │
│                    │  unit_type, technology, horsepower, indoor_serial,     │
│  17 cols           │  outdoor_serial, installation_date, is_multi_unit,     │
│                    │  warranty_months, warranty_start_date, warranty_end_date│
│                    │  warranty_provider, warranty_type, created_at          │
├──────────────────────────────────────────────────────────────────────────────┤
│  unit_components   │  id (PK), client_unit_id (FK→client_units),            │
│                    │  component_type (Indoor|Outdoor|Condenser|Air Handler), │
│  5 cols            │  serial_number, position_index, created_at             │
├──────────────────────────────────────────────────────────────────────────────┤
│  repair_jobs       │  id (PK), unit_id (FK→client_units), client_id,        │
│                    │  error_code, symptom, parts_replaced (JSON[]),         │
│  12 cols           │  before_photo_url, after_photo_url, status             │
│                    │  (Open|In Progress|Completed), affected_unit_type,     │
│                    │  warranty_claim, warranty_ref_number, covered_by,      │
│                    │  created_at                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│  client_requests   │  id (PK), client_id (FK→profiles), client_name,        │
│                    │  request_type, message, status (Pending|Approved|      │
│  8 cols            │  Rejected), preferred_date, preferred_time,            │
│                    │  service_address, phone_number, created_at             │
├──────────────────────────────────────────────────────────────────────────────┤
│  maintenance_items │  id (PK), maintenance_id (FK→maintenance),             │
│                    │  unit_id (FK→client_units), service_type, status,      │
│  8 cols            │  next_cleaning_date, notes, completed_at, created_at   │
├──────────────────────────────────────────────────────────────────────────────┤
│  technicians       │  id (PK), full_name, email, phone, specialization,     │
│  8 cols            │  status (Active|Inactive), hire_date, notes,           │
│                    │  created_at, updated_at                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  notifications     │  id (PK), user_id (nullable FK→profiles), title,       │
│                    │  message, type, is_read, link, created_at              │
│  7 cols            │                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  user_fcm_tokens   │  id (PK), user_id (FK→profiles), token, device_type,   │
│  5 cols            │  is_active, created_at                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  settings          │  id ('main'), company_name, company_email,             │
│                    │  company_phone, timezone, company_address,             │
│  20 cols           │  email_notifications + 4 more toggle fields,           │
│                    │  reminder_enabled, reminder_hours_before,              │
│                    │  maintenance_reminder_enabled, maintenance_reminder_   │
│                    │  months, follow_up_enabled, follow_up_days_after,      │
│                    │  two_factor_enabled, session_timeout_minutes,          │
│                    │  require_password_change_days                          │
└──────────────────────────────────────────────────────────────────────────────┘

   Key Relationships:
   - profiles.id ← client_units.client_id (FK)
   - client_units.id ← unit_components.client_unit_id (FK)
   - client_units.id ← repair_jobs.unit_id (FK)
   - profiles.id ← client_requests.client_id (FK)
   - profiles.id ← notifications.user_id (FK)
   - profiles.id ← user_fcm_tokens.user_id (FK)
   - maintenance.id ← maintenance_items.maintenance_id (FK)
   - client_units.id ← maintenance_items.unit_id (FK)
```

---

## API Endpoints

| Method | Endpoint | Purpose | Called By |
|--------|----------|---------|-----------|
| POST | `/api/send-email` | Send transactional emails via Resend | Server actions, cron |
| POST | `/api/push-notify` | Send FCM push to specific user | Admin actions |
| POST | `/api/warranty-expiry` | Check all units for expiring warranties | External cron |
| POST | `/api/maintenance-notify` | Check maintenance due dates + send reminders | External cron |
| GET | `/api/health` | Health check | Monitoring |
| POST | `/api/test-email` | Test email sending | Dev/testing |
| POST | `/api/test-notification` | Test push notifications | Dev/testing |
| POST | `/api/test-client` | Test client creation | Dev/testing |
| POST | `/api/test-client-email` | Test client email delivery | Dev/testing |

---

## Service Status Flow

```
                    ┌─────────────────────┐
                    │      PENDING        │
                    │  (lead submitted)   │
                    └──────────┬──────────┘
                               │ Admin accepts
                               ▼
                    ┌─────────────────────┐
                    │     SCHEDULED       │
                    │  (job created)      │
                    │  progress: 0        │
                    └──────────┬──────────┘
                               │ Admin marks in progress
                               ▼
                    ┌─────────────────────┐
                    │    IN PROGRESS      │
                    │  (technician on     │
                    │   site)             │
                    │  progress: 1-99     │
                    └──────────┬──────────┘
                               │ Admin clicks "Mark Complete"
                               ▼
                    ┌─────────────────────┐
                    │     COMPLETED       │──────► Email Sent (Resend)
                    │  progress: 100      │        Push Notification
                    └─────────────────────┘        In-app Notification

   Lead Statuses: Pending → Contacted → Accepted/Converted/Rejected
   Job Statuses:  Scheduled → In Progress → Completed
```

---

## Security Layer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY IMPLEMENTATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────┐
   │  Input Sanitization         │
   │  (src/lib/security.ts)     │
   │                             │
   │  sanitizedString()          │  ← strips <>, trims, max 10k chars
   │  sanitizedEmail()           │  ← lowercase, trim, max 255 chars
   │  sanitizedPhone()           │  ← strips non-digits, max 11 chars
   │  sanitizedName()            │  ← strips <>, trims, max 100 chars
   │  sanitizedDate()            │  ← regex YYYY-MM-DD only
   │  sanitizedTime()            │  ← regex time + AM/PM format
   └─────────────────────────────┘

   ┌─────────────────────────────┐
   │  Zod Validation Schemas     │
   │                             │
   │  phoneSchema: /^09\d{9}$/  │  ← PH mobile format
   │  emailSchema: valid email   │
   │  nameSchema: 1-100 chars    │
   │  dateSchema: YYYY-MM-DD     │
   │  timeSlotSchema: 6 slots   │
   │  uuidSchema: valid UUID     │
   └─────────────────────────────┘

   ┌─────────────────────────────┐
   │  Server-Side Protection     │
   │                             │
   │  - All mutations via        │
   │    Server Actions ('use     │
   │    server')                 │
   │  - Service role client      │
   │    bypasses RLS             │
   │  - SSR client respects      │
   │    user session             │
   │  - CSRF protection          │
   │    (src/lib/csrf.ts)        │
   │  - Rate limiting            │
   │    (src/lib/rate-limit.ts)  │
   └─────────────────────────────┘
```

---

## Warning & Maintenance Automated Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATED CRON-JOB FLOWS (External Trigger)               │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────────┐
   │  POST /api/warranty-expiry                                          │
   │                                                                      │
   │  1. Query all client_units where warranty_end_date is not null      │
   │  2. For each unit within 30 days of expiry:                         │
   │     a. Get client profile (email, full_name)                        │
   │     b. Send email via Resend (warranty_expiry template)             │
   │     c. Create in-app notification for client                        │
   │     d. Send FCM push if token exists                                │
   └──────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────────┐
   │  POST /api/maintenance-notify                                       │
   │                                                                      │
   │  1. Query maintenance_items where next_cleaning_date is due soon    │
   │  2. For each item:                                                  │
   │     a. Get client profile                                           │
   │     b. Send reminder email                                          │
   │     c. Create in-app notification                                   │
   └──────────────────────────────────────────────────────────────────────┘

   Note: These endpoints are designed to be called by an external cron
   service (e.g., cron-job.org, Vercel Cron, GitHub Actions).
```

---

## Email Templates (Resend)

| Event | Subject | Status |
|-------|---------|--------|
| **Booking Confirmation** | "Booking Confirmed: [Service] on [Date]" | ✅ Active |
| **Service Completed** | "✅ Your [Service] is Complete!" | ✅ Active |
| **Service Delayed** | "📅 Your [Service] Has Been Rescheduled" | ✅ Active |
| **Service Cancelled** | "❌ Your [Service] Has Been Cancelled" | ✅ Active |
| **Warranty Expiring** | "[Brand] Warranty Expiring Soon" | ✅ Active |
| **Maintenance Due** | "Time for Your AC Maintenance" | ✅ Active |
| **Client Message** | "💬 New Message from [Client]" | ✅ Active |
| **Generic Reminder** | "[Custom Title]" | ✅ Active |

All emails use branded HTML template with:
- Company header (gradient #005596 → #0062a3)
- Responsive 600px table layout
- Status-specific colors (success/warning/error)
- Service detail table
- Footer with company info

---

## Corporate Client Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CORPORATE CLIENT HANDLING                             │
└─────────────────────────────────────────────────────────────────────────────┘

   Corporate fields are embedded in the `leads` table (not a separate table):
   - company_name, contact_person, building_name, floor, province
   - designation, number_of_units, special_instructions
   - inspection_required = true (auto-set)

   Key differences from Residential:
   - Additional corporate form fields shown on booking form
   - inspection_required flag on the lead
   - Special handling in admin panel
   - Separate corporate leads view (getCorporateLeads())
   - Job priority system (Normal/High/Urgent)
```

---

## Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Anon key for client-side queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Admin key for server-side (bypasses RLS) |
| `RESEND_API_KEY` | Resend | Transactional email API key |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase | VAPID for push subscriptions |
| `STRIPE_SECRET_KEY` | Stripe | Payment processing (reserved) |
| `DATABASE_URL` | Supabase | Direct PostgreSQL connection string |

---

## Project File Map

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page (hero, services, CTA)
│   ├── globals.css                # Tailwind v4 global styles
│   ├── global-error.tsx           # Error boundary
│   ├── login/page.tsx             # Auth page
│   ├── forgot-password/page.tsx   # Password reset request
│   ├── reset-password/page.tsx    # Password reset form
│   ├── dashboard/page.tsx         # Client dashboard
│   ├── admin/page.tsx             # Admin panel (~5000 lines)
│   ├── actions/
│   │   ├── leads.ts               # Lead submission & management (824 lines)
│   │   ├── admin.ts               # Admin CRUD operations (1700+ lines)
│   │   └── user.ts                # Client dashboard actions (811 lines)
│   └── api/
│       ├── send-email/route.ts    # Email sending endpoint
│       ├── push-notify/route.ts   # FCM push endpoint
│       ├── warranty-expiry/route.ts # Warranty check endpoint
│       ├── maintenance-notify/route.ts # Maintenance reminder endpoint
│       ├── health/route.ts        # Health check
│       └── test-*                 # 4 test endpoints
├── components/
│   ├── ui/                        # 53 shadcn/ui components
│   ├── sections/                  # Landing page sections
│   │   ├── navigation.tsx
│   │   ├── hero.tsx
│   │   ├── services.tsx
│   │   ├── why-choose-us.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   ├── booking-form.tsx           # Public booking form
│   ├── admin-sidebar.tsx          # Admin navigation
│   ├── client-sidebar.tsx         # Client navigation
│   ├── notification-toggle.tsx    # Push notification settings UI
│   └── ErrorReporter.tsx          # Error reporting component
├── hooks/
│   ├── use-mobile.ts              # Mobile detection hook
│   └── usePushNotifications.ts    # FCM push notification hook
├── lib/
│   ├── supabase.ts                # Client-side Supabase singleton
│   ├── supabase-server.ts         # SSR + Admin Supabase clients
│   ├── email-service.ts           # Resend email templates
│   ├── firebase.ts                # Firebase config
│   ├── fcm-service.ts            # FCM send function
│   ├── security.ts                # Zod schemas + sanitization
│   ├── csrf.ts                   # CSRF protection
│   ├── rate-limit.ts             # Rate limiting
│   ├── errors.ts                 # Error utilities
│   ├── utils.ts                  # cn(), validatePHPhone(), etc.
│   └── progress.ts               # Progress calculation helpers
├── types/
│   └── database.ts               # TypeScript interfaces (19+ types)
├── proxy.ts                       # Auth middleware (Supabase SSR)
└── visual-edits/                  # Visual editing tools
```

---

## Dependencies Summary

| Category | Key Packages |
|----------|-------------|
| **Framework** | next@16.2.1, react@19.2.0 |
| **Styling** | tailwindcss@4, tailwindcss-animate, tw-animate-css |
| **UI** | @radix-ui/* (18+), @headlessui/react |
| **Forms** | react-hook-form, zod@4, @hookform/resolvers |
| **Database** | @supabase/supabase-js, @supabase/ssr, drizzle-orm |
| **Auth** | @supabase/ssr, better-auth, bcrypt |
| **Email** | resend |
| **Push** | firebase (client + admin) |
| **Payments** | stripe (reserved) |
| **Charts** | recharts |
| **PDF** | jspdf + jspdf-autotable |
| **3D** | three, @react-three/fiber, @react-three/drei |
| **Animation** | framer-motion, @tsparticles/react |
| **Icons** | lucide-react, @heroicons/react, @tabler/icons-react |

---

## Deployment

| Component | Platform | Tier | Notes |
|-----------|----------|------|-------|
| Web App | Vercel | Free/Hobby | Next.js SSR + API routes |
| Database | Supabase | Free | PostgreSQL with auth |
| Email | Resend | Free (3k/mo) | Transactional emails |
| Push | Firebase FCM | Free | Browser push notifications |
| Payments | Stripe | Reserved | Not yet active |
| Domain | Pending | - | azalea.aircon.services.com |

---

## Key Technical Notes

1. **Single Admin File**: `/admin/page.tsx` is ~5000+ lines — major refactor target
2. **No Tests**: Zero test files in the entire codebase
3. **Plaintext Passwords**: Auto-generated passwords stored in `profiles.password` column
4. **Dual Supabase Clients**: SSR client (session-aware) + Admin client (service role, bypasses RLS)
5. **`.env` Committed**: Contains service role key — security risk
6. **Node 24.x**: Very new runtime requirement
7. **Availability Check**: Max 4 bookings per day enforced in `submitLead()`
8. **Philippines-Specific**: PH phone format (09xx), address with barangay
9. **All Mutations via Server Actions**: No traditional REST API for data operations
10. **Database-Driven Config**: Company info, notification settings all stored in `settings` table
