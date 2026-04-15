/**
 * reconstruction-metadata.js — Orchestrates evidence gathering.
 *
 * In the platonic pipeline, this module:
 * 1. Resolves place reinterpretation (once, not duplicated)
 * 2. Uses local evidence + pre-fetched Gemini results (no redundant API calls)
 * 3. Derives confidence from actual evidence item averages
 * 4. Generates source attribution notes
 */

import { extractEvidence, extractEvidenceByLayer, getEvidenceSummary } from "./evidence-extractor.js";
import { resolvePlaceForYear } from "./place-reinterpretation.js";

function extractBasePlace(place) {
  if (place.includes("(formerly")) {
    return place.split("(formerly")[0].trim();
  }
  return place;
}

export async function generateReconstructionMetadata({
  place,
  year,
  preExtractedEvidence = null,
  preComputedGeminiResult = null,
}) {
  const reinterpretation = resolvePlaceForYear(place, year);

  // Keep reinterpretation as metadata, don't pollute the place string
  const canonicalPlace = reinterpretation.reinterpreted
    ? reinterpretation.modern
    : place;

  const basePlace = extractBasePlace(canonicalPlace);

  // ── Gather evidence ───────────────────────────────────────────
  let evidenceResult;

  if (preExtractedEvidence && preExtractedEvidence.length > 0) {
    // Use pre-extracted evidence (from /ritual route or Gemini pipeline)
    evidenceResult = {
      evidence: preExtractedEvidence,
      confidence: "gemini",
      note: "Evidence from consolidated pipeline",
    };
    console.log(`[PIPELINE] reconstruction-metadata: Using ${preExtractedEvidence.length} pre-extracted evidence items`);
  } else if (preComputedGeminiResult) {
    // Use evidence from the consolidated Gemini pipeline
    evidenceResult = {
      evidence: preComputedGeminiResult.evidenceItems || [],
      confidence: "gemini",
      note: "Evidence from Gemini pipeline",
    };
    console.log(`[PIPELINE] reconstruction-metadata: Using ${preComputedGeminiResult.evidenceItems?.length || 0} Gemini pipeline evidence items`);
  } else {
    // Fall back to local extraction only (no redundant Gemini call)
    evidenceResult = extractEvidence({ place: basePlace, year: parseInt(year) });
    console.log(`[PIPELINE] reconstruction-metadata: Local extraction: ${evidenceResult.evidence?.length || 0} items (confidence: ${evidenceResult.confidence})`);
  }

  const { bed: bedEvidence, event: eventEvidence, texture: textureEvidence } = extractEvidenceByLayer(evidenceResult.evidence || []);

  // ── Derive confidence from actual evidence ────────────────────
  const confidenceScore = calculateConfidenceScore(evidenceResult);

  const sourceNotes = generateSourceNotes(evidenceResult.evidence);

  const reconstructionMetadata = {
    canonicalPlace,
    originalPlace: place,
    year: parseInt(year),
    reinterpretation: reinterpretation.reinterpreted ? reinterpretation : null,
    confidence: evidenceResult.confidence,
    confidenceScore,
    evidenceCount: (evidenceResult.evidence || []).length,
    evidenceByLayer: {
      bed: bedEvidence,
      event: eventEvidence,
      texture: textureEvidence,
    },
    sourceNotes,
    evidenceNote: evidenceResult.note,
    generatedAt: new Date().toISOString(),
  };

  return reconstructionMetadata;
}

function calculateConfidenceScore(evidenceResult) {
  const evidence = evidenceResult.evidence || [];

  if (evidence.length === 0) return 0.3;

  // Derive from actual per-item confidence values
  const avg = evidence.reduce((sum, e) => sum + (e.confidence || 0.5), 0) / evidence.length;

  // Adjust by confidence level
  if (evidenceResult.confidence === "high") return Math.min(avg + 0.05, 1.0);
  if (evidenceResult.confidence === "gemini") return Math.min(avg, 0.85);
  if (evidenceResult.confidence === "medium") return Math.min(avg * 0.9, 0.75);
  return Math.min(avg * 0.7, 0.55);
}

function generateSourceNotes(evidence) {
  if (!evidence || evidence.length === 0) {
    return "Reconstruction based on era-appropriate regional characteristics.";
  }

  const sourceCounts = {};
  for (const e of evidence) {
    sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
  }

  const sourceList = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([source]) => formatSourceName(source));

  if (sourceList.length === 0) {
    return "Evidence from historical audio archives and academic research.";
  }

  if (sourceList.length === 1) {
    return `Evidence primarily from ${sourceList[0]}.`;
  }

  return `Evidence from ${sourceList.slice(0, -1).join(", ")} and ${sourceList[sourceList.length - 1]}.`;
}

function formatSourceName(source) {
  const names = {
    historicalAtlas: "historical atlases",
    oralHistory: "oral histories",
    academicResearch: "academic research",
    soundRecording: "historical recordings",
    newspaperArchive: "newspaper archives",
    gemini: "AI-generated research",
    inferred: "inferred sources",
  };
  return names[source] || source;
}

export function getLayerEvidenceSummary(layerType, evidenceByLayer) {
  const layerMap = {
    bed: evidenceByLayer.bed,
    event: evidenceByLayer.event,
    texture: evidenceByLayer.texture,
  };

  const layerEvidence = layerMap[layerType] || [];

  if (layerEvidence.length === 0) {
    return {
      hasEvidence: false,
      summary: `Default ${layerType} layer based on era characteristics.`,
      sources: [],
    };
  }

  const descriptions = layerEvidence.map(e => e.description).join("; ");
  const sources = [...new Set(layerEvidence.map(e => e.source))];

  return {
    hasEvidence: true,
    summary: descriptions,
    sources,
    avgConfidence: layerEvidence.reduce((sum, e) => sum + (e.confidence || 0.7), 0) / layerEvidence.length,
  };
}

export function getReconstructionSummary(metadata) {
  const parts = [];

  parts.push(`${metadata.canonicalPlace}, ${metadata.year}`);

  if (metadata.reinterpretation) {
    parts.push("reconstructed location");
  }

  parts.push(`${metadata.confidence} confidence`);

  if (metadata.evidenceCount > 0) {
    parts.push(`${metadata.evidenceCount} sources`);
  }

  return parts.join(" · ");
}