# Séance

> **Hear a place the way history felt.**

A web app that reconstructs the ambient soundscape of any place at any point in history using AI-generated audio. Built for the [ElevenLabs Worldwide Hackathon](https://hacks.elevenlabs.io/hackathons/3).

---

## What It Does

Type a place and year — Séance reconstructs a three-layer audio experience of what that place sounded like:

| Layer | Purpose | Example |
|-------|---------|---------|
| **Bed** | Ambient background drone | Wind through temple corridors, ocean hum |
| **Event** | Recurring human/mechanical sounds | Rickshaw bells, market chatter, factory whistles |
| **Texture** | Subtle environmental detail | Rain on cobblestone, insect chorus, distant thunder |

Every reconstruction is stored in Turbopuffer, so repeat visits load instantly from the archive.

## How It Works

```
User Input → Validation → Evidence Extraction → Normalization → Soundscape Planning
                                                                        ↓
                    Artifact Page ← Storage ← Audio Generation ← Prompt Building
```

1. **Evidence extraction** — Looks up pre-researched historical sources for each place-year combination, with Gemini API fallback for unknown queries
2. **Normalization** — Structures raw evidence into typed fragments (bed/event/texture) with confidence scores via Gemini
3. **Soundscape planning** — Plans layer durations, prompts, and event timing via Gemini
4. **Prompt building** — Converts plans into constrained prompts that avoid modern sounds or dramatic scoring
5. **Audio generation** — Creates three audio layers using ElevenLabs Sound Effects API
6. **Storage** — Saves artifacts to Turbopuffer for instant retrieval; large audio blobs overflow to Cloudflare R2
7. **Playback** — Renders a mixable audio experience with trust indicators showing evidence confidence

### Tech Stack

| Component | Technology |
|-----------|------------|
| Server | Node.js (plain HTTP, no framework) |
| Audio Generation | [ElevenLabs Sound Effects API](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/sound-effects) |
| Vector Storage | [Turbopuffer](https://turbopuffer.com/docs) |
| Audio Overflow | [Cloudflare R2](https://developers.cloudflare.com/r2/get-started/) |
| Evidence Fallback | Google Gemini API |
| Frontend | Vanilla HTML/CSS/JS, Web Audio API |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file:

```bash
# Required: Audio generation
ELEVENLABS_API_KEY=your_key_here

# Required: Artifact storage
TURBOPUFFER_API_KEY=your_key_here
TURBOPUFFER_NAMESPACE=seance-artifacts

# Optional: Gemini for evidence fallback & normalization
GOOGLE_API_KEY=your_key_here

# Optional: Cloudflare R2 for audio overflow (avoids Turbopuffer 8MiB limit)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=seance-audio
R2_PUBLIC_URL=https://your-domain.com/audio
```

### 3. Run

```bash
npm start            # Start server on port 8000
npm test             # Run all 116 tests
npm run dev          # Start with file watching (if configured)
```

## Project Structure

```
seance/
├── server.js                      # HTTP server entry point
├── src/
│   ├── handle-request.js          # Request router & pipeline orchestrator
│   ├── query-validation.js        # Input validation (place, year)
│   ├── evidence-extractor.js      # Historical evidence lookup
│   ├── reconstruction-metadata.js # Gemini fallback for unknown places
│   ├── normalize-evidence.js      # Evidence → typed fragments (async, Gemini)
│   ├── plan-soundscape.js         # Fragments → layer plan (async, Gemini)
│   ├── prompt-builder.js          # Plan → ElevenLabs prompts
│   ├── generate-layers.js         # ElevenLabs API + R2 upload
│   ├── gemini-client.js           # Google Gemini API client
│   ├── turbopuffer-client.js      # Turbopuffer storage client
│   ├── generation-job.js          # Job state machine + single-flight
│   ├── rate-limiter.js            # Sliding window rate limiter
│   ├── place-reinterpretation.js  # Anachronistic place name handling
│   ├── artifact-store.js          # In-memory artifact provenance store
│   ├── render-homepage.js         # Homepage template
│   ├── render-generating.js       # Generation progress template
│   ├── render-artifact.js         # Artifact playback template
│   ├── render-how-it-works.js     # How it works template
│   ├── render-disambiguation.js   # Place disambiguation template
│   ├── render-validation-error.js # Validation error template
│   └── shared-styles.js           # Design system (dark theme)
└── test/
    ├── homepage.test.js           # Homepage rendering (8 tests)
    ├── how-it-works.test.js       # How-it-works page (5 tests)
    ├── year-validation.test.js    # Query validation (10 tests)
    ├── moderation.test.js         # Sensitive period moderation (3 tests)
    ├── anachronistic-place.test.js# Evidence + disambiguation (11 tests)
    ├── prompt-builder.test.js     # Normalize → Plan → Prompt (12 tests)
    ├── async-jobs.test.js         # Job state machine (10 tests)
    ├── ritual-flow-e2e.test.js    # Full user journey E2E (17 tests)
    ├── ritual-loading.test.js     # Routing + artifact display (14 tests)
    ├── archive-hit-e2e.test.js    # Archive retrieval (4 tests)
    ├── archive-write.test.js      # Artifact store + provenance (8 tests)
    ├── partial-artifact.test.js   # Partial generation handling (7 tests)
    ├── playback.test.js           # Audio player rendering (4 tests)
    ├── rate-limit.test.js         # Rate limiting (4 tests)
    └── recent-queries.test.js     # localStorage history (4 tests)
```

## Pipeline Architecture

The generation pipeline runs as an async background job with the following stages:

| Stage | Description | Module |
|-------|-------------|--------|
| `PENDING` | Job created, awaiting start | `generation-job.js` |
| `EVIDENCE` | Extracting historical evidence | `evidence-extractor.js` → `reconstruction-metadata.js` |
| `NORMALIZING` | Structuring evidence fragments | `normalize-evidence.js` |
| `PLANNING` | Planning soundscape layers | `plan-soundscape.js` |
| `PROMPTS` | Building generation prompts | `prompt-builder.js` |
| `GENERATING` | Calling ElevenLabs API | `generate-layers.js` |
| `STORING` | Saving to Turbopuffer/R2 | `turbopuffer-client.js` |
| `COMPLETED` | Artifact ready for playback | — |

The `/generating` page polls job status and shows real-time stage progress.

## Safety & Moderation

The system implements narrow moderation to handle hard history responsibly:

- **Input moderation** — Blocks generic conflict-zone place names during sensitive periods (1914–1945) when no evidence exists
- **Output moderation** — Prompts include safety constraints ("no graphic description, not violent or exploitative") for sensitive periods
- **Evidence-grounded** — Places with actual evidence (London 1940, Tokyo 1945) remain fully available

## Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| No ElevenLabs key | Server starts, audio generation skipped, shows empty player |
| No Turbopuffer key | Falls back to in-memory storage |
| No Gemini key | Uses hardcoded evidence only, skips normalization/planning |
| No R2 credentials | Audio stored as base64 in Turbopuffer directly |
| 2 of 3 layers fail | Artifact marked "Partial reconstruction" |
| All layers fail | Job fails, error shown to user |

## Single-Flight Deduplication

Prevents duplicate generations for the same place-year:

- In-flight job tracking by `place:year` lock key
- Concurrent requests reuse the existing job
- Lock auto-clears on completion or failure

## Rate Limiting

- **Generation**: 5 fresh generations per minute per unique query
- **Archive**: Unlimited — cached artifacts always available
- **Cooldown**: 30-second cooldown after hitting the limit
- **Response**: 429 status with clear error message

## Tests

```
116 passing, 0 failing
```

Run the full suite:

```bash
npm test
```

Tests cover every pipeline step end-to-end: validation → evidence → normalization → planning → prompts → generation → storage → rendering → playback.

## License

MIT