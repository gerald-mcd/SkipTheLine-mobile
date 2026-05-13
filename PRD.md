# SkipTheLine — Product Requirements Document
### AI Creative Brief Edition · May 2026

> **How to use this document:** Paste this entire document as a prompt into any AI model or design tool (Claude, GPT-4o, v0, Lovable, Bolt, etc.) and instruct it to build a mobile app mockup or prototype. The intent is to give the model strong directional context — what the product *feels* like, what it *does*, and what problem it solves — without prescribing specific visuals, layouts, or component choices. Leave room for the model to surprise you.

---

## 1. What Is SkipTheLine?

SkipTheLine is a real-time, crowd-powered wait time app. Think Waze — but instead of traffic, it tells you how long the line is at any physical location before you get there.

The core loop is simple: users report wait times at the places around them. Those reports get aggregated in real time into a live, trustworthy number that the next person can act on. The more people report, the better the data gets. The better the data gets, the more people trust it. The more people trust it, the more they come back.

This is not a review app. It is not a reservation app. It is not a navigation app. It is a **live intelligence layer for the physical world.** The emotional promise to the user is: *you will never waste time standing in a line you didn't have to stand in.*

**Who uses it:**
- Someone deciding between two restaurants on a Friday night
- Someone trying to figure out if the DMV is worth going to right now
- Someone scoping the line at a nightclub before they commit to the Uber
- Someone at a barbershop deciding if they should come back in an hour

**Who pays for it:**
- Consumers via a freemium subscription (occasional users are free; power users pay for premium features)
- Businesses via a B2B SaaS dashboard that lets them manage their own queue data, see foot traffic analytics, and engage their customers — this is the primary revenue driver at launch

**Target launch markets:** Miami first, then New York City, then Los Angeles.

---

## 2. The Waze Analogy (and Why It Matters for the Product)

Waze didn't win because it had better maps. It won because it made reporting feel like a game and a contribution. Users tapped a button and felt like they were helping everyone else avoid a cop or a crash. That feedback loop — *report something, watch it affect the map, get rewarded for it* — is what created daily habitual use.

SkipTheLine needs the exact same thing. The data only works if people are reporting. People only report if it feels effortless, rewarding, and like they're part of something. The product design has to make reporting feel like a core part of the identity of using the app — not a chore, not a form, not an afterthought.

This is the product's flywheel and it should be felt in every interaction.

---

## 3. Core Screens & Feature Surface

### 3.1 Home / Map Screen
The map is the product. It is the first thing a user sees and it should immediately communicate that something is alive and happening right now. The map should not feel like a static Google Maps screenshot with dots on it. It should feel like a living city — reports coming in, pins updating, activity visible at a glance.

**What this screen needs to do:**
- Show wait time markers for nearby locations, color-coded by severity (short / moderate / long)
- Communicate real-time activity — the user should feel like other people are using this right now, in this city, near them
- Allow instant filtering by category (restaurants, nightlife, barbershops, government offices, healthcare, attractions, etc.)
- Surface a "trending near you" or "most active right now" layer — the equivalent of Waze's incident feed
- Include a live activity ticker or feed that shows recent reports from real users ("Marcus just reported 8 min at LA Barber — now")
- Make it unmistakably easy to submit a report — the report action should be a hero element on this screen, not buried
- Show the user's location in relation to everything else
- Display an active reporter count — how many people are contributing data nearby right now — this communicates trust and liveness

**The feel:** Opening this app should feel like turning on a radar. The city wakes up around you. You immediately feel oriented and informed. There should be a sense of energy, of things happening, of the crowd being with you.

---

### 3.2 List / Explore Screen
An alternative to the map for users who prefer a structured view or are browsing rather than navigating.

**What this screen needs to do:**
- Show a ranked or sorted list of nearby venues with their current wait times
- Allow filtering and sorting (by distance, wait time, category, trending activity)
- Surface event context where relevant — if a venue has elevated wait times because of a special event (a performer, a holiday weekend, a local festival), that context should be visible
- Show recency of data — users need to know if the wait time shown is from 2 minutes ago or 40 minutes ago; stale data erodes trust
- Allow favoriting / saving venues for quick access later

**The feel:** Fast, scannable, confident. You should be able to open this screen and make a decision in under ten seconds.

---

### 3.3 Report Flow
This is the most important interaction in the entire product. Everything the app is depends on people completing this flow accurately and repeatedly.

**What this screen needs to do:**
- Confirm the venue the user is reporting on (location-aware suggestion, easy to change)
- Capture the wait time in a way that feels fast and intuitive — not a text field, not a slider, something that feels native to mobile and takes two or three taps maximum
- Capture the *type* of wait — walk-in, reservation, VIP/guest list — because the same venue can have very different lines depending on how you're coming in
- For nightlife venues specifically: capture whether it's a general entry, VIP, or guest list situation, and flag whether it's a day or night event — this is differentiating data that no other product captures
- Allow optional event context tagging — if something specific is driving the crowd (a special event, a holiday, a performer), the user should be able to attach that context to their report
- Show the user what they're earning for this report — gamification reward preview before they submit, not after

**The feel:** Reporting should feel like a power move, not a form submission. It should take under 15 seconds. It should feel satisfying when you finish — like you just did something useful for the people around you. The reward (points, streak, badge) should feel like a natural part of completing the action, not a popup that appears afterward.

---

### 3.4 Venue Detail Screen
When a user taps a pin or a list item, they should land on a rich venue page.

**What this screen needs to do:**
- Show the current aggregated wait time prominently — this is the headline number
- Show wait time trend over time — is it getting better or worse right now?
- Show recent individual reports with timestamps and report type (walk-in vs. VIP, etc.)
- Show active event context if applicable — why is this place busy right now?
- Show business hours, category, distance
- Allow the user to report directly from this screen
- Allow favoriting
- For B2B subscribers: show enhanced business-managed data (managed queue, estimated wait by party size, etc.)

**The feel:** Authoritative but approachable. The user should leave this screen feeling like they have real intelligence, not just a number someone typed in.

---

### 3.5 Gamification / Profile Screen
This is the screen that closes the habit loop. It is what turns a one-time user into a daily reporter.

**What this screen needs to do:**
- Show the user's accumulated points (SkipPoints or equivalent — a currency that feels earned and meaningful)
- Show their reporting streak — consecutive days or weeks of contributing
- Show their rank or standing — local leaderboard, neighborhood rank, city rank
- Show badges or achievements earned for reporting behavior (first report, 10 reports at the same venue, reporting during a major event, etc.)
- Surface a leaderboard showing top reporters in the user's city or neighborhood — social proof that other people are competing and contributing
- Show unlocked perks or rewards — the ability to earn business-sponsored perks (a free drink at a venue you've reported on 10 times, priority access, etc.) is a long-term differentiator that should be teased here even at launch

**The feel:** This screen should feel like a game you're winning. It should give the user a sense of identity — *I'm one of the top reporters in Miami Beach* — and make them want to come back tomorrow to protect that standing. It should feel like a leaderboard in a sports app, not a loyalty card.

---

### 3.6 SMB Business Dashboard (Separate Product Surface)
This is not a consumer screen — it is a B2B product that business owners access, likely via web or a separate app view. It is the primary revenue driver at launch and deserves its own design treatment.

**What this screen needs to do:**
- Allow a verified business owner to view the live wait time being shown to users for their location
- Allow them to manually update or override the wait time if they have that information (managed queue mode)
- Show foot traffic trends — when is their venue busiest, how has wait time trended over the past week, what days drive the most reports
- Allow them to post an active event — if they have a special performer, a themed night, a holiday promotion — and attach it to their listing so users see the context
- Show customer engagement data — how many people viewed their listing, how many reports came in, how many users favorited them
- Allow basic profile management — hours, photos, category, contact

**The feel:** Clean, data-forward, professional. This is a tool a restaurant manager or club owner looks at before their shift. It should feel like a lightweight analytics dashboard, not a social media profile editor. The insight it surfaces should feel immediately actionable.

---

## 4. Data Architecture Concepts (for Context, Not Prescription)

The following are product-level truths the design should reflect — not technical specs, but things that shape how the UI needs to behave:

- **Wait times are aggregated from multiple reports.** The number shown is not a single user's input — it is a weighted average of recent reports, with more recent ones carrying more weight and outliers filtered out. The UI should communicate confidence and recency, not just a raw number.
- **Data goes stale.** A wait time from 45 minutes ago is not the same as one from 2 minutes ago. The interface should communicate staleness visually so users know when to trust the data and when to report.
- **Three sources populate venues:** automated import from Google Places, business self-registration, and user-submitted additions. The design doesn't need to expose this complexity — but it means the database is populated before users arrive, which matters for day-one experience.
- **Events change everything.** A venue during Art Basel week, a nightclub on New Year's Eve, a barbershop before homecoming — the wait time means something different in context. Event tagging is a first-class feature, not an add-on.
- **Cold start is solved by intent, not by waiting.** Before enough users are actively reporting, the product uses publicly available crowd data as a baseline to make the map feel alive from day one. The UI should never show an empty map.

---

## 5. UI/UX Direction — Immersive Experience Brief

> This section is the most important for generating mockups. Read it as an art direction brief, not a feature list.

### The Overarching Feeling
When someone opens SkipTheLine, they should feel like they just got access to something the crowd around them doesn't have. Like a cheat code for the city. Like they're seeing the city's nervous system in real time. The app should feel **alive, urgent, and intelligent** — not like a utility and not like a social network. It exists in its own category.

The experience should reward attention. The longer you look at the map, the more you notice — activity building near a venue, a pin shifting from green to yellow in real time, a live report rolling in on the ticker. The app should create a sense of situational awareness, the way a good radar or trading dashboard does.

### What the App Should Never Feel Like
- A static list of places with star ratings
- A form-heavy data entry tool
- A generic maps clone
- A social media feed
- Something that belongs in 2018

### Immersion Principles
**1. The world is the UI.**
The map isn't a feature inside the app — the map *is* the app. Everything else (search, filters, the venue list, the report button) floats on top of the world, not beside it. The user should always feel like they're looking at a live version of their city, not a database.

**2. Motion communicates life.**
Static UIs feel dead. The activity of other users — reports coming in, pins updating, the live feed scrolling — should be felt through subtle, purposeful motion. Not animation for animation's sake, but motion that tells a story: *something just happened here.*

**3. Reporting is the hero action.**
The single most important thing a user can do is submit a report. It should be the most visible, most satisfying, most frictionless interaction in the app. The button should feel magnetic. The flow should feel like it takes no effort. The reward preview should make submitting feel like scoring a point.

**4. Gamification is identity, not decoration.**
Points and badges are not sprinkled on top of the app — they are woven into how the app presents the user to themselves. Your points, your rank, your streak should be subtly visible throughout the experience (not just on a profile page), so the user always knows where they stand and what they're building toward.

**5. Trust is earned through data transparency.**
Users will only act on wait times they believe. The design should communicate the quality of data without requiring the user to think about it — recency, number of reports, confidence level. These signals should be visible but never noisy. A well-reported venue should feel different from a barely-reported one at a glance.

**6. Context makes data meaningful.**
A 30-minute wait at a nightclub on a normal Tuesday and a 30-minute wait on Art Basel weekend are completely different pieces of information. When event context is present, the UI should surface it in a way that reframes the number — not just a badge, but a signal that changes how the user interprets what they're seeing.

**7. The city should feel populated.**
Even when the user is alone, the app should make them feel like they're part of a crowd. Live activity, reporter counts, trending data, fresh timestamps — all of this communicates that this is a network of real people, right now, near you. Emptiness is the enemy. The product should always feel like it has a heartbeat.

---

## 6. Feature Inventory (Complete)

| Feature | Surface | Priority |
|---|---|---|
| Live map with wait time markers | Home | P0 |
| Color-coded severity (short / moderate / long) | Home | P0 |
| Real-time activity feed / ticker | Home | P0 |
| Report wait time flow | Report | P0 |
| Wait type capture (walk-in / reservation / VIP) | Report | P0 |
| Venue search and filtering | Home / List | P0 |
| Category chips (food, nightlife, barbers, gov, etc.) | Home | P0 |
| Trending nearby list | Home / List | P0 |
| SkipPoints reward system | Report / Profile | P0 |
| User profile with points, streak, rank | Profile | P0 |
| Local leaderboard | Profile | P0 |
| Event context tagging on reports | Report / Venue | P0 |
| Event badge on map pins and venue cards | Home / List | P0 |
| Active reporter count badge on map | Home | P0 |
| Venue detail page with trend and history | Venue | P1 |
| Nightlife-specific entry type fields | Report | P1 |
| Day vs. night event flag | Report | P1 |
| Favorites / saved venues | List / Profile | P1 |
| Data recency / staleness indicator | Home / List / Venue | P1 |
| Achievements and badges | Profile | P1 |
| Business-sponsored perks for top reporters | Profile | P2 |
| SMB business dashboard | B2B Web | P1 |
| Business self-registration and verification | B2B | P1 |
| Business-managed queue override | B2B Dashboard | P1 |
| Foot traffic analytics for businesses | B2B Dashboard | P1 |
| Business event posting | B2B Dashboard | P1 |
| User-submitted venue additions | Home / Report | P2 |
| Push notifications (wait time alerts, streak reminders) | System | P2 |
| Premium subscription paywall | Profile / System | P2 |

---

## 7. Known Gaps in the Existing Prototype

The current prototype is a frontend shell — well-structured, good UX bones, but entirely powered by mock data. Nothing is live. The following have not been built yet and represent the full technical roadmap:

- Real backend (database, API layer)
- Real authentication
- Live wait time data engine with report weighting and fraud filtering
- Native mobile app (current prototype is a web app only)
- Payment processing (Stripe)
- SMB dashboard (not started)
- Gamification backend (points, streaks, leaderboards)
- Google Maps / Places API integration
- Push notification infrastructure
- Analytics and instrumentation

The UI redesign brief above applies to the product vision — not the current prototype state.

---

## 8. Prompt Instructions for AI Model

If you are an AI model reading this document as a prompt, here is your directive:

**Build a mobile app mockup for SkipTheLine** — a real-time, crowd-powered wait time app as described above.

Focus specifically on:
1. The **Home / Map screen** — make it feel alive, immersive, and like a real city in motion
2. The **Report flow** — make it feel fast, satisfying, and rewarding
3. The **Profile / SkipPoints screen** — make it feel like a game the user is winning

**Design constraints:**
- Mobile-first. Think native iOS/Android experience — not a web page
- Dark, immersive visual direction — this app lives in the real world, at night, in busy places. It should feel at home there
- Motion and animation are encouraged where they communicate meaning — activity, updates, rewards
- Do not replicate any existing app's visual language. Find something that feels new
- The map should dominate. Other UI elements should feel like they float on top of the world, not beside it
- Make the report button the most magnetic thing on the screen
- Gamification (points, rank, streak) should be subtly woven throughout — not a separate "rewards" section bolted on

**What to avoid:**
- Light mode or neutral/clinical aesthetics
- Form-heavy layouts
- Static, non-animated pins or markers
- Anything that feels like a Yelp or Google Maps derivative
- Generic mobile UI patterns that don't serve the specific emotional promise of this product

Be bold. The product is asking users to change their behavior — to open an app before they go somewhere, to report what they see when they get there. That behavior change requires a product experience that feels worth it. Design to that standard.

---

*SkipTheLine — Pre-seed · Miami Launch · 2026*
*Document prepared for internal use and AI-assisted design prototyping*
