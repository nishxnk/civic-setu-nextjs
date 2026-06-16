# Technical Requirements Document (TRD)
## Civic Setu — Architecture & Technical Specifications

**Version:** 1.0
**Date:** 2026-06-16
**Reference PRD:** [PRD.md](PRD.md)

---

## 1. Technology Stack

### 1.1 Current Stack (Phase 1 MVP)

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.2 | Server components, API routes, SSR/ISR, file-based routing |
| **UI Library** | React | 19.2 | Component model, ecosystem, PWA support |
| **Language** | TypeScript | 5.x | Type safety, better DX, enterprise requirement |
| **Styling** | Tailwind CSS | 4.x | Utility-first, rapid prototyping, design system friendly |
| **Database** | MongoDB (Mongoose) | ODM 9.7 | Flexible schema for evolving requirements, geospatial queries |
| **Auth — Primary** | Firebase Auth | 12.14 | Email/password + Google OAuth, JWT tokens |
| **Auth — Server** | Firebase Admin SDK | 14.0 | Server-side token verification |
| **Auth — Legacy** | JWT (jsonwebtoken) | 9.0 | Fallback for non-Firebase users |
| **Password Hashing** | bcryptjs | 3.0 | Industry standard for legacy password auth |
| **AI Inference** | ONNX Runtime Node | 1.26 | Run YOLOv8 models server-side, no GPU required |
| **Image Processing** | Sharp | 0.35 | Resize, optimize images pre/post detection |

### 1.2 Recommended Additions (Phase 2+)

| Layer | Technology | Purpose |
|---|---|---|
| **Validation** | Zod | Request body/query validation, env var validation |
| **Rate Limiting** | `@upstash/ratelimit` + Redis | API protection, detection endpoint throttling |
| **Caching** | ioredis / `@upstash/redis` | Dashboard stats, search results, session cache |
| **Error Tracking** | `@sentry/nextjs` | Client + server error monitoring, release tracking |
| **Logging** | Pino | Structured JSON logging with log levels |
| **Background Jobs** | BullMQ + Redis | Video detection, report generation, notification dispatch |
| **Testing — Unit** | Vitest / Jest + RTL | Component + service layer unit tests |
| **Testing — E2E** | Playwright | Cross-browser E2E for critical flows |
| **API Docs** | OpenAPI / Swagger UI | Auto-generated from Zod schemas + route metadata |
| **CI/CD** | GitHub Actions | Lint → type-check → test → build → deploy |
| **Containerization** | Docker + Compose | Consistent dev/prod environments |
| **Monitoring** | Prometheus + Grafana | Self-hosted or Vercel Analytics |
| **Email** | Resend / SendGrid | Transactional emails (status updates, reports) |
| **SMS** | Twilio / MSG91 | SMS notifications for non-smartphone users |
| **WhatsApp** | WhatsApp Business Cloud API | Chatbot + complaint intake |
| **Maps** | Mapbox / OpenStreetMap (Leaflet) | Geospatial dashboard, complaint location picker |
| **i18n** | `next-intl` | Server + client translations, RTL support |
| **Feature Flags** | LaunchDarkly / Flagsmith | Gradual rollouts, per-tenant feature toggles |
| **Secrets** | Infisical / Doppler | Encrypted env management |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Web App  │  │ Mobile   │  │ WhatsApp │  │ Kiosk/IVR   │ │
│  │ (Next.js)│  │ (PWA)    │  │ Bot      │  │             │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└───────┼──────────────┼──────────────┼───────────────┼────────┘
        │              │              │               │
        ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Rate     │  │ Auth     │  │ Input    │  │ CORS /       │ │
│  │ Limiter  │  │ Middleware│  │ Valid.   │  │ Helmet       │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  API Routes  │ │  Background  │ │  WebSocket   │
│  (Next.js    │ │  Jobs        │ │  (Detection  │
│   Route      │ │  (BullMQ)    │ │   Realtime)  │
│   Handlers)  │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │Complaint │ │  User    │ │Detection │ │  Workflow      │ │
│  │Service   │ │ Service  │ │Service   │ │  Engine        │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘ │
│       │             │            │               │          │
│  ┌────┴─────┐ ┌─────┴────┐ ┌────┴─────┐ ┌──────┴────────┐ │
│  │ Report   │ │  SLA     │ │ Search   │ │ Notification  │ │
│  │ Service  │ │ Service  │ │ Service  │ │ Service       │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   MongoDB    │ │    Redis     │ │   Firebase   │
│  (Primary    │ │   (Cache /   │ │   (Auth /    │
│   Database)  │ │    Queue)    │ │   Storage)   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 2.2 Directory Structure (Target)

```
civic-setu-nextjs/
├── docs/                           # Documentation
│   ├── PRD.md
│   ├── TRD.md
│   ├── BACKEND-SCHEMA.md
│   ├── APP-FLOW.md
│   └── DESIGN.md
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public)/               # Public routes (landing, login, etc.)
│   │   ├── citizen/                # Citizen dashboard
│   │   ├── admin/                  # Admin panel
│   │   ├── worker/                 # Field worker app (PWA)  [NEW]
│   │   ├── api/                    # API route handlers
│   │   └── uploads/                # Uploaded images/documents
│   ├── components/                 # React components
│   │   ├── ui/                     # Design system primitives  [NEW]
│   │   ├── common/                 # Shared components
│   │   ├── forms/                  # Form components  [NEW]
│   │   ├── maps/                   # Map components  [NEW]
│   │   └── charts/                 # Chart components  [NEW]
│   ├── services/                   # Business logic layer  [NEW]
│   │   ├── complaint.service.ts
│   │   ├── user.service.ts
│   │   ├── detection.service.ts
│   │   ├── sla.service.ts
│   │   ├── report.service.ts
│   │   ├── search.service.ts
│   │   ├── notification.service.ts
│   │   └── workflow.service.ts
│   ├── models/                     # Mongoose schemas
│   ├── lib/                        # Infrastructure / adapters
│   │   ├── db/                     # Database connections
│   │   ├── auth/                   # Auth middleware, strategies
│   │   ├── cache/                  # Redis cache helpers  [NEW]
│   │   ├── queue/                  # BullMQ job definitions  [NEW]
│   │   ├── storage/                # Firebase Storage helpers  [NEW]
│   │   ├── email/                  # Email service  [NEW]
│   │   ├── sms/                    # SMS gateway  [NEW]
│   │   └── whatsapp/               # WhatsApp API client  [NEW]
│   ├── middleware/                  # Next.js middleware  [NEW]
│   ├── hooks/                      # Custom React hooks  [NEW]
│   ├── context/                    # React context providers
│   ├── types/                      # TypeScript type definitions
│   ├── utils/                      # Pure utility functions
│   └── config/                     # App configuration  [NEW]
│       ├── env.ts                  # Zod-validated env vars
│       └── constants.ts            # App constants & enums
├── tests/                          # Test suites  [NEW]
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                        # DB seeds, migrations, etc.  [NEW]
├── docker/                         # Docker config  [NEW]
├── docker-compose.yml              # Local dev stack  [NEW]
├── Dockerfile                      # Production image  [NEW]
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .github/workflows/              # CI/CD  [NEW]
    ├── ci.yml
    └── deploy.yml
```

---

## 3. Data Architecture

### 3.1 Database Choice: MongoDB

**Why MongoDB for this project:**
- Flexible document model suits evolving complaint categories, department structures per tenant
- Geospatial indexes (`2dsphere`) for location-based search and heatmaps
- Embedded documents reduce joins for complaint → citizen → timeline data
- Good fit for JSON-heavy configuration (workflow definitions, SLA rules)
- Horizontal scaling via sharding for multi-tenant isolation

### 3.2 Indexing Strategy

See [BACKEND-SCHEMA.md](BACKEND-SCHEMA.md) for full schema. Key indexes:

```
complaints:
  - { trackingNumber: 1 }            UNIQUE
  - { status: 1, createdAt: -1 }     — dashboard queries
  - { department: 1, status: 1 }     — department views
  - { "citizen.email": 1 }           — citizen lookup
  - { assignedTo: 1, status: 1 }     — worker task queue
  - { location: "2dsphere" }         — geospatial search
  - { category: 1, createdAt: -1 }   — analytics

users:
  - { email: 1 }                     UNIQUE
  - { firebaseUid: 1 }               UNIQUE SPARSE
  - { role: 1 }                      — admin user lists

audit_logs:
  - { complaintId: 1, timestamp: -1 } — per-complaint audit trail
  - { userId: 1, timestamp: -1 }      — per-user activity log
  - { action: 1, timestamp: -1 }      — action-type filtering
```

---

## 4. API Design

### 4.1 API Conventions

| Convention | Rule |
|---|---|
| **Base Path** | `/api` |
| **Versioning** | URL-based: `/api/v1/...` (add v2 when breaking) |
| **Auth** | `Authorization: Bearer <token>` header |
| **Content-Type** | `application/json` (except file uploads) |
| **Pagination** | `?page=1&limit=20` returning `{ data, total, page, totalPages }` |
| **Filtering** | `?status=pending&department=pwd&from=2026-01-01&to=2026-06-01` |
| **Sorting** | `?sortBy=createdAt&order=desc` |
| **Error Format** | `{ error: { code, message, details? } }` |
| **Success Format** | `{ data: T }` or `{ data: T[], pagination: {...} }` |

### 4.2 Complete API Blueprint

```
AUTH
├── POST   /api/auth/register          — Create account
├── POST   /api/auth/login             — Sign in (Firebase / legacy)
├── POST   /api/auth/refresh           — Refresh token
├── POST   /api/auth/forgot-password   — Send reset email
├── PUT    /api/auth/reset-password    — Reset with token
└── GET    /api/auth/me                — Current user profile

COMPLAINTS
├── POST   /api/complaints             — Create complaint
├── GET    /api/complaints             — List (paginated, filterable)
├── GET    /api/complaints/:id         — Detail with timeline
├── PUT    /api/complaints/:id         — Update (status, assignment, notes)
├── DELETE /api/complaints/:id         — Soft delete
├── POST   /api/complaints/:id/assign  — Assign to worker
├── POST   /api/complaints/:id/escalate— Manual escalation
├── GET    /api/complaints/:id/timeline— Full audit trail
└── POST   /api/complaints/:id/feedback— Citizen CSAT rating

SEARCH
├── GET    /api/search?q=...           — Full-text search
├── GET    /api/search/by-location     — Geo-radius search
└── GET    /api/search/by-tracking/:id — Tracking number lookup

DETECTION
├── POST   /api/detection/image        — Single image detection
├── POST   /api/detection/video        — Video analysis (→ background job)
├── WS      /api/detection/realtime    — WebSocket real-time stream
└── GET    /api/detection/status/:jobId— Async job status

ADMIN
├── GET    /api/admin/dashboard        — Overview stats
├── GET    /api/admin/analytics        — Advanced analytics (period, metrics)
├── GET    /api/admin/users            — User list + management
├── PUT    /api/admin/users/:id        — Update user role, status
├── DELETE /api/admin/users/:id        — Deactivate user
├── GET    /api/admin/departments      — Department list + stats
├── POST   /api/admin/departments      — Create department
├── PUT    /api/admin/departments/:id  — Update department
├── GET    /api/admin/roles            — RBAC role definitions  [NEW]
├── POST   /api/admin/roles            — Create role  [NEW]
├── GET    /api/admin/sla              — SLA configurations  [NEW]
├── PUT    /api/admin/sla/:category    — Update SLA for category  [NEW]
└── GET    /api/admin/audit-logs       — System audit log  [NEW]

CITIZEN
├── GET    /api/citizen/dashboard      — Personal stats
├── GET    /api/citizen/complaints     — My complaints
├── POST   /api/citizen/complaints     — File complaint
├── GET    /api/citizen/profile        — My profile
└── PUT    /api/citizen/profile        — Update profile

WORKER (NEW)
├── GET    /api/worker/tasks           — Assigned complaints
├── GET    /api/worker/tasks/:id       — Task detail with navigation
├── PUT    /api/worker/tasks/:id/start — Mark in-progress, capture before photo
├── PUT    /api/worker/tasks/:id/done  — Mark resolved, capture after photo
└── POST   /api/worker/attendance      — Geo-fenced check-in

REPORTS (NEW)
├── GET    /api/reports/summary        — Executive summary
├── GET    /api/reports/detailed       — Detailed CSV/PDF
├── GET    /api/reports/department/:id — Department-specific
└── POST   /api/reports/schedule       — Schedule recurring report emails

WEBHOOKS (NEW)
├── POST   /api/webhooks/register      — Register webhook endpoint
├── GET    /api/webhooks               — List configured webhooks
└── DELETE /api/webhooks/:id           — Remove webhook

HEALTH
└── GET    /api/health                 — DB + Redis + Firebase connectivity
```

---

## 5. Authentication & Authorization

### 5.1 Auth Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐
│  Client  │        │ Next.js  │        │ Firebase │
│  (Web)   │        │  Server  │        │  Auth    │
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                    │                   │
     │ 1. Sign in         │                   │
     │───────────────────►│                   │
     │                    │ 2. Verify token   │
     │                    │──────────────────►│
     │                    │ 3. Firebase user  │
     │                    │◄──────────────────│
     │                    │                   │
     │                    │ 4. Find/Create    │
     │                    │    MongoDB user   │
     │                    │                   │
     │ 5. JWT session    │                   │
     │◄───────────────────│                   │
     │                    │                   │
     │ 6. Store token    │                   │
     │    (localStorage) │                   │
     │                    │                   │
     │ 7. API call with  │                   │
     │    Bearer token   │                   │
     │───────────────────►│                   │
     │                    │ 8. Validate JWT   │
     │                    │    + Check role   │
     │                    │                   │
     │ 9. Response        │                   │
     │◄───────────────────│                   │
```

### 5.2 Role & Permission Matrix

| Action | Citizen | Worker | Supervisor | Dept Head | Admin |
|---|---|---|---|---|---|
| File complaint | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own complaints | ✅ | ✅ | ✅ | ✅ | ✅ |
| View assigned tasks | — | ✅ | ✅ | ✅ | ✅ |
| Update complaint status | — | ✅ (own) | ✅ (zone) | ✅ (dept) | ✅ (all) |
| Assign complaints | — | — | ✅ | ✅ | ✅ |
| View dept analytics | — | — | ✅ | ✅ | ✅ |
| View all analytics | — | — | — | ✅ | ✅ |
| Manage users | — | — | — | — | ✅ |
| Configure SLAs | — | — | — | ✅ | ✅ |
| View audit logs | — | — | — | — | ✅ |
| System configuration | — | — | — | — | ✅ |
| Manage RBAC roles | — | — | — | — | ✅ |

---

## 6. Performance Strategy

### 6.1 Caching Layers

| Layer | Technology | TTL | What |
|---|---|---|---|
| Client | React Query / SWR | Stale-while-revalidate | API responses |
| CDN | Vercel Edge / CloudFlare | 1h | Static assets, images |
| API Cache | Redis | 30s-5min | Dashboard stats, search results |
| Database | MongoDB Indexes | — | Hot query paths |
| Service | In-memory LRU | 60s | Detection model config, constants |

### 6.2 Image Optimization Pipeline

```
Upload → Sharp resize (max 1920px) → 
  → Save original (Firebase Storage) → 
  → Generate thumbnail (400px) → 
  → Feed to YOLOv8 (640px) → 
  → Draw bounding boxes → 
  → Return annotated image URL
```

### 6.3 Background Job Architecture

```
Synchronous (API response in < 200ms):
  - Complaint CRUD
  - Auth
  - Dashboard stats (cached)

Async (Background Job via BullMQ):
  - Video detection processing
  - Report generation (PDF/Excel)
  - Bulk email/SMS dispatch
  - Image optimization
  - Data archival
```

---

## 7. Security Architecture

### 7.1 Defense-in-Depth

```
┌─────────────────────────────────────────┐
│ L1: Network                              │
│   - HTTPS only, HSTS, TLS 1.3           │
│   - Cloud firewall, DDoS protection     │
├─────────────────────────────────────────┤
│ L2: Application                          │
│   - Helmet headers (CSP, X-Frame, etc.) │
│   - CORS whitelist                       │
│   - Rate limiting (global + per-route)   │
│   - CSRF tokens (mutating endpoints)     │
├─────────────────────────────────────────┤
│ L3: Authentication                       │
│   - Firebase Auth (primary)              │
│   - JWT with expiry + refresh            │
│   - Failed login lockout                 │
├─────────────────────────────────────────┤
│ L4: Authorization                        │
│   - Route-level role checks              │
│   - Resource-level ownership checks      │
│   - Tenant isolation checks (multi-tenant)│
├─────────────────────────────────────────┤
│ L5: Data                                 │
│   - Input validation (Zod)               │
│   - SQL/NoSQL injection prevention (Mongoose)│
│   - PII encryption at rest               │
│   - File upload type/size validation     │
├─────────────────────────────────────────┤
│ L6: Monitoring                           │
│   - Sentry error tracking                │
│   - Structured logging (no PII in logs)  │
│   - Audit trail (all state changes)      │
│   - Suspicious activity alerts           │
└─────────────────────────────────────────┘
```

---

## 8. Deployment Architecture

### 8.1 Target Infrastructure

```
┌──────────────────────────────────────────┐
│              Vercel (Primary)             │
│  ┌────────────────────────────────────┐  │
│  │  Next.js App (Edge Functions)      │  │
│  │  - SSR pages                       │  │
│  │  - API Routes → Serverless         │  │
│  │  - Static assets (CDN edge cache)  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ MongoDB  │ │  Redis   │ │ Firebase │
│ Atlas    │ │  Upstash │ │  Auth +  │
│ (AWS/    │ │  (Edge)  │ │  Storage │
│  GCP)    │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘

┌──────────────────────────────────────────┐
│         Self-Hosted Option (Govt)         │
│  ┌────────────────────────────────────┐  │
│  │  Docker Compose / Kubernetes       │  │
│  │  - Next.js container               │  │
│  │  - MongoDB container               │  │
│  │  - Redis container                 │  │
│  │  - Nginx reverse proxy             │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 8.2 Docker Compose (Dev)

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/civic-setu
      - REDIS_URL=redis://redis:6379
    depends_on: [mongo, redis]
    volumes: ["./src:/app/src"]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

---

## 9. Monitoring & Observability

### 9.1 Key Metrics

| Metric | Tool | Alert Threshold |
|---|---|---|
| API latency (p95) | Vercel Analytics | > 1s sustained for 5 min |
| Error rate | Sentry | > 5% of requests |
| Detection API failures | Sentry | > 10 in 5 min |
| MongoDB connection pool | Atlas monitoring | > 80% utilization |
| Redis hit rate | Upstash dashboard | < 60% |
| Page load (LCP) | Vercel Speed Insights | > 3s |

### 9.2 Logging Standards

```typescript
// Structured log format (Pino)
logger.info({
  correlationId: "req_abc123",
  userId: "user_xyz",
  action: "complaint.created",
  complaintId: "CIV-2026-1234",
  category: "road",
  duration: 45, // ms
});
```

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
        ┌───────┐
        │  E2E  │  10% — Playwright: critical user journeys
        │       │
       ┌┴───────┴┐
       │   Int.  │  30% — API route tests (supertest-like)
       │         │
      ┌┴─────────┴┐
      │   Unit     │  60% — Service layer, utils, hooks
      │            │
      └────────────┘
```

### 10.2 Test Coverage Targets

| Area | Target | Tool |
|---|---|---|
| Service layer | > 90% | Vitest |
| API routes | > 80% | Vitest + node-mocks-http |
| React components | > 70% | Vitest + RTL |
| Critical flows (E2E) | 100% of P0 flows | Playwright |
| Detection module | > 85% | Vitest |

---

## 11. Compliance & Regulations

| Regulation | Applicability | Requirements |
|---|---|---|
| **DPDP Act 2023** (India) | All India deployments | Consent management, data minimization, right to deletion, breach notification |
| **GDPR** | EU citizen data | Similar to DPDP + explicit consent, DPO appointment |
| **WCAG 2.1 AA** | Government procurement | Screen reader, keyboard nav, color contrast, text resize |
| **RTI Act** (India) | Government deployments | Auto-generate data for RTI queries |
| **Guidelines for Indian Govt Websites (GIGW)** | Central/State govt | Accessibility, content standards, security standards |
| **ISO 27001** | Enterprise contracts | ISMS, risk assessment, access control |

---

## 12. Third-Party Dependencies & Risk Management

| Dependency | Risk | Mitigation |
|---|---|---|
| Firebase Auth | Vendor lock-in | Abstract auth interface, JWT fallback already built |
| MongoDB Atlas | Vendor lock-in | Self-host option with Docker Compose |
| ONNX Runtime | Model compatibility | Pin model version, test on major updates |
| Vercel | Vendor lock-in | Docker image for self-hosting |
| WhatsApp API | Policy changes | Multi-channel strategy (SMS as fallback) |
