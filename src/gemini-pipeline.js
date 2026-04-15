/**
 * gemini-pipeline.js — Consolidated Gemini pipeline.
 *
 * Replaces 4 separate Gemini API calls with a SINGLE mega-call that returns
 * evidence + normalization + soundscape plan all at once.
 *
 * Includes:
 * - In-memory cache with TTL to prevent redundant calls
 * - Retry with exponential backoff
 * - Graceful fallback when Gemini is unavailable
 */

import { isConfigured as geminiIsConfigured } from "./gemini-client.js";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ─── Cache ──────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const pipelineCache = new Map();

function getCacheKey(place, year) {
  return `${place.toLowerCase().trim()}:${year}`;
}

function getCachedResult(place, year) {
  const key = getCacheKey(place, year);
  const entry = pipelineCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    pipelineCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResult(place, year, data) {
  const key = getCacheKey(place, year);
  pipelineCache.set(key, { data, timestamp: Date.now() });

  // Evict old entries periodically
  if (pipelineCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of pipelineCache) {
      if (now - v.timestamp > CACHE_TTL_MS) pipelineCache.delete(k);
    }
  }
}

// ─── Mega-prompt ────────────────────────────────────────────────────────

const MEGA_SYSTEM_PROMPT = `You are a historical soundscape architect for an app called Séance that reconstructs place-sounds from history.

Your SINGLE task: given a place and year, produce a COMPLETE soundscape specification in ONE JSON response.

This JSON will be used DIRECTLY by a text-to-sound-effects API. Be concrete, audible, and specific.

Rules:
- Prefer concrete sensory details over general historical facts
- Distinguish grounded evidence from inference
- Do not invent major details unsupported by evidence
- If evidence is weak, say so explicitly
- Make all prompts suitable for a text-to-sound-effects API (not literary prose)
- Separate constant background from environmental texture, human activity, and intermittent events
- Keep prompts concrete, short, and mixable
- Include negative constraints: no modern electronic sounds, not a film score, not generic stock ambience
- Return valid JSON only, no markdown fencing

Return JSON matching EXACTLY this schema:

{
  "evidence": {
    "fragments": [
      {
        "excerpt": "string — short sensory description",
        "source_type": "newspaper | memoir | oral_history | book | travelogue | inferred",
        "layer": "bed | texture | event",
        "sound_cues": ["string"],
        "atmosphere_cues": ["string"],
        "time_of_day": "unknown | dawn | morning | afternoon | evening | night",
        "reliability": 0.0
      }
    ],
    "confidence": 0.0,
    "evidence_quality": "strong | moderate | weak",
    "gaps": ["string"]
  },
  "normalization": {
    "dominant_sounds": ["string"],
    "background_textures": ["string"],
    "intermittent_events": ["string"],
    "human_activity": ["string"],
    "atmosphere": ["string"],
    "time_of_day": "unknown | dawn | morning | afternoon | evening | night",
    "density": "sparse | moderate | dense",
    "emotional_tone": ["string"],
    "reliability_notes": ["string"]
  },
  "soundscape_plan": {
    "summary": "string",
    "bed": {
      "prompt": "string — concrete sound description for audio generation API",
      "duration_seconds": 20,
      "loop": true
    },
    "texture": {
      "prompt": "string",
      "duration_seconds": 20,
      "loop": true
    },
    "human": {
      "prompt": "string",
      "duration_seconds": 15,
      "loop": true
    },
    "events": [
      {
        "name": "string",
        "prompt": "string",
        "duration_seconds": 3,
        "loop": false,
        "weight": 0.0
      }
    ],
    "mix_notes": {
      "foreground": ["string"],
      "midground": ["string"],
      "background": ["string"]
    }
  }
}`;

// ─── API call with retry ────────────────────────────────────────────────

async function callGeminiWithRetry(prompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 8192,
              topP: 0.95,
              topK: 40,
              thinkingConfig: { thinkingLevel: "medium" },
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      if (!result.candidates?.[0]?.content?.parts) {
        throw new Error("Invalid Gemini response structure");
      }

      return result.candidates[0].content.parts[0].text;
    } catch (e) {
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 500;
        console.warn(`[gemini-pipeline] Attempt ${attempt + 1} failed: ${e.message}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw e;
      }
    }
  }
}

// ─── Parse response ─────────────────────────────────────────────────────

function safeJsonParse(text) {
  // Strip markdown fencing if present
  const stripped = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn("[gemini-pipeline] JSON parse failed:", e.message);
    return null;
  }
}

function validatePipelineResult(parsed) {
  return (
    parsed &&
    parsed.evidence &&
    parsed.normalization &&
    parsed.soundscape_plan &&
    parsed.soundscape_plan.bed?.prompt &&
    parsed.soundscape_plan.texture?.prompt &&
    parsed.soundscape_plan.human?.prompt
  );
}

function normalizePipelineResult(parsed, place, year) {
  const e = parsed.evidence || {};
  const n = parsed.normalization || {};
  const sp = parsed.soundscape_plan || {};

  // Convert evidence fragments to internal format
  const evidenceItems = (e.fragments || []).map(f => ({
    description: f.excerpt || "",
    supports: [f.layer || "texture"],
    source: f.source_type || "inferred",
    confidence: f.reliability || 0.7,
    soundCues: f.sound_cues || [],
    atmosphereCues: f.atmosphere_cues || [],
    timeOfDay: f.time_of_day || "unknown",
  }));

  // Normalized evidence
  const normalizedEvidence = {
    place,
    year: parseInt(year),
    resolvedPlace: place,
    historicalAliases: [],
    confidence: e.confidence || 0.5,
    evidence_quality: e.evidence_quality || "moderate",
    evidenceFragments: (e.fragments || []).map(f => ({
      text: f.excerpt || "",
      source: f.source_type || "inferred",
      sourceType: f.source_type || "inferred",
      soundCues: f.sound_cues || [],
      atmosphereCues: f.atmosphere_cues || [],
      humanActivityCues: [],
      timeOfDay: f.time_of_day || "unknown",
      reliability: f.reliability || 0.5,
    })),
    dominantSounds: n.dominant_sounds || [],
    backgroundTextures: n.background_textures || [],
    intermittentEvents: n.intermittent_events || [],
    humanActivity: n.human_activity || [],
    atmosphere: n.atmosphere || [],
    timeOfDay: n.time_of_day || "unknown",
    density: n.density || "moderate",
    emotionalTone: n.emotional_tone || [],
    reliabilityNotes: n.reliability_notes || [],
    gaps: e.gaps || [],
  };

  // Soundscape plan (normalize snake_case to camelCase)
  const soundscapePlan = {
    summary: sp.summary || `${place} in ${year}: historical soundscape reconstruction`,
    bed: {
      prompt: sp.bed.prompt,
      durationSeconds: sp.bed.duration_seconds ?? sp.bed.durationSeconds ?? 20,
      loop: sp.bed.loop ?? true,
    },
    texture: {
      prompt: sp.texture.prompt,
      durationSeconds: sp.texture.duration_seconds ?? sp.texture.durationSeconds ?? 20,
      loop: sp.texture.loop ?? true,
    },
    human: {
      prompt: sp.human.prompt,
      durationSeconds: sp.human.duration_seconds ?? sp.human.durationSeconds ?? 15,
      loop: sp.human.loop ?? true,
    },
    events: (sp.events || []).map(ev => ({
      name: ev.name,
      prompt: ev.prompt,
      durationSeconds: ev.duration_seconds ?? ev.durationSeconds ?? 3,
      loop: ev.loop ?? false,
      weight: ev.weight ?? 0.2,
    })),
    mixNotes: sp.mix_notes || sp.mixNotes || {
      foreground: [],
      midground: [],
      background: [],
    },
    listeningModes: {
      fullScene: ["bed", "texture", "human"],
      atmosphere: ["bed", "texture"],
      streetLife: ["human", "texture"],
      machines: ["bed"],
      voices: ["human"],
    },
  };

  return {
    evidenceItems,
    normalizedEvidence,
    soundscapePlan,
    fromGemini: true,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Run the entire Gemini pipeline in a single API call.
 *
 * @param {string} place - Canonical place name
 * @param {string|number} year - Year
 * @param {object[]} localEvidence - Pre-extracted local evidence to augment with
 * @returns {Promise<object>} { evidenceItems, normalizedEvidence, soundscapePlan, fromGemini }
 */
export async function runGeminiPipeline({ place, year, localEvidence = [] }) {
  // Check cache first
  const cached = getCachedResult(place, year);
  if (cached) {
    console.log(`[gemini-pipeline] Cache HIT for ${place}:${year}`);
    return cached;
  }

  if (!geminiIsConfigured()) {
    console.log("[gemini-pipeline] Gemini not configured, skipping");
    return null;
  }

  const localContext = localEvidence.length > 0
    ? `\n\nExisting local evidence (use as grounding, supplement and refine):\n${localEvidence.map(e => `- ${e.description} (supports: ${e.supports?.join(",")})`).join("\n")}`
    : "\n\nNo pre-existing evidence available. Extract the best available sensory clues and mark weaker evidence clearly.";

  const prompt = `${MEGA_SYSTEM_PROMPT}

---

Place: ${place}
Year: ${year}
${localContext}

---

Respond with valid JSON only. Do not include any text outside the JSON structure.`;

  console.log(`[gemini-pipeline] Calling Gemini mega-pipeline for ${place}:${year}...`);
  const rawResponse = await callGeminiWithRetry(prompt);
  const parsed = safeJsonParse(rawResponse);

  if (!parsed || !validatePipelineResult(parsed)) {
    console.warn("[gemini-pipeline] Invalid pipeline result from Gemini, returning null");
    return null;
  }

  const result = normalizePipelineResult(parsed, place, year);
  setCachedResult(place, year, result);
  console.log(`[gemini-pipeline] Pipeline complete for ${place}:${year} (${result.evidenceItems.length} evidence items, confidence: ${result.normalizedEvidence.confidence})`);

  return result;
}

export function clearCache() {
  pipelineCache.clear();
}
