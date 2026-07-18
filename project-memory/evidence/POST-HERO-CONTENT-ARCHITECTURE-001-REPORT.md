# POST-HERO-CONTENT-ARCHITECTURE-001 REPORT

**Date:** 2026-07-09  
**Status:** INVESTIGATION — No implementation yet  
**Context:** Hero system locked to KF05→KF06. Now defining the homepage architecture that follows the hero.

---

## Business Goals Mapping

| Business Goal | Homepage Role | Priority |
|---|---|---|
| Build trust quickly | Hero impression + Foundation + Partners + Case Studies | Critical |
| Communicate capabilities | Services + Industries + AI & Automation | Critical |
| Showcase expertise | Case Studies + Insights/Blog | High |
| Generate qualified leads | CTAs throughout + Contact section | Critical |
| Support future academy | Architecture that can add Academy/ Courses without redesign | High |
| Appeal to enterprise | Credibility signals, outcomes, scale | High |
| Appeal to academic partners | Trust, partnership language, education-ready tone | High |

The homepage must answer three questions within the first 3 scrolls:
1. **What is SidrahSoft?** (Foundation + Services)
2. **Can we trust them?** (Partners + Case Studies)
3. **How do we work with them?** (CTAs + Contact)

---

## User Journey

### Primary Journey: Enterprise / Academic Decision-Maker
```
Hero (curiosity) → Foundation (positioning) → Services (capabilities)
→ Case Studies (proof) → Partners (trust) → CTA (contact / inquiry)
```

### Secondary Journey: SME / General Prospect
```
Hero → Foundation → Services → Industries → AI & Automation → CTA
```

### Future Journey: Student / Instructor
```
Hero → Foundation → Academy teaser (future) → Courses → Contact
```

### Mobile Journey
The mobile flow should mirror desktop but compress horizontal grids into vertical stacks. Trust signals must appear early because mobile users scroll faster and bounce sooner.

---

## Recommended Homepage Flow

1. **Hero** — cinematic, no text, locked KF05→KF06 (existing)
2. **Foundation** — single-line positioning + brand promise
3. **Services Overview** — 5 core capabilities (Web, Mobile, ERP, AI, Automation)
4. **Industries / Solutions** — verticals including Education, Enterprise, SMEs
5. **AI & Automation** — differentiated capability showcase
6. **Partners & Trust** — universities, academic partners, technology partners
7. **Case Studies** — 3 project highlights with outcome focus
8. **Insights / Blog** — 3 latest articles for SEO and credibility
9. **Careers / Culture** — compact, optional, future-ready
10. **Contact + Final CTA** — lead capture form + direct contact

---

## Section Inventory

| # | Section | Priority | Position | Lead Gen Role |
|---|---|---|---|---|
| 1 | Hero | Critical | 1 | Curiosity + brand impression |
| 2 | Foundation | Critical | 2 | Positioning |
| 3 | Services | Critical | 3 | Capability matching |
| 4 | Industries | High | 4 | Relevance |
| 5 | AI & Automation | High | 5 | Differentiation |
| 6 | Partners & Trust | High | 6 | Trust |
| 7 | Case Studies | High | 7 | Proof |
| 8 | Insights / Blog | Medium | 8 | SEO + nurture |
| 9 | Careers | Low | 9 | Culture / future hiring |
| 10 | Contact | Critical | 10 | Lead capture |

---

## Foundation Section

- **Purpose:** Immediately translate the cinematic hero into business meaning. State what SidrahSoft does and who it serves.
- **Business Value:** Sets positioning, reduces ambiguity, primes the visitor for service evaluation.
- **User Value:** Answers "What is this company?" in one glance.
- **Priority Level:** Critical
- **Recommended Position:** Directly after hero (currently exists as `.foundation-section`)
- **Recommended Content:**
  - Headline: "Technology partner for academic institutions and enterprise transformation."
  - Subhead: "Custom software, ERP, AI, and automation — built for scale and future growth."
  - No CTA here; keep it clean and transitional.

---

## Services Section

- **Purpose:** Present the five core service lines clearly.
- **Business Value:** Qualifies visitors by capability match; enables lead routing.
- **User Value:** Helps prospects self-identify which service fits their need.
- **Priority Level:** Critical
- **Recommended Position:** 3rd section, after Foundation
- **Recommended Content:**
  - Cards: Web Development, Mobile Applications, ERP Solutions, AI Solutions, Automation
  - Each card: icon + title + 1-sentence description + optional "Learn more" link
- **Lead Gen Role:** Service-level CTAs can route to specialized contact forms or service pages.

---

## Industries / Solutions Section

- **Purpose:** Show that SidrahSoft understands context-specific problems.
- **Business Value:** Increases relevance for enterprise and academic buyers; supports SEO long-tail keywords.
- **User Value:** Visitors see their own industry represented.
- **Priority Level:** High
- **Recommended Position:** 4th section, after Services
- **Recommended Verticals:**
  - Education & Universities
  - Enterprise & SMEs
  - Government & Public Sector
  - Healthcare (optional future)
- **Lead Gen Role:** Industry-specific landing pages can be linked from each card.

---

## AI & Automation Section

- **Purpose:** Differentiate SidrahSoft from general software shops by highlighting AI and automation expertise.
- **Business Value:** Positions the company for higher-margin services; aligns with "Futuristic AI" brand layer.
- **User Value:** Shows modern, forward-looking capability.
- **Priority Level:** High
- **Recommended Position:** 5th section
- **Recommended Content:**
  - Headline: "Intelligent systems that reduce cost and increase speed."
  - 3 sub-capabilities: Process Automation, AI Integration, Data Intelligence
  - Optional: visual abstraction (no generated stock)
- **Lead Gen Role:** Dedicated AI consultation CTA.

---

## Partners & Trust Section

- **Purpose:** Build credibility through association.
- **Business Value:** Reduces perceived risk for enterprise and academic buyers.
- **User Value:** Social proof and trust signals.
- **Priority Level:** High
- **Recommended Position:** 6th section, after AI & Automation
- **Recommended Content:**
  - University / academic partner logos
  - Enterprise client logos (if available and approved for display)
  - Technology / platform partner logos
- **Important:** Do not display logos without usage rights. Use placeholders if rights are pending.
- **Lead Gen Role:** Reinforces trust before the final CTA.

---

## Case Studies Section

- **Purpose:** Prove capability with real outcomes.
- **Business Value:** Strongest conversion driver after trust signals.
- **User Value:** Shows problem → solution → outcome in a concrete format.
- **Priority Level:** High
- **Recommended Position:** 7th section
- **Recommended Content:**
  - 3 featured case studies
  - Each: client type, problem, solution, technology, outcome
  - Link to full Portfolio page
- **Lead Gen Role:** "Read case study" or "Discuss a similar project" CTA per card.

---

## Insights / Blog Section

- **Purpose:** Demonstrate thought leadership and support SEO.
- **Business Value:** Long-term organic traffic; nurture repeat visitors.
- **User Value:** Educational, decision-support content.
- **Priority Level:** Medium
- **Recommended Position:** 8th section
- **Recommended Content:**
  - 3 latest articles with title, date, category
  - Link to Blog / Insights page
- **SEO Considerations:**
  - Use structured data (Article schema)
  - Optimize titles for search intent
  - Ensure each article has a canonical URL

---

## Careers Section

- **Purpose:** Support hiring and culture positioning.
- **Business Value:** Attracts talent; signals company growth and health.
- **User Value:** Shows SidrahSoft is an active, growing organization.
- **Priority Level:** Low for MVP
- **Recommended Position:** 9th section, compact
- **Recommended Content:**
  - Short headline: "Join the team building the future digital ecosystem."
  - Link to Careers page
- **Future-proofing:** Can expand when hiring becomes active.

---

## Contact Section

- **Purpose:** Convert interest into leads.
- **Business Value:** Primary lead generation mechanism.
- **User Value:** Clear, low-friction way to start a conversation.
- **Priority Level:** Critical
- **Recommended Position:** 10th section, final
- **Recommended Content:**
  - Headline: "Start your project."
  - Contact form fields: Name, Email, Organization, Service interest, Message
  - Direct email / phone / location
  - Privacy note near form
- **Lead Gen Role:** Main conversion point. Form submissions go to lead management system.

---

## CTA Strategy

| Location | CTA Type | Purpose |
|---|---|---|
| After Foundation | "Explore services" | Soft scroll to Services |
| After Services | "Discuss your project" | Hard scroll to Contact |
| After Case Studies | "See similar results" | Link to Portfolio page |
| After Partners | "Become a partner" | Contact form with pre-selected interest |
| Contact section | "Send inquiry" | Form submit |
| Sticky nav (future) | "Contact us" | Always accessible |

**Rules:**
- No CTAs inside the hero.
- Use progressive commitment: soft CTAs early, hard CTAs after trust is built.
- All CTAs lead to measurable actions (scroll, link, form).

---

## SEO Considerations

- **One H1 per page:** Foundation headline should be the only H1.
- **Meta title / description:** Include services + academic + enterprise keywords.
- **Semantic HTML:** Use `<section>` with clear headings.
- **Structured data:** Organization, Article (for blog), and BreadcrumbList schemas.
- **Performance:** Maintain hero performance (121 frames, linear mapping). Lazy-load below-fold images.
- **Accessibility:** Ensure all CTAs and forms are keyboard-navigable and screen-reader friendly.
- **Internal linking:** Link to Services, Portfolio, Partners, Blog, Contact pages.
- **Future content:** Blog section will drive long-tail SEO over time.

---

## Mobile Flow

- **Hero:** Sticky canvas works the same; height is `200vh`.
- **Foundation:** Keep text short; ensure readability over dark background.
- **Services / Industries:** Stack cards vertically; 1-column layout.
- **Partners:** Use horizontal scrollable logo strip or 2-column grid.
- **Case Studies:** Single card per row; larger tap targets.
- **Contact:** Form fields full-width, large inputs, easy submit.
- **CTAs:** Keep visible but not intrusive. Consider a sticky bottom "Contact" button if nav is added.
- **Performance:** Reduce image weight below hero; use `loading="lazy"`.

---

## Scalability & Future Academy Support

| Future Need | Homepage Preparation |
|---|---|
| Academy launch | Add "Academy" teaser section between Partners and Insights; link to future `/academy` page |
| Courses | Add "Featured Courses" section without redesigning the page flow |
| Student accounts | No homepage change needed; handled in portal |
| Certifications | Mention in Academy teaser |
| Careers growth | Expand Careers section into a dedicated page; keep homepage compact |
| New services | Add service card to Services section; no structural change |
| New industries | Add industry card to Industries section |

**Architecture Principle:** Each homepage section should be a self-contained component. Adding or removing a section must not require redesigning adjacent sections.

---

## Final Recommended Homepage Architecture

```
1. Hero (CinematicHero — locked, no text, no buttons)
2. Foundation Section
   - Positioning headline + subhead
3. Services Section
   - Web, Mobile, ERP, AI, Automation cards
4. Industries / Solutions Section
   - Education, Enterprise, SMEs, Government
5. AI & Automation Section
   - Differentiated capability spotlight
6. Partners & Trust Section
   - Academic + enterprise + technology partners
7. Case Studies Section
   - 3 outcome-focused project highlights
8. Insights / Blog Section
   - 3 latest articles
9. Careers Section (compact)
   - Culture + hiring link
10. Contact Section
    - Lead form + direct contact info
```

This architecture supports:
- **Enterprise credibility** through Services, Industries, and Case Studies
- **Academic trust** through Foundation tone, Education vertical, and Partners
- **Lead generation** through progressive CTAs and a final contact form
- **Future academy expansion** through a pluggable section model
- **SEO** through semantic structure and a content-driven blog section
- **Mobile experience** through vertical stacking and lightweight assets
- **Scalability** through independent, modular sections

---

## Next Recommended Steps

1. **Approve this homepage architecture** before any design or implementation.
2. Define **primary navigation** based on this flow.
3. Decide on **partner / client logo usage rights** before designing the Partners section.
4. Gather **3 initial case studies** for the Case Studies section.
5. Prepare **blog content strategy** for the Insights section.
6. When ready, implement sections one by one as independent components in `src/components/sections/`.
