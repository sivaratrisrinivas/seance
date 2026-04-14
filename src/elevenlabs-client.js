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

const LAYER_FAILURE_THRESHOLD = 2;

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

  const layerStatus = {
    bed: { success: false, error: null },
    event: { success: false, error: null },
    texture: { success: false, error: null },
  };

  let bedResult, eventResult, textureResult;

  if (isRealApi) {
    try {
      const bedBuffer = await generateAudioLayer({
        text: prompts.bed,
        layerType: "bed",
        durationSeconds: 15,
      });
      bedResult = Buffer.from(bedBuffer).toString("base64");
      layerStatus.bed.success = true;
    } catch (e) {
      layerStatus.bed.error = e.message;
      bedResult = null;
    }

    try {
      const eventBuffer = await generateAudioLayer({
        text: prompts.event,
        layerType: "event",
        durationSeconds: 8,
      });
      eventResult = Buffer.from(eventBuffer).toString("base64");
      layerStatus.event.success = true;
    } catch (e) {
      layerStatus.event.error = e.message;
      eventResult = null;
    }

    try {
      const textureBuffer = await generateAudioLayer({
        text: prompts.texture,
        layerType: "texture",
        durationSeconds: 10,
      });
      textureResult = Buffer.from(textureBuffer).toString("base64");
      layerStatus.texture.success = true;
    } catch (e) {
      layerStatus.texture.error = e.message;
      textureResult = null;
    }
  } else {
    bedResult = generateMockAudioLayer(prompts.bed, "bed");
    eventResult = generateMockAudioLayer(prompts.event, "event");
    textureResult = generateMockAudioLayer(prompts.texture, "texture");
    layerStatus.bed.success = true;
    layerStatus.event.success = true;
    layerStatus.texture.success = true;
  }

  const successCount = Object.values(layerStatus).filter(l => l.success).length;
  const isPartial = successCount > 0 && successCount < 3;
  
  if (successCount < LAYER_FAILURE_THRESHOLD) {
    throw new Error(
      `Insufficient layers: only ${successCount}/${Object.keys(layerStatus).length} succeeded. ` +
      `Failures: ${Object.entries(layerStatus)
        .filter(([, s]) => !s.success)
        .map(([k, v]) => `${k}: ${v.error}`)
        .join(", ")}`
    );
  }

  return {
    bed: bedResult,
    event: eventResult,
    texture: textureResult,
    isMock: !isRealApi,
    isPartial: isPartial || undefined,
    layerStatus,
  };
}

export function isConfigured() {
  return !!ELEVENLABS_API_KEY;
}