import { isConfigured as geminiIsConfigured } from "./gemini-client.js";
import { getPlaceContext } from "./prompt-builder.js";

const NEGATIVE_CONSTRAINTS = [
  "no modern electronic or synthetic sounds",
  "not a film score or hollywood style",
  "no dramatic or theatrical presentation",
  "not generic or stock ambience",
  "no graphic or violent sounds",
];

function coerceNormalizedEvidence(normalized) {
  if (!normalized) {
    return {
      place: "Unknown",
      year: 2000,
      resolvedPlace: "Unknown",
      historicalAliases: [],
      confidence: 0.1,
      evidenceFragments: [],
      dominantSounds: [],
      backgroundTextures: [],
      intermittentEvents: [],
      humanActivity: [],
      atmosphere: [],
      timeOfDay: "unknown",
      density: "moderate",
      emotionalTone: [],
      reliabilityNotes: ["No evidence - fallback reconstruction"],
    };
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

export async function planSoundscape({ normalizedEvidence, place, year }) {
  const coerced = coerceNormalizedEvidence(normalizedEvidence);

  if (geminiIsConfigured() && coerced.evidenceFragments?.length > 0) {
    try {
      return await planSoundscapeWithGemini({ normalizedEvidence: coerced, place, year });
    } catch (e) {
      console.warn("[plan-soundscape] Gemini planning failed, using fallback:", e.message);
    }
  }

  return buildFallbackSoundscapePlan({ normalizedEvidence: coerced, place, year });
}

async function planSoundscapeWithGemini({ normalizedEvidence, place, year }) {
  const prompt = `You are a historical soundscape planner.

Your task is to convert structured sensory evidence into a layered audio generation plan.

You are NOT writing literary prose.
You are NOT writing a generic scene description.
You are creating a sound plan that can be used by a text-to-sound-effects API.

Rules:
- Do not invent major details unsupported by the evidence.
- Separate constant background from environmental texture, human activity, and intermittent event sounds.
- Prefer specific audible cues over vague labels.
- Keep prompts concrete, short, and mixable.
- Return valid JSON only.

Return JSON matching exactly this schema:

{
  "summary": "string",
  "bed": {
    "prompt": "string",
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
  },
  "listening_modes": {
    "full_scene": ["bed", "texture", "human"],
    "atmosphere": ["bed", "texture"],
    "street_life": ["human", "texture"],
    "machines": ["string"],
    "voices": ["string"]
  }
}

Normalized evidence JSON:
${JSON.stringify(normalizedEvidence, null, 2)}

Make all layer prompts concrete, audible, and suitable for a text-to-sound-effects API.
Avoid poetic wording.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3-flash-preview"}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096, thinkingConfig: { thinkingLevel: "medium" } },
      }),
    }
  );

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = safeJsonParse(text);

  if (parsed && validateSoundscapePlan(parsed)) {
    // Normalize snake_case field names from Gemini to camelCase
    const normalizedPlan = {
      summary: parsed.summary || "",
      bed: {
        prompt: parsed.bed.prompt,
        durationSeconds: parsed.bed.duration_seconds ?? parsed.bed.durationSeconds ?? 20,
        loop: parsed.bed.loop ?? true,
      },
      texture: {
        prompt: parsed.texture.prompt,
        durationSeconds: parsed.texture.duration_seconds ?? parsed.texture.durationSeconds ?? 20,
        loop: parsed.texture.loop ?? true,
      },
      human: {
        prompt: parsed.human.prompt,
        durationSeconds: parsed.human.duration_seconds ?? parsed.human.durationSeconds ?? 15,
        loop: parsed.human.loop ?? true,
      },
      events: (parsed.events || []).map(e => ({
        name: e.name,
        prompt: e.prompt,
        durationSeconds: e.duration_seconds ?? e.durationSeconds ?? 3,
        loop: e.loop ?? false,
        weight: e.weight ?? 0.2,
      })),
      mixNotes: parsed.mix_notes || parsed.mixNotes || {},
      listeningModes: parsed.listening_modes || parsed.listeningModes || {},
    };
    return normalizedPlan;
  }

  throw new Error("Invalid plan structure from Gemini");
}

export function buildFallbackSoundscapePlan({ normalizedEvidence, place, year }) {
  const context = getPlaceContext(place);
  const evidenceText = normalizedEvidence.evidenceFragments
    .map(f => f.text)
    .join(" ");

  const bedPrompt = buildBedPrompt(evidenceText, context, normalizedEvidence, place, year);
  const texturePrompt = buildTexturePrompt(evidenceText, context, normalizedEvidence, place, year);
  const humanPrompt = buildHumanPrompt(evidenceText, context, normalizedEvidence, place, year);

  const events = buildEventsFromEvidence(normalizedEvidence.evidenceFragments, context);

  return {
    summary: `${place} in ${year}: ${normalizedEvidence.density} soundscape with ${normalizedEvidence.atmosphere?.join(", ") || "ambient"} atmosphere`,
    bed: {
      prompt: bedPrompt,
      durationSeconds: 20,
      loop: true,
    },
    texture: {
      prompt: texturePrompt,
      durationSeconds: 20,
      loop: true,
    },
    human: {
      prompt: humanPrompt,
      durationSeconds: 15,
      loop: true,
    },
    events: events,
    mixNotes: {
      foreground: events.slice(0, 2).map(e => e.name),
      midground: ["human activity", "market sounds"],
      background: ["ambient bed", "environmental texture"],
    },
    listeningModes: {
      fullScene: ["bed", "texture", "human"],
      atmosphere: ["bed", "texture"],
      streetLife: ["human", "texture"],
      machines: ["bed"],
      voices: ["human"],
    },
  };
}

function buildBedPrompt(evidenceText, context, normalized, place, year) {
  const t = evidenceText.toLowerCase();
  let bedSounds = [];

  if (t.includes("train") || t.includes("metro") || t.includes("railway")) {
    bedSounds.push("distant train rumble");
  }
  if (t.includes("ocean") || t.includes("sea") || t.includes("river")) {
    bedSounds.push("water lapping");
  }
  if (t.includes("traffic") || t.includes("vehicle")) {
    bedSounds.push("distant traffic hum");
  }
  if (t.includes("wind")) {
    bedSounds.push("gentle wind");
  }
  if (t.includes("cicada") || t.includes("insect")) {
    bedSounds.push("insect drone");
  }

  if (bedSounds.length === 0) {
    bedSounds.push("urban ambient drone");
  }

  const constraints = NEGATIVE_CONSTRAINTS.join(", ");
  return `${context.culture} ${context.region} ${bedSounds.join(", ")}, ${place} ${year}, seamless loop, ${constraints}`;
}

function buildTexturePrompt(evidenceText, context, normalized, place, year) {
  const t = evidenceText.toLowerCase();
  let textureSounds = [];

  if (t.includes("market") || t.includes("vendor")) {
    textureSounds.push("distant market murmur");
  }
  if (t.includes("crowd") || t.includes("people")) {
    textureSounds.push("scattered crowd murmur");
  }
  if (t.includes("rain") || t.includes("monsoon")) {
    textureSounds.push("rain on surfaces");
  }
  if (t.includes("footstep") || t.includes("walking")) {
    textureSounds.push("footsteps on pavement");
  }

  if (textureSounds.length === 0) {
    textureSounds.push("subtle environmental texture");
  }

  return `${context.culture} ${textureSounds.join(", ")}, ${place} ${year}, ${NEGATIVE_CONSTRAINTS.slice(0, 2).join(", ")}`;
}

function buildHumanPrompt(evidenceText, context, normalized, place, year) {
  const t = evidenceText.toLowerCase();
  let humanSounds = [];

  if (t.includes("vendor") || t.includes("selling")) {
    humanSounds.push("distant vendor calls");
  }
  if (t.includes("market") || t.includes("barter")) {
    humanSounds.push("market bartering murmur");
  }
  if (t.includes("conversation") || t.includes("talking")) {
    humanSounds.push("scattered conversations");
  }
  if (t.includes("religious") || t.includes("prayer")) {
    humanSounds.push("distant religious chant");
  }

  if (humanSounds.length === 0) {
    humanSounds.push("ambient human activity");
  }

  return `${context.culture} ${humanSounds.join(", ")}, ${place} ${year}, subtle, ${NEGATIVE_CONSTRAINTS.slice(0, 2).join(", ")}`;
}

function buildEventsFromEvidence(fragments, context) {
  const events = [];
  const seenEvents = new Set();

  for (const fragment of fragments || []) {
    const text = (fragment.text || "").toLowerCase();

    if (text.includes("bell") && !seenEvents.has("church_bell")) {
      events.push({
        name: "church_bell",
        prompt: `${context.culture} church bell tolling, ${context.period}, single strike`,
        durationSeconds: 3,
        loop: false,
        weight: 0.3,
      });
      seenEvents.add("church_bell");
    }

    if ((text.includes("horn") || text.includes("train")) && !seenEvents.has("train_horn")) {
      events.push({
        name: "train_horn",
        prompt: `${context.culture} train or ferry horn, distant, ${context.period}`,
        durationSeconds: 2,
        loop: false,
        weight: 0.25,
      });
      seenEvents.add("train_horn");
    }

    if (text.includes("shout") || text.includes("call") && !seenEvents.has("street_call")) {
      events.push({
        name: "street_call",
        prompt: `${context.culture} street vendor call, distant, ${context.period}`,
        durationSeconds: 2,
        loop: false,
        weight: 0.2,
      });
      seenEvents.add("street_call");
    }

    if (text.includes("music") || text.includes("drum") && !seenEvents.has("music_distant")) {
      events.push({
        name: "music_distant",
        prompt: `${context.culture} distant music or drumming, ${context.period}`,
        durationSeconds: 4,
        loop: false,
        weight: 0.15,
      });
      seenEvents.add("music_distant");
    }

    if (events.length >= 4) break;
  }

  if (events.length === 0) {
    events.push({
      name: "ambient_chime",
      prompt: `${context.culture} distant metallic chime or bell, ${context.period}`,
      durationSeconds: 2,
      loop: false,
      weight: 0.1,
    });
  }

  return events;
}

function safeJsonParse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return null;
  }
}

function validateSoundscapePlan(plan) {
  return (
    plan &&
    plan.bed &&
    plan.texture &&
    plan.human &&
    plan.bed.prompt &&
    plan.texture.prompt &&
    plan.human.prompt
  );
}

export function coerceSoundscapePlan(plan) {
  if (!plan) {
    return buildFallbackSoundscapePlan({
      normalizedEvidence: { evidenceFragments: [], density: "moderate", atmosphere: [] },
      place: "Unknown",
      year: 2000,
    });
  }

  return {
    summary: plan.summary || "Historical soundscape reconstruction",
    bed: coerceLayer(plan.bed, "bed"),
    texture: coerceLayer(plan.texture, "texture"),
    human: coerceLayer(plan.human, "human"),
    events: Array.isArray(plan.events) ? plan.events.map(coerceEvent) : [],
    mixNotes: {
      foreground: Array.isArray(plan.mixNotes?.foreground) ? plan.mixNotes.foreground : [],
      midground: Array.isArray(plan.mixNotes?.midground) ? plan.mixNotes.midground : [],
      background: Array.isArray(plan.mixNotes?.background) ? plan.mixNotes.background : [],
    },
    listeningModes: {
      fullScene: plan.listeningModes?.fullScene || ["bed", "texture", "human"],
      atmosphere: plan.listeningModes?.atmosphere || ["bed", "texture"],
      streetLife: plan.listeningModes?.streetLife || ["human", "texture"],
      machines: plan.listeningModes?.machines || [],
      voices: plan.listeningModes?.voices || [],
    },
  };
}

function coerceLayer(layer, defaultType) {
  return {
    prompt: layer?.prompt || `${defaultType} audio layer`,
    durationSeconds: layer?.durationSeconds || 15,
    loop: layer?.loop !== undefined ? layer.loop : true,
  };
}

function coerceEvent(event) {
  return {
    name: event?.name || "unnamed_event",
    prompt: event?.prompt || "sound event",
    durationSeconds: event?.durationSeconds || 3,
    loop: event?.loop !== undefined ? event.loop : false,
    weight: typeof event?.weight === "number" ? event.weight : 0.2,
  };
}