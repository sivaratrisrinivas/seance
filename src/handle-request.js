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

const AMBIGUOUS_PLACES = {
  Springfield: ["Springfield, Missouri", "Springfield, Illinois"],
  Cambridge: ["Cambridge, UK", "Cambridge, Massachusetts"],
  York: ["York, UK", "New York, USA"],
  Beverly: ["Beverly Hills, California", "Beverly, Massachusetts"],
};

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

  if (method === "GET" && pathname === "/generating") {
    const id = searchParams.get("id") ?? "";
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";
    const note = searchParams.get("note") ?? "";

    const finalId = id || (place && year ? generateOpaqueId(place, year) : "");

    let audioLayers = null;
    let prompts = null;
    let error = null;
    let evidenceData = null;
    let reconstructionMetadata = null;
    let confidence = "high";

    if (elIsConfigured()) {
      try {
        const placeKey = place.split(",")[0].trim();
        
        reconstructionMetadata = generateReconstructionMetadata({ place: placeKey, year: parseInt(year) });
        
        confidence = reconstructionMetadata.confidence;
        const evidenceNote = reconstructionMetadata.evidenceNote;

        prompts = buildPrompts({
          place: reconstructionMetadata.canonicalPlace,
          year: reconstructionMetadata.year,
          evidenceByLayer: reconstructionMetadata.evidenceByLayer,
        });

        audioLayers = await generateSoundscape({
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
          confidence,
          confidenceScore: reconstructionMetadata.confidenceScore,
          evidenceNote: reconstructionMetadata.evidenceNote,
          sourceNotes: reconstructionMetadata.sourceNotes,
        };

        if (tpIsConfigured()) {
          await tpStoreArtifact(artifactData);
        } else {
          await tpStoreArtifact(artifactData);
        }
      } catch (e) {
        error = e.message;
      }
    }

    const params = new URLSearchParams();
    if (finalId) params.set("id", finalId);
    if (place) params.set("place", place);
    if (year) params.set("year", year);
    if (note) params.set("note", note);
    if (audioLayers) params.set("generated", "true");
    if (error) params.set("error", error);
    if (reconstructionMetadata) params.set("confidence", reconstructionMetadata.confidence);

    const artifactUrl = `/artifact?${params.toString()}`;

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderGenerating({ place, year, redirectTo: artifactUrl }),
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
        audioLayers: artifactData?.audio_layers ? JSON.parse(artifactData.audio_layers) : null,
      }),
    };
  }

  return {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Not Found",
  };
}
