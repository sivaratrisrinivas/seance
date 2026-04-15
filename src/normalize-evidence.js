import { isConfigured as geminiIsConfigured } from "./gemini-client.js";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_DURATION = {
  bed: 20,
  texture: 20,
  human: 15,
  event: 3,
};

export async function normalizeEvidence({ place, year, rawEvidence, confidence }) {
  if (!rawEvidence || rawEvidence.length === 0) {
    return createMinimalNormalized({ place, year, confidence });
  }

  const hasHardcoded = rawEvidence.some(e => e.source !== "gemini");
  if (hasHardcoded) {
    return normalizeHardcodedEvidence({ place, year, rawEvidence, confidence });
  }

  if (rawEvidence.some(e => e.source === "gemini") && geminiIsConfigured()) {
    return await normalizeWithGemini({ place, year, rawEvidence, confidence });
  }

  return normalizeWithRules({ place, year, rawEvidence, confidence });
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

function normalizeHardcodedEvidence({ place, year, rawEvidence, confidence }) {
  const fragments = rawEvidence.map(e => ({
    text: e.description || "",
    source: e.source || "unknown",
    sourceType: mapSourceToType(e.source),
    soundCues: extractSoundCues(e.description),
    atmosphereCues: [],
    humanActivityCues: extractHumanActivity(e.description),
    timeOfDay: inferTimeOfDay(e.description),
    reliability: e.confidence || 0.7,
  }));

  const allDescriptions = rawEvidence.map(e => e.description).join(" ");

  return {
    place: place,
    year: parseInt(year),
    resolvedPlace: place,
    historicalAliases: [],
    confidence: confidence === "high" ? 0.9 : confidence === "medium" ? 0.65 : 0.45,
    evidence_quality: confidence === "high" ? "strong" : confidence === "medium" ? "moderate" : "weak",
    evidenceFragments: fragments,
    dominantSounds: extractSounds(allDescriptions, "dominant"),
    backgroundTextures: extractSounds(allDescriptions, "texture"),
    intermittentEvents: extractSounds(allDescriptions, "event"),
    humanActivity: extractHumanActivityList(rawEvidence),
    atmosphere: extractAtmosphere(allDescriptions),
    timeOfDay: inferTimeOfDay(allDescriptions) || "unknown",
    density: calculateDensity(rawEvidence),
    emotionalTone: [],
    reliabilityNotes: fragments.map(f => `${f.source}: reliability ${f.reliability.toFixed(2)}`),
    gaps: [],
  };
}

function normalizeWithRules({ place, year, rawEvidence, confidence }) {
  const fragments = rawEvidence.map(e => ({
    text: e.description || "",
    source: e.source || "gemini",
    sourceType: "inferred",
    soundCues: extractSoundCues(e.description),
    atmosphereCues: [],
    humanActivityCues: extractHumanActivity(e.description),
    timeOfDay: "",
    reliability: e.confidence || 0.5,
  }));

  const allDescriptions = rawEvidence.map(e => e.description).join(" ");

  return {
    place: place,
    year: parseInt(year),
    resolvedPlace: place,
    historicalAliases: [],
    confidence: 0.5,
    evidence_quality: "moderate",
    evidenceFragments: fragments,
    dominantSounds: extractSounds(allDescriptions, "dominant"),
    backgroundTextures: extractSounds(allDescriptions, "texture"),
    intermittentEvents: extractSounds(allDescriptions, "event"),
    humanActivity: extractHumanActivityList(rawEvidence),
    atmosphere: extractAtmosphere(allDescriptions),
    timeOfDay: "unknown",
    density: "moderate",
    emotionalTone: [],
    reliabilityNotes: ["AI-generated evidence - confidence moderate"],
    gaps: [],
  };
}

async function normalizeWithGemini({ place, year, rawEvidence, confidence }) {
  const prompt = `You are a historical soundscape normalizer. Convert raw evidence into strict JSON.

PLACE: ${place}
YEAR: ${year}

EVIDENCE:
${rawEvidence.map(e => `- ${e.description} (source: ${e.source}, confidence: ${e.confidence})`).join("\n")}

OUTPUT JSON (no markdown, just the JSON object):
{
  "place": "${place}",
  "year": ${year},
  "resolvedPlace": "...",
  "historicalAliases": [],
  "confidence": 0.0-1.0,
  "evidenceFragments": [{"text": "...", "source": "...", "sourceType": "...", "soundCues": [], "atmosphereCues": [], "humanActivityCues": [], "timeOfDay": "", "reliability": 0.0}],
  "dominantSounds": [],
  "backgroundTextures": [],
  "intermittentEvents": [],
  "humanActivity": [],
  "atmosphere": [],
  "timeOfDay": "",
  "density": "sparse|moderate|dense",
  "emotionalTone": [],
  "reliabilityNotes": []
}`;

  try {
    const response = await fetch(
      `${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      }
    );

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = safeJsonParse(text);

    if (parsed && validateNormalizedEvidence(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn("[normalize-evidence] Gemini normalization failed:", e.message);
  }

  return normalizeWithRules({ place, year, rawEvidence, confidence });
}

function mapSourceToType(source) {
  const typeMap = {
    historicalRecording: "historical_audio",
    oralHistory: "testimonial",
    academicResearch: "scholarly",
    newspaperArchive: "documentary",
    gemini: "inferred",
  };
  return typeMap[source] || "unknown";
}

function extractSoundCues(description) {
  const cues = [];
  const sounds = ["bell", "horn", "engine", "voice", "chatter", "music", "drum", "rain", "wind", "cart", "footstep", "metal", "horn", "scream", "shout"];
  const desc = description.toLowerCase();
  for (const sound of sounds) {
    if (desc.includes(sound)) {
      cues.push(sound);
    }
  }
  return cues;
}

function extractHumanActivity(description) {
  const activities = ["vendor", "market", "crowd", "walking", "talking", "selling", "buying", "working", "children"];
  const activityList = [];
  const desc = description.toLowerCase();
  for (const activity of activities) {
    if (desc.includes(activity)) {
      activityList.push(activity);
    }
  }
  return activityList;
}

function extractHumanActivityList(evidence) {
  const activities = [];
  for (const e of evidence) {
    const desc = (e.description || "").toLowerCase();
    if (desc.includes("vendor") || desc.includes("market") || desc.includes("crowd")) {
      activities.push("market_activity");
    }
    if (desc.includes("train") || desc.includes("metro") || desc.includes("transport")) {
      activities.push("transport");
    }
    if (desc.includes("religious") || desc.includes("bell") || desc.includes("prayer")) {
      activities.push("religious");
    }
  }
  return [...new Set(activities)];
}

function extractSounds(text, category) {
  const soundMap = {
    dominant: ["train", "metro", "engine", "bell", "fountain", "traffic", "ocean"],
    texture: ["market", "crowd", "murmur", "wind", "rain", "footstep", "cart"],
    event: ["bell", "horn", "shout", "announcement", "call", "drum", "music"],
  };

  const sounds = [];
  const t = text.toLowerCase();
  for (const sound of soundMap[category] || []) {
    if (t.includes(sound)) {
      sounds.push(sound);
    }
  }
  return sounds;
}

function extractAtmosphere(text) {
  const atmospheres = [];
  const t = text.toLowerCase();
  if (t.includes("rain") || t.includes("monsoon")) atmospheres.push("rainy");
  if (t.includes("fog") || t.includes("morning")) atmospheres.push("misty");
  if (t.includes("busy") || t.includes("market")) atmospheres.push("bustling");
  if (t.includes("quiet") || t.includes("evening")) atmospheres.push("calm");
  return atmospheres;
}

function inferTimeOfDay(text) {
  const t = text.toLowerCase();
  if (t.includes("morning") || t.includes("dawn")) return "morning";
  if (t.includes("evening") || t.includes("sunset")) return "evening";
  if (t.includes("night")) return "night";
  return "";
}

function calculateDensity(evidence) {
  if (!evidence || evidence.length < 3) return "sparse";
  if (evidence.length > 6) return "dense";
  return "moderate";
}

function safeJsonParse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn("[normalize-evidence] JSON parse failed:", e.message);
    return null;
  }
}

function validateNormalizedEvidence(normalized) {
  return normalized && normalized.place && normalized.year && typeof normalized.confidence === "number";
}

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
  };
}

export function isConfigured() {
  return geminiIsConfigured();
}