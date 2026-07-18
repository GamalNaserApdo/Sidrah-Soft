# SidrahSoft Website Rebuild
# Project Rules & Development Constitution

## Purpose

This document is the single source of truth for all decisions related to the SidrahSoft Website Rebuild project.

All analysis, planning, architecture, design, development, and future expansion decisions must follow the rules defined in this document.

When a conflict exists between implementation and this document, this document takes priority.

---

# 1. Project Vision

SidrahSoft is not building a website only.

The project is the first phase of a larger digital ecosystem.

Current phase:

- Premium Corporate Website
- Company Showcase
- Portfolio Platform
- Lead Generation Platform
- Partnership & University Trust Builder

Future phases:

- Academy Platform
- Hybrid LMS
- Student Portal
- Courses
- Certifications
- Payments
- Training Programs

The architecture must support future expansion without requiring a complete rebuild.

---

# 2. Project Priorities

Priority 1:
Academic & Institutional Trust

Priority 2:
Future Academy Readiness

Priority 3:
Lead Generation

All decisions must support one or more of these priorities.

---

# 3. MVP Scope

Included:

- Home Page
- About
- Services
- Portfolio
- Partners & Clients
- Blog / Insights
- Careers
- Contact
- CMS
- Admin Panel
- Lead Management

Not Included:

- LMS
- Student Dashboard
- Payments
- Certificates
- Course Enrollment

These belong to future phases.

---

# 4. Technical Direction

Backend:
- Django
- Django REST Framework

Database:
- MySQL

Frontend:
- Next.js

CMS:
- Custom CMS
- Role-Based Permissions

Architecture must remain future-ready.

---

# 5. Language Strategy

Current:
- English Only

Future:
- Arabic

Requirements:

- No hardcoded UI text.
- Translation-ready architecture.
- Future RTL support.
- CMS must support bilingual content in future.

Do not build a global multi-language system.

Support only English and future Arabic.

---

# 6. Design Philosophy

Primary:
- Corporate Enterprise

Secondary:
- Modern Startup

Accent:
- Futuristic AI

Future Layer:
- Educational Technology

The website must feel professional, trustworthy, modern, and technically advanced.

---

# 7. Visual Direction

Prefer:

- Abstract technology visuals
- Digital systems
- Data networks
- Connected infrastructure
- Enterprise-grade technology
- High-quality custom visual assets

Avoid:

- Generic stock photos
- Smiling office teams
- Typical SaaS templates
- Generic corporate imagery

---

# 8. Hero Philosophy

Hero is not a marketing banner.

Hero is:

- Cinematic visual experience
- Brand impression engine
- Curiosity generator
- Storytelling opener

Requirements:

- Minimal text
- Visual-first experience
- Scroll-driven transformation
- First 100vh–200vh may be used as a cinematic sequence

---

# 9. Higgsfield Strategy

Higgsfield is NOT the primary image generator.

Primary usage:

- Motion
- Animation
- Scene enhancement
- Scroll storytelling
- Cinematic transitions

Visual assets may be created manually or with other tools first.

---

# 10. Portfolio Rules

Portfolio must support:

- Problem
- Solution
- Technology
- Outcome

Portfolio content will be managed through CMS.

All projects should be displayable.

---

# 11. Trust Building Rules

Partners and clients are critical trust assets.

The platform must support showcasing:

- Clients
- Partners
- Success Stories
- Case Studies

Current partner assets exist in:

src/assets/partiners/

---

# 12. CMS Rules

CMS must allow management of:

- Pages
- Services
- Portfolio
- Partners
- Blog
- Careers
- Contact Information
- Site Settings
- Visual Assets

Avoid hardcoded content whenever possible.

---

# 13. Lead Management Rules

Contact submissions must be stored and managed.

Required features:

- Status Tracking
- Search
- Filtering
- Inquiry Type
- Lead History
- Follow-Up Tracking

---

# 14. Role-Based Access

Architecture must support:

- Admin
- Editor
- Content Manager

Additional roles may be added later.

---

# 15. Future Academy Protection

No decision may block future implementation of:

- Courses
- Students
- Progress Tracking
- Certificates
- Payments
- Instructor Management

---

# 16. Performance Rules

Performance is more important than visual effects.

Animations must never significantly harm:

- SEO
- Accessibility
- Mobile Experience
- Core Web Vitals

---

# 17. Decision Rules

Never assume missing requirements.

Unknown requirements must be marked:

STATUS: PENDING DECISION

Do not invent business requirements.

---

# 18. Documentation Rules

Major decisions must be documented.

Project memory must remain updated.

When uncertain:
Ask first.
Do not guess.

---

# 19. Assets Rules

Official assets location:

src/assets/

Current logo:

src/assets/logo.svg

Do not assume additional logo variants exist.

---

# 20. Working Methodology

Always follow:

1. Analyze
2. Discuss
3. Approve
4. Plan
5. Execute
6. Review
7. Document

Never skip steps.