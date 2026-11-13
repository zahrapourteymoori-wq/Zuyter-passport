# ZUYTER Skin Passport — Project Reference & Working Agreement

> **Single source of truth for the Zuyter Skin Passport project.**  
> Status: planning / early prototype. Last reviewed: 2026-11-13.  
> Language of user-facing UI: Persian (fa-IR), RTL. Technical identifiers and code: English.

## 0. Non-negotiable working rules (approved by project owner)

1. **Keep decisions in Git.** Technical and nontechnical requirements, approved decisions, and changes must be recorded here (or linked decision records) in the same commit as the relevant change. Read this document before starting a new feature.
2. **Keep testing short, relevant and useful.** Run the smallest sensible checks for the changed behavior: build/typecheck + focused smoke test. Avoid lengthy, repetitive full-app regression on every small edit. Broader regression is reserved for cross-cutting changes, auth/security, database migrations, checkout/referrals, or releases.
3. **Change only what is necessary.** Identify the affected module, make a minimal patch, preserve existing APIs and flows, and do not rewrite unrelated code or regenerate the entire app. Explain any unavoidable cross-module change before implementing it.
4. **Preserve the approved V1 appearance.** The initial HTML prototype is the **visual baseline**, not a prompt to redesign. Preserve layout, colors, logo, Persian copy where approved, spacing, mobile structure, and already-approved question illustrations. Any visual deviation requires explicit approval.
5. **KISS and human-readable code.** Prefer simple, readable solutions over abstractions/frameworks with no clear benefit. Use meaningful identifiers, small focused components/functions, consistent formatting, and **helpful comments** describing intent, business rules and nonobvious behavior. Do not add pointless comments that repeat obvious syntax. Keep code maintainable by a human.

### Definition of done for future changes
- Scope stated in 1–3 sentences; change is limited to agreed files/components.
- Approved visual baseline and unrelated behavior preserved.
- One short focused test path performed and result reported truthfully.
- No secrets committed; database/API permissions checked where relevant.
- Decisions/behavior changes recorded in this file or a linked ADR.
- Git commit identifies the change; outstanding limitations disclosed.

## 1. Project purpose and audience

**Name:** پاسپورت پوستی زویتر / ZUYTER Skin Passport.  
**Brand:** ZUYTER, tagline “Shine With Us”.  
**Primary audiences:** direct skincare customers; representatives, teachers/trainers and skin consultants; company administrators.

Purpose: a free, mobile-first skincare consultation and passport experience that helps people discover a suitable Zuyter routine, buy products, ask questions and track progress. Referral-based distribution links clients and eligible repeat purchases with their introducing representative.

The web app should be reachable by a normal link or QR, and optionally installable as a **PWA** on Android and iOS. **Native mobile apps and Flutter are not required** at this stage.

## 2. Approved end-to-end customer flow

1. Customer opens the public landing page via QR/referral link, social media or the Zuyter website.
2. Customer answers the skincare questionnaire **without compulsory registration**. Do not ask them to declare their own skin type as the primary method: infer an initial pattern from behavioral questions.
3. Show an **immediate initial result and morning/evening routine** based on Zuyter's actual products and approved professional rules. This is not a clinical diagnosis and results must not be advertised as guaranteed.
4. Allow per-product **«مشاهده و خرید»** and **«خرید کامل روتین من»**. The latter creates a cart from suitable Zuyter products. Where sunscreen is recommended, do not falsely present a nonexistent Zuyter sunscreen SKU.
5. Offer **«سؤال بیشتری داری؟»** through three paths: (a) Zuyter specialist, (b) my referring consultant/trainer, (c) choose an approved Zuyter consultant. Do not promise a response-time SLA until staff capacity is verified.
6. Offer registration/sign-in **when saving the passport**, rather than blocking access to the first result. Logged-in users can return to their saved result and dashboard.
7. Customer dashboard: passport, answer review/reassessment, AM/PM routine, cart/shop, consultations, and **14-day / optionally 30-day** progress notes/photos.
8. Representative dashboard: personal referral link and **real scannable QR** in production, authorized clients, order/reorder status, permitted messages, earned/pending commissions/points, notifications.
9. Company admin panel: manage products, approved protocols, role assignments, referrals, orders/commissions, support and audit activities.
10. Consultant permissions and access to personal skin data require explicit privacy rules/consent.

## 3. Questionnaire baseline (subject to matching the originally approved visual question screens)

The integrated prototype currently contains **12 principal questions** plus **one conditional pigmentation-duration question** (if relevant). Topics:
1. Age band.
2. Main skin concerns (multi-select).
3. Daily oiliness pattern.
4. Sensation after cleansing.
5. Response to new skincare products.
6. Typical sensitivity symptoms.
7. Environmental/lifestyle triggers.
8. Acne pattern.
9. Pigmentation/spots.
9a. Duration of spots (conditional).
10. Existing routine.
11. Known prior ingredient/product sensitivity.
12. Other influential conditions/lifestyle factors.

**Important:** Some questionnaire wording and illustration selections were approved in earlier visual reviews. Those **original approved screens/assets must be checked against the V1 references before finalizing question UI**. The above is a functional baseline, not approval to replace prior illustrations or text.

## 4. Visual design freeze

- **Visual source of truth:** initial prototype named `Zuyter_Skin_Passport_App_Demo_v1.html` (an earlier user-approved HTML version; the uploaded copy may have a suffix such as “(2)”).
- Existing consolidated prototype: `ZUYTER_Skin_Passport_Complete_V1_Plus_Dashboards.html` — functional reference, not authority for changing V1 styling.
- The V1 uses a **deep-purple sidebar**, white/soft-lavender content cards, an illustrated passport cover, RTL Persian flow, and authentic brand logo embedded in the V1 HTML. Prefer actual user-approved assets; **never recreate/modify product packaging, labels or logo by AI approximation**.
- Brand guidance: primary purple `#68438F`, deep purple `#43285E`, soft lavender `#D8CBE7`, white `#FFFFFF`. Existing V1's precise CSS values are the visual implementation reference; do not replace all of them just to align to a palette.
- Persian UI: consistent RTL; correct Persian typography (brand corporate Persian Noora where licensed/available; Peyda commonly preferred for social designs; do not assume a licensed font file may be redistributed).
- Mobile-first experience; PWA installation available where supported. Support both Android and iOS with known platform differences.
- **Baseline preservation rule:** visually inspect the affected page/viewport against V1 only when changing UI; do not re-approve or redesign the whole application each time.

## 5. Approved technology decisions

| Concern | Decision |
|---|---|
| Frontend | **React + TypeScript + Vite** |
| Styling | Reuse and progressively componentize approved V1 HTML/CSS; avoid premature UI-library migration |
| PWA | Web App Manifest + service worker, responsive mobile web, optional home-screen installation |
| Backend & database | **Supabase PostgreSQL**, Auth, private Storage, Edge Functions where needed |
| Authentication | Supabase Auth; suitable Iranian-phone SMS integration requires provider/availability verification |
| Authorization | Least-privilege server-side checks and PostgreSQL **Row Level Security (RLS)** on exposed user tables |
| Store | Existing `https://zuyter.ir` WordPress site; verify actual WooCommerce/API setup before wiring checkout |
| AI/routine rules | Approved deterministic product/protocol eligibility first, AI for bounded explanations if implemented; never let an LLM invent products or unsafe claims |
| Code versioning | GitHub `zahrapourteymoori-wq/Zuyter-passport`, default branch `main` |
| Deployment | Vercel or Cloudflare Pages **not yet selected**; prospective subdomain `passport.zuyter.ir` **not yet configured** |
| Native apps | Out of scope; no Flutter required for approved PWA target |

### Supabase environment — verified 2026-11-13
- Project confirmed by owner as the correct one, despite its current display name not being “Zuyter”.
- Supabase project reference: `qfbnhemkbwrsqpdmmspc`.
- Current dashboard display name when checked: `zahrapourteymoori-wq's Project`.
- Region: `ap-northeast-2` (Seoul); project was `ACTIVE_HEALTHY`.
- The `public` schema had **zero tables** when checked. Database migrations and auth settings have **not yet been implemented**.
- Before collecting real photos and other sensitive skin information, confirm retention, privacy/consent and regulatory/geographic data-hosting choices. Region selection was not an intentional owner-approved decision.
- **Never commit** service-role keys, database passwords, tokens or personal customer data. Client uses only a publishable key and RLS; elevated keys remain server-side.

## 6. Data model (proposal, not yet created)

Initial domain entities:
- `profiles`: account profile (minimal personally identifiable data).
- `user_roles`: customer / consultant / representative / administrator, with explicit authorization.
- `skin_assessments`: questionnaire response snapshot, version and timestamps.
- `skin_profiles`: derived nonmedical skin-pattern assessment.
- `products`: verified Zuyter product catalog and WooCommerce mapping.
- `routines` and `routine_items`: morning/evening sequences and product rationales.
- `referrals`: persistent attribution between a customer and representative, with defined consent and policy.
- `orders`, `order_items`, `commissions`: synchronized, idempotent store events and eligibility ledger.
- `consultations`, `messages`: inquiries and authorized support conversations.
- `skin_followups`: day-14/day-30 observations and optional photos.
- `notifications`: event notifications.

Photo files go in a **private storage bucket**, served via short-lived signed access after permission checks. Keep sensitive data out of service-worker caches. Avoid exposing raw assessment/photos to representatives by default. Separate profiles/consents from commerce events.

### Roles and permissions, principle-level
- **Guest:** public questionnaire and immediate provisional routine, no stored account access.
- **Customer:** own passport, products, followups, questions and consent controls.
- **Representative / trainer:** own QR/referral records, authorized commerce summaries and allowed messages; no default access to clinical/sensitive photos.
- **Consultant:** only explicitly assigned/authorized customer consultations and consented data.
- **Admin:** authorized operational management with auditing and least privilege.
- Do not trust a client-supplied role, referral owner or commission amount. Enforce server/database rules.

## 7. WooCommerce, referral and commission rules

- A representative gets a unique referral identifier and QR; first acquisition should persist attribution according to the **owner-approved future attribution policy**.
- Subsequent purchases on the main WordPress store must be linked using reliable account identity and an authenticated server-side integration—not browser localStorage alone.
- Orders are sourced from WooCommerce authenticated webhooks/API, verified against replay/duplicates and state transitions. Commission ledger is recomputed or adjusted for cancellations/refunds, not blindly incremented.
- Notify the representative after eligible purchase events, while protecting customer privacy.
- **Still to approve:** referral conflict policy, ownership duration, commission percentages, payout period, eligibility thresholds, returns/refunds and representative notifications.

## 8. Product integrity and safety rules

Use **actual Zuyter product names, SKUs, verified images and official purchase links**, with no invented products or formula percentages. Examples from approved product information:
- 30 ml `10% Niacinamide + Caffeine` blemish/oily skin serum; also Zinc PCA. `https://zuyter.ir/product/acne-serum-oily-skin-zuyter/`
- 30 ml `Alpha Arbutin 2%` brightening/dark spot serum. `https://zuyter.ir/product/anti-dark-spot-brightening-serum-zuyter/`
- 30 ml eye serum; HA + collagen + caffeine + arnica. `https://zuyter.ir/product/anti-wrinkle-brightening-eye-serum-zuyter/`
- Hydrating/young-looking skin serum; plus appropriate oily/dry cleansers, toners and moisturizers.

Packaging integrity: serums are smallest; foams and creams comparable in scale; toner a little smaller. Never alter original product color, label, cap, shape or language in visuals. Exact catalog and composition rules must be verified against the official source before launch. Do not call a routine a medical prescription.

## 9. Testing and change management playbook

**Small UI/text change:** edit only responsible component/style, run typecheck/build, open affected screen at one mobile width, check RTL and matching V1. No full walkthrough.

**Questionnaire or scoring change:** test changed question, conditional follow-up and completion-to-dashboard once. Ensure answer persistence and nonmedical copy.

**Auth/RLS/Storage change:** test owner access and **one unauthorized-user/role denial**; security checks cannot be skipped merely to keep tests short.

**Checkout/referral change:** test a valid purchase event + repeated webhook + invalid/unauthorized event, verify ledger behavior. No live payment without an explicit rollout plan.

**Release:** short cross-role smoke test and build; security/advisor check for new Supabase tables; deploy from a traceable Git commit. Report what was and wasn't tested.

**Patch discipline:** avoid mass formatting, avoid hidden refactoring, keep diffs narrow; write a short commit message and note any decisions. If an architectural migration is required, split into reversible increments.

## 10. Current project state / known gaps

- Existing V1 and subsequent HTML demos are prototypes, **not a production frontend**.
- A merged HTML demo has been shared in chat; before migrating, **ensure the exact owner-approved V1 HTML and question illustrations are available as repository assets**. A link or description alone does not guarantee the approved originals are present in Git.
- Supabase is connected and accessible; no application schema, auth policies, production storage or back-end API was verified as implemented at the time of writing.
- The repo was reported empty at the start of this documentation commit.
- Real checkout, AI personalization, real scannable QR, representative payout, notifications, durable image storage and deployment remain to implement.
- Do not claim a prototype button makes a production integration work.

## 11. Outstanding decisions (must not be guessed)

1. Confirm exact V1 HTML, accepted questionnaire illustrations, official Zuyter logo and product images committed to repo.
2. Finalize privacy notice, age policy, photo consent, deletion/retention and data-hosting suitability.
3. Decide sign-in options, including workable Iranian SMS provider and account merge with WooCommerce.
4. Validate current WooCommerce installation and API/webhook access.
5. Approve referral attribution rules and commission economics.
6. Approve product eligibility/scoring and exceptions with Zuyter's qualified subject-matter expert.
7. Choose host/domain and decide whether to move Supabase region before production data exists.
8. Agree on acceptance criteria for initial public beta.

## 12. How to update this reference

For each decision-changing implementation: update the relevant section in the **same PR/commit**, identifying whether it is **Approved**, **Proposed**, or **Open**. If a topic grows too large, create `docs/decisions/NNNN-topic.md` and link it here. Do not silently override this reference; escalate conflicting requests for owner confirmation.
