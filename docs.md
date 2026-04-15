# Séance — Implementation Documentation

## Pipeline Architecture

The soundscape generation pipeline has been upgraded from a simple 3-layer text-driven approach to a structured, layered system.

### New Modules

#### 1. normalizeEvidence (src/normalize-evidence.js)

Converts raw evidence (hardcoded, extracted, or Gemini-generated) into a structured JSON object:

```javascript
{
  place: "London",
  year: 1940,
  resolvedPlace: "London",
  historicalAliases: [],
  confidence: 0.9,
  evidenceFragments: [
    {
      text: "Big Ben heavy tolling...",
      source: "historicalRecording",
      sourceType: "historical_audio",
      soundCues: ["bell"],
      atmosphereCues: [],
      humanActivityCues: [],
      timeOfDay: "",
      reliability: 0.98
    }
  ],
  dominantSounds: ["bell", "train"],
  backgroundTextures: ["market", "crowd"],
  intermittentEvents: ["bell", "horn"],
  humanActivity: ["market_activity", "transport"],
  atmosphere: ["bustling"],
  timeOfDay: "unknown",
  density: "moderate",
  emotionalTone: [],
  reliabilityNotes: []
}
```

**Behavior:**
- Hardcoded evidence → deterministic normalization (no Gemini)
- Gemini evidence → optional Gemini normalization with code fallback
- No evidence → minimal normalized structure with confidence 0.1

#### 2. planSoundscape (src/plan-soundscape.js)

Creates a structured soundscape plan from normalized evidence:

```javascript
{
  summary: "London in 1940: moderate soundscape with bustling atmosphere",
  bed: {
    prompt: "British Western Europe urban ambient drone...",
    durationSeconds: 20,
    loop: true
  },
  texture: {
    prompt: "British distant market murmur...",
    durationSeconds: 20,
    loop: true
  },
  human: {
    prompt: "British ambient human activity...",
    durationSeconds: 15,
    loop: true
  },
  events: [
    { name: "church_bell", prompt: "...", durationSeconds: 3, loop: false, weight: 0.3 }
  ],
  mixNotes: { foreground: [], midground: [], background: [] },
  listeningModes: { fullScene: [...], atmosphere: [...], ... }
}
```

**Behavior:**
- Always has deterministic fallback planner
- Uses Gemini if configured and evidence exists
- Extracts up to 5 event clips from evidence

#### 3. generateLayers (src/generate-layers.js)

Generates audio using the soundscape plan:

- 3 loops: bed, texture, human (20s, 20s, 15s)
- Up to 5 event clips (2-5s each)
- Resilient: individual layer/event failures don't crash artifact

## Artifact Schema (v2)

New fields stored in Turbopuffer:

| Field | Type | Description |
|-------|------|-------------|
| schema_version | int | Always 2 for new artifacts |
| raw_evidence | JSON | Original evidence array |
| normalized_evidence | JSON | Structured normalized evidence |
| soundscape_plan | JSON | Full soundscape plan |
| audio_layers_extended | JSON | Extended audio with events |
| summary | string | One-line soundscape description |

### Backward Compatibility

Old artifacts (schema v1) are automatically upgraded on read:
- `parseArtifactWithDefaults()` detects schema version
- Maps legacy `audio_layers` to new `audio_layers_extended` structure
- Missing fields default to sensible values

## Job States

New job pipeline stages:

1. `EVIDENCE` - Gather historical evidence
2. `NORMALIZING` - Normalize evidence to structured format
3. `PLANNING` - Plan soundscape layers
4. `PROMPTS` - Build generation prompts (legacy)
5. `GENERATING` - Generate audio layers
6. `STORING` - Save artifact to storage

## API Integration

### ElevenLabs

- Uses sound generation API for each layer
- Prompt style: concrete, audible descriptions
- Example: "British Western Europe urban ambient drone, London 1940, seamless loop"

### Gemini

Three distinct purposes:
1. **Evidence synthesis** - Generate raw evidence when no hardcoded evidence exists
2. **Evidence normalization** - Convert raw evidence to structured JSON (optional)
3. **Soundscape planning** - Create soundscape plan from normalized evidence (optional)

All Gemini calls have deterministic fallbacks.

## Configuration

No new environment variables required. Uses existing:
- `ELEVENLABS_API_KEY`
- `GOOGLE_API_KEY`
- `TURBOPUFFER_API_KEY`
- `GEMINI_MODEL` (optional, defaults to gemini-2.0-flash)

## Testing

```bash
npm test  # Run all tests
```

Key tests verify:
- Pipeline modules work in isolation
- Artifact storage includes new fields
- Backward compatibility with old artifacts
- Error handling and graceful degradation

## Debug Endpoints

- `GET /debug/artifact?place=London&year=1940` - Shows full artifact with new fields
- `POST /debug/regenerate?place=London&year=1940` - Regenerates with new pipeline