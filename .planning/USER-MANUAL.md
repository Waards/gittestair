# Azelea Aircon System — User Manual

## Overview

Azelea Aircon System is a full-service HVAC management platform for air conditioning service businesses in the Philippines. It enables customers to book services online and allows administrators to manage leads, jobs, clients, technicians, and business operations from a single dashboard.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Public Booking](#2-public-booking)
3. [Client Dashboard](#3-client-dashboard)
4. [Admin Panel](#4-admin-panel)
5. [Notifications](#5-notifications)
6. [FAQ](#6-faq)

---

## 1. Getting Started

### System Requirements
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection
- For push notifications: browser must support Web Push API

### Accessing the System
| Role     | URL               |
|----------|--------------------|
| Public   | `https://<domain>/` |
| Client   | `https://<domain>/login` |
| Admin    | `https://<domain>/admin` |

### Account Types
- **Public** — No account needed to submit a booking request.
- **Client** — Has a dashboard to track services, units, and notifications. Created by admin after lead conversion or via client registration.
- **Admin** — Full access to all management features.

### Logging In
1. Navigate to `/login`.
2. Enter your email and password.
3. Click **Sign In**.
4. Admins are redirected to `/admin`. Clients are redirected to `/dashboard`.

### Password Reset
1. Go to `/forgot-password`.
2. Enter your registered email.
3. Check your inbox for a password reset link.
4. Click the link and set a new password.

---

## 2. Public Booking

The landing page (`/`) allows anyone to submit a service request.

### Step-by-Step Booking
1. Browse the **Services** section to view available offerings.
2. Click **Book Now** to open the booking form.
3. Fill in the required fields:
   - **Full Name**
   - **Email Address**
   - **Phone Number** (Philippine format: `09xx-xxx-xxxx`)
   - **Client Type** — Residential or Corporate
     - Corporate requires Company Name, Contact Person, Building/Floor, and Province.
   - **Service Type** — Installation, Cleaning, Repair, Dismantle & Relocation, Freon Charging, or Maintenance Plan.
   - **Service Address** — Street, Barangay, City, Province.
   - **Preferred Date & Time Slot** (8:00 AM – 8:00 PM, 1-hour slots).
   - **Aircon Details** — Brand, Type (Window, Split, Inverter, Cassette, etc.), Horsepower, BTU.
   - **Additional Notes** (optional).
4. Submit the form. A confirmation message will appear.
5. The admin reviews your request and follows up via email or phone.

---

## 3. Client Dashboard

After logging in, clients access `/dashboard`. Here you can manage your services, units, and profile.

### My Services
- **Active Services** — View ongoing jobs with status tracking and progress bar.
- **Job History** — View completed service records.
- Each job displays: service type, assigned technician, schedule, status, and notes.

### Rescheduling a Job
1. Go to **My Services**.
2. Click on the active job.
3. Select **Reschedule** and pick a new date/time slot.
4. Confirm the change.

### My Units
- View all registered aircon units.
- Each unit shows: brand, type, horsepower, BTU, serial number, installation date, and **warranty status**.
- Expiring warranties are highlighted with a warning badge.
- **Add Unit:** Register a new aircon unit to your profile.

### Notifications
- View in-app notifications for booking confirmations, service updates, warranty reminders, and maintenance alerts.
- **Push Notifications:** Toggle browser push notifications on/off via the notification settings.

### Profile
- Update your name, service address, and phone number.
- Change your password.

---

## 4. Admin Panel

Admins access all management tools at `/admin`. Navigation is via the sidebar.

### 4.1 Dashboard
- Summary statistics: total leads, active jobs, pending services, clients count.
- Quick overview of recent activity.

### 4.2 Leads
- View all incoming service requests from the public booking form.
- Filters: All, Pending, Accepted, Rejected, Converted.
- **Accept Lead** — Accept the lead and auto-create a job:
  - As Installation
  - As Repair
  - As Maintenance
- **Reject Lead** — Decline with a reason (optional).
- **Convert to Client** — Convert a lead into a registered client (auto-creates auth account + profile + job).
- **Edit / Delete** — Modify or remove a lead.

### 4.3 Clients
- View, search, and manage all registered clients.
- Columns: Name, Email, Phone, Type (Residential/Corporate), Created Date.
- **Add Client** — Manually register a new client.
- **Edit / Archive** — Update details or archive a client.
- Click a client to view their full profile, units, and job history.

### 4.4 Jobs

#### Installations
- Manage aircon installation jobs.
- **Create Installation** — Assign client, technician, schedule, and unit details.
- **Mark Complete** — Finalize the job, trigger completion notification.
- View job details: progress, assigned technician, scheduled date/time, notes.

#### Repairs
- Manage repair jobs.
- **Create Repair** — Select client, aircon unit, describe issue, assign technician.
- **Mark Complete** — Log repair resolution and parts used.

#### Maintenance
- Manage recurring maintenance plans.
- **Create Maintenance** — Assign client, unit, plan type, frequency.
- Track maintenance history and upcoming due dates.

### 4.5 Units
- View all aircon units across all clients.
- **Register Unit** — Add a new unit to a client's account.
- Fields: Brand, Type, Horsepower, BTU, Serial Number, Installation Date, Warranty Period.
- Warranty tracking with expiry dates. Units nearing warranty end are flagged.

### 4.6 Technicians
- Manage the workforce.
- **Add Technician** — Name, contact info, specialization.
- **Assign to Jobs** — Link a technician to an installation, repair, or maintenance job.
- Track technician workload and job history.

### 4.7 Calendar
- Timeline view of all scheduled appointments.
- Filter by job type (Installation, Repair, Maintenance).
- See scheduled date, time slot, client name, and assigned technician.

### 4.8 Notifications
- System notification center.
- View all sent notifications (email, push).
- Manually send test notifications.

### 4.9 Settings

#### Company Info
- Update company name, address, contact details displayed on the landing page.

#### Notification Preferences
- Toggle notification channels:
  - **Email Notifications** (via Resend)
  - **SMS Notifications**
  - **Push Notifications** (via Firebase)
- Configure reminder timing for:
  - Warranty expiry alerts
  - Maintenance reminders

#### Security
- **Two-Factor Authentication (2FA)** — Enable/disable.
- **Session Timeout** — Set idle timeout duration.
- **Change Password** — Update admin password.

---

## 5. Notifications

The system sends automatic notifications for key events.

### Email Notifications
Sent to clients via Resend for:
| Event                    | Recipient |
|--------------------------|-----------|
| Booking confirmation     | Client    |
| Service completion       | Client    |
| Service delay            | Client    |
| Cancellation notice      | Client    |
| Warranty expiry reminder | Client    |
| Maintenance reminder     | Client    |

### Push Notifications
Browser push alerts (Firebase FCM) for:
- Booking status updates
- Service reminders
- Warranty alerts

Clients can opt in/out of push notifications from their dashboard.

### In-App Notifications
Available in both Client Dashboard and Admin Panel for real-time status updates.

---

## 6. FAQ

**Q: I forgot my password. What do I do?**
Go to `/forgot-password`, enter your email, and follow the reset link sent to your inbox.

**Q: How do I update my address or phone number?**
Log in to your client dashboard, go to **Profile**, and update your details.

**Q: Can I have multiple aircon units registered?**
Yes. Go to **My Units** in the dashboard and click **Add Unit** to register additional units.

**Q: How do I know when my warranty is about to expire?**
The warranty expiry date is displayed on each unit card. You will also receive an email and push notification when expiry is near.

**Q: How do I reschedule a service appointment?**
Go to **My Services**, click on the active job, and select **Reschedule**. Choose a new date and time slot.

**Q: I own a business with multiple units. Can I use this system?**
Yes. When booking, select **Corporate** as client type and fill in the company details. The system supports multiple units per corporate account.

**Q: What payment methods are accepted?**
Contact the admin for accepted payment methods.

**Q: How do I contact support?**
Reach out via the contact details on the landing page or email the admin directly.
