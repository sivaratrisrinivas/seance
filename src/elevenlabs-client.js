import { buildPrompts } from "./prompt-builder.js";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/sound-generation";

const mockAudioLayers = {
  bed: "mock_bed_audio_base64",
  event: "mock_event_audio_base64",
  texture: "mock_texture_audio_base64",
};

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

export async function generateSoundscape({ place, year, evidence, evidenceByLayer = null }) {
  const evidenceList = evidenceByLayer
    ? [
        ...(evidenceByLayer.bed || []),
        ...(evidenceByLayer.event || []),
        ...(evidenceByLayer.texture || []),
      ]
    : evidence || [];

  const prompts = buildPrompts({ place, year, evidence: evidenceList });

  const isRealApi = !!ELEVENLABS_API_KEY;

  let bedResult, eventResult, textureResult;

  if (isRealApi) {
    const [bedBuffer, eventBuffer, textureBuffer] = await Promise.all([
      generateAudioLayer({
        text: prompts.bed,
        layerType: "bed",
        durationSeconds: 15,
      }),
      generateAudioLayer({
        text: prompts.event,
        layerType: "event",
        durationSeconds: 8,
      }),
      generateAudioLayer({
        text: prompts.texture,
        layerType: "texture",
        durationSeconds: 10,
      }),
    ]);

    bedResult = Buffer.from(bedBuffer).toString("base64");
    eventResult = Buffer.from(eventBuffer).toString("base64");
    textureResult = Buffer.from(textureBuffer).toString("base64");
  } else {
    bedResult = generateMockAudioLayer(prompts.bed, "bed");
    eventResult = generateMockAudioLayer(prompts.event, "event");
    textureResult = generateMockAudioLayer(prompts.texture, "texture");
  }

  return {
    bed: bedResult,
    event: eventResult,
    texture: textureResult,
    isMock: !isRealApi,
  };
}

export function isConfigured() {
  return !!ELEVENLABS_API_KEY;
}