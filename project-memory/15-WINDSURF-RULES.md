# 15 · Windsurf Development Rules

## 1. No Assumptions
Never assume missing requirements. If a requirement is unclear, mark it as `STATUS: PENDING DECISION` and ask for clarification.

## 2. Investigation Before Modification
Always inspect existing code, memory files, and documentation before making changes. Do not modify files you have not read.

## 3. Architecture Before Implementation
Do not write production code until the architecture is approved. Discuss and document major decisions before execution.

## 4. MVP First
Build the MVP scope first. Excluded features (LMS, payments, certificates, etc.) must not be implemented in this phase.

## 5. Performance Before Effects
Performance, SEO, accessibility, mobile experience, and Core Web Vitals take priority over visual effects.

## 6. Documentation Required
Major decisions must be documented. Update project memory when direction changes.

## 7. Approval Process Required
Do not implement major architectural, design, or business decisions without approval. Follow the working methodology: Analyze → Discuss → Approve → Plan → Execute → Review → Document.

## 8. Translation-Ready Architecture
No hardcoded UI text. Build English-only now, but structure must support future Arabic and RTL.

## 9. Future Academy Protection
No decision may block future courses, students, certificates, payments, instructors, or progress tracking.

## 10. Asset Discipline
- Do not modify assets in `src/assets/` unless explicitly approved.
- Do not assume additional logo variants exist.
- Prefer custom, abstract technology visuals over generic stock.

## 11. Role-Based Boundaries
Respect role boundaries in CMS and admin panel. Admin, Editor, and Content Manager permissions must be explicit.

## 12. Lead Management Integrity
Lead statuses, follow-up history, and inquiry types must be preserved accurately. Do not silently alter or discard lead data.

## 13. Cinematic Hero, Not Marketing Banner
The hero must remain a cinematic, visual-first experience. Do not overload it with CTAs, feature lists, or dense text.

## 14. Higgsfield as Motion Only
Use Higgsfield for motion, animation, and cinematic transitions — not as the primary image generator.

## 15. Quality Bar
Reject generic SaaS templates, generic stock photos, smiling office teams, and typical corporate imagery. Hold the visual identity standard.

## 16. No Blurry Scope
If a feature is not explicitly in the MVP or approved future roadmap, do not build it.

## 17. Review and Test Before Declare Done
Every change must be reviewed. Do not mark a task complete until verification is possible or documented.
