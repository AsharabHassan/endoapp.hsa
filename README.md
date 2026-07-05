# Endomax Lift Suitability Analyzer · Harley Street Aesthetics

A cinematic, standalone web-app lead magnet for **Harley Street Aesthetics** (London & Glasgow). A visitor takes a selfie, answers a short clinical quiz, and receives a personalised **Endomax Lift** suitability result. Qualified leads flow into **GoHighLevel** for AI sales-agent follow-up.

> The tool is a **cosmetic, informational pre-consultation guide — not a medical assessment or diagnosis.** Suitability is always confirmed in person.

This app is a rebranded replica of the MEDfacials Endolift analyzer, restyled in the Harley Street Aesthetics dark-gold luxury identity (near-black + metallic gold `#D4AF37`, Playfair Display + Montserrat) and re-pointed to the **Endomax Lift** treatment and HSA's London & Glasgow clinics.

## How it works

1. **Hero** → consent → **photo** (camera or upload) *or* a no-photo quiz-only path.
2. **On-device scan** — MediaPipe draws a 478-point face mesh as an "AI analysis" animation. The selfie never leaves the device for this step.
3. **Quiz** — one-at-a-time screening questions.
4. **Lead gate** — name/email/phone + a *separate* marketing-consent checkbox. Submitting fires the lead to GoHighLevel.
5. **Result** — an animated verdict (strong / good / consultation / explore-options), a personalised narrative, target areas, what-to-expect, and a booking CTA.

### The safety model
- `lib/scoring.ts` is the **authoritative** engine. Hard flags (pregnancy, infection, contraindications, severe laxity, etc.) override everything and route to a consultation. It never returns a flat "you don't qualify".
- **Claude Vision** (`claude-sonnet-4-6`) only writes the narrative *within* the bucket the scorer already chose — it can never escalate suitability.
- The uploaded image lives only in the `/api/analyze` request scope and is **never stored or logged**. If Claude is unavailable, a deterministic on-brand fallback narrative is used, so a user always gets a result.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind v4 · Motion · MediaPipe Tasks Vision · Anthropic SDK · Zustand · Vitest.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev                         # http://localhost:3000
```

The **quiz-only path works with no configuration.** The photo + Claude narrative and GoHighLevel delivery need the env vars below.

### Environment variables (`.env.local`)
| Var | Scope | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | server | Claude Vision narrative |
| `ANTHROPIC_MODEL` | server (optional) | defaults to `claude-sonnet-4-6` |
| `GHL_WEBHOOK_URL` | server | GoHighLevel inbound webhook |
| `NEXT_PUBLIC_BOOKING_URL` | public | booking link |
| `NEXT_PUBLIC_SITE_URL` | public | canonical / OG URL |

## Tests & build
```bash
npm test        # unit tests (scoring, GHL payload, quality gate, wizard store)
npm run build   # production build + type-check
```

## Deploy (Netlify)
The repo ships a `netlify.toml` that wires up the official **Next.js runtime** plugin (`@netlify/plugin-nextjs`), which turns the App Router pages and the Node API routes (`/api/analyze`, `/api/lead`, `/api/report`) into Netlify Functions automatically. Node is pinned to 22 (Next 16 needs ≥ 20.9).

1. Push to a Git repo and **Add new site → Import an existing project** in Netlify. The app is at the **repository root** — leave the base directory empty. Build command (`npm run build`) and publish dir (`.next`) are read from `netlify.toml`.
2. Set the env vars above under **Site configuration → Environment variables**. `NEXT_PUBLIC_*` vars must be present at build time; the server vars are read at request time by the functions.
3. Point your subdomain (e.g. `endomax.harleystreetaesthetic.co.uk`) at the site under **Domain management**.

Or from the CLI: `npm i -g netlify-cli && netlify init && netlify deploy --build --prod`.

### Deploy (Vercel — alternative)
1. Push to a Git repo and import into Vercel. The Next.js app is at the **repository root**, so leave **Root Directory** empty (`./`). Framework Preset should auto-detect as **Next.js**.
2. Set the env vars above in the Vercel project.
3. Point your subdomain at the deployment.

## Before go-live (HSA-specific)
- **Confirm the Endomax Lift contraindication / hard-flag copy** in `lib/scoring.ts` and the quiz questions — it carries medical-liability weight and should be signed off by a qualified practitioner.
- Replace the **placeholder testimonials** in `components/result/Testimonials.tsx` with HSA's own verified reviews.
- Add HSA's own **consented before/after pairs** to `/public/results` and populate `CASES` in `components/result/ResultsGallery.tsx` (it ships empty — do not reuse imagery from any other clinic).
- Confirm the **GoHighLevel webhook URL** and that the AI-agent sequence keys off the `endomax-<bucket>` tags and the `marketingConsent` field.
- Confirm the **booking URL** and clinic contact details in `lib/constants.ts`.
- A UK GDPR DPIA covering the selfie processing is recommended (the app minimises risk by never storing the image and keeping marketing consent separate).
