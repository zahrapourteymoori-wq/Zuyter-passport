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


## 13. Functional preview — 2026-11-13

- **Implemented:** Persian RTL React/Vite preview, guest questionnaire with conditional spot duration, versioned passport snapshots, email/password Auth, follow-up notes, consultation threads, role dashboards, consent-based referral registration and QR, and role change audit.
- **Visual baseline:** the preview uses draft wording and a temporary layout and PWA icon. The later source review in section 14 records the V1 HTML and available question screens found locally.
- **Provisional routine:** behavior-based, nonmedical and generic. Product eligibility, protocol review and verified catalog are prerequisites for product recommendations and routine checkout.
- **Preview hosting:** manually triggered GitHub Pages workflow, relative assets and hash routes. Offline storage covers the public shell. Configure the final site URL in Supabase Auth before testing signup redirects.
- **Data boundaries:** consultants receive assigned consultation text only. Representatives can see referral registrations for their own code. Role management and consultation routing are administrator-only. Photo collection awaits the owner’s consent and retention decisions.
- **AvalAI integration:** server-side Chat Completions with account verification, CORS allowlist, daily per-user quota and lexical retrieval of reviewed excerpts. The model selects an excerpt index. Displayed text is the approved excerpt and its source link. Model availability, official content and keys must be configured before enabling the service.
- **Open:** migration of V1 styling and verified questionnaire copy, approved product protocols, privacy/age/photo decisions, live WooCommerce and SMS credentials, attribution/commission rules, final Pages URL and device acceptance.

## 14. Source review and precedence — 2026-11-13

**Confirmed by owner:** use the original V1 HTML for approved layout, styling and embedded branding. Use the integrated HTML for the added feature and navigation reference. Use the question PNGs for the screens they cover. Use the product requirements PDF and this document for technical and product decisions, with conflicts recorded explicitly. Retain React, TypeScript, PWA and Supabase. Route AvalAI through the authenticated Edge Function and keep secrets out of Git.

| Source available locally | Review result | SHA-256 |
|---|---|---|
| Zuyter_Skin_Passport_App_Demo_v1.html | Visual baseline includes the embedded branding, landing page and responsive navigation. Both numbered copies match. | `53e3cb408b7a402c50fe823316760aebbfec4d065e9fab2ea091078b5ad99d8b` |
| ZUYTER_Skin_Passport_Complete_V1_Plus_Dashboards.html | Adds the questionnaire, routine, cart and sales views. Both numbered copies match. Treat demo business behavior as prototype evidence. | `717f6e40933867af1f64a3e246ff6944a5aa300ad85d27c85d96e4328cea46e7` |
| Zuyter_Skin_Passport_Question_Pages_PNG.zip | Eight complete screens: questions 6–12 and conditional 9a. Approved visual references for questions 1–5 have yet to be located. | `231337dec98dc51b97dc3349edc39cead45bdcb3ab03e83fa33596cb96168d3a` |
| Zuyter_Skin_Passport_Product_Requirements_FA.pdf | Fifteen-page v0.1 requirements draft found in Downloads. Both numbered copies match. | `49c4c96c2b60c511c6e3e9ed9fdc1d1adc0ca34c9a3d20745ccbf8d498898722` |

The separately attached transfer receipt is outside the project reference set. This review records source identities without importing the source files into the repository.

### Conflicts and release decisions

- **Entry flow:** section 2 approves a guest questionnaire and initial result before account creation. The PDF describes a post-purchase QR journey with consent and phone OTP near entry. The integrated HTML has a demo passport gate. Keep the approved guest path for the preview. Confirm how a separate verified post-purchase journey should work before adding one. Phone OTP still requires a provider decision.
- **Questionnaire:** PNG 6 uses one frequency answer and integrated HTML 6 uses multiple symptom selections. PNG 7 asks about frequency of reactivity and integrated HTML 7 asks for multiple triggers. PNG 10 offers multiple product categories and integrated HTML 10 asks for a single routine description. PNG 12 allows declining to answer a health-related question and integrated HTML 12 asks for multiple influencing factors. The current React preview has its own draft wording. Recreate the supplied screens as accessible controls using the ZIP as reference. Confirm screens 1–5, conditional behavior for 9a and data compatibility before changing stored questionnaire formats or routine rules.
- **Product and purchase rules:** the integrated demo derives its skin pattern from question 3 and includes a cart and sales view. The approved rules require professional review of eligibility, actual catalog items and verified checkout. The PDF also distinguishes self-reported from verified purchases and leaves storefront integration timing open.
- **Privacy and support:** the PDF describes optional private photos, separate marketing consent, scheduled follow-ups, scoped representative and expert access, and human escalation. The preview currently has manual follow-up notes, role-scoped consultations and a bounded AvalAI function. Agree on consent, retention, role access, notification provider and escalation before collecting photos, expanding data access or enabling automatic messaging.

**Next reversible implementation:** port the approved V1 shell and landing page in a focused React/CSS change, then check a mobile and desktop viewport against V1. Apply the supplied questionnaire screens as a separate change with a focused flow test. Source review precedes application changes.


## 15. Integrated preview and release decisions — 2026-11-13

- **Approved source precedence:** the latest owner brief supersedes the earlier PNG precedence in section 14. V1 remains the visual source. Integrated HTML controls questionnaire text, options and behavior, including questions 6 and 10. PNGs are supporting material. The V1 embedded wordmark and product artwork were ported as original assets. The PWA icons use the same wordmark. The two newly attached images were treated as supporting references since the brief specifies V1 branding.
- **Implemented:** V1 responsive shell and landing page, integrated quiz with conditional 9a and an immediate guest result, independently addressable dashboard sections, real catalog links, and versioned snapshots. The database accepts integrated-1 and preserves draft-1.
- **Routine and catalog:** verified product pages are available directly from the routine. The order of generic AM/PM steps remains provisional. Product-specific placements, frequency and contraindications await the approved professional protocol.
- **Chat:** the deployed function uses JWT verification and two reviewed catalog fact excerpts. It has a configurable model with a gpt-5.4-mini default, a Pages-origin default with environment override, and 15 provider calls per account per UTC day. It can return a fixed medical referral or insufficient-source answer without invoking the provider. Full protocol ingestion awaits approved material.
- **Commerce:** signed WooCommerce order snapshot receiver is ready for configuration. The service-only staging table rejects older snapshots on replay. Customer/representative mapping, refunds, commission rates, settlement and real order display require confirmed store credentials and commercial rules. No live webhook configured.
- **Release:** GitHub Pages uses a manually triggered workflow, hash routing and a public client key. Verify the final Pages redirect in Auth and install on Android and iOS. Supabase Security Advisor reported disabled leaked-password protection. Review that project setting before public rollout. Private skin photos and automatic reminders await consent and retention decisions.

## 16. Confirmed next-version changes — 2026-11-13

- **Typography:** the React app loads Vazirmatn weights 400, 500, 600 and 700 from the Google Fonts stylesheet. The V1 spacing, palette, logo and layout remain the design reference.
- **Phone Auth:** the client now validates Iranian mobile numbers, converts Persian and Arabic digits, emits +98 E.164 values, sends an OTP with Supabase Phone Auth and verifies it with verifyOtp. Email/password is no longer the primary screen. Existing email accounts require an owner-approved, verified phone-link migration before they are treated as migrated.
- **SMS architecture:** send-sms-hook verifies the signed Supabase Auth hook and calls a configurable national SMS pattern endpoint. SEND_SMS_HOOK_SECRET, MELIPAYAMAK_PATTERN_URL, MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD and MELIPAYAMAK_BODY_ID are server secrets. No provider secret is accepted by the browser or stored in the public database. A real paid send requires the owner to configure Supabase Auth's Send SMS Hook and confirm the provider endpoint and network path.
- **Admin RBAC:** is_super_admin, restricted role updates and non-secret SMS metadata are present in Supabase. Only a server-side owner action may set the first super admin. The UI never creates an administrator from ordinary registration.
- **Navigation:** guest and authenticated role menus are filtered by role. Direct private routes still require an authenticated session and the database query policies remain authoritative.
- **Open security action:** enable Supabase leaked-password protection before public release. Validate the actual national SMS endpoint from the deployed Edge Function region or place the provider call behind an approved Iran-hosted relay if the provider blocks the project region.
