const NEGATIVE_CONSTRAINTS = {
  modern: "no modern electronic or synthetic sounds",
  film: "not a film score or hollywood style",
  dramatic: "no dramatic or theatrical presentation",
  generic: "not generic or stock ambience",
  violence: "no graphic or violent sounds",
  sensitive: "no graphic description, not violent or exploitative",
};

const PLACE_CONTEXT = {
  Hyderabad: { region: "South Asia", culture: "Indian", period: "1980s" },
  Bombay: { region: "South Asia", culture: "Indian", period: "1970s" },
  Calcutta: { region: "South Asia", culture: "Indian", period: "1940s" },
  Delhi: { region: "South Asia", culture: "Indian", period: "1980s" },
  Chennai: { region: "South Asia", culture: "Indian", period: "1980s" },
  Bangalore: { region: "South Asia", culture: "Indian", period: "1980s" },
  Tokyo: { region: "East Asia", culture: "Japanese", period: "1960s" },
  Kyoto: { region: "East Asia", culture: "Japanese", period: "1910s" },
  Shanghai: { region: "East Asia", culture: "Chinese", period: "1930s" },
  Beijing: { region: "East Asia", culture: "Chinese", period: "1960s" },
  HongKong: { region: "East Asia", culture: "Chinese", period: "1960s" },
  Singapore: { region: "Southeast Asia", culture: "Singaporean", period: "1960s" },
  Bangkok: { region: "Southeast Asia", culture: "Thai", period: "1970s" },
  Manila: { region: "Southeast Asia", culture: "Filipino", period: "1960s" },
  Istanbul: { region: "Middle East", culture: "Turkish", period: "1960s" },
  Cairo: { region: "Middle East", culture: "Egyptian", period: "1960s" },
  Jerusalem: { region: "Middle East", culture: "Middle Eastern", period: "1940s" },
  Beirut: { region: "Middle East", culture: "Lebanese", period: "1960s" },
  Moscow: { region: "Eastern Europe", culture: "Russian", period: "1960s" },
  Leningrad: { region: "Eastern Europe", culture: "Russian", period: "1960s" },
  Paris: { region: "Western Europe", culture: "French", period: "1960s" },
  London: { region: "Western Europe", culture: "British", period: "1960s" },
  Berlin: { region: "Western Europe", culture: "German", period: "1960s" },
  Rome: { region: "Southern Europe", culture: "Italian", period: "1960s" },
  Vienna: { region: "Central Europe", culture: "Austrian", period: "1960s" },
  NewYork: { region: "North America", culture: "American", period: "1960s" },
  LosAngeles: { region: "North America", culture: "American", period: "1960s" },
  Chicago: { region: "North America", culture: "American", period: "1960s" },
  Detroit: { region: "North America", culture: "American", period: "1960s" },
  Havana: { region: "Caribbean", culture: "Cuban", period: "1950s" },
  RioDeJaneiro: { region: "South America", culture: "Brazilian", period: "1960s" },
  BuenosAires: { region: "South America", culture: "Argentinian", period: "1960s" },
  MexicoCity: { region: "North America", culture: "Mexican", period: "1960s" },
};

function getPlaceContext(place) {
  const key = place.replace(/\s+/g, "");
  return PLACE_CONTEXT[key] || { region: "Unknown", culture: "International", period: "Historical" };
}

function extractEvidenceByLayer(evidence) {
  const bed = [];
  const event = [];
  const texture = [];

  for (const e of evidence || []) {
    const supports = e.supports || [];
    if (supports.includes("bed") || supports.includes("multiple")) bed.push(e);
    if (supports.includes("event") || supports.includes("multiple")) event.push(e);
    if (supports.includes("texture") || supports.includes("multiple")) texture.push(e);
  }

  return { bed, event, texture };
}

function isSensitivePeriod(year) {
  const yearNum = parseInt(year, 10);
  return yearNum >= 1914 && yearNum <= 1945;
}

function buildBedPrompt(metadata, context) {
  const { place, year, evidence } = metadata;
  const { bed } = extractEvidenceByLayer(evidence);

  let prompt = `${context.culture} ${context.region} urban ambient soundscape, ${place} ${year}`;

  if (bed.length > 0) {
    prompt += `. Based on evidence: ${bed.map(e => e.description).join(", ")}`;
  }

  let constraints = [NEGATIVE_CONSTRAINTS.modern, NEGATIVE_CONSTRAINTS.film, NEGATIVE_CONSTRAINTS.generic];
  if (isSensitivePeriod(year)) {
    constraints.push(NEGATIVE_CONSTRAINTS.sensitive);
  }
  prompt += `. ${constraints.join(", ")}`;

  return prompt;
}

function buildEventPrompt(metadata, context) {
  const { place, year, evidence } = metadata;
  const { event } = extractEvidenceByLayer(evidence);

  let prompt = `${context.culture} recurring ${context.period} sounds in ${place}, ${year}`;

  if (event.length > 0) {
    prompt += `. Based on evidence: ${event.map(e => e.description).join(", ")}`;
  } else {
    prompt += ". Subtle recurring sounds, not dramatic";
  }

  let constraints = [NEGATIVE_CONSTRAINTS.modern, NEGATIVE_CONSTRAINTS.dramatic, NEGATIVE_CONSTRAINTS.film];
  if (isSensitivePeriod(year)) {
    constraints.push(NEGATIVE_CONSTRAINTS.sensitive);
  }
  prompt += `. ${constraints.join(", ")}`;

  return prompt;
}

function buildTexturePrompt(metadata, context, confidence) {
  const { place, year, evidence } = metadata;
  const { texture } = extractEvidenceByLayer(evidence);

  let prompt = `${context.culture} subtle environmental texture of ${place}, ${year}`;

  if (texture.length > 0) {
    prompt += `. Based on evidence: ${texture.map(e => e.description).join(", ")}`;
  }

  if (confidence === "low") {
    prompt += ". Inferred from regional era characteristics, uncertain reconstruction";
  }

  let constraints = [NEGATIVE_CONSTRAINTS.modern, NEGATIVE_CONSTRAINTS.generic];
  if (isSensitivePeriod(year)) {
    constraints.push(NEGATIVE_CONSTRAINTS.sensitive);
  }
  prompt += `. ${constraints.join(", ")}`;

  return prompt;
}

export function buildHeroPrompts(metadata) {
  const { place, confidence = "high" } = metadata;
  const context = getPlaceContext(place);

  return {
    bed: buildBedPrompt(metadata, context),
    event: buildEventPrompt(metadata, context),
    texture: buildTexturePrompt(metadata, context, confidence),
  };
}

export function buildPrompts({ place, year, evidence, evidenceByLayer = null }) {
  const context = getPlaceContext(place);

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