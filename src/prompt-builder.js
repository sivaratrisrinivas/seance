/**
 * prompt-builder.js — Build ElevenLabs-ready prompts from evidence.
 *
 * Uses PLACE_CONTEXT for cultural grounding and derives the period from
 * the actual query year instead of a hardcoded default.
 *
 * This module builds prompts from raw evidence. In the platonic pipeline,
 * the soundscape plan from Gemini already contains prompts — this module
 * serves as the fallback prompt builder for when Gemini isn't available.
 */

import { extractEvidenceByLayer } from "./evidence-extractor.js";

// ─── Prompt length limit (ElevenLabs ~1000 chars) ───────────────────────

const MAX_PROMPT_LENGTH = 950;

function truncatePrompt(prompt) {
  if (prompt.length <= MAX_PROMPT_LENGTH) return prompt;
  return prompt.slice(0, MAX_PROMPT_LENGTH - 3) + "...";
}

// ─── Negative constraints ───────────────────────────────────────────────

const NEGATIVE_CONSTRAINTS = {
  modern: "no modern electronic or synthetic sounds, no oscillators",
  film: "no cinematic score, no musical instruments, no rhythm",
  dramatic: "no dramatic or theatrical presentation, no narration",
  generic: "not generic, no stock ambience",
  violence: "no graphic or violent sounds",
  sensitive: "no graphic description, not violent or exploitative",
};

// ─── Place context ──────────────────────────────────────────────────────

const PLACE_CONTEXT = {
  Hyderabad: { region: "South Asia", culture: "Indian" },
  Mumbai: { region: "South Asia", culture: "Indian" },
  Kolkata: { region: "South Asia", culture: "Indian" },
  Delhi: { region: "South Asia", culture: "Indian" },
  Chennai: { region: "South Asia", culture: "Indian" },
  Bangalore: { region: "South Asia", culture: "Indian" },
  Tokyo: { region: "East Asia", culture: "Japanese" },
  Kyoto: { region: "East Asia", culture: "Japanese" },
  Shanghai: { region: "East Asia", culture: "Chinese" },
  Beijing: { region: "East Asia", culture: "Chinese" },
  HongKong: { region: "East Asia", culture: "Chinese" },
  Singapore: { region: "Southeast Asia", culture: "Singaporean" },
  Bangkok: { region: "Southeast Asia", culture: "Thai" },
  Manila: { region: "Southeast Asia", culture: "Filipino" },
  Yangon: { region: "Southeast Asia", culture: "Burmese" },
  HoChiMinhCity: { region: "Southeast Asia", culture: "Vietnamese" },
  Istanbul: { region: "Middle East", culture: "Turkish" },
  Cairo: { region: "Middle East", culture: "Egyptian" },
  Jerusalem: { region: "Middle East", culture: "Middle Eastern" },
  Beirut: { region: "Middle East", culture: "Lebanese" },
  Moscow: { region: "Eastern Europe", culture: "Russian" },
  StPetersburg: { region: "Eastern Europe", culture: "Russian" },
  Paris: { region: "Western Europe", culture: "French" },
  London: { region: "Western Europe", culture: "British" },
  Berlin: { region: "Western Europe", culture: "German" },
  Rome: { region: "Southern Europe", culture: "Italian" },
  Vienna: { region: "Central Europe", culture: "Austrian" },
  NewYork: { region: "North America", culture: "American" },
  LosAngeles: { region: "North America", culture: "American" },
  Chicago: { region: "North America", culture: "American" },
  Detroit: { region: "North America", culture: "American" },
  Havana: { region: "Caribbean", culture: "Cuban" },
  RioDeJaneiro: { region: "South America", culture: "Brazilian" },
  BuenosAires: { region: "South America", culture: "Argentinian" },
  MexicoCity: { region: "North America", culture: "Mexican" },
};

/**
 * Get cultural context for a place. Derives the period from the actual year.
 */
export function getPlaceContext(place, year = null) {
  const key = place.replace(/\s+/g, "").split(",")[0].replace(/\(.*\)/, "").trim();
  const base = PLACE_CONTEXT[key] || { region: "Unknown", culture: "International" };

  // Derive period from actual year instead of hardcoding
  const yearNum = parseInt(year, 10);
  let period = "Historical";
  if (yearNum) {
    if (yearNum < 1800) period = `${Math.floor(yearNum / 100) * 100}s`;
    else if (yearNum < 1900) period = "19th century";
    else period = `${Math.floor(yearNum / 10) * 10}s`;
  }

  return { ...base, period };
}

// ─── Sensitive period detection ─────────────────────────────────────────

function isSensitivePeriod(year) {
  const yearNum = parseInt(year, 10);
  return yearNum >= 1914 && yearNum <= 1945;
}

// ─── Prompt builders ────────────────────────────────────────────────────

function buildBedPrompt(metadata, context) {
  const { place, year, evidence } = metadata;
  const { bed } = extractEvidenceByLayer(evidence);

  let prompt = `High-fidelity field-recording, wide stereo. ${context.culture} ${context.region} urban ambient soundscape, ${place} ${year}`;

  if (bed.length > 0) {
    const descriptions = bed.map(e => e.description).join(", ");
    // Limit evidence text to keep prompt under limit
    const maxEvidenceLen = MAX_PROMPT_LENGTH - prompt.length - 200;
    const truncatedDescs = descriptions.length > maxEvidenceLen
      ? descriptions.slice(0, maxEvidenceLen) + "..."
      : descriptions;
    prompt += `. Based on evidence: ${truncatedDescs}`;
  }

  let constraints = [NEGATIVE_CONSTRAINTS.modern, NEGATIVE_CONSTRAINTS.film, NEGATIVE_CONSTRAINTS.generic];
  if (isSensitivePeriod(year)) {
    constraints.push(NEGATIVE_CONSTRAINTS.sensitive);
  }
  prompt += `. ${constraints.join(", ")}`;

  return truncatePrompt(prompt);
}

function buildEventPrompt(metadata, context) {
  const { place, year, evidence } = metadata;
  const { event } = extractEvidenceByLayer(evidence);

  let prompt = `Indistinct background walla. ${context.culture} recurring ${context.period} soundscape in ${place}, ${year}`;

  if (event.length > 0) {
    const descriptions = event.map(e => e.description).join(", ");
    const maxEvidenceLen = MAX_PROMPT_LENGTH - prompt.length - 200;
    const truncatedDescs = descriptions.length > maxEvidenceLen
      ? descriptions.slice(0, maxEvidenceLen) + "..."
      : descriptions;
    prompt += `. Based on evidence: ${truncatedDescs}`;
  } else {
    prompt += ". Subtle recurring sounds, not dramatic";
  }

  let constraints = [NEGATIVE_CONSTRAINTS.modern, NEGATIVE_CONSTRAINTS.dramatic, NEGATIVE_CONSTRAINTS.film];
  if (isSensitivePeriod(year)) {
    constraints.push(NEGATIVE_CONSTRAINTS.sensitive);
  }
  prompt += `. ${constraints.join(", ")}`;

  return truncatePrompt(prompt);
}

function buildTexturePrompt(metadata, context, confidence) {
  const { place, year, evidence } = metadata;
  const { texture } = extractEvidenceByLayer(evidence);

  let prompt = `Detailed mid-ground foley, close-mic. ${context.culture} subtle environmental texture of ${place}, ${year}`;

  if (texture.length > 0) {
    const descriptions = texture.map(e => e.description).join(", ");
    const maxEvidenceLen = MAX_PROMPT_LENGTH - prompt.length - 200;
    const truncatedDescs = descriptions.length > maxEvidenceLen
      ? descriptions.slice(0, maxEvidenceLen) + "..."
      : descriptions;
    prompt += `. Based on evidence: ${truncatedDescs}`;
  }

  if (confidence === "low") {
    prompt += ". Inferred from regional era characteristics, uncertain reconstruction";
  }

  let constraints = [NEGATIVE_CONSTRAINTS.modern, NEGATIVE_CONSTRAINTS.generic];
  if (isSensitivePeriod(year)) {
    constraints.push(NEGATIVE_CONSTRAINTS.sensitive);
  }
  prompt += `. ${constraints.join(", ")}`;

  return truncatePrompt(prompt);
}

// ─── Public API ─────────────────────────────────────────────────────────

export function buildHeroPrompts(metadata) {
  const { place, confidence = "high", year } = metadata;
  const context = getPlaceContext(place, year);

  return {
    bed: buildBedPrompt(metadata, context),
    event: buildEventPrompt(metadata, context),
    texture: buildTexturePrompt(metadata, context, confidence),
  };
}

export function buildPrompts({ place, year, evidence, evidenceByLayer = null }) {
  const context = getPlaceContext(place, year);

  const metadata = {
    place,
    year,
    evidence: evidence || [],
  };

  if (evidenceByLayer) {
    metadata.evidence = [
      ...(evidenceByLayer.bed || []),
      ...(evidenceByLayer.event || []),
      ...(evidenceByLayer.texture || []),
    ];
  }

  const confidence = evidenceByLayer
    ? (evidenceByLayer.bed?.length > 0 || evidenceByLayer.event?.length > 0 || evidenceByLayer.texture?.length > 0 ? "high" : "low")
    : "high";

  return {
    bed: buildBedPrompt(metadata, context),
    event: buildEventPrompt(metadata, context),
    texture: buildTexturePrompt(metadata, context, confidence),
  };
}