const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const EVIDENCE_SYSTEM_PROMPT = `You are a sensory archive researcher for a historical soundscape app called Séance.

Your task is to extract historically grounded sensory evidence for a specific place and year.

You are NOT writing a story.
You are NOT writing a summary for a human reader.
You are extracting evidence for downstream sound generation.

Rules:
- Prefer concrete sensory details over general historical facts.
- Prioritize:
  1. explicit sounds
  2. atmospheric texture
  3. human activity and movement
- Resolve historical aliases if needed (for example, older place names).
- Distinguish grounded evidence from inference.
- Do not invent major details unsupported by evidence.
- Return valid JSON only.
- If evidence is weak, say so explicitly in the JSON.
- Keep excerpts short and useful.

Return JSON matching exactly this schema:

{
  "query": {
    "place_input": "string",
    "year_input": "string"
  },
  "resolved": {
    "place": "string",
    "year": 0,
    "historical_aliases": ["string"],
    "interpretation_note": "string"
  },
  "confidence": 0.0,
  "evidence_quality": "strong | moderate | weak",
  "evidence_fragments": [
    {
      "excerpt": "string",
      "source": "string",
      "source_type": "newspaper | memoir | oral_history | book | travelogue | inferred",
      "year_of_source": 0,
      "sound_cues": ["string"],
      "atmosphere_cues": ["string"],
      "human_activity_cues": ["string"],
      "time_of_day": "unknown | dawn | morning | afternoon | evening | night",
      "reliability": 0.0
    }
  ],
  "dominant_sounds": ["string"],
  "background_textures": ["string"],
  "intermittent_events": ["string"],
  "human_activity": ["string"],
  "atmosphere": ["string"],
  "time_of_day": "unknown | dawn | morning | afternoon | evening | night",
  "density": "sparse | moderate | dense",
  "emotional_tone": ["string"],
  "reliability_notes": ["string"],
  "gaps": ["string"]
}`;

async function callGemini(prompt, options = {}) {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  const { thinkingLevel = null, thinkingBudget = null, temperature = 0.7 } = options;

  const generationConfig = {
    temperature,
    maxOutputTokens: 8192,
    topP: 0.95,
    topK: 40,
  };

  if (thinkingLevel !== null) {
    generationConfig.thinkingConfig = {
      thinkingLevel: thinkingLevel,
    };
  } else if (thinkingBudget !== null) {
    generationConfig.thinkingConfig = {
      thinkingBudget: thinkingBudget,
    };
  }

  const response = await fetch(
    `${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const result = await response.json();

  if (!result.candidates || !result.candidates[0]?.content?.parts) {
    throw new Error("Invalid Gemini response structure");
  }

  return result.candidates[0].content.parts[0].text;
}

export async function generateEvidenceFromGemini({ place, year, textFragments }) {
  const prompt = `${EVIDENCE_SYSTEM_PROMPT}

---

Place: ${place}
Year: ${year}

${textFragments.length > 0 ? `Existing fragments:\n${textFragments.join("\n\n")}` : "If direct evidence is sparse, extract the best available sensory clues and mark them clearly as weaker evidence."}

---

Respond with valid JSON only. Do not include any text outside the JSON structure.`;

  const response = await callGemini(prompt, { thinkingLevel: "medium" });
  return response;
}

export function isConfigured() {
  return !!GOOGLE_API_KEY;
}

export function getConfig() {
  return {
    model: GEMINI_MODEL,
    configured: !!GOOGLE_API_KEY,
  };
}

export function parseEvidenceFromGeminiResponse(geminiOutput) {
  const jsonMatch = geminiOutput.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn("[gemini-client] No JSON found in Gemini response, falling back to legacy parser");
    return parseLegacyEvidence(geminiOutput);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.evidence_fragments && Array.isArray(parsed.evidence_fragments)) {
      return parsed.evidence_fragments.map(fragment => ({
        description: fragment.excerpt || "",
        supports: fragment.sound_cues?.length > 0 ? ["event", "bed"] : ["texture"],
        source: fragment.source_type || "inferred",
        confidence: fragment.reliability || 0.7,
        soundCues: fragment.sound_cues || [],
        atmosphereCues: fragment.atmosphere_cues || [],
        humanActivityCues: fragment.human_activity_cues || [],
        timeOfDay: fragment.time_of_day || "",
        yearOfSource: fragment.year_of_source,
      }));
    }

    if (parsed.dominant_sounds || parsed.background_textures || parsed.intermittent_events) {
      const evidence = [];
      
      if (parsed.dominant_sounds) {
        evidence.push({
          description: `Dominant sounds: ${parsed.dominant_sounds.join(", ")}`,
          supports: ["bed"],
          source: "gemini",
          confidence: parsed.confidence || 0.7,
        });
      }
      
      if (parsed.background_textures) {
        evidence.push({
          description: `Background textures: ${parsed.background_textures.join(", ")}`,
          supports: ["texture"],
          source: "gemini",
          confidence: parsed.confidence || 0.7,
        });
      }
      
      if (parsed.intermittent_events) {
        evidence.push({
          description: `Intermittent events: ${parsed.intermittent_events.join(", ")}`,
          supports: ["event"],
          source: "gemini",
          confidence: parsed.confidence || 0.7,
        });
      }
      
      return evidence;
    }

    console.warn("[gemini-client] Unexpected JSON structure in Gemini response");
    return parseLegacyEvidence(geminiOutput);
  } catch (e) {
    console.warn("[gemini-client] JSON parse failed:", e.message);
    return parseLegacyEvidence(geminiOutput);
  }
}

function parseLegacyEvidence(geminiOutput) {
  const evidence = [];
  const lines = geminiOutput.split("\n");
  let currentLayer = null;
  let currentSounds = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("LAYER NAME:") || trimmed.startsWith("### 1.")) {
      if (currentLayer && currentSounds.length > 0) {
        evidence.push({
          description: `${currentLayer}: ${currentSounds.join(", ")}`,
          supports: ["bed"],
          source: "gemini",
          confidence: 0.85,
        });
      }
      currentLayer = trimmed.replace(/^.*?: /, "").replace(/^#+\s*/, "").trim();
      currentSounds = [];
    } else if (trimmed.startsWith("EVENT NAME:")) {
      if (currentSounds.length > 0) {
        evidence.push({
          description: `${currentLayer}: ${currentSounds.join(", ")}`,
          supports: ["event"],
          source: "gemini",
          confidence: 0.85,
        });
      }
      const eventName = trimmed.replace(/^EVENT NAME: /, "").trim();
      currentLayer = eventName;
      currentSounds = [];
    } else if (trimmed.startsWith("SOUND DESCRIPTION:") || trimmed.startsWith("- ")) {
      const desc = trimmed.replace(/^SOUND DESCRIPTION: /, "").replace(/^- /, "").trim();
      if (desc) currentSounds.push(desc);
    } else if (currentSounds.length > 0 && trimmed.length > 3) {
      currentSounds.push(trimmed);
    }
  }

  if (currentLayer && currentSounds.length > 0) {
    evidence.push({
      description: `${currentLayer}: ${currentSounds.join(", ")}`,
      supports: ["texture"],
      source: "gemini",
      confidence: 0.85,
    });
  }

  return evidence;
}