/**
 * elevenlabs-client.js — ElevenLabs API primitives.
 *
 * Provides ONLY the low-level generateAudioLayer function and isConfigured check.
 * All orchestration (parallel calls, retries, R2 upload) is in generate-layers.js.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/sound-generation";

function generateMockAudioLayer(text, layerType) {
  return `mock_${layerType}_${Buffer.from(text).toString("base64").slice(0, 20)}`;
}

export async function generateAudioLayer({ text, layerType, durationSeconds = 10 }) {
  if (!ELEVENLABS_API_KEY) {
    return generateMockAudioLayer(text, layerType);
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_text_to_sound_v2",
      duration_seconds: durationSeconds,
      prompt_influence: layerType === "bed" ? 0.3 : 0.5,
      loop: layerType === "bed",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

export function isConfigured() {
  return !!ELEVENLABS_API_KEY;
}