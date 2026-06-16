# Application Flow & User Journeys
## Civic Setu — End-to-End Workflows & Screen Maps

**Version:** 1.0
**Date:** 2026-06-16

---

## 1. Core User Journeys

### 1.1 Journey 1: Citizen Files & Tracks Complaint (P0)

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Landing │    │  Login/  │    │  File    │    │  Track   │    │Feedback  │
│  Page   │───►│  Sign Up │───►│Complaint │───►│ Progress │───►│+ Rating  │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │               │               │               │
     │              │               │               │               │
     ▼              ▼               ▼               ▼               ▼
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Hero +  │    │Firebase   │    │Category  │    │Timeline  │    │1-5 star  │
│ Features│    │Auth + JWT│    │→ Location│    │View with │    │+ comment  │
│ CTA →   │    │or Email/ │    │→ Photo   │    │Status    │    │          │
│ File Now│    │Password  │    │→ AI Det  │    │Badge +   │    │          │
│         │    │          │    │→ Submit  │    │ETA/Notes │    │          │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                               │
     │  Guest mode?                  │  Anonymous?
     └──────────────────────────────►│  Get token link via SMS/email
```

**Detailed Steps:**
1. Citizen lands on homepage → sees Hero, stats (X complaints resolved), CTA "File a Complaint"
2. Clicks CTA → if not logged in, redirected to `/login` or `/signup`
3. Auth: Firebase email/password or Google OAuth → JWT stored → redirect to complaint form
4. Complaint form (3-step wizard):
   - **Step 1 — Category:** Select from grid (Road, Water, Lighting, Sanitation, Traffic, Other)
   - **Step 2 — Location:** Type address (autocomplete) + pin on map, or auto-detect GPS
   - **Step 3 — Details:** Title, description, upload photo (1-3 images)
   - **AI detection fires** on photo upload → shows detected issues (e.g., "Pothole — 94% confidence")
   - Submit → tracking number generated (CIV-2026-1234) → success screen
5. Citizen dashboard: table of all complaints with status badges, click to detail
6. Complaint detail page:
   - Timeline of status changes (who, when, notes)
   - Current status with progress bar
   - Location on map
   - Attachment gallery
   - "Share" button (WhatsApp/social)
7. When resolved → citizen receives notification → opens detail → submits rating (1-5 stars + comment)

---

### 1.2 Journey 2: Admin Dashboard & Complaint Management (P0)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Admin   │    │Overview  │    │Complaint │    │  Assign  │    │ Monitor  │
│  Login   │───►│Dashboard │───►│  List    │───►│  Worker  │───►│Resolution│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │               │               │               │
                     ▼               ▼               ▼               ▼
               ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
               │Stats     │    │Filter by │    │Select    │    │SLA Timer │
               │Cards     │    │Status,   │    │Worker    │    │Escalate  │
               │Charts    │    │Dept, Date│    │from Zone │    │if Breach │
               └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Detailed Steps:**
1. Admin logs in → Firebase Auth → API validates role = admin → redirect to `/admin`
2. Overview dashboard renders:
   - Stats cards: Total, Pending, In-Progress, Resolved, Rejected
   - Monthly trend line chart
   - Category pie chart
   - Department performance bar chart
   - Priority distribution
3. Clicks "Manage Complaints" → complaint list with filters
4. Table columns: Tracking #, Title, Category, Dept, Status, Priority, Assigned To, Date
5. Clicks on a pending complaint → detail page
6. Detail page shows: full complaint info + timeline + attachments + AI detection results
7. Admin clicks "Assign" → opens modal:
   - Shows eligible workers (filtered by department + zone)
   - Shows worker load (current task count)
   - One-click assign
8. Once assigned → complaint status moves to "Assigned" → worker receives notification
9. Admin can also: bulk assign, bulk update status, export filtered list to CSV

---

### 1.3 Journey 3: Field Worker Resolves Complaint (P0 — Phase 2)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Worker  │    │  Task    │    │Navigate  │    │Capture   │    │  Mark    │
│  Login   │───►│  Queue   │───►│to Site   │───►│Before +  │───►│Resolved  │
│          │    │          │    │          │    │After     │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │               │               │               │
                     ▼               ▼               ▼               ▼
               ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
               │Sorted by│    │Open in   │    │Geo-tagged│    │Materials │
               │Priority │    │Google    │    │photos    │    │Used +    │
               │+ SLA    │    │Maps      │    │mandatory │    │Sign-off  │
               └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Detailed Steps:**
1. Worker logs in via PWA (mobile) → sees task queue
2. Task cards: Title, address, priority badge, SLA countdown timer, "Navigate" button
3. Taps task → detail view with map
4. Taps "Start Work" → status → "In Progress"
   - Must capture "Before" photo (geo-tagged, timestamped)
   - Tapping forces camera, can't use gallery (fraud prevention)
5. After work done → taps "Mark Resolved"
   - Must capture "After" photo
   - Enter resolution notes
   - Optionally log materials used
6. Submit → complaint status → "Resolved" → citizen notified
7. Optional: citizen present → digital sign-off on worker's device

---

### 1.4 Journey 4: SLA Breach & Escalation (P1 — Phase 2)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Complaint │    │ SLA      │    │ Breach   │    │Escalate  │    │Commission│
│ Assigned │───►│ Timer    │───►│ Detected │───►│to Next   │───►│er Review │
│          │    │ Running  │    │          │    │Level     │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │               │               │               │
                     ▼               ▼               ▼               ▼
               ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
               │Cron runs│    │slaBreach │    │Notify    │    │Penalty   │
               │every 15m│    │= true    │    │Supervisor│    │Dashboard │
               │          │    │          │    │→DeptHead │    │Update    │
               └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 2. Complaint Status State Machine

```
                          ┌─────────┐
                          │  Filed  │ ◄──────── Can reopen if citizen disputes
                          │ (via any│
                          │ channel)│
                          └────┬────┘
                               │
                               ▼
                         ┌───────────┐
                         │  Pending  │ (Awaiting admin review)
                         └─────┬─────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌─────────┐ ┌─────────┐ ┌──────────┐
              │Acknowl- │ │ Reject  │ │ Auto-    │
              │ edged   │ │ (with   │ │ Assign   │
              │         │ │ reason) │ │ (AI)     │
              └────┬────┘ └────┬────┘ └────┬─────┘
                   │           │           │
                   │  ┌────────┘           │
                   │  │                    │
                   ▼  ▼                    │
              ┌─────────┐                  │
              │ Assigned│◄─────────────────┘
              └────┬────┘
                   │
                   ▼
            ┌───────────┐
            │In Progress│ (Worker on site)
            └─────┬─────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
 ┌─────────┐ ┌─────────┐ ┌──────────┐
 │Resolved │ │ Escalat-│ │ Rejected │
 │(pending │ │ ed      │ │ (worker  │
 │citizen  │ │         │ │ can't fix)│
 │confirm) │ └────┬────┘ └──────────┘
 └────┬────┘      │
      │           ▼
      │    ┌───────────┐
      │    │ Re-assign │──► Assigned (different worker/dept)
      │    └───────────┘
      │
      ▼
┌──────────┐
│ Feedback │ ◄─ Citizen CSAT rating
│ Collected│
└────┬─────┘
     │
     ▼
┌──────────┐
│  Closed  │ (Final state)
└──────────┘
     │
     ▼
┌──────────┐
│ Reopened │ ◄─ Citizen disputes resolution within 7 days
└────┬─────┘
     │
     └──► Assigned
```

---

## 3. Screen Flow Map (All Pages)

### 3.1 Public Routes

```
/ (Landing)
├── Hero Section
│   ├── CTA: "File Complaint" → /login (if not auth) or /citizen/complaints/new
│   └── CTA: "Track Complaint" → /search (tracking number lookup)
├── Features Section (cards)
├── Stats Section (live counters)
├── How It Works (3 steps)
└── Footer

/(public)/login
├── Email + Password form
├── Google OAuth button
├── Link: "Create Account" → /signup
└── Link: "Forgot Password?"

/(public)/signup
├── Registration form (name, email, password, phone)
├── Google OAuth button
└── Link: "Already have an account?" → /login

/(public)/about
├── Mission statement
├── Team / organization info
├── Technology overview
└── Contact info

/(public)/contact
├── Contact form
└── Office addresses / phone numbers

/(public)/complaint/[trackingNumber]
├── Public tracking page (no login needed)
│   ├── Status progress bar
│   ├── Timeline
│   └── Share button
```

### 3.2 Citizen Routes (auth required, role: citizen)

```
/citizen
├── /citizen (Dashboard)
│   ├── My Stats cards (total, pending, resolved)
│   ├── Recent Complaints table
│   ├── "File New Complaint" button
│   └── Quick actions

├── /citizen/complaints
│   ├── List of all my complaints (paginated)
│   ├── Filters: status, date range
│   └── Click → /citizen/complaints/[id]

├── /citizen/complaints/[id]
│   ├── Complaint detail
│   ├── Status timeline
│   ├── Map (location)
│   ├── Attachments (photos)
│   ├── AI detection results (if any)
│   ├── Resolution notes + after photos
│   ├── Share button
│   └── Feedback form (if resolved)

├── /citizen/complaints/new (or /citizen/report)
│   ├── Step 1: Category selection grid
│   ├── Step 2: Location (address input + map picker)
│   ├── Step 3: Details (title, description, photo upload)
│   │   └── AI detection overlay on uploaded photo
│   └── Success: tracking number + share

└── /citizen/profile
    ├── Edit name, email, phone
    ├── Notification preferences
    ├── Language selector
    └── Linked accounts (Google)
```

### 3.3 Admin Routes (auth required, role: admin | dept_head | commissioner)

```
/admin
├── /admin (Dashboard)
│   ├── Stats cards (total, pending, in-progress, resolved, rejected)
│   ├── Priority distribution pie
│   ├── Monthly trend line chart
│   ├── Department performance bars
│   ├── Category breakdown
│   ├── Recent complaints feed
│   └── SLA breach alerts

├── /admin/complaints
│   ├── Table: all complaints
│   ├── Filters: status, dept, category, priority, date, zone
│   ├── Search: tracking number, citizen name/email
│   ├── Sortable columns
│   ├── Bulk actions: assign, change status, export
│   └── Click → /admin/complaints/[id]

├── /admin/complaints/[id]
│   ├── Full complaint detail
│   ├── Assignment panel (select worker/department)
│   ├── Status change buttons
│   ├── Resolution review + approve/reject
│   ├── Full audit timeline
│   └── AI detection results

├── /admin/users
│   ├── User table (filterable: role, dept, status)
│   ├── Add user button → modal
│   ├── Edit user → drawer
│   ├── Deactivate/Activate toggle
│   └── Bulk import (CSV)

├── /admin/departments
│   ├── Department list with stats
│   ├── Add/Edit department modal
│   ├── Department head assignment
│   └── Category mapping

├── /admin/analytics
│   ├── Date range selector
│   ├── Advanced charts (multiple metrics)
│   ├── Department comparison
│   ├── Worker productivity
│   ├── SLA compliance rate
│   ├── Export PDF/Excel
│   └── Schedule recurring report

├── /admin/roles (Phase 2)
│   ├── Role list
│   ├── Create/Edit role
│   └── Permission matrix editor

├── /admin/sla (Phase 2)
│   ├── SLA config per category
│   ├── Working hours + holidays
│   └── Escalation chain builder

├── /admin/audit-logs (Phase 2)
│   ├── Activity log table
│   ├── Filters: user, action, resource, date
│   └── Export audit report

└── /admin/settings (Phase 2)
    ├── Brand settings (logo, colors, name)
    ├── Feature toggles
    ├── Notification templates
    ├── Webhook management
    └── API keys (if public API enabled)
```

### 3.4 Worker Routes (auth required, role: worker | supervisor) — Phase 2

```
/worker
├── /worker (Task Queue)
│   ├── Task cards sorted by priority + SLA
│   ├── Filter by status
│   └── Map view toggle

├── /worker/tasks/[id]
│   ├── Complaint details
│   ├── Map + navigation button
│   ├── "Start Work" button → captures before photo
│   ├── "Mark Resolved" button → captures after photo
│   ├── Resolution notes + materials form
│   └── Digital sign-off (citizen signature capture)

└── /worker/attendance
    ├── Geo-fenced check-in
    ├── Daily task summary
    └── History
```

---

## 4. Key Interaction Flows

### 4.1 AI Detection Flow

```
User uploads photo
        │
        ▼
┌─────────────────┐
│ Frontend:        │
│ Show preview     │
│ + loading state  │
└────────┬────────┘
         │ POST /api/detection/image (FormData)
         ▼
┌─────────────────┐
│ Server:          │
│ 1. Sharp resize │
│    to 640px      │
│ 2. ONNX Runtime  │
│    Run YOLOv8    │
│ 3. Extract boxes │
│ 4. Annotate img  │
│ 5. Save to       │
│    Firebase       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response:        │
│ { detections: [  │
│   { label:       │
│     "Pothole",   │
│     confidence:  │
│     0.94,        │
│     box: [...]   │
│   }],            │
│   annotatedUrl   │
│ }                │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend:        │
│ Display annotated│
│ image with       │
│ bounding boxes   │
│ + detection      │
│ labels below     │
└─────────────────┘
```

### 4.2 Search Flow

```
User enters search query
        │
        ├── Is it a tracking number? (CIV-YYYY-XXXX pattern)
        │   └── GET /api/search/by-tracking-number/:id
        │       └── Redirect to complaint detail
        │
        ├── Is it a location? (address text)
        │   └── GET /api/search/by-location?q=...&radius=5km&lat=...&lng=...
        │       └── Show map with pins + list
        │
        └── General text search
            └── GET /api/search?q=...&category=...&status=...
                └── Show results table
```

### 4.3 Notification Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Event   │    │  Create  │    │ Dispatch │    │  User    │
│ Occurs   │───►│Notif Doc │───►│to Workers│───►│ Receives │
└──────────┘    └──────────┘    └──────────┘    └──────────┘

Events:
  complaint.created     → Admin gets in-app + email
  complaint.assigned    → Worker gets push + SMS
  complaint.in_progress → Citizen gets in-app
  complaint.resolved    → Citizen gets email + SMS + WhatsApp
  complaint.escalated   → Supervisor + Dept Head get email + push
  sla.warning           → Worker + Supervisor get push
  sla.breached          → Worker + Sup + Dept Head get email + SMS
  feedback.requested    → Citizen gets email with star rating link
```

---

## 5. Authentication State Flow

```
App Load
   │
   ▼
┌──────────┐
│Check Auth│ (AuthContext)
│Loading...│
└────┬─────┘
     │
     ├── User authenticated ──────────────────────┐
     │   │                                        │
     │   ▼                                        │
     │ ┌────────────┐                             │
     │ │Check Role  │                             │
     │ └──┬─────┬───┘                             │
     │    │     │                                  │
     │    ▼     ▼          ▼                      │
     │ citizen admin/     worker                   │
     │         dept_head                           │
     │    │     │          │                       │
     │    ▼     ▼          ▼                       │
     │ /citizen /admin   /worker                   │
     │                                              │
     ├── No user, public route ─────────────────────┤
     │   │                                         │
     │   ▼                                         │
     │ Show public page                             │
     │                                              │
     ├── No user, protected route ──────────────────┤
     │   │                                         │
     │   ▼                                         │
     │ Redirect to /login                           │
     │ (save intended URL for post-login redirect)   │
     │                                              │
     └──────────────────────────────────────────────┘
```

---

## 6. Data Flow Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│                                                  │
│  Page Component                                  │
│      │                                           │
│      ▼                                           │
│  Custom Hook (useComplaints, useDashboard, etc.) │
│      │                                           │
│      ▼                                           │
│  API Client (api-client.ts)                     │
│      │                                           │
│      ▼                                           │
│  fetch() with Auth Bearer token                  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│                   MIDDLEWARE                      │
│                                                  │
│  1. CORS check                                   │
│  2. Rate limit check (Redis)                     │
│  3. Auth middleware (validate JWT)               │
│  4. Role check (requireAdmin / requireWorker)    │
│  5. Zod input validation                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│               ROUTE HANDLER                       │
│                                                  │
│  1. Extract validated params                     │
│  2. Call Service Layer                           │
│  3. Return formatted response                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│               SERVICE LAYER                       │
│                                                  │
│  complaint.service.ts                            │
│      │                                           │
│      ├── Business logic                          │
│      ├── Permission checks (resource-level)      │
│      ├── Trigger side effects:                   │
│      │   ├── Create audit log                    │
│      │   ├── Create notification                 │
│      │   ├── Update SLA deadline                 │
│      │   └── Fire webhook                        │
│      │                                           │
│      ▼                                           │
│  Mongoose Model (data access)                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│               DATABASE (MongoDB)                  │
└─────────────────────────────────────────────────┘
```

---

## 7. Background Job Flows

### 7.1 SLA Monitor Cron

```
Every 15 minutes:
  1. Find complaints WHERE:
     status IN ["assigned", "in-progress"]
     slaDeadline < NOW
     slaBreached != true
  2. For each:
     - Set slaBreached = true
     - Create audit log entry
     - Create notification for worker + supervisor
     - If escalation level > 0:
       - Set esclatedTo = next level role
       - Notify escalated role
```

### 7.2 Report Generation

```
1. Admin clicks "Generate Report" → POST /api/reports/detailed
   └── Returns jobId immediately

2. BullMQ worker processes:
   ├── Fetch data (complaints, users, stats for period)
   ├── Generate PDF (using react-pdf or puppeteer)
   ├── Upload to Firebase Storage
   └── Update job status + create notification with download link

3. Admin clicks notification → downloads PDF
```

### 7.3 Video Detection Processing

```
1. User uploads video → POST /api/detection/video
   └── Returns jobId + "processing" status

2. BullMQ worker:
   ├── Extract frames (1 frame per second)
   ├── Run YOLOv8 on each frame
   ├── Aggregate detections
   ├── Generate annotated video (optional)
   └── Update job status + store results on complaint
```

---

## 8. Offline-First Flow (Worker PWA — Phase 2)

```
┌─────────────────────────────────────┐
│          ONLINE (Normal)             │
│                                      │
│  Worker views tasks ← API fetch      │
│  Worker updates task → API call      │
│  Photos upload → Firebase Storage    │
│                                      │
└──────────────┬──────────────────────┘
               │
               │ Network lost
               ▼
┌─────────────────────────────────────┐
│          OFFLINE (Cached)            │
│                                      │
│  Service Worker intercepts:          │
│  - GET /tasks → cached response     │
│  - POST/PUT → IndexedDB queue       │
│                                      │
│  Photos saved to local cache         │
│  "Sync pending" badge on task        │
│                                      │
└──────────────┬──────────────────────┘
               │
               │ Network restored
               ▼
┌─────────────────────────────────────┐
│          SYNC (Restoring)            │
│                                      │
│  Background Sync API:                │
│  1. Read queued mutations from IDB   │
│  2. Replay in order                  │
│  3. Upload cached photos             │
│  4. Update task status to "synced"   │
│  5. Notify worker                    │
│                                      │
└─────────────────────────────────────┘
```
