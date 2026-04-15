/**
 * plan-soundscape.js — Soundscape planning.
 *
 * Creates the audio generation blueprint from normalized evidence.
 * In the platonic pipeline, the primary planning is done by gemini-pipeline.js.
 * This module handles the FALLBACK path when Gemini results aren't available,
 * and provides coercion/validation for soundscape plans from any source.
 */

import { coerceNormalizedEvidence } from "./normalize-evidence.js";
import { getPlaceContext } from "./prompt-builder.js";

const NEGATIVE_CONSTRAINTS = [
  "no modern electronic or synthetic sounds",
  "not a film score or hollywood style",
  "no dramatic or theatrical presentation",
  "not generic or stock ambience",
  "no graphic or violent sounds",
];

// ─── Main entry point ───────────────────────────────────────────────────

export async function planSoundscape({ normalizedEvidence, place, year, preComputedPlan = null }) {
  // If we already have a plan from the Gemini pipeline, use it directly
  if (preComputedPlan && validateSoundscapePlan(preComputedPlan)) {
    console.log("[plan-soundscape] Using pre-computed plan from Gemini pipeline");
    return coerceSoundscapePlan(preComputedPlan);
  }

  const coerced = coerceNormalizedEvidence(normalizedEvidence);
  return buildFallbackSoundscapePlan({ normalizedEvidence: coerced, place, year });
}

// ─── Fallback builder ───────────────────────────────────────────────────

export function buildFallbackSoundscapePlan({ normalizedEvidence, place, year }) {
  const context = getPlaceContext(place, year);
  const evidenceText = (normalizedEvidence.evidenceFragments || [])
    .map(f => f.text)
    .join(" ");

  const bedPrompt = buildBedPrompt(evidenceText, context, normalizedEvidence, place, year);
  const texturePrompt = buildTexturePrompt(evidenceText, context, normalizedEvidence, place, year);
  const humanPrompt = buildHumanPrompt(evidenceText, context, normalizedEvidence, place, year);
  const events = buildEventsFromEvidence(normalizedEvidence.evidenceFragments, context);

  // Evidence-informed durations
  const density = normalizedEvidence.density || "moderate";
  const bedDuration = density === "dense" ? 25 : density === "sparse" ? 15 : 20;
  const humanDuration = density === "dense" ? 20 : density === "sparse" ? 10 : 15;

  return {
    summary: `${place} in ${year}: ${density} soundscape with ${normalizedEvidence.atmosphere?.join(", ") || "ambient"} atmosphere`,
    bed: {
      prompt: bedPrompt,
      durationSeconds: bedDuration,
      loop: true,
    },
    texture: {
      prompt: texturePrompt,
      durationSeconds: 20,
      loop: true,
    },
    human: {
      prompt: humanPrompt,
      durationSeconds: humanDuration,
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

// ─── Prompt builders ────────────────────────────────────────────────────

function buildBedPrompt(evidenceText, context, normalized, place, year) {
  const t = evidenceText.toLowerCase();
  let bedSounds = [];

  if (t.includes("train") || t.includes("metro") || t.includes("railway") || t.includes("tram")) {
    bedSounds.push("distant train and rail rumble");
  }
  if (t.includes("ocean") || t.includes("sea") || t.includes("river") || t.includes("wave")) {
    bedSounds.push("water lapping and gentle waves");
  }
  if (t.includes("traffic") || t.includes("vehicle") || t.includes("motor") || t.includes("engine")) {
    bedSounds.push("distant vehicle traffic hum");
  }
  if (t.includes("wind") || t.includes("breeze")) {
    bedSounds.push("gentle wind through architecture");
  }
  if (t.includes("cicada") || t.includes("insect") || t.includes("cricket")) {
    bedSounds.push("insect drone and chorus");
  }
  if (t.includes("fountain") || t.includes("splash")) {
    bedSounds.push("water fountain continuous flow");
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

  if (t.includes("market") || t.includes("vendor") || t.includes("hawking")) {
    textureSounds.push("distant market murmur");
  }
  if (t.includes("crowd") || t.includes("people") || t.includes("chatter")) {
    textureSounds.push("scattered crowd murmur");
  }
  if (t.includes("rain") || t.includes("monsoon")) {
    textureSounds.push("rain on surfaces");
  }
  if (t.includes("footstep") || t.includes("walking") || t.includes("geta")) {
    textureSounds.push("footsteps on pavement");
  }
  if (t.includes("clinking") || t.includes("clatter")) {
    textureSounds.push("metal and glass clinking");
  }
  if (t.includes("bird") || t.includes("crow")) {
    textureSounds.push("distant bird calls");
  }

  if (textureSounds.length === 0) {
    textureSounds.push("subtle environmental texture");
  }

  return `${context.culture} ${textureSounds.join(", ")}, ${place} ${year}, ${NEGATIVE_CONSTRAINTS.slice(0, 2).join(", ")}`;
}

function buildHumanPrompt(evidenceText, context, normalized, place, year) {
  const t = evidenceText.toLowerCase();
  let humanSounds = [];

  if (t.includes("vendor") || t.includes("selling") || t.includes("hawking")) {
    humanSounds.push("distant vendor calls");
  }
  if (t.includes("market") || t.includes("barter") || t.includes("haggling")) {
    humanSounds.push("market bartering murmur");
  }
  if (t.includes("conversation") || t.includes("talking") || t.includes("chatter")) {
    humanSounds.push("scattered conversations");
  }
  if (t.includes("prayer") || t.includes("chant") || t.includes("azaan") || t.includes("ezan")) {
    humanSounds.push("distant religious chant");
  }
  if (t.includes("singing") || t.includes("music")) {
    humanSounds.push("distant musical performance");
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

    if ((text.includes("bell") || text.includes("tolling") || text.includes("chiming")) && !seenEvents.has("bell")) {
      events.push({
        name: "bell",
        prompt: `${context.culture} bell tolling, ${context.period}, single strike, resonant`,
        durationSeconds: 3,
        loop: false,
        weight: 0.3,
      });
      seenEvents.add("bell");
    }

    if ((text.includes("horn") || text.includes("foghorn") || text.includes("whistle")) && !seenEvents.has("horn")) {
      events.push({
        name: "horn",
        prompt: `${context.culture} distant horn or whistle, ${context.period}`,
        durationSeconds: 2,
        loop: false,
        weight: 0.25,
      });
      seenEvents.add("horn");
    }

    if ((text.includes("shout") || text.includes("call") || text.includes("vendor")) && !seenEvents.has("street_call")) {
      events.push({
        name: "street_call",
        prompt: `${context.culture} street vendor call, distant, ${context.period}`,
        durationSeconds: 2,
        loop: false,
        weight: 0.2,
      });
      seenEvents.add("street_call");
    }

    if ((text.includes("music") || text.includes("drum") || text.includes("accordion")) && !seenEvents.has("music")) {
      events.push({
        name: "music",
        prompt: `${context.culture} distant music or drumming, ${context.period}`,
        durationSeconds: 4,
        loop: false,
        weight: 0.15,
      });
      seenEvents.add("music");
    }

    if ((text.includes("bird") || text.includes("crow") || text.includes("koel")) && !seenEvents.has("bird_call")) {
      events.push({
        name: "bird_call",
        prompt: `${context.culture} bird call, natural, ${context.period}`,
        durationSeconds: 2,
        loop: false,
        weight: 0.15,
      });
      seenEvents.add("bird_call");
    }

    if (events.length >= 5) break;
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

// ─── Validation & coercion ──────────────────────────────────────────────

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