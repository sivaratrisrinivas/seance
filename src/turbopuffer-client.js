const TURBOPUFFER_API_KEY = process.env.TURBOPUFFER_API_KEY;
const TURBOPUFFER_REGION = process.env.TURBOPUFFER_REGION || "gcp-us-central1";
const NAMESPACE = process.env.TURBOPUFFER_NAMESPACE || "seance-artifacts";
const SCHEMA_VERSION = 2;

const BASE_URL = `https://${TURBOPUFFER_REGION}.turbopuffer.com/v2/namespaces/${NAMESPACE}`;

const inMemoryStore = new Map();

async function turbopufferRequest(path, method = "POST", body = null) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TURBOPUFFER_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Turbopuffer API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function storeArtifact(artifact) {
  if (!TURBOPUFFER_API_KEY) {
    const id = `${artifact.place}:${artifact.year}`;
    inMemoryStore.set(id, { 
      ...artifact, 
      storedAt: new Date().toISOString(), 
      version: artifact.version || SCHEMA_VERSION,
      schema_version: SCHEMA_VERSION,
    });
    console.log(`[TURBOPUFFER] Stored artifact in MEMORY: ${id}, schema: v${SCHEMA_VERSION}`);
    return { id, mode: "memory", version: artifact.version || SCHEMA_VERSION };
  }

  const id = `${artifact.place}:${artifact.year}`;
  const version = artifact.version || 1;
  
  const audioLayersRef = artifact.audioLayers ? JSON.stringify(artifact.audioLayers) : null;
  const hasAudio = !!(artifact.audioLayers?.bed || artifact.audioLayers?.event || artifact.audioLayers?.texture);

  const hasExtendedAudio = artifact.audioLayersExtended || artifact.events?.length > 0;
  
  const doc = {
    id,
    place: artifact.place,
    year: String(artifact.year),
    version,
    schema_version: SCHEMA_VERSION,
    place_input: artifact.placeInput || artifact.place || null,
    year_input: artifact.yearInput || String(artifact.year) || null,
    resolved_place: artifact.resolvedPlace || artifact.place || null,
    resolved_year: artifact.resolvedYear ? String(artifact.resolvedYear) : String(artifact.year) || null,
    interpretation_note: artifact.interpretationNote || artifact.metadata?.note || null,
    evidence_quality: artifact.evidenceQuality || null,
    metadata: artifact.metadata ? JSON.stringify(artifact.metadata) : null,
    evidence: artifact.evidence ? JSON.stringify(artifact.evidence) : null,
    audio_layers: audioLayersRef,
    prompts: artifact.prompts ? JSON.stringify(artifact.prompts) : null,
    confidence: artifact.confidence || artifact.confidenceScore ? parseFloat(artifact.confidenceScore || 0.85) : null,
    confidence_score: artifact.confidenceScore ? parseFloat(artifact.confidenceScore) : null,
    evidence_note: artifact.evidenceNote || null,
    source_notes: artifact.sourceNotes || null,
    raw_evidence: artifact.rawEvidence ? JSON.stringify(artifact.rawEvidence) : null,
    normalized_evidence: artifact.normalizedEvidence ? JSON.stringify(artifact.normalizedEvidence) : null,
    soundscape_plan: artifact.soundscapePlan ? JSON.stringify(artifact.soundscapePlan) : null,
    audio_layers_extended: artifact.audioLayersExtended ? JSON.stringify(artifact.audioLayersExtended) : null,
    summary: artifact.summary || null,
    source_mode: artifact.sourceMode || "fresh",
    created_at: new Date().toISOString(),
  };

  console.log(`[TURBOPUFFER] Storing artifact: ${id}, version: ${version}, schema: v${SCHEMA_VERSION}, hasExtendedAudio: ${hasExtendedAudio}`);
  
  await turbopufferRequest("", "POST", {
    upsert_rows: [doc],
    schema: {
      audio_layers: { type: "string", filterable: false },
      prompts: { type: "string", filterable: false },
      metadata: { type: "string", filterable: false },
      evidence: { type: "string", filterable: false },
      raw_evidence: { type: "string", filterable: false },
      normalized_evidence: { type: "string", filterable: false },
      soundscape_plan: { type: "string", filterable: false },
      audio_layers_extended: { type: "string", filterable: false },
      schema_version: { type: "int", filterable: true },
    },
  });

  console.log(`[TURBOPUFFER] Stored successfully: ${id}`);
  return { id, mode: "turbopuffer", version };
}

export async function getArtifact(place, year) {
  const id = `${place}:${year}`;

  if (!TURBOPUFFER_API_KEY) {
    const result = inMemoryStore.get(id) || null;
    console.log(`[TURBOPUFFER] Retrieved from MEMORY: ${id} (${result ? "found" : "not found"})`);
    return result ? parseArtifactWithDefaults(result) : null;
  }

  console.log(`[TURBOPUFFER] Querying for: ${id}`);
  try {
    const result = await turbopufferRequest("/query", "POST", {
      filters: ["id", "Eq", id],
      rank_by: ["id", "asc"],
      limit: 1,
      include_attributes: true,
    });

    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      console.log(`[TURBOPUFFER] Found artifact: ${id}, version: ${row.version}, schema: v${row.schema_version || 1}`);
      return parseArtifactWithDefaults(row);
    }
    console.log(`[TURBOPUFFER] No artifact found: ${id}`);
  } catch (e) {
    console.warn("Turbopuffer query failed, using memory fallback:", e.message);
  }

  const fallback = inMemoryStore.get(id) || null;
  return fallback ? parseArtifactWithDefaults(fallback) : null;
}

function parseArtifactWithDefaults(artifact) {
  if (!artifact) return null;

  const parsed = { ...artifact };

  if (artifact.normalized_evidence && typeof artifact.normalized_evidence === "string") {
    try {
      parsed.normalized_evidence = JSON.parse(artifact.normalized_evidence);
    } catch (e) {
      console.warn("[turbopuffer] Failed to parse normalized_evidence:", e.message);
    }
  }

  if (artifact.soundscape_plan && typeof artifact.soundscape_plan === "string") {
    try {
      parsed.soundscape_plan = JSON.parse(artifact.soundscape_plan);
    } catch (e) {
      console.warn("[turbopuffer] Failed to parse soundscape_plan:", e.message);
    }
  }

  if (artifact.audio_layers_extended && typeof artifact.audio_layers_extended === "string") {
    try {
      parsed.audio_layers_extended = JSON.parse(artifact.audio_layers_extended);
    } catch (e) {
      console.warn("[turbopuffer] Failed to parse audio_layers_extended:", e.message);
    }
  }

  if (artifact.raw_evidence && typeof artifact.raw_evidence === "string") {
    try {
      parsed.raw_evidence = JSON.parse(artifact.raw_evidence);
    } catch (e) {
      console.warn("[turbopuffer] Failed to parse raw_evidence:", e.message);
    }
  }

  const schemaVersion = artifact.schema_version || 1;
  if (schemaVersion < 2) {
    console.log(`[turbopuffer] Legacy artifact detected (schema v${schemaVersion}), applying defaults`);
    parsed.schema_version = schemaVersion;
    
    if (!parsed.audio_layers_extended && artifact.audio_layers) {
      const legacyLayers = typeof artifact.audio_layers === "string" 
        ? JSON.parse(artifact.audio_layers) 
        : artifact.audio_layers;
      parsed.audio_layers_extended = {
        bed: legacyLayers.bed ? { audioUrl: legacyLayers.bed, prompt: "", durationSeconds: 20, loop: true } : null,
        texture: legacyLayers.texture ? { audioUrl: legacyLayers.texture, prompt: "", durationSeconds: 20, loop: true } : null,
        human: legacyLayers.event ? { audioUrl: legacyLayers.event, prompt: "", durationSeconds: 15, loop: true } : null,
        events: [],
        isMock: legacyLayers.isMock || false,
        isPartial: legacyLayers.isPartial || false,
      };
    }
  }

  return parsed;
}

export async function searchSimilar(place, year, limit = 5) {
  const id = `${place}:${year}`;

  if (!TURBOPUFFER_API_KEY) {
    const results = [];
    for (const [key, value] of inMemoryStore.entries()) {
      if (key !== id) {
        results.push({ id: key, ...value });
      }
    }
    return results.slice(0, limit);
  }

  const result = await turbopufferRequest("/query", "POST", {
    filters: ["id", "NotEq", id],
    limit,
    include_attributes: true,
  });

  return result.rows || [];
}

export function isConfigured() {
  return !!TURBOPUFFER_API_KEY;
}

export function getConfig() {
  return {
    region: TURBOPUFFER_REGION,
    namespace: NAMESPACE,
    mode: TURBOPUFFER_API_KEY ? "turbopuffer" : "memory",
  };
}