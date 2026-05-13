# SkipTheLine — Assessment Email (Final Draft)

**Subject: SkipTheLine — Technical Assessment & Initial Thoughts**

Hi [Team],

Really glad I had the chance to dig into this — there's a lot of exciting stuff happening here and I think we have a genuinely strong foundation to build on. Wanted to share some initial thoughts before we connect.

---

**Initial Assessment**

Honestly, the prototype is in a really good place. Clean design, the flows feel natural, and the right features are there. What we're working with is a frontend shell — totally expected at this stage — and the good news is there's a clear and exciting path ahead.

Here's what I'm seeing as the key areas to work through:

- **Auth** — User authentication is accounted for and we have a clear approach in mind — something worth aligning on early as it touches everything from onboarding to the B2B side.
- **Backend** — No live database yet, and both Firebase and Supabase are currently in the stack. I'd suggest we align on one and go all in — it'll simplify things a lot.
- **Google Maps** — This is really the heartbeat of the whole product. I'd love for us to lean into the Places API to seed our business database at launch and use Popular Times as a fallback while our crowdsourced data gets momentum.
- **Wait time engine** — The core of the product. Right now wait times are simulated — the real work is building the engine that takes live user reports, weighs them intelligently, filters out bad data, and surfaces a number people can actually trust. Getting this right is what separates us from a glorified comment section.
- **Day one data** — One of the most important things we'll figure out together is how Miami feels alive from day one before users are actively reporting. I have some ideas here I'd love to walk through.
- **Mobile** — The prototype is a web app and the deck shows native — this is probably the most important conversation we need to have. React Native/Expo vs. PWA will shape everything else, so the sooner we align on it the better.
- **Gamification** — This is what drives the growth engine. A product like this only works if users are motivated to keep coming back and reporting — without that the data dies. Want to make sure we're aligned on how central this is to the launch plan before we start scoping.
- **Analytics & instrumentation** — We'll want visibility into how the product is actually performing from day one — report frequency, accuracy, user engagement, drop-off. Important to bake this in early rather than bolt it on later.
- **Security & data privacy** — We're collecting real-time location data at scale. Worth making sure we're handling this the right way from the start — happy to dig into this further on the call.
- **Payments** — Stripe integration is still ahead of us — something we can plan for in the roadmap.

---

**A Few Thoughts on the Experience**

I have some thoughts around the experience that I think could really elevate where this is already heading — nothing I want to rush through in an email, but definitely something I'm excited to get into on the call.

---

**Cost Considerations**

These are approximate estimated numbers that will sharpen once we nail down the architecture. I've broken them out across two stages — early launch and growth scale — because the decisions we make now will have a real impact on what this costs as we grow:

| Category | Launch (0–10K users) | Scale (100K+ users) |
|---|---|---|
| Google Places API (business seed import) | $200–500 one-time + ongoing per-call | $500–2,000+/mo |
| Google Maps SDK / display | $200–400/mo | $1,000–5,000+/mo |
| Firebase (Auth + optional Firestore) | $50–150/mo | $500–2,000+/mo |
| Supabase (DB + realtime) | $25–100/mo | $300–1,500+/mo |
| Hosting / CDN (Vercel or similar) | $20–50/mo | $200–1,000+/mo |
| Stripe (payments) | 2.9% + 30¢ per transaction | 2.9% + 30¢ per transaction |
| Push notifications (Expo/FCM) | Minimal | $100–500+/mo |
| **Total infra estimate** | **~$500–1,200/mo** | **~$2,500–12,000+/mo** |

The bigger variable is really engineering time. Native mobile means more runway but a richer experience. PWA gets us to market faster with some App Store trade-offs. It's a meaningful decision and worth getting right.

---

**A Few Things I'd Love to Align On**

Before I put together a full roadmap, it would really help to get on the same page about a few things:

1. **What's actually expected of me here?** Whether it's CTO, Founding Engineer, or something in between — I want to make sure we're fully aligned on scope and where I have decision-making authority.
2. **How are we defining "wait time" from the user's perspective?** Is it what they personally experienced from the moment they walked in? Is it what the hostess told them? Is it door to door? This is foundational to everything — what we ask users to report, how we validate it, and ultimately how much users trust the data.
3. **How central is gamification to the launch plan?** The Waze comparison in the deck only holds if users are motivated to keep coming back and reporting. SkipPoints and reputation systems are what create that habit loop — and whether this is a Day 1 feature or something we layer in post-launch changes the roadmap significantly. Would love to understand where this sits in the priority stack.
4. **Where is the data coming from on day one?** Before users are actively reporting, what are we showing and how are we aggregating it?
5. **Would love to explore if there's any user research or validation that's been done.** Have we had any conversations with potential users or SMB owners yet? Really helpful to know what's been validated so we're building in the right direction.
6. **When do we need a working MVP in Miami?** Is there a hard milestone tied to the raise?

---

Happy to jump on a call this week — really looking forward to it.

[Your name]
