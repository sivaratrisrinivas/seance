import { renderHomepage } from "./render-homepage.js";
import { validateRitualQuery } from "./query-validation.js";
import { renderRitualLoading } from "./render-ritual-loading.js";
import { renderGenerating } from "./render-generating.js";
import { renderHowItWorks } from "./render-how-it-works.js";
import { renderValidationError } from "./render-validation-error.js";
import { renderArtifact } from "./render-artifact.js";
import { renderDisambiguation } from "./render-disambiguation.js";
import { resolvePlaceForYear, needsReinterpretation } from "./place-reinterpretation.js";
import { storeArtifact as tpStoreArtifact, getArtifact as tpGetArtifact, isConfigured as tpIsConfigured } from "./turbopuffer-client.js";
import { isArchived } from "./artifact-store.js";
import { generateSoundscape, isConfigured as elIsConfigured } from "./elevenlabs-client.js";
import { buildPrompts } from "./prompt-builder.js";
import { extractEvidence, getEvidenceSummary } from "./evidence-extractor.js";
import { generateReconstructionMetadata, getReconstructionSummary } from "./reconstruction-metadata.js";
import { createJob, getJob, getInFlightJob, JobState, updateJobState } from "./generation-job.js";
import { checkRateLimit } from "./rate-limiter.js";

const AMBIGUOUS_PLACES = {
  Springfield: ["Springfield, Missouri", "Springfield, Illinois"],
  Cambridge: ["Cambridge, UK", "Cambridge, Massachusetts"],
  York: ["York, UK", "New York, USA"],
  Beverly: ["Beverly Hills, California", "Beverly, Massachusetts"],
};

function generateMockPrompts(text, layerType) {
  return `mock_${layerType}_${Buffer.from(text).toString("base64").slice(0, 20)}`;
}

function generateOpaqueId(place, year) {
  return btoa(`${place}:${year}`).replace(/=/g, "");
}

export async function handleRequest({
  method = "GET",
  pathname = "/",
  searchParams = new URLSearchParams(),
} = {}) {
  if (method === "GET" && pathname === "/") {
    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderHomepage(),
    };
  }

  if (method === "GET" && pathname === "/how-it-works") {
    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderHowItWorks(),
    };
  }

  if (method === "GET" && pathname === "/disambiguate") {
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";
    const candidates = AMBIGUOUS_PLACES[place] ?? [];

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderDisambiguation({ place, year, candidates }),
    };
  }

  if (method === "GET" && pathname === "/ritual") {
    const validation = validateRitualQuery({
      place: searchParams.get("place") ?? "",
      year: searchParams.get("year") ?? "",
    });

    if (!validation.ok) {
      return {
        status: 422,
        headers: { "content-type": "text/html; charset=utf-8" },
        body: renderValidationError(validation),
      };
    }

    const evidenceCheck = extractEvidence({
      place: validation.place,
      year: validation.year,
    });
    if (evidenceCheck.blocked) {
      return {
        status: 422,
        headers: { "content-type": "text/html; charset=utf-8" },
        body: renderValidationError({
          ok: false,
          place: validation.place,
          year: validation.year,
          message: evidenceCheck.note,
        }),
      };
    }

    const placeKey = validation.place.split(",")[0].trim();
    if (AMBIGUOUS_PLACES[placeKey]) {
      const disambigUrl = `/disambiguate?place=${encodeURIComponent(placeKey)}&year=${encodeURIComponent(validation.year)}`;
      return {
        status: 302,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          location: disambigUrl,
        },
        body: `Redirecting to ${disambigUrl}`,
      };
    }

    const existingArtifact = await tpGetArtifact(validation.place, validation.year);
    if (existingArtifact && existingArtifact.audio_layers) {
      const artifactUrl = `/artifact?place=${encodeURIComponent(validation.place)}&year=${encodeURIComponent(validation.year)}&archived=true`;
      return {
        status: 302,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          location: artifactUrl,
        },
        body: `Redirecting to ${artifactUrl}`,
      };
    }

    const rateLimitCheck = checkRateLimit({
      identifier: `${validation.place}:${validation.year}`,
      type: "generation",
    });
    if (!rateLimitCheck.allowed) {
      return {
        status: 429,
        headers: { 
          "content-type": "text/html; charset=utf-8",
          "retry-after": String(rateLimitCheck.retryAfter),
        },
        body: renderValidationError({
          ok: false,
          place: validation.place,
          year: validation.year,
          message: rateLimitCheck.reason,
        }),
      };
    }

    const reinterpretation = resolvePlaceForYear(placeKey, validation.year);
    let finalPlace = validation.place;
    let reinterpretNote = "";
    if (reinterpretation.reinterpreted) {
      finalPlace = `${reinterpretation.modern} (formerly ${reinterpretation.original})`;
      reinterpretNote = `&note=${encodeURIComponent(reinterpretation.note)}`;
    }

    const opaqueId = generateOpaqueId(finalPlace, validation.year);

    await tpStoreArtifact({
      place: finalPlace,
      year: validation.year,
      metadata: { reinterpretation: reinterpretation.reinterpreted ? reinterpretation : null },
    });

    const generatingUrl = `/generating?id=${opaqueId}&place=${encodeURIComponent(validation.place)}&year=${encodeURIComponent(validation.year)}${reinterpretNote}`;
    return {
      status: 302,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        location: generatingUrl,
      },
      body: `Redirecting to ${generatingUrl}`,
    };
  }

  async function runGenerationJob(job) {
  updateJobState(job.id, JobState.EVIDENCE);
  
  try {
    const placeKey = job.place.split(",")[0].trim();
    const reconstructionMetadata = generateReconstructionMetadata({ place: placeKey, year: parseInt(job.year) });
    
    updateJobState(job.id, JobState.PROMPTS);
    
    const prompts = buildPrompts({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      evidenceByLayer: reconstructionMetadata.evidenceByLayer,
    });

    updateJobState(job.id, JobState.GENERATING);
    
    const audioLayers = await generateSoundscape({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      evidenceByLayer: reconstructionMetadata.evidenceByLayer,
    });

    const artifactData = {
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      metadata: reconstructionMetadata.reinterpretation,
      evidence: reconstructionMetadata.evidenceByLayer.bed?.concat(
        reconstructionMetadata.evidenceByLayer.event || [],
        reconstructionMetadata.evidenceByLayer.texture || []
      ) || [],
      prompts,
      audioLayers,
      confidence: reconstructionMetadata.confidence,
      confidenceScore: reconstructionMetadata.confidenceScore,
      evidenceNote: reconstructionMetadata.evidenceNote,
      sourceNotes: reconstructionMetadata.sourceNotes,
    };

    updateJobState(job.id, JobState.STORING);
    
    await tpStoreArtifact(artifactData);
    
    updateJobState(job.id, JobState.COMPLETED, { result: artifactData });
  } catch (e) {
    updateJobState(job.id, JobState.FAILED, { error: e.message });
  }
}

if (method === "GET" && pathname === "/generating") {
    const id = searchParams.get("id") ?? "";
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";
    const note = searchParams.get("note") ?? "";

    const finalId = id || (place && year ? generateOpaqueId(place, year) : "");

    let job = null;
    let audioLayers = null;
    let prompts = null;
    let error = null;
    let evidenceData = null;
    let reconstructionMetadata = null;
    let confidence = "high";
    let jobId = searchParams.get("jobId") ?? "";

    if (!jobId && place && year) {
      const existingJob = getInFlightJob(place, year);
      
      if (existingJob) {
        job = existingJob;
        jobId = existingJob.id;
      } else {
        job = createJob({ place, year });
        jobId = job.id;
        runGenerationJob(job).then(() => {});
      }
    } else if (jobId) {
      job = getJob(jobId);
    }

    if (elIsConfigured()) {
      if (job && job.state === JobState.COMPLETED && job.result) {
        audioLayers = job.result.audioLayers;
        prompts = job.result.prompts;
        confidence = job.result.confidence;
      } else if (job && job.state === JobState.FAILED) {
        error = job.error;
      }
    }

    const params = new URLSearchParams();
    if (finalId) params.set("id", finalId);
    if (place) params.set("place", place);
    if (year) params.set("year", year);
    if (note) params.set("note", note);
    if (jobId) params.set("jobId", jobId);
    if (audioLayers) params.set("generated", "true");
    if (error) params.set("error", error);
    if (reconstructionMetadata) params.set("confidence", reconstructionMetadata.confidence);

    const artifactUrl = `/artifact?${params.toString()}`;

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderGenerating({ place, year, redirectTo: artifactUrl, jobId }),
    };
  }

  if (method === "GET" && pathname === "/artifact") {
    const id = searchParams.get("id");
    let place = searchParams.get("place") ?? "";
    let year = searchParams.get("year") ?? "";
    const note = searchParams.get("note") ?? "";
    const archived = searchParams.get("archived") === "true";
    const generated = searchParams.get("generated") === "true";
    const error = searchParams.get("error") ?? "";

    if (id && !place && !year) {
      const decoded = atob(id);
      const parts = decoded.split(":");
      place = parts[0] || "";
      year = parts[1] || "";
    }

    let artifactData = null;
    let confidence = "high";
    let isArchived = archived;
    if (place && year && tpIsConfigured()) {
      artifactData = await tpGetArtifact(place, year);
      if (artifactData) {
        confidence = artifactData?.confidence || "high";
        if (!generated && !archived) {
          isArchived = true;
        }
      }
    }

    const reinterpretation = note
      ? { reinterpreted: true, note: note }
      : null;

    const audioLayers = artifactData?.audio_layers ? JSON.parse(artifactData.audio_layers) : null;
    const partial = audioLayers?.isPartial === true;

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderArtifact({ 
        place, 
        year, 
        archived: isArchived, 
        reinterpretation,
        generated,
        error,
        confidence: artifactData?.confidence || confidence || "high",
        confidenceScore: artifactData?.confidence_score || null,
        evidence: artifactData?.evidence ? JSON.parse(artifactData.evidence) : null,
        evidenceNote: artifactData?.evidence_note || null,
        sourceNotes: artifactData?.source_notes || null,
        audioLayers,
        partial,
      }),
    };
  }

  if (method === "GET" && pathname === "/debug/artifact") {
    const id = searchParams.get("id");
    let place = searchParams.get("place") ?? "";
    let year = searchParams.get("year") ?? "";

    if (id && !place && !year) {
      const decoded = atob(id);
      const parts = decoded.split(":");
      place = parts[0] || "";
      year = parts[1] || "";
    }

    let artifactData = null;
    if (place && year && tpIsConfigured()) {
      artifactData = await tpGetArtifact(place, year);
    }

    return {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        query: { place, year, id },
        archived: !!artifactData,
        artifact: artifactData ? {
          place: artifactData.place,
          year: artifactData.year,
          version: artifactData.version || 1,
          confidence: artifactData.confidence,
          confidenceScore: artifactData.confidence_score,
          evidence: artifactData.evidence ? JSON.parse(artifactData.evidence) : null,
          evidenceNote: artifactData.evidence_note,
          sourceNotes: artifactData.source_notes,
          prompts: artifactData.prompts ? JSON.parse(artifactData.prompts) : null,
          audioLayers: artifactData.audio_layers_ref ? JSON.parse(artifactData.audio_layers_ref) : null,
          metadata: artifactData.metadata ? JSON.parse(artifactData.metadata) : null,
          createdAt: artifactData.created_at,
        } : null,
      }, null, 2),
    };
  }

  if (method === "POST" && pathname === "/debug/regenerate") {
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";
    const force = searchParams.get("force") === "true";

    if (!place || !year) {
      return {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "place and year required" }),
      };
    }

    const existing = await tpGetArtifact(place, year);
    const newVersion = existing ? (existing.version || 1) + 1 : 1;

    const placeKey = place.split(",")[0].trim();
    const reconstructionMetadata = generateReconstructionMetadata({ place: placeKey, year: parseInt(year) });

    const prompts = buildPrompts({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      evidenceByLayer: reconstructionMetadata.evidenceByLayer,
    });

    let audioLayers;
    const useMockMode = !elIsConfigured();
    
    if (useMockMode) {
      audioLayers = {
        bed: generateMockPrompts(prompts.bed, "bed"),
        event: generateMockPrompts(prompts.event, "event"),
        texture: generateMockPrompts(prompts.texture, "texture"),
        isMock: true,
      };
    } else {
      try {
        audioLayers = await generateSoundscape({
          place: reconstructionMetadata.canonicalPlace,
          year: reconstructionMetadata.year,
          evidenceByLayer: reconstructionMetadata.evidenceByLayer,
        });
        if (audioLayers.isMock) {
          console.log("Using mock audio (ElevenLabs returned mock)");
        }
      } catch (e) {
        console.warn("Audio generation failed, using fallback:", e.message);
        audioLayers = { 
          bed: "mock_fallback_bed", 
          event: "mock_fallback_event", 
          texture: "mock_fallback_texture", 
          isMock: true 
        };
      }
    }

    const artifactData = {
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      version: newVersion,
      metadata: reconstructionMetadata.reinterpretation,
      evidence: reconstructionMetadata.evidenceByLayer.bed?.concat(
        reconstructionMetadata.evidenceByLayer.event || [],
        reconstructionMetadata.evidenceByLayer.texture || []
      ) || [],
      prompts,
      audioLayers,
      confidence: reconstructionMetadata.confidence,
      confidenceScore: reconstructionMetadata.confidenceScore,
      evidenceNote: reconstructionMetadata.evidenceNote,
      sourceNotes: reconstructionMetadata.sourceNotes,
    };

    await tpStoreArtifact(artifactData);

    return {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        action: "regenerated",
        previousVersion: existing?.version || null,
        newVersion,
        mode: force ? "forced" : "incremental",
      }, null, 2),
    };
  }

  if (method === "GET" && pathname === "/job/status") {
    const jobId = searchParams.get("id") ?? "";
    
    if (!jobId) {
      return {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "job id required" }),
      };
    }
    
    const job = getJob(jobId);
    if (!job) {
      return {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ error: "job not found" }),
      };
    }
    
    return {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        id: job.id,
        state: job.state,
        stage: job.stage,
        place: job.place,
        year: job.year,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }),
    };
  }

  return {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Not Found",
  };
}
