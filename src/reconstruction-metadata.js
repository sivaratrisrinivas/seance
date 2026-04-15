import { extractEvidence, extractEvidenceByLayer, getEvidenceSummary } from "./evidence-extractor.js";
import { resolvePlaceForYear } from "./place-reinterpretation.js";
import { generateEvidenceFromGemini, parseEvidenceFromGeminiResponse, isConfigured as geminiIsConfigured } from "./gemini-client.js";

function extractBasePlace(place) {
  if (place.includes("(formerly")) {
    return place.split("(formerly")[0].trim();
  }
  return place;
}

export async function generateReconstructionMetadata({ place, year, preExtractedEvidence = null }) {
  const reinterpretation = resolvePlaceForYear(place, year);
  
  const finalPlace = reinterpretation.reinterpreted
    ? `${reinterpretation.modern} (formerly ${reinterpretation.original})`
    : place;

  const basePlace = extractBasePlace(finalPlace);
  const evidenceResult = preExtractedEvidence 
    ? { evidence: preExtractedEvidence, confidence: "gemini", note: "Evidence from Google Gemini AI" }
    : extractEvidence({ place: basePlace, year: parseInt(year) });
  console.log(`[PIPELINE] reconstruction-metadata: Extracted ${evidenceResult.evidence?.length || 0} evidence items (confidence: ${evidenceResult.confidence})`);
  
  if (evidenceResult.evidence?.length === 0 && geminiIsConfigured()) {
    try {
      console.log(`[PIPELINE] reconstruction-metadata: No evidence found, calling Gemini for ${basePlace}, ${year}...`);
      const prompt = `${basePlace} in ${year}. Provide sensory-rich historical fragments about the soundscape: ambient sounds, human activity, mechanical/industrial, nature, intermittent events, and specific sound events.`;
      const geminiResponse = await generateEvidenceFromGemini({
        place: basePlace,
        year: parseInt(year),
        textFragments: [prompt],
      });
      const parsedEvidence = parseEvidenceFromGeminiResponse(geminiResponse);
      if (parsedEvidence?.length > 0) {
        console.log(`[PIPELINE] reconstruction-metadata: Gemini generated ${parsedEvidence.length} evidence items`);
        evidenceResult.evidence = parsedEvidence;
        evidenceResult.confidence = "gemini";
        evidenceResult.note = "Evidence generated from Google Gemini AI";
      }
    } catch (geminiError) {
      console.warn("Gemini evidence extraction failed:", geminiError.message);
    }
  }
  
  const { bed: bedEvidence, event: eventEvidence, texture: textureEvidence } = extractEvidenceByLayer(evidenceResult.evidence || []);

  const confidenceScore = calculateConfidenceScore(evidenceResult);
  
  const sourceNotes = generateSourceNotes(evidenceResult.evidence);
  
  const reconstructionMetadata = {
    canonicalPlace: finalPlace,
    originalPlace: place,
    year: parseInt(year),
    reinterpretation: reinterpretation.reinterpreted ? reinterpretation : null,
    confidence: evidenceResult.confidence,
    confidenceScore,
    evidenceCount: evidenceResult.evidence.length,
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
  if (evidenceResult.confidence === "high") return 0.85;
  if (evidenceResult.confidence === "medium") return 0.65;
  return 0.45;
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