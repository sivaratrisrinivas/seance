/**
 * normalize-evidence.js — Evidence normalization.
 *
 * Converts raw evidence items into a rich, structured format suitable for
 * soundscape planning. Uses semantic keyword groups for better extraction.
 *
 * In the platonic pipeline, Gemini normalization is handled by gemini-pipeline.js.
 * This module focuses on LOCAL normalization (hardcoded and fallback paths).
 */

import { isConfigured as geminiIsConfigured } from "./gemini-pipeline.js";

// ─── Semantic keyword groups ────────────────────────────────────────────

const SOUND_TAXONOMY = {
  bells: ["bell", "tolling", "chiming", "pealing", "gong", "chime", "carillon", "peal"],
  horns: ["horn", "foghorn", "honk", "klaxon", "blare", "siren", "whistle"],
  engines: ["engine", "motor", "diesel", "steam", "traction", "locomotive", "putt"],
  voices: ["voice", "chatter", "murmur", "shout", "call", "cry", "conversation", "announcement", "hawking", "bartering", "haggling", "singing", "chant"],
  music: ["music", "drum", "accordion", "guitar", "trumpet", "flute", "piano", "bandoneon", "tabla", "sitar", "harmonica"],
  nature: ["rain", "wind", "thunder", "wave", "ocean", "river", "bird", "cicada", "insect", "cricket", "crow", "creek"],
  transport: ["train", "metro", "subway", "tram", "trolley", "bus", "taxi", "rickshaw", "carriage", "cart", "bicycle"],
  impact: ["hammer", "clatter", "clang", "bang", "crack", "creak", "grind", "screech", "rattle", "clinking"],
  water: ["splash", "fountain", "drip", "gurgle", "flow", "lap", "ripple", "bubbling"],
  footsteps: ["footstep", "walking", "geta", "sandal", "heel", "boot", "clog"],
};

const ATMOSPHERE_KEYWORDS = {
  rainy: ["rain", "monsoon", "drizzle", "downpour", "storm", "wet"],
  misty: ["fog", "mist", "haze", "morning", "dawn"],
  bustling: ["busy", "market", "crowd", "festival", "commerce", "trade"],
  calm: ["quiet", "evening", "serene", "peaceful", "twilight"],
  industrial: ["factory", "machinery", "forge", "workshop", "assembly"],
  sacred: ["temple", "church", "mosque", "shrine", "prayer", "worship"],
  maritime: ["port", "dock", "harbor", "wharf", "pier", "ship", "boat", "ferry"],
};

const TIME_KEYWORDS = {
  dawn: ["dawn", "sunrise", "first light", "daybreak"],
  morning: ["morning", "breakfast", "commute"],
  afternoon: ["afternoon", "midday", "noon", "lunch"],
  evening: ["evening", "sunset", "dusk", "twilight"],
  night: ["night", "midnight", "late", "dark"],
};

// ─── Main normalize ─────────────────────────────────────────────────────

export async function normalizeEvidence({ place, year, rawEvidence, confidence }) {
  if (!rawEvidence || rawEvidence.length === 0) {
    return createMinimalNormalized({ place, year, confidence });
  }

  // If we have a pre-normalized result from the Gemini pipeline, detect it
  if (rawEvidence._preNormalized) {
    return rawEvidence._preNormalized;
  }

  return normalizeWithSemanticRules({ place, year, rawEvidence, confidence });
}

function createMinimalNormalized({ place, year, confidence }) {
  return {
    place: place,
    year: parseInt(year),
    resolvedPlace: place,
    historicalAliases: [],
    confidence: 0.1,
    evidence_quality: "weak",
    evidenceFragments: [],
    dominantSounds: [],
    backgroundTextures: [],
    intermittentEvents: [],
    humanActivity: [],
    atmosphere: [],
    timeOfDay: "unknown",
    density: "sparse",
    emotionalTone: [],
    reliabilityNotes: ["No evidence available - minimal reconstruction"],
    gaps: ["No source material available"],
  };
}

// ─── Semantic rule-based normalization ──────────────────────────────────

function normalizeWithSemanticRules({ place, year, rawEvidence, confidence }) {
  const fragments = rawEvidence.map(e => ({
    text: e.description || "",
    source: e.source || "unknown",
    sourceType: mapSourceToType(e.source),
    soundCues: extractSoundCues(e.description),
    atmosphereCues: extractAtmosphereCues(e.description),
    humanActivityCues: extractHumanActivity(e.description),
    timeOfDay: inferTimeOfDay(e.description),
    reliability: e.confidence || 0.7,
  }));

  const allDescriptions = rawEvidence.map(e => e.description).join(" ");
  const allText = allDescriptions.toLowerCase();

  // Derive confidence from actual evidence quality
  const avgReliability = fragments.reduce((sum, f) => sum + f.reliability, 0) / fragments.length;
  const derivedConfidence = confidence === "high" ? Math.max(avgReliability, 0.8) :
    confidence === "medium" ? Math.max(avgReliability * 0.85, 0.5) :
    confidence === "gemini" ? Math.max(avgReliability, 0.6) :
    Math.max(avgReliability * 0.7, 0.3);

  // Derive emotional tone from atmosphere + density
  const atmosphere = extractAtmosphereList(allText);
  const density = calculateDensity(rawEvidence);
  const emotionalTone = deriveEmotionalTone(atmosphere, density);

  return {
    place: place,
    year: parseInt(year),
    resolvedPlace: place,
    historicalAliases: [],
    confidence: derivedConfidence,
    evidence_quality: derivedConfidence >= 0.8 ? "strong" : derivedConfidence >= 0.5 ? "moderate" : "weak",
    evidenceFragments: fragments,
    dominantSounds: extractByTaxonomy(allText, ["engines", "transport", "bells", "water"]),
    backgroundTextures: extractByTaxonomy(allText, ["nature", "footsteps", "impact"]),
    intermittentEvents: extractByTaxonomy(allText, ["bells", "horns", "voices"]),
    humanActivity: extractHumanActivityList(rawEvidence),
    atmosphere,
    timeOfDay: aggregateTimeOfDay(fragments),
    density,
    emotionalTone,
    reliabilityNotes: fragments.map(f => `${f.source}: reliability ${f.reliability.toFixed(2)}`),
    gaps: [],
  };
}

// ─── Taxonomy-based extraction ──────────────────────────────────────────

function extractByTaxonomy(text, categories) {
  const results = new Set();
  for (const category of categories) {
    const keywords = SOUND_TAXONOMY[category] || [];
    for (const kw of keywords) {
      if (text.includes(kw)) {
        results.add(kw);
      }
    }
  }
  return Array.from(results);
}

function extractSoundCues(description) {
  const desc = (description || "").toLowerCase();
  const cues = [];
  for (const [category, keywords] of Object.entries(SOUND_TAXONOMY)) {
    for (const kw of keywords) {
      if (desc.includes(kw)) {
        cues.push(kw);
      }
    }
  }
  return [...new Set(cues)];
}

function extractAtmosphereCues(description) {
  const desc = (description || "").toLowerCase();
  const cues = [];
  for (const [atmo, keywords] of Object.entries(ATMOSPHERE_KEYWORDS)) {
    for (const kw of keywords) {
      if (desc.includes(kw)) {
        cues.push(atmo);
        break;
      }
    }
  }
  return [...new Set(cues)];
}

function extractHumanActivity(description) {
  const activities = ["vendor", "market", "crowd", "walking", "talking", "selling", "buying", "working", "children", "playing", "haggling", "bartering", "praying", "singing", "dancing"];
  const activityList = [];
  const desc = (description || "").toLowerCase();
  for (const activity of activities) {
    if (desc.includes(activity)) {
      activityList.push(activity);
    }
  }
  return activityList;
}

function extractHumanActivityList(evidence) {
  const activities = new Set();
  for (const e of evidence) {
    const desc = (e.description || "").toLowerCase();
    if (desc.includes("vendor") || desc.includes("market") || desc.includes("crowd") || desc.includes("haggling")) {
      activities.add("market_activity");
    }
    if (desc.includes("train") || desc.includes("metro") || desc.includes("tram") || desc.includes("bus") || desc.includes("rickshaw")) {
      activities.add("transport");
    }
    if (desc.includes("religious") || desc.includes("bell") || desc.includes("prayer") || desc.includes("temple") || desc.includes("mosque") || desc.includes("church")) {
      activities.add("religious");
    }
    if (desc.includes("factory") || desc.includes("workshop") || desc.includes("forge") || desc.includes("assembly")) {
      activities.add("industrial");
    }
    if (desc.includes("music") || desc.includes("drum") || desc.includes("accordion") || desc.includes("guitar")) {
      activities.add("music");
    }
    if (desc.includes("dock") || desc.includes("port") || desc.includes("harbor") || desc.includes("boat") || desc.includes("ferry")) {
      activities.add("maritime");
    }
  }
  return Array.from(activities);
}

function extractAtmosphereList(text) {
  const atmospheres = [];
  for (const [atmo, keywords] of Object.entries(ATMOSPHERE_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        atmospheres.push(atmo);
        break;
      }
    }
  }
  return [...new Set(atmospheres)];
}

function inferTimeOfDay(text) {
  const t = (text || "").toLowerCase();
  for (const [time, keywords] of Object.entries(TIME_KEYWORDS)) {
    for (const kw of keywords) {
      if (t.includes(kw)) return time;
    }
  }
  return "";
}

function aggregateTimeOfDay(fragments) {
  const times = fragments.map(f => f.timeOfDay).filter(t => t && t !== "");
  if (times.length === 0) return "unknown";
  // Most common time
  const counts = {};
  for (const t of times) {
    counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function calculateDensity(evidence) {
  if (!evidence || evidence.length < 3) return "sparse";
  if (evidence.length > 6) return "dense";
  return "moderate";
}

function deriveEmotionalTone(atmosphere, density) {
  const tone = [];
  if (atmosphere.includes("bustling") && density === "dense") tone.push("energetic");
  if (atmosphere.includes("calm")) tone.push("contemplative");
  if (atmosphere.includes("sacred")) tone.push("reverent");
  if (atmosphere.includes("industrial")) tone.push("mechanical");
  if (atmosphere.includes("maritime")) tone.push("expansive");
  if (atmosphere.includes("rainy")) tone.push("melancholic");
  if (atmosphere.includes("misty")) tone.push("atmospheric");
  if (tone.length === 0) tone.push("ambient");
  return tone;
}

function mapSourceToType(source) {
  const typeMap = {
    historicalRecording: "historical_audio",
    soundRecording: "historical_audio",
    oralHistory: "testimonial",
    academicResearch: "scholarly",
    newspaperArchive: "documentary",
    gemini: "inferred",
    inferred: "inferred",
  };
  return typeMap[source] || "unknown";
}

// ─── Coercion (single source of truth, imported by plan-soundscape.js) ─

export function coerceNormalizedEvidence(normalized) {
  if (!normalized) {
    return createMinimalNormalized({ place: "Unknown", year: 2000, confidence: "low" });
  }

  return {
    place: normalized.place || "Unknown",
    year: parseInt(normalized.year) || 2000,
    resolvedPlace: normalized.resolvedPlace || normalized.place || "Unknown",
    historicalAliases: Array.isArray(normalized.historicalAliases) ? normalized.historicalAliases : [],
    confidence: typeof normalized.confidence === "number" ? normalized.confidence : 0.5,
    evidence_quality: normalized.evidence_quality || "moderate",
    evidenceFragments: Array.isArray(normalized.evidenceFragments) ? normalized.evidenceFragments : [],
    dominantSounds: Array.isArray(normalized.dominantSounds) ? normalized.dominantSounds : [],
    backgroundTextures: Array.isArray(normalized.backgroundTextures) ? normalized.backgroundTextures : [],
    intermittentEvents: Array.isArray(normalized.intermittentEvents) ? normalized.intermittentEvents : [],
    humanActivity: Array.isArray(normalized.humanActivity) ? normalized.humanActivity : [],
    atmosphere: Array.isArray(normalized.atmosphere) ? normalized.atmosphere : [],
    timeOfDay: normalized.timeOfDay || "unknown",
    density: normalized.density || "moderate",
    emotionalTone: Array.isArray(normalized.emotionalTone) ? normalized.emotionalTone : [],
    reliabilityNotes: Array.isArray(normalized.reliabilityNotes) ? normalized.reliabilityNotes : [],
    gaps: Array.isArray(normalized.gaps) ? normalized.gaps : [],
  };
}

export function isConfigured() {
  return geminiIsConfigured();
}