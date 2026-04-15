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
import { generateLayers } from "./generate-layers.js";
import { buildPrompts } from "./prompt-builder.js";
import { extractEvidence, getEvidenceSummary } from "./evidence-extractor.js";
import { normalizeEvidence, coerceNormalizedEvidence } from "./normalize-evidence.js";
import { planSoundscape, coerceSoundscapePlan, buildFallbackSoundscapePlan } from "./plan-soundscape.js";
import { generateEvidenceFromGemini, parseEvidenceFromGeminiResponse, isConfigured as geminiIsConfigured } from "./gemini-client.js";
import { generateReconstructionMetadata, getReconstructionSummary } from "./reconstruction-metadata.js";
import { createJob, getJob, getInFlightJob, JobState, updateJobState, setInFlightJob } from "./generation-job.js";
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

    let evidenceCheck = extractEvidence({
      place: validation.place,
      year: validation.year,
    });
    console.log(`[PIPELINE] /ritual: Extracted ${evidenceCheck.evidence?.length || 0} evidence items for ${validation.place}, ${validation.year} (confidence: ${evidenceCheck.confidence})`);
    
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
    
    if ((evidenceCheck.evidence?.length === 0 || evidenceCheck.confidence === "low" || evidenceCheck.confidence === "medium") && geminiIsConfigured()) {
      try {
        console.log(`[PIPELINE] /ritual: Calling Gemini for evidence...`);
        const geminiPrompt = `${placeKey} in ${validation.year}. Provide sensory-rich historical fragments about the soundscape: ambient sounds, human activity, mechanical/industrial, nature, intermittent events, and specific sound events.`;
        const geminiResponse = await generateEvidenceFromGemini({
          place: placeKey,
          year: validation.year,
          textFragments: [geminiPrompt],
        });
        const parsedEvidence = parseEvidenceFromGeminiResponse(geminiResponse);
        if (parsedEvidence?.length > 0) {
          console.log(`[PIPELINE] /ritual: Gemini generated ${parsedEvidence.length} evidence items`);
          evidenceCheck = {
            evidence: parsedEvidence,
            confidence: "gemini",
            note: "Evidence generated from Google Gemini AI",
          };
        }
      } catch (geminiError) {
        console.warn("Gemini evidence extraction failed:", geminiError.message);
      }
    }

    const existingArtifact = await tpGetArtifact(validation.place, validation.year);
    console.log(`[PIPELINE] /ritual: Checking for existing artifact in turbopuffer: ${existingArtifact ? "found" : "not found"}`);
    if (existingArtifact && existingArtifact.audio_layers) {
      const artifactUrl = `/artifact?place=${encodeURIComponent(validation.place)}&year=${encodeURIComponent(validation.year)}&archived=true`;
      console.log(`[PIPELINE] /ritual: Found existing artifact with audio, redirecting to /artifact (ARCHIVE HIT)`);
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

    const generatingUrl = `/generating?id=${opaqueId}&place=${encodeURIComponent(validation.place)}&year=${encodeURIComponent(validation.year)}${reinterpretNote}`;
    console.log(`[PIPELINE] /ritual: No artifact found, redirecting to /generating (FRESH GENERATION)`);
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
  console.log(`[PIPELINE] /generating: Job ${job.id} started for ${job.place}, ${job.year}`);
  
  try {
    const placeKey = job.place.split(",")[0].trim();
    console.log(`[PIPELINE] /generating: Job ${job.id} - EVIDENCE phase: Calling generateReconstructionMetadata...`);
    const reconstructionMetadata = await generateReconstructionMetadata({ 
      place: placeKey, 
      year: parseInt(job.year),
      preExtractedEvidence: job.preExtractedEvidence,
    });
    console.log(`[PIPELINE] /generating: Job ${job.id} - EVIDENCE phase: Got ${reconstructionMetadata.evidenceCount} evidence items, confidence: ${reconstructionMetadata.confidence}`);

    const allEvidence = [
      ...(reconstructionMetadata.evidenceByLayer.bed || []),
      ...(reconstructionMetadata.evidenceByLayer.event || []),
      ...(reconstructionMetadata.evidenceByLayer.texture || []),
    ];

    updateJobState(job.id, "NORMALIZING");
    console.log(`[PIPELINE] /generating: Job ${job.id} - NORMALIZE phase: Normalizing evidence...`);
    const normalizedEvidence = await normalizeEvidence({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      rawEvidence: allEvidence,
      confidence: reconstructionMetadata.confidence,
    });
    console.log(`[PIPELINE] /generating: Job ${job.id} - NORMALIZE phase: Normalized (confidence: ${normalizedEvidence.confidence}, fragments: ${normalizedEvidence.evidenceFragments?.length || 0})`);

    updateJobState(job.id, "PLANNING");
    console.log(`[PIPELINE] /generating: Job ${job.id} - PLAN phase: Planning soundscape...`);
    const soundscapePlan = await planSoundscape({
      normalizedEvidence,
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
    });
    console.log(`[PIPELINE] /generating: Job ${job.id} - PLAN phase: Planned (bed: ${soundscapePlan.bed?.prompt?.slice(0, 40)}..., events: ${soundscapePlan.events?.length || 0})`);

    updateJobState(job.id, JobState.PROMPTS);
    console.log(`[PIPELINE] /generating: Job ${job.id} - PROMPTS phase: Building generation prompts...`);
    
    const prompts = buildPrompts({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      evidenceByLayer: reconstructionMetadata.evidenceByLayer,
    });
    console.log(`[PIPELINE] /generating: Job ${job.id} - PROMPTS phase: Prompts built (bed: ${prompts.bed?.slice(0, 50)}...)`);

    updateJobState(job.id, JobState.GENERATING);
    console.log(`[PIPELINE] /generating: Job ${job.id} - GENERATING phase: Calling ElevenLabs for layered audio...`);
    
    const audioLayers = await generateLayers({
      soundscapePlan,
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
    });
    console.log(`[PIPELINE] /generating: Job ${job.id} - GENERATING phase: Audio generated (isMock: ${audioLayers.isMock}, hasAudio: ${!!audioLayers.bed}, events: ${audioLayers.events?.length || 0})`);

    const artifactData = {
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      version: 2,
      schemaVersion: 2,
      placeInput: job.place,
      yearInput: job.year,
      resolvedPlace: reconstructionMetadata.canonicalPlace,
      resolvedYear: reconstructionMetadata.year,
      interpretationNote: reconstructionMetadata.reinterpretation?.note || "",
      evidenceQuality: normalizedEvidence.evidence_quality || (reconstructionMetadata.confidence === "high" ? "strong" : reconstructionMetadata.confidence === "medium" ? "moderate" : "weak"),
      metadata: reconstructionMetadata.reinterpretation,
      rawEvidence: {
        provider: "gemini",
        payload: {
          query: { place_input: job.place, year_input: job.year },
          resolved: {
            place: reconstructionMetadata.canonicalPlace,
            year: reconstructionMetadata.year,
            historical_aliases: [],
            interpretation_note: reconstructionMetadata.reinterpretation?.note || "",
          },
          confidence: normalizedEvidence.confidence,
          evidence_quality: normalizedEvidence.evidence_quality || "moderate",
          evidence_fragments: normalizedEvidence.evidenceFragments || [],
          dominant_sounds: normalizedEvidence.dominantSounds || [],
          background_textures: normalizedEvidence.backgroundTextures || [],
          intermittent_events: normalizedEvidence.intermittentEvents || [],
          human_activity: normalizedEvidence.humanActivity || [],
          atmosphere: normalizedEvidence.atmosphere || [],
          time_of_day: normalizedEvidence.timeOfDay || "unknown",
          density: normalizedEvidence.density || "moderate",
          emotional_tone: normalizedEvidence.emotionalTone || [],
          reliability_notes: normalizedEvidence.reliabilityNotes || [],
          gaps: normalizedEvidence.gaps || [],
        },
      },
      normalizedEvidence: {
        evidence_fragments: normalizedEvidence.evidenceFragments || [],
        dominant_sounds: normalizedEvidence.dominantSounds || [],
        background_textures: normalizedEvidence.backgroundTextures || [],
        intermittent_events: normalizedEvidence.intermittentEvents || [],
        human_activity: normalizedEvidence.humanActivity || [],
        atmosphere: normalizedEvidence.atmosphere || [],
        time_of_day: normalizedEvidence.timeOfDay || "unknown",
        density: normalizedEvidence.density || "moderate",
        emotional_tone: normalizedEvidence.emotionalTone || [],
        reliability_notes: normalizedEvidence.reliabilityNotes || [],
        gaps: normalizedEvidence.gaps || [],
      },
      soundscapePlan,
      evidence: allEvidence,
      prompts,
      audioLayers: {
        bed: audioLayers.bed,
        event: audioLayers.human,
        texture: audioLayers.texture,
        isMock: audioLayers.isMock,
        isPartial: audioLayers.isPartial,
      },
      audioLayersExtended: audioLayers,
      summary: soundscapePlan.summary,
      confidence: normalizedEvidence.confidence || reconstructionMetadata.confidenceScore || 0.7,
      confidenceScore: reconstructionMetadata.confidenceScore,
      evidenceNote: reconstructionMetadata.evidenceNote,
      sourceNotes: reconstructionMetadata.sourceNotes,
      sourceMode: "fresh",
    };

    updateJobState(job.id, JobState.STORING);
    console.log(`[PIPELINE] /generating: Job ${job.id} - STORING phase: Saving artifact to turbopuffer...`);
    
    await tpStoreArtifact(artifactData);
    console.log(`[PIPELINE] /generating: Job ${job.id} - STORING phase: Artifact stored successfully`);
    
    updateJobState(job.id, JobState.COMPLETED, { result: artifactData });
  } catch (e) {
    console.error(`[PIPELINE] /generating: Job ${job.id} FAILED:`, e.message);
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
      body: renderGenerating({ 
        place, 
        year, 
        redirectTo: artifactUrl, 
        jobId,
        jobState: job?.state ?? null,
        jobStage: job?.stage ?? null,
      }),
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
    const jobId = searchParams.get("jobId") ?? "";
    let artifactJob = null;
    let audioLayersFromJob = null;

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

    if (jobId) {
      artifactJob = getJob(jobId);
      if (artifactJob && artifactJob.state === JobState.COMPLETED && artifactJob.result?.audioLayers) {
        audioLayersFromJob = artifactJob.result.audioLayers;
        confidence = artifactJob.result.confidence || confidence;
      }
    }

    const audioLayersFromArtifact = (() => {
  // Try new extended format first
  if (artifactData?.audio_layers_extended) {
    const ext = typeof artifactData.audio_layers_extended === 'string' 
      ? JSON.parse(artifactData.audio_layers_extended) 
      : artifactData.audio_layers_extended;
    return {
      bed: ext.bed,
      texture: ext.texture,
      event: ext.human,
      isMock: ext.isMock,
      isPartial: ext.isPartial,
    };
  }
  // Fall back to legacy format
  if (artifactData?.audio_layers) {
    return typeof artifactData.audio_layers === 'string' 
      ? JSON.parse(artifactData.audio_layers) 
      : artifactData.audio_layers;
  }
  return null;
})();

    const audioLayers = audioLayersFromJob || audioLayersFromArtifact || null;
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
        evidence: artifactData?.evidence ? (typeof artifactData.evidence === "string" ? JSON.parse(artifactData.evidence) : artifactData.evidence) : null,
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
          schemaVersion: artifactData.schema_version || 1,
          confidence: artifactData.confidence,
          confidenceScore: artifactData.confidence_score,
          evidence: artifactData.evidence ? (typeof artifactData.evidence === "string" ? JSON.parse(artifactData.evidence) : artifactData.evidence) : null,
          rawEvidence: artifactData.raw_evidence,
          normalizedEvidence: artifactData.normalized_evidence,
          soundscapePlan: artifactData.soundscape_plan,
          evidenceNote: artifactData.evidence_note,
          sourceNotes: artifactData.source_notes,
          prompts: artifactData.prompts ? (typeof artifactData.prompts === "string" ? JSON.parse(artifactData.prompts) : artifactData.prompts) : null,
          audioLayers: artifactData.audio_layers ? (typeof artifactData.audio_layers === "string" ? JSON.parse(artifactData.audio_layers) : artifactData.audio_layers) : null,
          audioLayersExtended: artifactData.audio_layers_extended,
          summary: artifactData.summary,
          metadata: artifactData.metadata ? (typeof artifactData.metadata === "string" ? JSON.parse(artifactData.metadata) : artifactData.metadata) : null,
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
    const newVersion = existing ? (existing.version || 1) + 1 : 2;

    const placeKey = place.split(",")[0].trim();
    const reconstructionMetadata = await generateReconstructionMetadata({ place: placeKey, year: parseInt(year) });

    const allEvidence = [
      ...(reconstructionMetadata.evidenceByLayer.bed || []),
      ...(reconstructionMetadata.evidenceByLayer.event || []),
      ...(reconstructionMetadata.evidenceByLayer.texture || []),
    ];

    const normalizedEvidence = await normalizeEvidence({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      rawEvidence: allEvidence,
      confidence: reconstructionMetadata.confidence,
    });

    const soundscapePlan = await planSoundscape({
      normalizedEvidence,
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
    });

    const prompts = buildPrompts({
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      evidenceByLayer: reconstructionMetadata.evidenceByLayer,
    });

    let audioLayers;
    let audioLayersExtended;
    const useMockMode = !elIsConfigured();
    
    if (useMockMode) {
      audioLayers = {
        bed: generateMockPrompts(prompts.bed, "bed"),
        event: generateMockPrompts(prompts.event, "event"),
        texture: generateMockPrompts(prompts.texture, "texture"),
        isMock: true,
      };
      audioLayersExtended = {
        bed: { audioUrl: generateMockPrompts(soundscapePlan.bed.prompt, "bed"), prompt: soundscapePlan.bed.prompt, durationSeconds: soundscapePlan.bed.durationSeconds, loop: soundscapePlan.bed.loop },
        texture: { audioUrl: generateMockPrompts(soundscapePlan.texture.prompt, "texture"), prompt: soundscapePlan.texture.prompt, durationSeconds: soundscapePlan.texture.durationSeconds, loop: soundscapePlan.texture.loop },
        human: { audioUrl: generateMockPrompts(soundscapePlan.human.prompt, "human"), prompt: soundscapePlan.human.prompt, durationSeconds: soundscapePlan.human.durationSeconds, loop: soundscapePlan.human.loop },
        events: (soundscapePlan.events || []).slice(0, 5).map(e => ({
          name: e.name,
          audioUrl: generateMockPrompts(e.prompt, `event_${e.name}`),
          prompt: e.prompt,
          durationSeconds: e.durationSeconds,
          weight: e.weight,
          success: true,
        })),
        isMock: true,
        isPartial: false,
      };
    } else {
      try {
        audioLayersExtended = await generateLayers({
          soundscapePlan,
          place: reconstructionMetadata.canonicalPlace,
          year: reconstructionMetadata.year,
        });
        audioLayers = {
          bed: audioLayersExtended.bed,
          event: audioLayersExtended.human,
          texture: audioLayersExtended.texture,
          isMock: audioLayersExtended.isMock,
          isPartial: audioLayersExtended.isPartial,
        };
        if (audioLayersExtended.isMock) {
          console.log("Using mock audio (ElevenLabs not configured)");
        }
      } catch (e) {
        console.warn("Audio generation failed, using fallback:", e.message);
        audioLayers = { 
          bed: "mock_fallback_bed", 
          event: "mock_fallback_event", 
          texture: "mock_fallback_texture", 
          isMock: true 
        };
        audioLayersExtended = null;
      }
    }

    const artifactData = {
      place: reconstructionMetadata.canonicalPlace,
      year: reconstructionMetadata.year,
      version: newVersion,
      schemaVersion: 2,
      placeInput: place,
      yearInput: year,
      resolvedPlace: reconstructionMetadata.canonicalPlace,
      resolvedYear: reconstructionMetadata.year,
      interpretationNote: reconstructionMetadata.reinterpretation?.note || "",
      evidenceQuality: normalizedEvidence.evidence_quality || (reconstructionMetadata.confidence === "high" ? "strong" : reconstructionMetadata.confidence === "medium" ? "moderate" : "weak"),
      metadata: reconstructionMetadata.reinterpretation,
      rawEvidence: {
        provider: "gemini",
        payload: {
          query: { place_input: place, year_input: year },
          resolved: {
            place: reconstructionMetadata.canonicalPlace,
            year: reconstructionMetadata.year,
            historical_aliases: [],
            interpretation_note: reconstructionMetadata.reinterpretation?.note || "",
          },
          confidence: normalizedEvidence.confidence,
          evidence_quality: normalizedEvidence.evidence_quality || "moderate",
          evidence_fragments: normalizedEvidence.evidenceFragments || [],
          dominant_sounds: normalizedEvidence.dominantSounds || [],
          background_textures: normalizedEvidence.backgroundTextures || [],
          intermittent_events: normalizedEvidence.intermittentEvents || [],
          human_activity: normalizedEvidence.humanActivity || [],
          atmosphere: normalizedEvidence.atmosphere || [],
          time_of_day: normalizedEvidence.timeOfDay || "unknown",
          density: normalizedEvidence.density || "moderate",
          emotional_tone: normalizedEvidence.emotionalTone || [],
          reliability_notes: normalizedEvidence.reliabilityNotes || [],
          gaps: normalizedEvidence.gaps || [],
        },
      },
      normalizedEvidence: {
        evidence_fragments: normalizedEvidence.evidenceFragments || [],
        dominant_sounds: normalizedEvidence.dominantSounds || [],
        background_textures: normalizedEvidence.backgroundTextures || [],
        intermittent_events: normalizedEvidence.intermittentEvents || [],
        human_activity: normalizedEvidence.humanActivity || [],
        atmosphere: normalizedEvidence.atmosphere || [],
        time_of_day: normalizedEvidence.timeOfDay || "unknown",
        density: normalizedEvidence.density || "moderate",
        emotional_tone: normalizedEvidence.emotionalTone || [],
        reliability_notes: normalizedEvidence.reliabilityNotes || [],
        gaps: normalizedEvidence.gaps || [],
      },
      soundscapePlan,
      evidence: allEvidence,
      prompts,
      audioLayers,
      audioLayersExtended,
      summary: soundscapePlan.summary,
      confidence: normalizedEvidence.confidence || reconstructionMetadata.confidenceScore || 0.7,
      confidenceScore: reconstructionMetadata.confidenceScore,
      evidenceNote: reconstructionMetadata.evidenceNote,
      sourceNotes: reconstructionMetadata.sourceNotes,
      sourceMode: "fresh",
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
