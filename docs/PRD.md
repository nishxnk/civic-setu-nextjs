# Product Requirements Document (PRD)
## Civic Setu — Digital Civic Grievance & Governance Platform

**Version:** 1.0
**Date:** 2026-06-16
**Status:** Phase 1 — MVP with Enterprise Expansion
**Product Type:** B2G (Business-to-Government) / B2B SaaS

---

## 1. Executive Summary

### 1.1 Product Vision

Civic Setu ("Setu" = bridge in Hindi) is a **digital bridge between citizens and governance**. It is an end-to-end platform for reporting, tracking, and resolving civic infrastructure issues — potholes, broken streetlights, waterlogging, sanitation gaps, traffic violations — using AI-powered detection, geospatial tracking, and multi-level workflow automation.

The platform serves three core personas:
- **Citizens** — report issues and track resolution
- **Government Departments / Organizations** — manage, assign, resolve, and analyze
- **Field Workers** — receive tasks, update on-ground status, capture proof

### 1.2 Mission

Reduce average civic complaint resolution time from 30+ days to under 72 hours. Bring transparency, accountability, and data-driven governance to municipal operations.

### 1.3 Target Market

| Segment | Examples | Revenue Model |
|---|---|---|
| **Municipal Corporations** | Nagar Nigam, City Councils | Annual license + per-user |
| **Smart City SPVs** | Smart City Mission projects | Annual license |
| **Government Departments** | PWD, Electricity Board, Water Authority | Department-wise license |
| **Large Campuses/Organizations** | Universities, SEZs, Industrial Parks | Per-campus SaaS |
| **RWAs / Residential Complexes** | Gated communities, townships | Freemium → Premium |

---

## 2. User Personas

### 2.1 Citizen (Nagarik)
- **Age range:** 18-70
- **Tech literacy:** Mixed (smartphone user to feature-phone)
- **Languages:** Multi-lingual (need i18n for 22 Indian languages)
- **Goals:** Report issue quickly, track status, get resolution confirmation
- **Pain points:** Don't know which department to contact, no visibility after reporting, no accountability

### 2.2 Field Worker (Karmachari)
- **Role:** On-ground municipal worker / contractor
- **Tech literacy:** Basic smartphone usage
- **Goals:** See assigned tasks, navigate to location, update with photos, get citizen sign-off
- **Pain points:** No digital task queue, manual paper-based updates, can't prove work done

### 2.3 Supervisor / Zonal Officer (Adhikari)
- **Role:** Department supervisor managing a ward/zone
- **Goals:** Assign complaints to workers, monitor SLA compliance, approve resolutions
- **Pain points:** No visibility into worker productivity, manual escalation, can't track SLA breaches

### 2.4 Department Head / Commissioner (Pramukh)
- **Role:** Department head or municipal commissioner
- **Goals:** View department performance, analytics dashboard, generate reports, identify hotspots
- **Pain points:** No real-time data for review meetings, can't answer RTI queries quickly, no predictive insights

### 2.5 System Administrator
- **Role:** IT admin managing the platform
- **Goals:** Configure org hierarchy, manage users/roles, set SLAs, configure integrations
- **Pain points:** Rigid systems that can't adapt to org structure changes

---

## 3. Feature Modules

### Module A: Citizen Portal (Phase 1 MVP — Partially Built)

| Feature | Priority | Status | Description |
|---|---|---|---|
| A1. Complaint Filing | P0 | ✅ In Progress | Multi-step form: category → location → description → photo → submit |
| A2. AI Auto-Detection | P0 | ✅ In Progress | Upload photo → YOLOv8 detects road damage types |
| A3. Tracking Number | P0 | ✅ Done | Auto-generated unique ID (CIV-YYYY-XXXX) |
| A4. Complaint History | P0 | ✅ In Progress | List view + detail view of all past complaints |
| A5. Status Tracking | P0 | ✅ In Progress | Real-time status: Pending → In Progress → Resolved |
| A6. Citizen Profile | P1 | ✅ In Progress | Name, email, phone, notification preferences |
| A7. Multi-Language UI | P2 | ❌ Not Started | 22 Indian languages + English |
| A8. Anonymous Reporting | P2 | ❌ Not Started | Optional anonymous mode with tracking token |
| A9. WhatsApp Bot | P2 | ❌ Not Started | File complaint via WhatsApp messages |
| A10. Voice Complaint | P3 | ❌ Not Started | Voice-to-text in regional languages |

### Module B: Admin Dashboard (Phase 1 — Partially Built)

| Feature | Priority | Status | Description |
|---|---|---|---|
| B1. Overview Dashboard | P0 | ✅ In Progress | Cards: total, pending, resolved, in-progress; charts |
| B2. Complaint Management | P0 | ✅ In Progress | Table view, filter, sort, bulk actions |
| B3. User Management | P0 | ✅ In Progress | CRUD users, role assignment, status toggle |
| B4. Department Management | P0 | ✅ In Progress | CRUD departments, assign categories |
| B5. Analytics Dashboard | P1 | ✅ In Progress | Charts: monthly trends, category breakdown, department performance |
| B6. Geospatial View | P1 | ❌ Not Started | Live map with complaint pins, heatmap, zone overlays |
| B7. Report Generation | P1 | ❌ Not Started | PDF/Excel exports, auto-scheduled email reports |
| B8. RBAC Configuration | P2 | ❌ Not Started | Granular role builder UI |
| B9. SLA Configuration | P2 | ❌ Not Started | Per-category SLA timers, escalation chains |
| B10. Audit Log Viewer | P2 | ❌ Not Started | Immutable activity log with filters |

### Module C: Field Worker App (Phase 2)

| Feature | Priority | Status | Description |
|---|---|---|---|
| C1. Task Queue | P0 | ❌ Not Started | Assigned complaints list, sorted by priority/deadline |
| C2. Navigation | P0 | ❌ Not Started | Open in Google Maps with complaint location |
| C3. Before/After Capture | P0 | ❌ Not Started | Mandatory geo-tagged photos before & after work |
| C4. Geo-fenced Attendance | P1 | ❌ Not Started | Verify worker presence at complaint site |
| C5. Offline Mode | P1 | ❌ Not Started | Queue updates locally, sync when connected |
| C6. Digital Sign-off | P1 | ❌ Not Started | Citizen signs on worker device confirming resolution |
| C7. Material Tracking | P2 | ❌ Not Started | Log materials/resources used per complaint |

### Module D: Workflow & SLA Engine (Phase 2)

| Feature | Priority | Status | Description |
|---|---|---|---|
| D1. Multi-Level Approvals | P0 | ❌ Not Started | Configurable N-level approval chains |
| D2. Auto-Assignment | P0 | ❌ Not Started | Round-robin / load-balanced / skill-based routing |
| D3. SLA Timers | P0 | ❌ Not Started | Per-category countdown, working-hours-aware |
| D4. Auto-Escalation | P0 | ❌ Not Started | Breach → auto-escalate to supervisor → department head |
| D5. Penalty Dashboards | P2 | ❌ Not Started | SLA breach tracking per department/worker |
| D6. Holiday Calendar | P2 | ❌ Not Started | Configurable working days, holidays, excluded periods |

### Module E: Multi-Channel Intake (Phase 3)

| Feature | Priority | Status | Description |
|---|---|---|---|
| E1. WhatsApp Integration | P1 | ❌ Not Started | WhatsApp Business API for 2-way communication |
| E2. SMS Gateway | P1 | ❌ Not Started | Status updates via SMS for non-smartphone users |
| E3. IVR Integration | P2 | ❌ Not Started | Phone hotline → auto-create complaint ticket |
| E4. Email-to-Ticket | P2 | ❌ Not Started | Parse structured emails into complaints |
| E5. Walk-in Kiosk Mode | P3 | ❌ Not Started | Assisted filing at municipal centers |
| E6. Public API | P2 | ❌ Not Started | REST API for third-party app integration |

### Module F: Integration Hub (Phase 4)

| Feature | Priority | Status | Description |
|---|---|---|---|
| F1. SSO / SAML / OAuth | P1 | ❌ Not Started | Government identity provider integration |
| F2. Aadhaar / DigiLocker | P2 | ❌ Not Started | Indian government identity verification |
| F3. GIS Integration | P1 | ❌ Not Started | Consume municipal GIS map layers |
| F4. HRMS / ERP Sync | P2 | ❌ Not Started | Auto-sync employee directory |
| F5. Payment Gateway | P3 | ❌ Not Started | For fine payment / fee collection |
| F6. Webhook System | P2 | ❌ Not Started | Push events to external systems on status change |
| F7. CPGRAMS Integration | P2 | ❌ Not Started | Central government grievance portal sync |

### Module G: Advanced Analytics & AI (Phase 5)

| Feature | Priority | Status | Description |
|---|---|---|---|
| G1. Predictive Hotspots | P2 | ❌ Not Started | ML model predicting complaint surge areas |
| G2. NLP Auto-Categorization | P2 | ❌ Not Started | Classify complaint text → correct department |
| G3. Duplicate Detection | P2 | ❌ Not Started | "Has this pothole already been reported at this location?" |
| G4. Sentiment Analysis | P3 | ❌ Not Started | Flag angry/escalating citizens |
| G5. AI Chatbot | P3 | ❌ Not Started | First-level support + complaint intake via conversation |
| G6. Anomaly Detection | P3 | ❌ Not Started | Detect unusual complaint volume spikes |

### Module H: Platform & Multi-Tenancy (Phase 5)

| Feature | Priority | Status | Description |
|---|---|---|---|
| H1. White-Labeling | P2 | ❌ Not Started | Per-tenant logo, colors, domain, email templates |
| H2. Multi-Tenant Isolation | P1 | ❌ Not Started | Database-level or collection-level data isolation |
| H3. Subscription Tiers | P3 | ❌ Not Started | Feature-gating per plan |
| H4. Usage Analytics | P3 | ❌ Not Started | Tenant-level usage tracking for billing |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load (LCP): < 2.5s
- API response (p95): < 200ms for reads, < 1s for writes
- Image upload + detection: < 5s end-to-end
- Support 10,000 concurrent users per tenant
- Handle 100,000+ complaints per tenant

### 4.2 Security
- HTTPS-only, HSTS enabled
- JWT + Firebase Auth with token rotation
- CSRF protection on all mutating endpoints
- Rate limiting: 100 req/min per IP, 10 req/min for detection APIs
- Input sanitization (Zod validation on every endpoint)
- Helmet security headers
- Encryption at rest for PII (citizen phone, email)
- GDPR / DPDP Act 2023 compliant data handling

### 4.3 Accessibility
- WCAG 2.1 AA compliant
- Screen reader support (ARIA labels, semantic HTML)
- Keyboard navigation
- High contrast mode
- Minimum 200% text resize support

### 4.4 Reliability
- 99.5% uptime SLA
- Graceful degradation when detection model is down
- Offline queue for field worker app
- Automated database backups (daily)

### 4.5 Maintainability
- Code coverage > 80%
- E2E test coverage of critical flows
- Structured logging with correlation IDs
- Error tracking (Sentry)
- Automated CI/CD pipeline

---

## 5. Success Metrics (KPIs)

| Metric | Target | Measurement |
|---|---|---|
| Average Resolution Time | < 72 hours | `resolutionDate - createdAt` |
| Citizen Satisfaction (CSAT) | > 4.2/5 | Post-resolution survey |
| Complaint-to-Resolution Rate | > 85% | `resolved / total` |
| SLA Compliance | > 90% | `slaMet / totalWithSLA` |
| Repeat Reporting Rate | < 15% | Same location + category within 30 days |
| Daily Active Users (DAU) | > 500 per 100K citizens | Analytics |
| Time-to-First-Complaint | < 3 minutes | `createdAt - sessionStart` |

---

## 6. Competitive Landscape

| Competitor | Strengths | Weaknesses |
|---|---|---|
| CPGRAMS (Govt) | Mandated for central depts | Slow, no mobile, no AI, rigid workflow |
| MyGov | Citizen engagement | Not a grievance system |
| SeeClickFix (US) | Good UX, map-centric | Not localized for India, no multi-language |
| I Change My City | Indian, localized | Limited enterprise features, no AI |
| Custom ERP solutions | Tailored to org | Expensive, long deployment, vendor lock-in |

**Civic Setu's differentiator:** AI-first (auto-detection), multi-channel (WhatsApp + SMS + Web), enterprise RBAC + SLA, geo-enabled, and white-label ready — all in one platform.

---

## 7. Release Phasing

| Phase | Timeline | Scope |
|---|---|---|
| **Phase 1 — MVP** | Current | Citizen portal, admin dashboard, AI detection, basic CRUD |
| **Phase 2 — Enterprise Core** | Q3 2026 | RBAC, workflow engine, SLA, field worker app, geo dashboard |
| **Phase 3 — Multi-Channel** | Q4 2026 | WhatsApp, SMS, IVR, email intake |
| **Phase 4 — Integrations** | Q1 2027 | SSO, GIS, HRMS, webhooks, CPGRAMS |
| **Phase 5 — AI + Platform** | Q2 2027 | NLP, chatbots, predictive analytics, multi-tenancy, white-label |

---

## 8. Glossary

| Term | Definition |
|---|---|
| **Tracking Number** | Unique complaint identifier (CIV-YYYY-XXXX) |
| **SLA** | Service Level Agreement — max resolution time per category |
| **RBAC** | Role-Based Access Control |
| **CSAT** | Citizen Satisfaction score |
| **Geo-fencing** | GPS-based boundary verification |
| **PWA** | Progressive Web App — installable web app with offline support |
| **RTI** | Right to Information — Indian transparency law |
| **DPDP Act** | Digital Personal Data Protection Act 2023 (India) |
