const TURBOPUFFER_API_KEY = process.env.TURBOPUFFER_API_KEY;
const TURBOPUFFER_REGION = process.env.TURBOPUFFER_REGION || "gcp-us-central1";
const NAMESPACE = process.env.TURBOPUFFER_NAMESPACE || "seance-artifacts";

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
    inMemoryStore.set(id, { ...artifact, storedAt: new Date().toISOString(), version: artifact.version || 1 });
    return { id, mode: "memory", version: artifact.version || 1 };
  }

  const id = `${artifact.place}:${artifact.year}`;
  const version = artifact.version || 1;
  
  const audioLayersRef = artifact.audioLayers ? {
    hasAudio: true,
    isMock: artifact.audioLayers.isMock || false,
  } : null;
  
  const doc = {
    id,
    place: artifact.place,
    year: String(artifact.year),
    version,
    metadata: artifact.metadata ? JSON.stringify(artifact.metadata) : null,
    evidence: artifact.evidence ? JSON.stringify(artifact.evidence) : null,
    audio_layers_ref: audioLayersRef ? JSON.stringify(audioLayersRef) : null,
    prompts: artifact.prompts ? JSON.stringify(artifact.prompts) : null,
    confidence: artifact.confidence || artifact.confidenceScore ? parseFloat(artifact.confidenceScore || 0.85) : null,
    confidence_score: artifact.confidenceScore ? parseFloat(artifact.confidenceScore) : null,
    evidence_note: artifact.evidenceNote || null,
    source_notes: artifact.sourceNotes || null,
    created_at: new Date().toISOString(),
  };

  await turbopufferRequest("", "POST", {
    upsert_rows: [doc],
  });

  return { id, mode: "turbopuffer", version };
}

export async function getArtifact(place, year) {
  const id = `${place}:${year}`;

  if (!TURBOPUFFER_API_KEY) {
    return inMemoryStore.get(id) || null;
  }

  try {
    const result = await turbopufferRequest("/query", "POST", {
      filters: ["id", "Eq", id],
      rank_by: ["id", "asc"],
      limit: 1,
      include_attributes: true,
    });

    if (result.rows && result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (e) {
    console.warn("Turbopuffer query failed, using memory fallback:", e.message);
  }

  return inMemoryStore.get(id) || null;
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