# SkipTheLine — CTO Assessment Project

## What This Is
I am evaluating a potential CTO role at SkipTheLine, a pre-seed startup building a real-time, crowd-powered wait time app (think "Waze for lines"). I was brought in by a friend/co-founder and have signed an NDA. My job is to assess the existing Bolt prototype, ask the right questions, and determine how to build this properly.

## The Company
- **Product:** Real-time crowdsourced wait times for restaurants, barbershops, DMVs, attractions, nightclubs, dayclubs, etc.
- **Founder:** Jason Mizrachi — iHeartMedia executive, 30+ years in media/partnerships
- **Stage:** Pre-seed, raising $1MM (SAFE or convertible note)
- **Target launch cities:** Miami → NYC → LA
- **Revenue model:** B2C freemium ($3.99/mo) + B2B SaaS ($29-199/mo), initially 80% B2B
- **Comparable:** Waze (for navigation), but for physical wait times
- **Exit targets:** Google Maps, Yelp, DoorDash/Uber, public sector API licensing

## The Existing Prototype
Built in Bolt.new. Tech stack:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Package name internally:** "waitwise" (branding not locked in code)
- **Components:** 30+ UI components built — good UX structure
- **Auth:** Firebase in deps but NOT configured — no real auth works
- **Backend:** Supabase in deps but NOT integrated — no real backend
- **Data:** 100% mock data from `mockData.ts` — nothing is live
- **Maps:** Google Maps API types included but not connected
- **Mobile:** This is a web app with PWA capability — NOT a native iOS/Android app
- **Payments:** Not built at all
- **SMB Dashboard:** Not built (this is their primary revenue product)
- **Real-time:** Simulated, not actual

## Critical Gaps (What Needs to Be Built)
1. Real backend — connect Supabase or Firebase, pick one and consolidate
2. Real auth — Firebase Google Sign-In needs actual config
3. Real wait time data engine with time-decay weighting + fraud detection
4. Native mobile app — React Native / Expo or commit to PWA strategy
5. SMB business dashboard (B2B product = 80% of early revenue)
6. Payment processing — Stripe integration
7. Gamification system — SkipPoints, leaderboards, badges (critical for cold-start)
8. Cold-start data strategy — how to seed wait times before users exist

## Business / Location Data Layer (How It Works)

Three-source approach for populating businesses:

**1. Google Places API (primary seed source)**
- Query Google Places API by category + city at launch to auto-import all relevant businesses
- Returns: name, address, coordinates, category, hours, phone, photos
- Used to seed Miami database before launch — thousands of businesses imported via script
- Google Popular Times data usable as wait time fallback while crowdsourced data builds up
- Cost: charged per API call — needs to be budgeted

**2. Business Self-Registration (B2B layer)**
- Business owner finds their listing (already in DB from Google import) and claims it
- Verifies ownership, manages profile, optionally manages own queue data
- This is the SMB subscriber product — paying tier unlocks dashboard and analytics

**3. User-Submitted Businesses (fallback + growth)**
- If a user tries to report a wait time for a business not in the database, they can add it
- Simple form: name, category, address
- Goes into a review/approval queue before going live
- Critical for catching new businesses, pop-ups, and anything Google Places missed
- Also drives user investment in the platform — they built part of it

**Business categories confirmed:**
Restaurants, barbershops, DMVs, attractions, landmarks, nightclubs, dayclubs, healthcare, retail, grocery, entertainment, government offices

**Nightclub/dayclub specific data fields needed (not in current model):**
- Entry type: general / VIP / guest list
- Day vs. night flag
- Event context (special event, performer, theme night)
- This makes wait data significantly more useful and differentiated

**How wait times attach to businesses:**
Every business has a unique ID in the database. A report stores: business_id + wait_time + report_type + user_id + timestamp + user_coordinates. The real-time engine aggregates recent reports per business ID and calculates the current displayed wait time.

## Key Strategic Questions for the Team
- Web PWA vs. native mobile (React Native/Expo) — biggest architectural decision
- Cold-start problem: how do we get initial data in Miami before users?
- Gamification depth at launch vs. later
- Map-first vs. list-first default experience
- Firebase + Supabase overlap — which do we consolidate on?
- Who owns the existing code IP? (contracted dev team mentioned in deck)
- What has the contracted mobile dev team actually delivered?
- What does $300K product dev budget cover?

## My Role / Positioning
- Coming in as potential CTO / Founding Engineer
- Need to establish myself as a strategic technical leader, not just a dev
- Thinking in terms of: architecture, scalability, cost, user growth, gamification
- Next step: send assessment email, then live call with Jason's team

## Assessment Email — Key Decisions & Framing

The first deliverable is an assessment email to Jason's team. Final draft saved in `assessment-email.md`. Key principles:

- **Tone:** Confident but humble — here to help, not critique. Collaborative, not robotic. Warm but not over-the-top.
- **Intro:** Keep high-level and concise — one or two sentences max before getting into substance
- **Positioning:** CTO-level strategic thinker, not just a developer doing an audit
- **Depth:** Stay high-level — the email establishes you as the person who should write the PRD, not the PRD itself
- **Section naming:** Reads like a collaborative assessment, not a report card — "Initial Assessment", "A Few Thoughts on the Experience", "Cost Considerations", "A Few Things I'd Love to Align On"
- **UI/UX:** One sentence only — tease that you have thoughts that could elevate the experience, save it for the call. Don't detail it.
- **Google Maps:** Treat as a product decision point, not just a cost line — Places API for business seeding, Popular Times as cold-start fallback
- **Cold-start / Day one data:** Frame as "how do we make Miami feel alive before users are reporting" — not a cold technical term
- **Gamification:** Keep high level — product only works if users are motivated to report, want to understand priority before scoping. Don't mention SkipPoints by name.
- **Auth:** High level only — authentication approach is accounted for, worth aligning on early as it touches onboarding and B2B
- **Wait time definition:** Frame as a user perspective question — is it what the hostess told them, what they personally experienced, door to door? Foundational to trust in the data.
- **Wait time engine:** Explain clearly that current wait times are simulated — real engine needs to weigh reports intelligently, filter bad data, surface trustworthy numbers
- **Analytics & instrumentation:** Flag as something to bake in early — report frequency, accuracy, engagement, drop-off
- **Security & data privacy:** Flag as top of mind — collecting real-time location data at scale, handle responsibly from the start
- **Cost table:** Two columns — Launch (0–10K users) and Scale (100K+ users). Noted as approximate estimated numbers.
- **SMB Dashboard:** Removed from email — too detailed for first communication
- **Questions to ask:** Role/scope clarity, wait time definition, gamification priority, day one data strategy, user research/validation, MVP timeline
- **Removed questions:** Contracted dev team deliverables, IP ownership, Firebase vs. Supabase, budget breakdown, GTM for Miami, team composition, fundraise status (too tactical or internal for first email)

## Innovation / Product Vision Notes
- The deck's Waze comparison is apt — Waze succeeded because of gamification + real-time data loop
- SkipPoints / leaderboards / reporter reputation are the flywheel — must be prioritized
- Map-first experience creates a sense of live activity (consider making this the default)
- "Trending Now" banner (already in prototype) is good — lean into this
- Live activity feed ("Sarah just reported 8min wait at Chipotle") would drive engagement
- Business perks for top reporters in their area = powerful differentiator
- Cold-start wedge: consider Google Popular Times API as fallback data while crowdsourced builds

## Event Tagging — Build Logic
Event context should be a first-class field on every business, not an afterthought:
- Every business can have an active event attached: name, type, start/end time, expected crowd impact
- Examples: "Art Basel week," "Ultra weekend," "Heat game night," "Spring Break," special performer, theme night
- Wait time predictions factor in event context — a venue during Art Basel behaves differently than a normal Tuesday
- Events can be system-generated (pulled from a public events API or manually added by admin) or business-submitted (SMB dashboard feature)
- User-reported events: if enough users tag the same context, it surfaces as a confirmed event
- Map pins and listing cards display active event badge so users understand why wait times are elevated
- Nightclub/dayclub entry type fields (general/VIP/guest list + day/night flag) already support this — event tagging extends the same logic across all categories
- Data model implication: `events` table with business_id + event_name + event_type + start_time + end_time + crowd_multiplier_estimate

## Competitive Analysis — Google Maps & Waze

### Google Maps — Reverse Engineered

**Ideal Customers (3 types):**
1. Daily commuter — habitual, not emotional loyalty. Uses it every day without thinking.
2. Traveler / explorer — high intent, high engagement. Needs discovery in unfamiliar cities.
3. Local business finder — "coffee near me." Destination-driven, short sessions, high commercial intent.

**Core problem solved:** Reducing friction and anxiety of getting somewhere unfamiliar. Answers: "Where is it, how do I get there, will I get there on time?" Everything else answers the follow-up: "Is it worth going?"

**Gaps revealed by reviews:**
- Data accuracy at the micro level — great at macro navigation, street-level ground truth breaks down
- No passive ambient awareness — requires intent to search. Waze tells you what's happening before you ask.
- Loyalty without delight — people use it because it's best available, not because they love it. No emotional hook, no community, no sense of contribution.

**The gap Google Maps leaves wide open:**
> Real-time, human-verified, crowd-powered conditions at the destination — not just how to get there, but whether it's worth going right now.

Google Maps tells you a restaurant has a 4.2 rating and is open until 10pm. It cannot tell you there's currently a 45-minute wait because a Heat game just let out. That's SkipTheLine's entire value proposition — a gap Google has the infrastructure to fill but has consciously not prioritized.

---

### Waze — Reverse Engineered

**Ideal Customers (3 types):**
1. Daily commuter / road warrior — uses Waze as passive co-pilot, auto-launches when they get in the car. Core loyal user.
2. Frequent traveler — drives unfamiliar cities constantly. Crowd-sourced local knowledge makes every city feel like home turf.
3. Anxiety-driven driver — optimizing for predictability and control, not speed. "No surprises" is the emotional job.

**Core problem solved:** Eliminating uncertainty and anxiety about what's ahead on the road. Not navigation — no surprises. "I want to feel like I have eyes on the road ahead, even around the corner I haven't turned yet."

**Key review insights:**
- "I use it even when I don't need directions" — ambient intelligence working perfectly. It's a live environmental sensor, not a navigation tool.
- "I have it set up so it automatically comes up when I get in the car" — habitual, automatic, always-on. This is what PMF looks like for an ambient app.
- 7-year user still frustrated with UX friction at edge cases — users can't leave because nothing else does what Waze does, but not fully satisfied.

**The three gaps Waze leaves open:**
1. **Waze stops at the car door** — zero awareness of what happens after you arrive. Is it packed? Is there a line? That handoff moment — car to destination — is exactly where SkipTheLine picks up.
2. **Crowd intelligence without a community** — reports disappear into an algorithm. No reputation, no leaderboard, no identity. Users love what they receive, not what they give. Contribution loop is purely transactional. SkipTheLine's gamification (SkipPoints, leaderboards, reporter reputation) is the thing Waze never built.
3. **No pre-trip intelligence** — activates when you're in the car with a destination. Doesn't help you decide whether to go, when to go, or where to go instead.

---

### The Master Insight — How Both Analyses Connect

| | Google Maps | Waze | SkipTheLine |
|--|-------------|------|-------------|
| **Domain** | Where + how to get there | What's on the road | What's waiting at the destination |
| **Intelligence** | Reactive search | Ambient (driving only) | Ambient (pre-trip + arrival) |
| **Community** | Reviews (static) | Reports (anonymous) | Reports (identity + reputation) |
| **Loyalty driver** | Utility | No surprises | Community + gamification |
| **Stops working when** | You arrive | You park | Never — it's about the destination |

**The gap neither fills:**
> Real-time, crowd-powered intelligence about what's happening at the destination, before you leave, with a motivated community that makes the data better over time.

---

### The Stack Mental Model

**Google Maps = the road layer**
Infrastructure. Tiles, routing, Places data, business seeding. Rented the same way Uber rents it — a utility, not the product.

**SkipTheLine = the destination intelligence layer on top**
The live pulse of the city. What's happening at every pin on that map right now.

- A pin Google Maps shows as "open" → SkipTheLine shows as "45 min wait, spiking"
- A pin Google Maps shows with a 4.2 rating → SkipTheLine shows as "unusually quiet right now, go now"
- A pin Google Maps has no real-time data for → SkipTheLine shows "Art Basel crowd, reported 8 min ago"

Google Maps made the map. SkipTheLine makes it breathe.

**The Waze parallel:**

| Layer | Waze | SkipTheLine |
|-------|------|-------------|
| Base map | Google Maps tiles | Google Maps tiles |
| Crowd intelligence | Roads and traffic | Destinations and wait times |
| Ambient awareness | What's ahead on your drive | What's waiting when you arrive |
| Community flywheel | Hazard reporters | Wait time reporters + SkipPoints |
| Monetization | Ads | B2C freemium + B2B SMB dashboard |

Waze didn't replace Google Maps. It layered crowd intelligence on top and became indispensable to a high-loyalty user base. That's the exact playbook.

**The one-line pitch:**
> "Google Maps shows you what's there. Waze shows you what's on the road. SkipTheLine shows you what's waiting when you arrive — powered by the same crowd intelligence model that made Waze the most loyal navigation app ever built."

---

### Ambient Intelligence — Reactive vs. Ambient

**Reactive** = you have to ask first. The app is a tool. You drive it. It waits for you.

**Ambient** = the app reads the environment and surfaces what matters before you ask. It's a co-pilot.

**What ambient looks like as product features:**
- Push notification at 6:45pm Friday: "Heads up — wait times in Wynwood are spiking. Best window to go is before 8pm."
- Home screen live city heatmap — no search required
- Home screen widget showing current wait at your three favorite spots
- Morning summary: "Your usual barbershop is slow right now — shorter wait than normal if you can go today"
- Passive location awareness: walk near a restaurant you've visited → app surfaces current wait without opening

**Why ambient wins strategically:**
- Changes relationship with app — not a utility you open occasionally, a co-pilot always in peripheral vision
- Changes the data flywheel — ambient creates reporting moments not tied to user intent. A user walking past a packed restaurant gets a nudge: "Looks busy near you — quick report?" Reactive apps never get this moment.
- Defensible moat — Google Maps could add wait times tomorrow. What they can't add is the behavioral layer — gamification, reporter reputation, community. Ambient intelligence only works if the underlying data is alive. That requires motivated contributors. That's the moat.

> Google Maps tells you how to get somewhere. SkipTheLine tells you whether it's worth leaving your couch.

## Maps Strategy

- **Base map:** Google Maps SDK (web + iOS + Android)
- **Tile provider:** Google Maps at launch — migrate to Mapbox at scale to reduce cost and gain full brand control
- **Business data:** Google Places API — seed Miami database via grid import script before launch
- **Navigation:** Deep link out to Google Maps or Apple Maps — do not build native navigation at pre-seed
- **Custom pins:** SVG markers generated dynamically per business, color-coded by wait level
- **Static maps:** Use Static Maps API ($2/1K) for business cards and list views — not interactive maps
- **Pin color language:** Gray (no data) → Green (0–10 min) → Orange (11–25 min) → Red (26–45 min) → Dark red (45+ min)
- **Pulsing pin:** Fresh report < 5 min old gets a pulse ring animation — signals live data to users
- **Marker clustering:** Clusterer library groups dense pins when zoomed out
- **Map style:** Dark/muted custom style so colored wait-time pins are the primary visual focus
- **Provider selection:** Force Google on all devices (not PROVIDER_DEFAULT) — consistent brand experience
- **Photo strategy:** Store photo_reference at import, display Google photos at launch, migrate to business-uploaded assets via SMB dashboard over time

## Ambient Intelligence & Nudge Strategy

### Location Permission Approach
- **Phase 1:** "While Using" location only — no Always permission required
- **Rationale:** Build user trust first, earn Always permission later after they've gotten value
- Graceful degradation — manual reporting still works fully without any ambient features

### Nudge Type 1 — Arrival Nudge (Priority 1, Build First)
The highest-value nudge. Live data, zero historical lag.

**Trigger logic:**
- User detected within 80m of a venue
- Dwell > 3 minutes (eliminates walk-bys)
- First detection at this venue today (don't re-ask)

**Intent correlation signals (combine to reduce false positives):**
- Dwell > 8 min alone → nudge
- Dwell > 3 min + viewed venue in app today → nudge
- Dwell > 3 min + searched/navigated to venue → nudge
- Dwell < 3 min + no prior signals → no nudge

**The nudge UI — one tap maximum:**
```
🍽️ At Komodo?
How's the wait looking?

[No wait]  [~15m]  [~30m]  [45m+]  [Don't know yet]
```
"Don't know yet" signals user is present — ask again in 15 min.

**Follow-up at 15–20 min dwell:**
```
Quick update on that Komodo wait? 🍽️
[No wait]  [~15m]  [~30m]  [45m+]
```
This is still live data — user is physically at the venue.

### Nudge Type 2 — Wait Drop Proximity Alert
Delivers value before asking for anything. Builds trust.

**Three conditions must all be true:**
1. User is within 0.3 miles (walking) or 1.5 miles (driving)
2. Wait dropped >30% OR crossed a psychological threshold (e.g. 45→20 min)
3. User showed prior interest (viewed venue in last 4 hours, favorited, or reported before)

**The nudge UI:**
```
⚡ Wait just dropped at Komodo
45 min → 15 min
You're 6 min away

        [Open in Maps]

Reported by 3 people · 4 min ago
```
No question asked — pure value delivery. One action if they want to act.

**Delivery mechanism under While Using:**
- Silent push notification wakes app for 30 seconds
- App checks current location during that window
- If still in range → fire visible notification
- If out of range → discard silently

### Post-Visit Nudge (Phase 1 fallback — historical data, use carefully)
Fire 8–12 min after user leaves proximity zone. Schedule as local notification during While Using window — fires independently after app closes.

**Critical limitation:** Post-visit reports are historical, not live. Handle this honestly:
- Apply time decay: full weight 0–10 min, 70% at 20 min, 40% at 30 min, 15% at 45 min, expired after 45 min
- Display with honest timestamp: "Reported 28 min ago — may not reflect right now"
- Separate live vs. historical in UI — live reports get green LIVE badge, post-visit fall into "Recent visits" section
- Never display post-visit report as current wait time without decay applied

### Nudge Priority Order
```
1. Arrival nudge (live, immediate, highest data quality)
2. Pre-departure nudge at 15–20 min dwell (still live)
3. Post-visit nudge (historical, decayed, labeled honestly)
```

### The Full Session Loop
```
User opens app near venue (While Using active)
  → Wait drop alert fires if conditions met (in-app banner)
  → User views venue, taps Get Directions → hands off to Google Maps
  → App detects dwell > 3 min near venue
  → Arrival nudge fires: "At Komodo? How's the wait?"
  → User taps [~15m] → live report published → SkipPoints awarded
  → At 15–20 min dwell → follow-up nudge if "don't know yet" was tapped
  → User closes app → local notification scheduled for post-visit
  → Post-visit nudge fires → historical data collected with decay applied
```

### Phase 2 — BLE Beacons (B2B upsell)
- SMB subscribers receive beacon hardware ($15–30)
- Beacon detection works without Always location (Bluetooth permission only)
- Paying venues get automatic visit detection → more accurate data → better analytics
- Becomes a B2B sales feature: "subscribers get smarter, more accurate wait data"

### Phase 3 — Earn Always Permission
- After users have gotten clear value from Phase 1
- Frame as "Smart Reports" upgrade — opt-in, not required
- Full geofence + motion inference unlocked
- On-device inference only — raw signals never leave device
- Only result leaves phone: `{ venueId, waitMinutes, confidence }`

## Tools & Workflow
- Working in VS Code + Claude Code
- Bolt.new was used for initial prototype
- GitHub repo: JMiz0517/SkipTheLine2026 (private, under original owner)
- No code exported locally yet — working from screenshots + copy/paste from Bolt
