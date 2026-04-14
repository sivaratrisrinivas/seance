# Séance

A web app that lets you hear what a place sounded like in a past year.

## What

Type a place and year, then hear a three-layer soundscape reconstruction of that place at that time. The audio combines:

- **Bed** - ambient background sound
- **Event** - recurring sounds that shape a place
- **Texture** - subtle environmental details

Every reconstruction is stored so repeat visits load instantly from the archive.

## Why

People can read about the past, but they can't hear it. This app brings historical places to life through sound using AI generation and persistent storage.

## How

1. **Evidence extraction** - Uses pre-researched historical sources to build evidence for each place-year
2. **Prompt building** - Converts evidence into constrained AI prompts that avoid modern sounds or dramatic scoring
3. **AI generation** - Creates three audio layers using ElevenLabs Sound Effects API
4. **Storage** - Saves artifacts to Turbopuffer for instant retrieval on repeat visits
5. **Playback** - Renders a playable audio experience with trust indicators showing evidence confidence

### Tech

- Node.js (no framework, plain HTTP server)
- ElevenLabs Sound Effects API for audio generation
- Turbopuffer for artifact storage
- In-memory fallback when APIs not configured

## Setup

Create `.env` with your API keys:

```
ELEVENLABS_API_KEY=your_key_here
TURBOPUFFER_API_KEY=your_key_here
TURBOPUFFER_NAMESPACE=seance-artifacts
```

## Run

```bash
npm install
npm test   # Run tests
npm start  # Start server on port 8000
```

## Files

- `server.js` - HTTP server entry point
- `src/handle-request.js` - Request routing
- `src/elevenlabs-client.js` - Audio generation
- `src/turbopuffer-client.js` - Artifact storage
- `src/evidence-extractor.js` - Historical evidence lookup
- `src/reconstruction-metadata.js` - Structured metadata builder
- `src/prompt-builder.js` - Prompt generation for AI
- `src/query-validation.js` - Query input validation
- `src/render-*.js` - Page templates

## Safety

The system implements narrow moderation to handle hard history responsibly:

- **Input moderation**: Blocks generic conflict-zone place names (WarZone, UnknownConflict) during sensitive periods (1914-1945) when no evidence exists in the system
- **Output moderation**: Prompts include safety constraints ("no graphic description, not violent or exploitative") for sensitive historical periods
- Places with evidence (London 1940, Tokyo 1945, etc.) remain fully available