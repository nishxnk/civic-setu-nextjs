# Backend Schema Design
## Civic Setu — MongoDB Collection Definitions

**Version:** 1.0
**Date:** 2026-06-16
**Database:** MongoDB 7.x (Mongoose ODM)

---

## 1. Entity Relationship Overview

```
┌──────────┐       ┌───────────────┐       ┌──────────────┐
│   User   │◄──────┤  Complaint    │──────►│  AuditLog    │
│          │       │               │       │              │
│  _id     │──┐    │  _id          │    ┌──│ complaintId  │
│  name    │  │    │  title        │    │  │  userId      │
│  email   │  │    │  description  │    │  │  action      │
│  role    │  │    │  category     │    │  │  timestamp   │
│  deptId  │──┼───►│  department   │    │  └──────────────┘
│  zoneId  │  │    │  status       │    │
└──────────┘  │    │  priority     │    │  ┌──────────────┐
              │    │  assignedTo ──┼────┘  │  Timeline    │
┌──────────┐  │    │  citizen      │       │              │
│  Dept    │◄─┘    │  location     │       │  complaintId │
│          │       │  attachments  │       │  entries[]   │
│  _id     │       │  trackingNum  │       │  - status    │
│  name    │       │  timeline     │       │  - timestamp │
│  head    │       │  slaDeadline  │       │  - userId    │
│  workers │       │  resolution   │       │  - notes     │
└──────────┘       └───────────────┘       └──────────────┘
       │
       │            ┌──────────────┐       ┌──────────────┐
       │            │  SLA Config  │       │  Webhook     │
       └───────────►│              │       │              │
                    │  category    │       │  url         │
                    │  maxHours    │       │  events[]    │
                    │  deptId      │       │  secret      │
                    │  escalation  │       │  isActive    │
                    └──────────────┘       └──────────────┘

┌──────────┐       ┌──────────────┐       ┌──────────────┐
│   Role   │       │  Config      │       │  Feedback    │
│          │       │  (Tenant)    │       │              │
│  name    │       │  key/val     │       │  complaintId │
│  perms[] │       │  per-org     │       │  rating      │
└──────────┘       └──────────────┘       │  comment     │
                                           └──────────────┘
```

---

## 2. Collection: `users`

### 2.1 Schema

```typescript
// Existing collection — EXTENDED for enterprise
interface IUser {
  _id: ObjectId;

  // ── Identity ──
  firebaseUid?: string;        // Firebase Auth UID (sparse unique index)
  name: string;                // Full name
  email: string;               // Unique, validated
  password?: string;           // Hashed, select: false (legacy auth)
  phone?: string;              // Mobile number

  // ── Role & Org ──
  role: UserRole;              // "citizen" | "worker" | "supervisor" | "dept_head" | "admin" | "commissioner"
  permissions?: string[];      // Granular permission overrides (denormalized from role)
  departmentId?: ObjectId;     // Reference to departments collection
  zoneId?: ObjectId;           // Reference to zones collection
  ward?: string;               // Ward/constituency name

  // ── Profile ──
  photoURL?: string;           // Profile picture URL
  designation?: string;        // Job title
  employeeId?: string;         // Government employee ID
  authProvider: AuthProvider;  // "email" | "google" | "saml" | "legacy"

  // ── Status ──
  isActive: boolean;           // Can log in?
  isVerified: boolean;         // Email/phone verified?
  lastLoginAt?: Date;          // Last successful login
  lastLoginIp?: string;        // Audit trail

  // ── Preferences ──
  language?: string;           // Preferred locale code (hi, ta, te, etc.)
  notificationPrefs: {
    email: boolean;            // Receive email notifications
    sms: boolean;              // Receive SMS
    whatsapp: boolean;         // Receive WhatsApp messages
    push: boolean;             // Receive push notifications
  };

  // ── Metadata ──
  createdBy?: ObjectId;       // Who created this user (admin)
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = "citizen" | "worker" | "supervisor" | "dept_head" | "admin" | "commissioner";
type AuthProvider = "email" | "google" | "saml" | "legacy";
```

### 2.2 Indexes

```javascript
{ email: 1 }                        // UNIQUE
{ firebaseUid: 1 }                  // UNIQUE, SPARSE
{ role: 1, departmentId: 1 }        // Department-level user queries
{ zoneId: 1, role: 1 }              // Zone-level worker lists
{ isActive: 1 }                     // Active user filtering
{ "notificationPrefs.sms": 1 }      // SMS notification recipients
```

### 2.3 Relationship to Existing Schema

Current schema has: `firebaseUid`, `name`, `email`, `password`, `role` (3 values), `photoURL`, `authProvider`, `phone`.
**Changes needed:**
- Expand `role` enum to 6 values
- Add: `permissions[]`, `departmentId`, `zoneId`, `ward`, `designation`, `employeeId`, `isActive`, `isVerified`, `lastLoginAt`, `lastLoginIp`, `language`, `notificationPrefs`, `createdBy`

---

## 3. Collection: `departments`

### 3.1 Schema (NEW)

```typescript
interface IDepartment {
  _id: ObjectId;

  // ── Identity ──
  name: string;                  // Display name (e.g., "Public Works Department")
  code: string;                  // Short code (e.g., "pwd")
  description?: string;

  // ── Organization ──
  headUserId?: ObjectId;         // Department head (ref: users)
  parentDepartmentId?: ObjectId; // For nested dept hierarchy
  icon?: string;                 // Font Awesome / Lucide icon name

  // ── Complaints ──
  categories: string[];          // Categories this dept handles
  minPriority: ComplaintPriority; // Minimum auto-assignable priority
  isComplaintEnabled: boolean;   // Can receive new complaints?

  // ── SLAs ──
  defaultSlaHours: number;       // Default SLA in working hours
  slaOverrides?: Array<{         // Per-category SLA override
    category: string;
    maxHours: number;
  }>;

  // ── Escalation ──
  escalationChain?: Array<{      // Ordered escalation levels
    level: number;               // 1 = first escalation
    role: string;                // Role that gets escalated to
    afterHours: number;          // Hours after breach
    notifyChannel: ("email" | "sms" | "whatsapp" | "push")[];
  }>;

  // ── Metadata ──
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Indexes

```javascript
{ code: 1 }              // UNIQUE
{ categories: 1 }         // Find dept by complaint category
{ headUserId: 1 }         // Department head lookup
{ isActive: 1 }           // Active departments
```

---

## 4. Collection: `zones`

### 4.1 Schema (NEW)

```typescript
interface IZone {
  _id: ObjectId;

  name: string;                  // e.g., "Zone 1 — North Ward"
  code: string;                  // Short code

  // ── Hierarchy ──
  departmentId: ObjectId;        // Parent department
  supervisorId?: ObjectId;       // Zone supervisor (ref: users)
  workerIds?: ObjectId[];        // Field workers in this zone

  // ── Geography ──
  boundary?: {                   // GeoJSON polygon for boundary
    type: "Polygon";
    coordinates: number[][][];
  };
  centerPoint?: {                // GeoJSON point for map centering
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };

  // ── Metadata ──
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Indexes

```javascript
{ departmentId: 1, code: 1 }   // UNIQUE composite
{ supervisorId: 1 }            // Supervisor lookup
{ workerIds: 1 }               // Find zone by worker
{ boundary: "2dsphere" }       // Geo containment queries
```

---

## 5. Collection: `complaints`

### 5.1 Schema — EXTENDED

```typescript
// Existing collection — SIGNIFICANTLY EXTENDED
interface IComplaint {
  _id: ObjectId;

  // ── Core ──
  title: string;
  description: string;
  category: ComplaintCategory;
  department: ComplaintDepartment;

  // ── Location ──
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
    geoJSON?: {                // For 2dsphere queries
      type: "Point";
      coordinates: [number, number];
    };
    ward?: string;
    zone?: string;
    pinCode?: string;
    landmark?: string;
  };

  // ── Citizen ──
  citizen: {
    userId?: ObjectId;          // Reference if registered user
    name: string;
    email: string;
    phone: string;
    isAnonymous: boolean;
    consentGiven: boolean;      // DPDP Act consent
  };

  // ── Categorization ──
  tags?: string[];              // NLP auto-tags
  subCategory?: string;         // Granular category
  severity?: "minor" | "moderate" | "major" | "critical";

  // ── Status & Priority ──
  status: ComplaintStatus;      // "pending" → "acknowledged" → "assigned" → "in-progress" → "resolved" | "rejected"
  priority: ComplaintPriority;

  // ── Assignment ──
  assignedTo?: ObjectId;         // Current assigned worker
  assignedDept?: ObjectId;      // Assigned department
  assignedZone?: ObjectId;      // Assigned zone
  assignmentHistory?: Array<{
    fromUserId?: ObjectId;
    toUserId: ObjectId;
    assignedAt: Date;
    assignedBy: ObjectId;
    reason?: string;
  }>;

  // ── SLA ──
  slaDeadline?: Date;           // Must-resolve-by timestamp
  slaBreached?: boolean;        // Flag set by cron job
  slaEscalated?: boolean;       // Has been escalated
  escalationLevel?: number;     // Current escalation level

  // ── Timeline ──
  timeline: Array<{
    status: ComplaintStatus;
    timestamp: Date;
    userId?: ObjectId;
    userRole?: string;
    notes?: string;
    location?: { latitude: number; longitude: number }; // Worker location during update
  }>;

  // ── Attachments ──
  attachments: Array<{
    url: string;                 // Firebase Storage URL
    thumbnailUrl?: string;       // Thumbnail URL
    type: "image" | "video" | "document";
    caption?: string;
    isBeforePhoto?: boolean;     // Field worker before photo
    isAfterPhoto?: boolean;      // Field worker after photo
    hasExifGps?: boolean;        // GPS in EXIF data
    exifGps?: { lat: number; lng: number };
    uploadedBy: ObjectId;
    uploadedAt: Date;
  }>;

  // ── AI Detection ──
  aiDetection?: {
    model: string;               // e.g., "yolov8n"
    results: Array<{
      label: string;             // e.g., "Pothole", "Cracks"
      confidence: number;
      boundingBox: [number, number, number, number];
    }>;
    annotatedImageUrl?: string;
    processedAt: Date;
  };

  // ── Resolution ──
  resolutionNotes?: string;
  resolutionDate?: Date;
  resolvedBy?: ObjectId;
  beforePhotoUrl?: string;       // Before image
  afterPhotoUrl?: string;        // After image
  materialsUsed?: Array<{
    item: string;
    quantity: number;
    unit: string;
  }>;
  costIncurred?: number;

  // ── Feedback ──
  citizenFeedback?: {
    rating: number;              // 1-5
    comment?: string;
    submittedAt: Date;
  };

  // ── Tracking ──
  trackingNumber: string;        // UNIQUE, auto-generated: CIV-YYYY-XXXXX

  // ── Source ──
  source: "web" | "mobile" | "whatsapp" | "sms" | "ivr" | "kiosk" | "email" | "api";

  // ── Metadata ──
  createdBy?: ObjectId;         // User who filed complaint
  createdAt: Date;
  updatedAt: Date;
}

type ComplaintStatus = "pending" | "acknowledged" | "assigned" | "in-progress" | "resolved" | "rejected" | "reopened";
type ComplaintPriority = "low" | "medium" | "high" | "critical";
```

### 5.2 Indexes

```javascript
{ trackingNumber: 1 }                            // UNIQUE
{ status: 1, createdAt: -1 }                     // Dashboard: pending complaints by recency
{ department: 1, status: 1, createdAt: -1 }      // Department-specific dashboard
{ assignedTo: 1, status: 1 }                     // Worker task queue
{ "citizen.userId": 1, createdAt: -1 }            // Citizen: my complaints
{ "citizen.email": 1, createdAt: -1 }             // Citizen search by email
{ category: 1, createdAt: -1 }                    // Category analytics
{ "location.geoJSON": "2dsphere" }                // Geo-radius search
{ slaDeadline: 1, status: 1 }                     // SLA breach cron: find overdue
{ tags: 1 }                                       // Tag-based search
{ source: 1 }                                     // Source analytics
{ createdAt: -1 }                                 // Recency sorting
{ "aiDetection.results": 1 }                      // AI result analytics (sparse)
```

### 5.3 Relationship to Existing Schema

Current schema has: `title`, `description`, `category`, `department`, `location` (address, lat, lng), `citizen` (name, email, phone), `status` (4 values), `priority`, `attachments` (string[]), `assignedTo`, `trackingNumber`, `resolutionNotes`, `resolutionDate`.

**Changes needed:** Most of the new fields are additive. Status enum expands from 4 → 7. Attachments become subdocuments instead of string array.

---

## 6. Collection: `roles`

### 6.1 Schema (NEW)

```typescript
interface IRole {
  _id: ObjectId;

  name: string;                  // Display name: "Zonal Supervisor"
  slug: string;                  // Machine name: "zonal_supervisor"
  description?: string;

  // ── Permissions ──
  permissions: string[];         // e.g., ["complaints:read", "complaints:assign", "users:read"]
  inherits?: ObjectId;           // Inherit permissions from another role

  // ── Scope ──
  scope: "global" | "department" | "zone"; // Data visibility scope

  // ── Metadata ──
  isSystem: boolean;             // Built-in role? (can't delete)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 Permission Naming Convention

```
resource:action[:scope]

Resources:
  complaints, users, departments, zones, roles,
  analytics, reports, detection, sla, webhooks, audit

Actions:
  create, read, update, delete, assign, escalate,
  approve, export, manage (all actions)

Examples:
  complaints:read                          — View own complaints
  complaints:read:zone                     — View all complaints in zone
  complaints:read:department               — View all complaints in department
  complaints:create                        — File complaint
  complaints:assign                        — Assign to worker
  complaints:update:status                 — Change status
  complaints:delete                        — Soft delete
  users:manage:department                  — CRUD users in department
  analytics:read:global                    — View all analytics
  sla:manage                               — Configure SLA
  audit:read                               — View audit logs
```

### 6.3 Default Roles

| Role | Inherits | Key Permissions |
|---|---|---|
| Citizen | — | `complaints:create`, `complaints:read` (own) |
| Field Worker | Citizen | `complaints:read:assigned`, `complaints:update:status`, `attachments:upload` |
| Supervisor | Worker | `complaints:read:zone`, `complaints:assign`, `users:read:zone` |
| Department Head | Supervisor | `complaints:read:department`, `analytics:read:department`, `sla:manage`, `reports:export` |
| Commissioner | Dept Head | `analytics:read:global`, `users:read:global` |
| Admin | — | Everything, `roles:manage`, `audit:read`, `webhooks:manage` |

### 6.4 Indexes

```javascript
{ slug: 1 }        // UNIQUE
{ isActive: 1 }    // Active roles
```

---

## 7. Collection: `audit_logs`

### 7.1 Schema (NEW)

```typescript
interface IAuditLog {
  _id: ObjectId;

  // ── What happened ──
  action: string;                // e.g., "complaint.created", "user.role_changed"
  resource: string;              // e.g., "complaints", "users"
  resourceId: ObjectId;          // The affected document

  // ── Changes ──
  changes?: {
    field: string;
    oldValue?: any;
    newValue: any;
  }[];

  // ── Who did it ──
  userId?: ObjectId;             // Actor (null for system actions)
  userName?: string;             // Denormalized for readability
  userRole?: string;             // Actor's role at time of action

  // ── Context ──
  ipAddress?: string;
  userAgent?: string;
  complaintId?: ObjectId;        // Related complaint if applicable
  correlationId?: string;        // For request tracing

  // ── Metadata ──
  timestamp: Date;               // When the action happened
}
```

### 7.2 Indexes

```javascript
{ resourceId: 1, timestamp: -1 }       // Per-resource audit trail
{ userId: 1, timestamp: -1 }           // Per-user activity
{ action: 1, timestamp: -1 }           // Action-type filtering
{ complaintId: 1, timestamp: -1 }      // Per-complaint full history
{ correlationId: 1 }                   // Request tracing
{ timestamp: -1 }                      // Recent activity (TTL: 2 years)
```

### 7.3 TTL Index

```javascript
// Auto-delete audit logs older than 2 years (for DPDP Act compliance)
{ timestamp: 1 }, { expireAfterSeconds: 63072000 }
```

---

## 8. Collection: `sla_configs`

### 8.1 Schema (NEW)

```typescript
interface ISlaConfig {
  _id: ObjectId;

  // ── Scope ──
  departmentId?: ObjectId;       // NULL = global default
  category: string;              // Complaint category

  // ── SLA Definition ──
  maxWorkingHours: number;       // Maximum resolution time in working hours
  priorityMultiplier?: {         // Multiplier per priority
    low: number;                 // e.g., 1.5 (150% of base)
    medium: number;              // e.g., 1.0
    high: number;                // e.g., 0.5
    critical: number;            // e.g., 0.25
  };

  // ── Working Hours ──
  workingHours: {
    start: string;               // "09:00"
    end: string;                 // "18:00"
    daysOfWeek: number[];        // [1,2,3,4,5] = Mon-Fri
  };
  holidays?: Date[];             // Excluded dates

  // ── Escalation ──
  escalationLevels: Array<{
    level: number;               // 1, 2, 3...
    afterWorkingHours: number;   // Hours after SLA breach
    escalateToRole: string;      // Role to escalate to
    notifyVia: ("email" | "sms" | "whatsapp" | "push" | "dashboard")[];
  }>;

  // ── Metadata ──
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: ObjectId;
}
```

### 8.2 Indexes

```javascript
{ departmentId: 1, category: 1 }   // UNIQUE composite
{ isActive: 1 }                     // Active configs
```

---

## 9. Collection: `notifications`

### 9.1 Schema (NEW)

```typescript
interface INotification {
  _id: ObjectId;

  userId: ObjectId;              // Recipient
  complaintId?: ObjectId;        // Related complaint

  // ── Content ──
  type: "status_update" | "assignment" | "sla_warning" | "sla_breach" | "escalation" | "resolution" | "feedback_request" | "system";
  title: string;                 // Short title
  body: string;                  // Message body
  actionUrl?: string;            // Deep link (e.g., /citizen/complaints/CIV-2026-1234)

  // ── Delivery ──
  channels: ("email" | "sms" | "whatsapp" | "push" | "in_app")[];
  statuses: {                    // Per-channel delivery status
    email?: "pending" | "sent" | "failed";
    sms?: "pending" | "sent" | "failed";
    whatsapp?: "pending" | "sent" | "failed";
    push?: "pending" | "sent" | "failed";
    in_app?: "unread" | "read";
  };

  // ── Metadata ──
  readAt?: Date;
  createdAt: Date;
}
```

### 9.2 Indexes

```javascript
{ userId: 1, "statuses.in_app": 1, createdAt: -1 }   // Unread in-app notifications
{ userId: 1, createdAt: -1 }                           // User notification feed
{ createdAt: 1 }, { expireAfterSeconds: 7776000 }      // TTL: auto-delete after 90 days
```

---

## 10. Collection: `webhooks`

### 10.1 Schema (NEW)

```typescript
interface IWebhook {
  _id: ObjectId;

  name: string;
  url: string;                   // Endpoint URL
  secret: string;                // HMAC signing secret
  events: string[];              // ["complaint.created", "complaint.resolved", ...]
  headers?: Record<string, string>; // Custom headers
  retryOnFailure: boolean;
  maxRetries: number;            // Default 3

  // ── Stats ──
  lastDeliveryAt?: Date;
  lastDeliveryStatus?: "success" | "failed";
  consecutiveFailures: number;
  totalDeliveries: number;

  // ── Metadata ──
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 10.2 Indexes

```javascript
{ events: 1, isActive: 1 }   // Find webhooks by event type
{ isActive: 1 }               // Active webhooks
```

---

## 11. Collection: `config` (Tenant Settings)

### 11.1 Schema (NEW)

```typescript
interface IConfig {
  _id: ObjectId;

  key: string;                   // e.g., "brand.name", "brand.logo", "email.from"
  value: any;                    // Typed based on key
  type: "string" | "number" | "boolean" | "json" | "image";

  // ── Scope ──
  scope: "global" | "department";
  departmentId?: ObjectId;       // NULL for global

  // ── Metadata ──
  description?: string;
  updatedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 11.2 Key Config Keys

```
brand.name              — Organization name
brand.logo              — Logo URL
brand.favicon           — Favicon URL
brand.primaryColor      — Primary brand color (hex)
brand.secondaryColor    — Secondary brand color (hex)
brand.portalTitle       — Browser tab title
email.fromName          — Outgoing email sender name
email.fromAddress       — Outgoing email address
sms.defaultCountryCode  — Default country code for SMS
whatsapp.businessNumber — WhatsApp Business phone number
features.whatsapp       — Enable/disable WhatsApp channel
features.sms            — Enable/disable SMS
features.detection      — Enable/disable AI detection
features.anonymousMode  — Allow anonymous complaints
features.maxAttachmentSize — Max upload size in MB
complaints.maxPerDay    — Rate limit per citizen per day
retention.auditLogDays  — Audit log retention period
retention.notificationDays — Notification retention period
```

### 11.3 Indexes

```javascript
{ key: 1, departmentId: 1 }   // UNIQUE composite
{ scope: 1 }                  // Global vs department configs
```

---

## 12. Data Migration Strategy

### 12.1 Phase 1 → Phase 2 Migration

**Changes to existing collections:**

```
users:
  + role enum expanded (backward-compatible: existing values stay valid)
  + new optional fields (no migration needed, defaults applied)

complaints:
  + status enum expanded (existing 4 values → 7 values)
  + attachments: string[] → subdocument[] (migration script needed)
  + timeline[] added (can be backfilled from audit_logs)
  + new optional fields (no migration needed)
```

### 12.2 Migration Script Template

```typescript
// scripts/migrate-phase2.ts
async function migratePhase2() {
  // 1. Migrate attachments from string[] to subdocument[]
  const complaints = await Complaint.find({
    attachments: { $type: "string" }
  });

  for (const c of complaints) {
    const newAttachments = c.attachments.map((url: string) => ({
      url,
      type: "image",
      uploadedBy: c.citizen.userId || null,
      uploadedAt: c.createdAt,
    }));
    await Complaint.updateOne(
      { _id: c._id },
      { $set: { attachments: newAttachments } }
    );
  }

  // 2. Backfill timeline for existing complaints
  // ... (read audit_logs, create timeline entries)
}
```

---

## 13. Data Lifecycle & Retention

| Data Type | Retention | Action After |
|---|---|---|
| Audit Logs | 2 years | Auto-delete (TTL index) |
| Notifications | 90 days | Auto-delete (TTL index) |
| Complaints | 5 years | Archive to cold storage |
| Resolved Complaints | 5 years | Soft-delete, retain anonymized stats |
| User Accounts | Until deactivated + 1 year | Anonymize PII |
| Detection Images | 1 year | Delete from Firebase Storage |
| Temp/Processing Files | 24 hours | Cron clean-up |
