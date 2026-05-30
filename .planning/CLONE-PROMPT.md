# Clone Prompt — Aircon One (Azalea Aircon Services) — Vanilla PHP

Below is a comprehensive prompt you can give to any AI coding assistant to recreate this entire HVAC service management web app using **vanilla PHP** (no frameworks). Paste the entire block below.

---

```
You are building a full-stack HVAC service management platform called "Azalea Aircon Services" (brand name "Aircon One") using vanilla PHP. Customers book aircon services online; administrators manage the entire operation.

## TECH STACK

- Backend: **Vanilla PHP 8.x** (no frameworks — plain PHP with modular includes)
- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- CSS Framework: Tailwind CSS (via CDN or build step)
- Icons: Font Awesome or Lucide (via CDN)
- Database: PostgreSQL (direct PDO connection)
- Auth: PHP sessions + password_hash/password_verify
- Email: cURL to Resend REST API
- Push Notifications: Firebase Cloud Messaging (PHP server via cURL + browser JS client)
- Charts: Chart.js (CDN)
- PDF: jsPDF (client-side) or TCPDF (server-side)
- No JavaScript frameworks — all JS is vanilla

## PROJECT STRUCTURE

```
/
├── index.php                    # Landing page
├── .htaccess                    # Apache URL rewriting
├── config/
│   ├── database.php             # PDO connection
│   ├── app.php                  # App config constants
│   └── functions.php            # Global helper functions
├── public/
│   ├── css/
│   │   └── style.css            # Custom styles (Tailwind + overrides)
│   ├── js/
│   │   ├── app.js               # Main app JS
│   │   ├── booking-form.js      # Booking form handling
│   │   ├── push-notifications.js # FCM client
│   │   ├── admin.js             # Admin panel JS
│   │   └── dashboard.js         # Client dashboard JS
│   └── assets/                  # Images, fonts, etc.
├── auth/
│   ├── login.php                # Login page
│   ├── login-process.php        # POST handler
│   ├── logout.php               # Logout
│   ├── forgot-password.php      # Password reset request
│   ├── forgot-password-process.php
│   ├── reset-password.php       # Password reset form
│   └── reset-password-process.php
├── admin/
│   ├── index.php                # Admin dashboard (main panel)
│   ├── sidebar.php              # Admin sidebar component
│   ├── header.php               # Admin header
│   ├── footer.php               # Admin footer
│   ├── leads.php                # Lead management
│   ├── leads-actions.php        # Lead accept/reject/convert handlers
│   ├── clients.php              # Client management
│   ├── clients-actions.php      # Client CRUD handlers
│   ├── installations.php        # Installation jobs
│   ├── repairs.php              # Repair jobs
│   ├── maintenance.php          # Maintenance jobs
│   ├── jobs-actions.php         # Job create/edit/complete handlers
│   ├── units.php                # Client units asset registry
│   ├── units-actions.php        # Unit CRUD handlers
│   ├── technicians.php          # Technician management
│   ├── technicians-actions.php  # Technician CRUD handlers
│   ├── calendar.php             # Appointment calendar
│   ├── notifications.php        # System notifications
│   └── settings.php             # Company/settings management
├── dashboard/
│   ├── index.php                # Client dashboard
│   ├── header.php               # Client header
│   ├── sidebar.php              # Client sidebar
│   ├── services.php             # My services / active jobs
│   ├── history.php              # Job history
│   ├── units.php                # My aircon units
│   ├── request-service.php      # Submit service request
│   ├── profile.php              # Update profile
│   ├── notifications.php        # In-app notifications
│   └── settings.php             # Notification toggle settings
├── api/
│   ├── send-email.php           # POST - Resend email endpoint
│   ├── push-notify.php          # POST - FCM push notification
│   ├── warranty-expiry.php      # POST - Check warranty expiry
│   ├── maintenance-notify.php   # POST - Check maintenance reminders
│   ├── health.php               # GET - Health check
│   └── booking.php              # POST - Lead submission (AJAX)
├── includes/
│   ├── auth-check.php           # Session auth verification
│   ├── admin-auth.php           # Admin role check
│   ├── client-auth.php          # Client role check
│   ├── db.php                   # Database connection singleton
│   ├── security.php             # Input sanitization functions
│   ├── validation.php           # Validation functions
│   ├── email-service.php        # Resend API wrapper
│   ├── fcm-service.php          # Firebase FCM sender
│   ├── notification-service.php # In-app notification helper
│   └── csrf.php                 # CSRF token generation/validation
├── templates/
│   ├── landing/
│   │   ├── navigation.php
│   │   ├── hero.php
│   │   ├── services.php
│   │   ├── why-choose-us.php
│   │   ├── cta.php
│   │   ├── footer.php
│   │   └── booking-form.php
│   ├── email/
│   │   ├── base-template.php    # HTML email wrapper
│   │   ├── booking-confirmation.php
│   │   ├── service-complete.php
│   │   ├── service-delayed.php
│   │   ├── service-cancelled.php
│   │   ├── warranty-expiry.php
│   │   ├── maintenance-reminder.php
│   │   └── client-message.php
│   └── components/
│       ├── toast.php
│       ├── modal.php
│       ├── table.php
│       ├── pagination.php
│       ├── status-badge.php
│       └── progress-bar.php
└──── migrations/
    └── 001_initial_schema.sql
```

## DATABASE SCHEMA (PostgreSQL via PDO)

Create these tables using the migration file:

### profiles
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- email VARCHAR(255) UNIQUE NOT NULL
- full_name VARCHAR(100)
- role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin','client'))
- client_type VARCHAR(20) DEFAULT 'Residential' CHECK (client_type IN ('Residential','Corporate'))
- phone VARCHAR(11)
- address TEXT
- street VARCHAR(255), barangay VARCHAR(255), city VARCHAR(255), zip_code VARCHAR(20)
- is_archived BOOLEAN DEFAULT false
- password_hash VARCHAR(255) NOT NULL  -- PHP password_hash()
- created_at TIMESTAMP DEFAULT NOW()

### leads
- id UUID PK, full_name, email, phone_number, service_address TEXT
- client_type, service_type, preferred_date DATE, preferred_time VARCHAR(50), additional_info TEXT
- status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Contacted','Converted','Accepted','Rejected'))
- aircon_brand, aircon_type, horsepower, btu VARCHAR(100), unit_brand_type
- street, barangay, city, zip_code
- company_name, contact_person, building_name, floor, province, designation, special_instructions TEXT
- number_of_units INT, inspection_required BOOLEAN DEFAULT false
- created_at TIMESTAMP DEFAULT NOW()

### appointments
- id UUID PK, client_name VARCHAR(255), email, phone, address TEXT
- service_type VARCHAR(100), date DATE, time VARCHAR(50)
- status VARCHAR(20) DEFAULT 'pending'
- notes TEXT, priority VARCHAR(20), is_corporate BOOLEAN DEFAULT false
- reschedule_count INT DEFAULT 0, created_at TIMESTAMP

### installations / repairs / maintenance
Three tables, same structure:
- id UUID PK, title, client_name, location TEXT, technician VARCHAR(100)
- date DATE, time VARCHAR(50)
- status VARCHAR(20) CHECK (status IN ('Scheduled','In Progress','Completed'))
- progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
- cost VARCHAR(50), notes TEXT, type VARCHAR(50), priority VARCHAR(20)
- is_corporate BOOLEAN DEFAULT false, created_at TIMESTAMP
- Maintenance only: is_multi_unit BOOLEAN DEFAULT false, client_id UUID REFERENCES profiles, updated_at TIMESTAMP

### client_units
- id UUID PK, client_id UUID REFERENCES profiles(id) ON DELETE CASCADE
- unit_name VARCHAR(255), brand VARCHAR(100), unit_type VARCHAR(100)
- technology VARCHAR(100), horsepower DECIMAL, indoor_serial, outdoor_serial
- installation_date DATE, is_multi_unit BOOLEAN DEFAULT false
- warranty_months INT, warranty_start_date DATE, warranty_end_date DATE
- warranty_provider VARCHAR(255), warranty_type VARCHAR(100)
- created_at TIMESTAMP

### unit_components
- id UUID PK, client_unit_id UUID REFERENCES client_units(id) ON DELETE CASCADE
- component_type VARCHAR(50) CHECK (component_type IN ('Indoor','Outdoor','Condenser','Air Handler'))
- serial_number VARCHAR(255), position_index INT DEFAULT 0
- created_at TIMESTAMP

### repair_jobs
- id UUID PK, unit_id UUID REFERENCES client_units(id), client_id UUID REFERENCES profiles(id)
- error_code VARCHAR(100), symptom TEXT, parts_replaced JSONB DEFAULT '[]'
- before_photo_url TEXT, after_photo_url TEXT
- status VARCHAR(20) CHECK (status IN ('Open','In Progress','Completed'))
- affected_unit_type VARCHAR(20), warranty_claim BOOLEAN DEFAULT false
- warranty_ref_number VARCHAR(100), covered_by VARCHAR(255)
- created_at TIMESTAMP

### client_requests
- id UUID PK, client_id UUID REFERENCES profiles(id)
- client_name VARCHAR(255), request_type VARCHAR(100), message TEXT
- status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected'))
- preferred_date DATE, preferred_time VARCHAR(50), service_address TEXT, phone_number VARCHAR(11)
- created_at TIMESTAMP

### maintenance_items
- id UUID PK, maintenance_id UUID REFERENCES maintenance(id) ON DELETE CASCADE
- unit_id UUID REFERENCES client_units(id) ON DELETE CASCADE
- service_type VARCHAR(100), status VARCHAR(50), next_cleaning_date DATE
- notes TEXT, completed_at TIMESTAMP, created_at TIMESTAMP

### technicians
- id UUID PK, full_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(11)
- specialization VARCHAR(255)
- status VARCHAR(20) CHECK (status IN ('Active','Inactive'))
- hire_date DATE, notes TEXT, created_at TIMESTAMP, updated_at TIMESTAMP

### notifications
- id UUID PK, user_id UUID REFERENCES profiles(id) ON DELETE CASCADE (nullable)
- title VARCHAR(255), message TEXT, type VARCHAR(50)
- is_read BOOLEAN DEFAULT false, link VARCHAR(500), created_at TIMESTAMP

### user_fcm_tokens
- id UUID PK, user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
- token TEXT NOT NULL, device_type VARCHAR(50)
- is_active BOOLEAN DEFAULT true, created_at TIMESTAMP

### settings
- id VARCHAR(50) PRIMARY KEY DEFAULT 'main'
- company_name, company_email, company_phone, timezone, company_address
- email_notifications BOOLEAN DEFAULT true, sms_notifications BOOLEAN DEFAULT false
- push_notifications BOOLEAN DEFAULT true, new_booking_alert BOOLEAN DEFAULT true
- booking_update_alert BOOLEAN DEFAULT true, payment_alert BOOLEAN DEFAULT false
- reminder_enabled BOOLEAN DEFAULT true, reminder_hours_before INT DEFAULT 24
- follow_up_enabled BOOLEAN DEFAULT true, follow_up_days_after INT DEFAULT 7
- maintenance_reminder_enabled BOOLEAN DEFAULT true, maintenance_reminder_months INT DEFAULT 6
- two_factor_enabled BOOLEAN DEFAULT false, session_timeout_minutes INT DEFAULT 60
- require_password_change_days INT DEFAULT 90

### Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_client_units_client ON client_units(client_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_maintenance_date ON maintenance(date);
CREATE INDEX idx_fcm_user ON user_fcm_tokens(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

## FEATURES TO IMPLEMENT

### 1. Architecture & Routing
- Use mod_rewrite (.htaccess) for clean URLs: /login, /admin, /dashboard, /admin/leads, etc.
- All PHP files include config/database.php and config/functions.php
- Simple routing: each .php file handles its own route
- POST handlers in separate -actions.php or -process.php files
- AJAX endpoints in /api/ return JSON

### 2. Authentication
- PHP sessions with session_start()
- Login: validate email + password_verify() against profiles.password_hash
- Session stores: user_id, role, full_name
- includes/auth-check.php: verify session exists, redirect to /auth/login.php if not
- includes/admin-auth.php: verify role='admin', redirect if not
- includes/client-auth.php: verify role='client', redirect if not
- Logout: session_destroy()
- Forgot/reset password flow with token stored in DB (password_reset_tokens table)
- Auto-create profiles on lead submission (insert into profiles with password_hash)

### 3. Public Landing Page (index.php)
```
Sections (include from /templates/landing/):
- navigation.php: logo, nav links, CTA button
- hero.php: headline, subtext, CTA to booking form
- services.php: service cards (Installation, Repair, Maintenance)
- why-choose-us.php: benefits grid
- booking-form.php: (see below)
- cta.php: final CTA section
- footer.php: company info, links
```

**Booking Form** (booking-form.php):
- Full name, email, Philippine phone (09xxxxxxxxx), street/barangay/city/zip
- Client type: Residential / Corporate (radio)
- Service type: dropdown (Installation, Repair, Maintenance, Freon Refill, etc.)
- Preferred date + time slot (6 slots: 8-10am, 10-12pm, 1-3pm, 3-5pm, 5-7pm, 7-8pm)
- Aircon specs: brand, type (Split/Window/Inverter/Cassette), horsepower, BTU
- Corporate fields (show/hide via JS): company name, contact person, building name, floor, province, designation, number of units, special instructions
- Additional info textarea

Validation & submission (AJAX to /api/booking.php):
1. Sanitize all inputs
2. Validate PH phone (regex /^09\d{9}$/)
3. Validate date format (Y-m-d)
4. Validate time slot
5. Check availability: SELECT COUNT from leads + appointments where date = preferred_date, reject if >= 4
6. INSERT into leads table with all fields
7. Auto-create profile: INSERT into profiles with password_hash of random 8-char password
8. INSERT notification row (type='request')
9. cURL POST to Resend API for booking confirmation email
10. Return JSON { success: true } or { error: "message" }

### 4. Admin Panel (admin/index.php)
Include admin/header.php, admin/sidebar.php, admin/footer.php.
Tab-based SPA-like navigation (PHP includes, each tab loads a separate file).

**Sidebar tabs** (admin/sidebar.php):
- 📊 Dashboard (stats: total leads, clients, active jobs, technicians)
- 📋 Leads (pending list + accept/reject/convert/delete actions)
- 👥 Clients (CRUD table + create/edit modal + archive toggle)
- 🔧 Installations (job list + create/edit/complete/progress)
- 🛠️ Repairs (same as above)
- 🔄 Maintenance (same as above)
- 📅 Calendar (timeline of appointments by date)
- 🧊 Client Units (per-client registry with warranty tracking)
- 👨‍🔧 Technicians (CRUD table)
- 🔔 Notifications (list all system notifications)
- ⚙️ Settings (company info, toggles, reminder config)

**Key Admin Actions** (handled in admin/leads-actions.php, jobs-actions.php, etc.):
- Accept lead → INSERT into installations/repairs/maintenance, UPDATE lead status='Accepted', send email + push + in-app notification
- Convert lead → INSERT into auth (password_hash), INSERT into profiles, INSERT into auto-job based on service_type, UPDATE lead status='Converted'
- Reject lead → UPDATE status='Rejected' with optional reason note
- Mark job complete → UPDATE status='Completed', progress=100, POST to Resend API service-complete email
- CRUD on clients, jobs, units, technicians — all via POST + redirect

### 5. Client Dashboard (dashboard/index.php)
Include dashboard/header.php, dashboard/sidebar.php.

**Sidebar tabs**:
- 📊 My Services (active jobs with status badges and progress bars)
- 📋 Job History (completed jobs list)
- 🧊 My Units (registered aircon units with warranty status)
- 📝 Request Service (form → INSERT into client_requests, admin approves)
- 👤 My Profile (edit name, address, phone)
- 🔔 Notifications (fetch from notifications table where user_id = session user)
- ⚙️ Settings (notification toggle + push notification enable)

**Client Actions**:
- View active job status/progress
- Request reschedule (insert into client_requests)
- Register new unit (INSERT into client_units)
- Submit service request
- Enable push notifications (save FCM token via AJAX)
- Update profile

### 6. Security
- Password hashing: PHP password_hash(PASSWORD_BCRYPT)
- Input sanitization functions in includes/security.php:
  - sanitizeString($str): strip_tags, trim, max 10k chars
  - sanitizeEmail($email): strtolower, trim, max 255, filter_var FILTER_SANITIZE_EMAIL
  - sanitizePhone($phone): preg_replace non-digits, max 11
  - sanitizeDate($date): check Y-m-d format
  - sanitizeTime($time): check valid time slot
- CSRF: generate token in session, validate on all POST requests (includes/csrf.php)
- Rate limiting: session-based, track request counts, block after threshold
- All DB queries use PDO prepared statements (no string interpolation)

### 7. Email Service (Resend API via cURL)
File: includes/email-service.php
Function sendEmail($to, $subject, $htmlContent) that:
- Uses curl to POST to https://api.resend.com/emails
- Auth header: Bearer RESEND_API_KEY
- From: Aircon One <noreply@airconone.com>
- Returns success/failure

**Email templates** (in templates/email/):
- base-template.php: wraps content in branded HTML (gradient header #005596→#0062a3, 600px table layout, footer)
- booking-confirmation.php: service type, date, time
- service-complete.php: green success layout
- service-delayed.php: yellow warning layout
- service-cancelled.php: red error layout
- warranty-expiry.php: orange alert
- maintenance-reminder.php: reminder message
- client-message.php: message from client

### 8. Push Notifications (Firebase FCM)
**Client-side** (public/js/push-notifications.js):
- Import Firebase app + messaging from CDN (firebase-compat)
- Request Notification.permission
- Get FCM token via getToken()
- Send token to /api/push-notify.php?action=save-token (POST)

**Server-side** (includes/fcm-service.php):
- function sendPushNotification($token, $title, $body, $data = [])
- Uses curl to POST to https://fcm.googleapis.com/fcm/send
- Auth header: key=FIREBASE_SERVER_KEY
- Returns success/failure

**Trigger points**: lead accepted, job completed, warranty expiry, maintenance reminder

### 9. Automated Flows (API endpoints for cron)
- POST /api/warranty-expiry.php: query client_units where warranty_end_date BETWEEN NOW() AND NOW()+30d, send email + notification per client
- POST /api/maintenance-notify.php: query maintenance_items where next_cleaning_date <= NOW()+7d, send reminders
- GET /api/health.php: return JSON { status: "ok", timestamp: ... }

### 10. Calendar View (admin/calendar.php)
- Show appointments table grouped by date
- Filter by month
- Color-coded by status (pending=gray, Scheduled=blue, Completed=green, Cancelled=red)

### 11. Error Handling
- All DB operations wrapped in try-catch
- Errors logged to PHP error_log
- User-facing errors returned as JSON for AJAX, $_SESSION['error'] for form posts
- Global error handler set via set_error_handler() and set_exception_handler()

## ENVIRONMENT / CONFIG

config/database.php:
```php
<?php
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_PORT = getenv('DB_PORT') ?: '5432';
$DB_NAME = getenv('DB_NAME') ?: 'aircon_one';
$DB_USER = getenv('DB_USER') ?: 'postgres';
$DB_PASS = getenv('DB_PASS');
$DSN = "pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;";
$pdo = new PDO($DSN, $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);
```

config/app.php:
```php
<?php
define('APP_NAME', 'Azalea Aircon Services');
define('SITE_URL', getenv('SITE_URL') ?: 'http://localhost:8080');
define('RESEND_API_KEY', getenv('RESEND_API_KEY'));
define('FIREBASE_SERVER_KEY', getenv('FIREBASE_SERVER_KEY'));
define('FIREBASE_VAPID_KEY', getenv('FIREBASE_VAPID_KEY'));
```

## IMPLEMENTATION NOTES

1. All POST handlers redirect back to the referring page after completion (PRG pattern)
2. AJAX endpoints return JSON with Content-Type: application/json
3. Sessions store: user_id, role, full_name, csrf_token
4. Every DB query uses PDO prepared statements with named parameters
5. All output is UTF-8 with proper Content-Type headers
6. Use htmlspecialchars($var, ENT_QUOTES, 'UTF-8') for all user output
7. Password reset uses a password_reset_tokens table (token_hash, user_id, expires_at)
8. The booking form shows corporate fields via JavaScript toggle when "Corporate" is selected
9. Progress bars and status badges are rendered with inline PHP conditionals
10. Include guards prevent direct access to includes (define('IN_APP', true))

## DEPLOYMENT

- Web Server: Apache 2.4+ with mod_rewrite enabled
- PHP 8.1+ with pgsql, curl, json, session extensions
- Database: PostgreSQL 14+ (or Supabase PostgreSQL)
- Email: Resend account
- Push: Firebase project with Cloud Messaging enabled
- Cron: Set up cron jobs to hit /api/warranty-expiry.php and /api/maintenance-notify.php daily

## UI / FRONTEND DESIGN SYSTEM

### Font
- **Primary font**: Inter (Google Fonts, weights 400, 500, 600, 700)
- Apply `font-family: 'Inter', sans-serif` to body
- Use `-webkit-font-smoothing: antialiased` for crisp rendering

### Color Palette
Use these exact colors consistently throughout the app:

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#0062a3` | Buttons, links, icons, sidebar gradient start, focus rings |
| Primary Dark | `#005596` | Login buttons, dashboard headings, sidebar gradient start |
| Primary Darker | `#00447a` | Button hover states |
| Primary Darkest | `#003d70` | Sidebar gradient end |
| Background | `#ffffff` | Page background |
| Foreground | `#020617` | Headings, primary text (near-black) |
| Muted | `#f8fafc` | Subtle section backgrounds |
| Muted Foreground | `#64748b` | Body text, descriptions, labels |
| Secondary | `#f1f5f9` | Secondary button backgrounds, info boxes |
| Accent/Border | `#e2e8f0` | Card borders, input borders, dividers |
| Destructive | `#ef4444` | Error states, delete buttons |

**Status colors** (use as badge backgrounds):
| Status | Color |
|--------|-------|
| Pending | `#eab308` (yellow-500) |
| Scheduled | `#3b82f6` (blue-500) |
| In Progress | `#f97316` (orange-500) |
| Completed | `#22c55e` (green-500) |
| Cancelled/Rejected | `#6b7280` (gray-500) |
| Contacted | `#8b5cf6` (purple-500) |
| Converted | `#06b6d4` (cyan-500) |

### Border Radius
- Cards: `border-radius: 0.75rem` (12px)
- Buttons: `border-radius: 0.5rem` (8px)
- Badges/pills: `border-radius: 9999px` (full rounded)
- Inputs: `border-radius: 0.5rem` (8px)

### Shadows
- Cards: `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` (shadow-sm)
- Hovered cards: `box-shadow: 0 4px 12px rgba(0,0,0,0.15)` (shadow-md)
- Dialogs/modals: `box-shadow: 0 20px 60px rgba(0,0,0,0.3)` (shadow-xl)

### Reusable Component Patterns

**Card**: `bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6`
**Button Primary**: `bg-[#0062a3] hover:bg-[#005596] text-white font-medium py-2 px-4 rounded-lg transition-colors`
**Button Outline**: `border border-[#e2e8f0] bg-white text-[#020617] hover:bg-[#f1f5f9] font-medium py-2 px-4 rounded-lg transition-colors`
**Input**: `w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0062a3] focus:border-transparent`
**Badge**: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider`
**Section heading**: `text-4xl font-bold text-[#020617] tracking-tight`
**Section subtext**: `text-lg text-[#64748b] max-w-2xl`

---

## LANDING PAGE (index.php)

### Navigation Bar (templates/landing/navigation.php)
- **Fixed top**, full width, z-index 50
- White background with `backdrop-blur-md` when scrolled
- Transparent border at top of page
- **Layout**: max-width 1280px centered, flex justify-between items-center, padding 1rem 1.5rem
- **Left**: Logo image (40x40 rounded) + "Azelea" text (font-bold text-xl)
- **Center**: Nav links — Home, Services, About Us, Contact (text-sm font-medium, hover color `#0062a3`)
- **Right**: Phone icon + number, "Book Service" button (`bg-[#0062a3] text-white rounded-lg`), Login/Admin buttons (outline style)
- **Mobile**: Hamburger icon, slide-down menu with opacity + translate animation (300ms)

### Hero Section (templates/landing/hero.php)
- **Background**: Radial gradient `rgba(0,98,163,0.05)` top-right, linear gradient white to `#f8fafc`
- **Padding**: `padding: 5rem 1.5rem` (py-20 lg:py-32)
- **Heading**: "Professional HVAC Solutions for Your **Comfort**" — text-size `3.75rem` on desktop, `2.25rem` on mobile, font-bold, line-height 1.2
  - "Comfort" word highlighted in `color: #0062a3`
- **Subtext**: `text-xl text-[#64748b]`, max-width 56rem
- **CTA**: "Book a Service" button with ArrowRight icon that slides right on hover (`translate-x-1` transition 200ms)

### Services Grid (templates/landing/services.php)
- **Background**: `#f8fafc` subtle background
- **Heading**: "Our Services" (text-4xl font-bold) + subtext
- **Grid**: 3 columns desktop, 2 tablet, 1 mobile, gap 1.5rem
- **6 Service Cards**:
  1. Installation — Snowflake icon
  2. Repair — Wrench icon
  3. Maintenance — Shield icon
  4. Corporate — Users icon
  5. 24/7 Support — Clock icon
  6. Warranty — Award icon
- Each card: `bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6`
- **Hover effect**: `translate-y: -4px`, `shadow-md`, border becomes transparent (200ms transition)
- Icon: `w-12 h-12 text-[#0062a3]`, stroke-width 1.5
- Bottom: "View All Services" button (`bg-[#0062a3] text-white`)

### Why Choose Us (templates/landing/why-choose-us.php)
- **Two-column layout** on desktop, single on mobile
- **Left column**: "Why Choose Azelea?" heading + 5 value propositions
  - Each: blue CircleCheckBig icon + title + description text
- **Right column**: Mission/Vision card with gradient background `rgba(0,98,163,0.05 to 0.02)`, rounded-2xl, border

### CTA Section (templates/landing/cta.php)
- **Full-width band**: `bg-[#0062a3]` (primary blue), white text
- Heading: "Ready to Get Started?"
- Two buttons:
  - "Book Service Now" — `bg-[#f1f5f9] text-[#0062a3]` (light bg, dark text)
  - "Contact Us" — white outline with Phone icon

### Footer (templates/landing/footer.php)
- `bg-white border-t border-[#e2e8f0]`
- **4-column grid**:
  1. Brand info (logo + company name + description)
  2. Services list (6 items)
  3. Contact details (Phone, Email, Address, Hours icons)
  4. Business Hours
- Bottom bar: copyright text

### Booking Form (templates/landing/booking-form.php + public/js/booking-form.js)
This is a **3-step multi-step dialog** (modal popup):

**Step 1 — Client Information**:
- Client Type: RadioGroup — "Residential" (default) or "Corporate"
- Residential fields: Full Name, Phone (09xxxxxxxxx), Email, Street, Barangay, City, ZIP Code
- Corporate fields (shown via JS toggle when Corporate selected): Company Name, Contact Person, Designation, Number of Units, Province, Building Name, Floor
- Section header: blue User icon + "Client Information"

**Step 2 — Service Details**:
- Service Type: Select dropdown with options + prices:
  - Aircon Installation (₱15,000), Site Inspection (Free), Aircon Cleaning (₱2,500), Aircon Repairs (₱1,500), Dismantle (₱2,000), Relocation (₱3,500), Freon Charging (₱2,000)
- If Installation selected → show Technical Specifications box (blue border `#0062a3/20`, bg `rgba(0,98,163,0.025)`):
  - Brand (Select: Daikin, Samsung, LG, etc. + Other), Type (Window/Split/Inverter/Cassette/Console/Central), Horsepower, BTU
- Schedule: Date picker + Time slot selector (6 slots: 8-10AM, 10-12PM, 1-3PM, 3-5PM, 5-7PM, 7-8PM)
  - Booked slots shown as disabled with strikethrough text
- Corporate + Installation: Special Instructions textarea

**Step 3 — Review & Confirm**:
- Two-column summary of all entered data
- Technical specs in blue-bordered box
- Note: "You will receive a 24-hour confirmation"

**Step indicator**: 3 circles connected by lines
- Current step: `bg-[#0062a3] text-white border-[#0062a3]`
- Completed: `bg-green-500`
- Upcoming: `bg-white border-[#e2e8f0]`

**Dialog**: max-width 600px, scrollable content area (max-height 70vh)
**Footer**: Previous (outline) + Next/Confirm (`bg-[#0062a3] text-white`), bg `#f8fafc`

---

## LOGIN / AUTH PAGES

### Login Page (auth/login.php)
- **Background**: `#f8fafc`, centered card layout (max-w-md)
- **Logo**: Rounded-xl box (`bg-[#005596]`, 64x64) with white "A" letter
- **Heading**: "Login" (text-3xl font-bold `#1e293b`) + subtitle
- **Card**: white, border-slate-200, shadow-sm
  - Header: Lock icon + "Sign In" in `#005596`
  - Email field with Mail icon prefix
  - Password field with Lock icon prefix + Eye/EyeOff visibility toggle
  - **Submit button**: Full-width `bg-[#005596] hover:bg-[#00447a]`, loading spinner when submitting
  - "Forgot your password?" link in `#005596`
  - "Back to Home" outline button
  - Error: red alert box (`bg-red-50 border-red-100 text-red-600`)

### Forgot Password (auth/forgot-password.php)
- Same layout as login
- Email input + "Send Reset Email" button
- Success state shows confirmation message

### Reset Password (auth/reset-password.php)
- Same layout pattern
- New password + confirm password fields

---

## ADMIN PANEL

### Layout (admin/index.php)
- `display: flex` full height — sidebar + main content area
- Main content: scrollable, padded (`padding: 1.5rem 2rem`)

### Admin Sidebar (admin/sidebar.php — components/admin-sidebar.php)
- **Gradient background**: `linear-gradient(to bottom, #005596, #003d70)`
- **Expandable**: Default collapsed (width 60px), expands to 256px on hover, 300ms transition
- **Logo section**: White rounded box with logo + "Azelea" + "Admin Panel" text (when expanded)
- **Navigation items** (10 items, each with Lucide icon):
  1. Dashboard (Home icon)
  2. Clients (Users icon)
  3. Installations (Wrench icon)
  4. Repairs (PenTool icon)
  5. Maintenance (Wrench icon)
  6. Schedule (CalendarDays icon)
  7. Reports (BarChart3 icon)
  8. Requests (FileText icon)
  9. Leads (TrendingUp icon)
  10. Technicians (HardHat icon)
- **Active state**: `bg-white bg-opacity-20 text-white shadow-md`
- **Inactive state**: `text-blue-100 hover:bg-white hover:bg-opacity-10`
- **Bottom section** (border-top): Reminders (Bell), Settings (Settings), Sign Out (LogOut in red)
- **Collapsed tooltips**: Dark tooltip on hover (`bg-slate-800 text-white text-xs rounded-md px-2 py-1`)

### Admin Dashboard (admin/index.php — main content)
- **Sticky header**: White bar with page title + notification bell (red badge for unread)
- **Stat cards grid**: 4 columns, each card:
  - Icon in colored circle (blue, amber, emerald, rose)
  - Number (text-3xl font-bold) + label (text-sm text-[#64748b])
  - Cards: white, rounded-xl, border, shadow-sm
  - Hover: shadow-md, icon scales up (`scale-110`)
- **Recent Activity**: List with status badges, dates, clickable items

### Admin Views
Each view follows this pattern:
- **Header**: Title + action buttons (Create, Filter, etc.)
- **Data table**: Striped rows, sortable columns, status badges, action dropdowns
- **Empty state**: Centered icon + "No data found" message
- **Dialogs**: For create/edit forms (same dialog pattern as booking form)

---

## CLIENT DASHBOARD

### Layout (dashboard/index.php)
- Same flex layout as admin (sidebar + main content)

### Client Sidebar (dashboard/sidebar.php)
- Same gradient pattern as admin sidebar
- **Navigation items** (3):
  1. Overview (Home icon)
  2. Machine List (Wind icon)
  3. Settings (Settings icon)
- **Request Service** button (Wrench icon, amber-300 colored)
- **Bottom**: Notifications bell (red badge for unread), Sign Out

### Client Dashboard Content (dashboard/index.php)
- **Background**: `#f8fafc`
- **Header**: "Client Dashboard" + welcome message + "Request a Service" button (`bg-[#0062a3]`)
- **3 stat cards**:
  1. Your Activity (Activity icon, blue bg)
  2. Active Services (Clock icon, amber bg)
  3. Completed Services (CheckCircle2 icon, emerald bg)
  - Cards: border-none shadow-sm, icon scales on hover
- **Recent Services**: List with status badges + progress bars
  - Progress bar: animated diagonal stripes for in-progress items
  - Reschedule button for eligible items
- **Machines view**: Grid of AC unit cards (Wind icon, brand/type/HP details)
- **Settings view**: Profile form, password change, notification toggles

---

## ANIMATIONS & INTERACTIONS

All animations use CSS transitions (no heavy JS animation libraries):

| Element | Animation | Duration |
|---------|-----------|----------|
| Navbar background | Transparent → white/80 blur on scroll | 200ms |
| Mobile menu | opacity-0, translateY(-4) → opacity-1, translateY(0) | 300ms |
| Service cards | translateY(-4), shadow-md on hover | 200ms |
| Admin/client sidebar | width 60px → 256px on hover | 300ms |
| CTA arrow | translateX(0) → translateX(1) on hover | 200ms |
| Stat card icon | scale(1) → scale(1.1) on hover | 200ms |
| Progress bar stripes | Diagonal stripe animation (infinite) | 800ms linear |
| Dialog/modal | Fade in + zoom in (scale 0.95→1) | 200ms |
| Button loading | Spinner rotate animation | infinite |
| Logo | scale(1) → scale(1.05) on hover | 200ms |

---

## RESPONSIVE BREAKPOINTS

- Mobile: < 768px (default)
- Tablet: ≥ 768px (`md:`)
- Desktop: ≥ 1024px (`lg:`)
- Max container width: 1280px centered with 1rem padding

---

## DELIVERABLES

Generate a complete, working vanilla PHP application with all files listed above. The app should:
- Run on Apache + PHP 8.x + PostgreSQL
- Allow public booking form submission
- Auto-create user accounts (hashed passwords) on lead submission
- Allow admin login and full management (leads, clients, jobs, units, techs, settings)
- Allow client login and dashboard access (services, units, profile, notifications)
- Send emails via Resend API on booking, completion, delay, cancellation, warranty, maintenance
- Support push notification opt-in via Firebase FCM
- Track warranties and send expiry alerts
- Handle both Residential and Corporate clients
- Use secure password hashing (bcrypt), CSRF protection, input sanitization, prepared statements
- Have clean URLs via .htaccess rewrite

Focus on functionality AND visual design. Use Tailwind CSS utility classes with the exact color palette, spacing, and component patterns defined in the UI DESIGN SYSTEM section above. All forms must validate both client-side (JS) and server-side (PHP). The UI should match the design system precisely — same colors, same border radius, same shadows, same hover effects, same animations.
```
