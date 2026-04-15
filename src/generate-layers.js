import { isConfigured as elIsConfigured } from "./elevenlabs-client.js";
import { coerceSoundscapePlan } from "./plan-soundscape.js";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1/sound-generation";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "seance-audio";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const USE_EXTERNAL_STORAGE = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_PUBLIC_URL);

let _s3Client = null;

async function getS3Client() {
  if (_s3Client) return _s3Client;

  const { S3Client } = await import("@aws-sdk/client-s3");
  _s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  return _s3Client;
}

async function uploadToR2(audioData, key) {
  if (!USE_EXTERNAL_STORAGE) {
    return null;
  }

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = await getS3Client();
  const body = Buffer.from(audioData, "base64");

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "audio/mpeg",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

const DEFAULT_DURATION = {
  bed: 20,
  texture: 20,
  human: 15,
  event: 3,
};

function buildBedPrompt(planPrompt, place, year) {
  return `${planPrompt}. ${place} ${year}. Natural environmental ambience. No narration. No music foreground. Seamless ambient loop.`;
}

function buildTexturePrompt(planPrompt, place, year) {
  return `${planPrompt}. ${place} ${year}. Natural environmental ambience. No narration. No music foreground. Seamless ambient loop.`;
}

function buildHumanPrompt(planPrompt, place, year) {
  return `${planPrompt}. Mid-distance perspective. Natural crowd dynamics. No isolated featured speaker. Seamless loop.`;
}

function buildEventPrompt(planPrompt) {
  return `${planPrompt}. Single short event. Clean onset and fade. No music.`;
}

export { buildBedPrompt, buildTexturePrompt, buildHumanPrompt, buildEventPrompt };

export async function generateLayers({ soundscapePlan, place, year }) {
  const plan = coerceSoundscapePlan(soundscapePlan);
  const isRealApi = !!ELEVENLABS_API_KEY;

  const layerResults = {
    bed: null,
    texture: null,
    human: null,
    events: [],
    isMock: !isRealApi,
    isPartial: false,
    layerStatus: {
      bed: { success: false, error: null },
      texture: { success: false, error: null },
      human: { success: false, error: null },
    },
    eventStatus: [],
  };

  if (isRealApi) {
    layerResults.bed = await generateAudioLayer({
      text: buildBedPrompt(plan.bed.prompt, place, year),
      layerType: "bed",
      durationSeconds: plan.bed.durationSeconds,
      place,
      year,
    });
    layerResults.layerStatus.bed.success = !!layerResults.bed;

    layerResults.texture = await generateAudioLayer({
      text: buildTexturePrompt(plan.texture.prompt, place, year),
      layerType: "texture",
      durationSeconds: plan.texture.durationSeconds,
      place,
      year,
    });
    layerResults.layerStatus.texture.success = !!layerResults.texture;

    layerResults.human = await generateAudioLayer({
      text: buildHumanPrompt(plan.human.prompt, place, year),
      layerType: "human",
      durationSeconds: plan.human.durationSeconds,
      place,
      year,
    });
    layerResults.layerStatus.human.success = !!layerResults.human;

    const maxEvents = 5;
    const eventsToGenerate = (plan.events || []).slice(0, maxEvents);

    for (const eventSpec of eventsToGenerate) {
      try {
        const audioUrl = await generateAudioLayer({
          text: buildEventPrompt(eventSpec.prompt),
          layerType: "event",
          durationSeconds: eventSpec.durationSeconds,
        });
        layerResults.events.push({
          name: eventSpec.name,
          audioUrl,
          prompt: eventSpec.prompt,
          durationSeconds: eventSpec.durationSeconds,
          weight: eventSpec.weight,
          success: true,
        });
        layerResults.eventStatus.push({ name: eventSpec.name, success: true });
      } catch (e) {
        console.warn(`[generate-layers] Event "${eventSpec.name}" failed:`, e.message);
        layerResults.events.push({
          name: eventSpec.name,
          audioUrl: null,
          prompt: eventSpec.prompt,
          durationSeconds: eventSpec.durationSeconds,
          weight: eventSpec.weight,
          success: false,
          error: e.message,
        });
        layerResults.eventStatus.push({ name: eventSpec.name, success: false, error: e.message });
      }
    }
  } else {
    layerResults.bed = generateMockAudio(buildBedPrompt(plan.bed.prompt, place, year), "bed");
    layerResults.texture = generateMockAudio(buildTexturePrompt(plan.texture.prompt, place, year), "texture");
    layerResults.human = generateMockAudio(buildHumanPrompt(plan.human.prompt, place, year), "human");
    layerResults.layerStatus.bed.success = true;
    layerResults.layerStatus.texture.success = true;
    layerResults.layerStatus.human.success = true;

    for (const eventSpec of (plan.events || []).slice(0, 5)) {
      layerResults.events.push({
        name: eventSpec.name,
        audioUrl: generateMockAudio(buildEventPrompt(eventSpec.prompt), `event_${eventSpec.name}`),
        prompt: eventSpec.prompt,
        durationSeconds: eventSpec.durationSeconds,
        weight: eventSpec.weight,
        success: true,
      });
    }
  }

  const successCount = Object.values(layerResults.layerStatus).filter(l => l.success).length;
  const eventSuccessCount = layerResults.events.filter(e => e.success).length;

  layerResults.isPartial = successCount < 3 || eventSuccessCount === 0;

  if (successCount < 2 && eventSuccessCount === 0) {
    throw new Error(
      `Insufficient audio generation: ${successCount}/3 layers + ${eventSuccessCount} events succeeded`
    );
  }

  return layerResults;
}

export async function generateAudioLayer({ text, layerType, durationSeconds = 10, place = "", year = "" }) {
  if (!ELEVENLABS_API_KEY) {
    return generateMockAudio(text, layerType);
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
      loop: layerType === "bed" || layerType === "texture" || layerType === "human",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  if (USE_EXTERNAL_STORAGE) {
    const timestamp = Date.now();
    const sanitizedPlace = (place || "unknown").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const key = `${sanitizedPlace}_${year}/${layerType}_${timestamp}.mp3`;
    
    try {
      const url = await uploadToR2(base64Audio, key);
      if (url) {
        console.log(`[generate-layers] Uploaded ${layerType} to ${url}`);
        return url;
      }
    } catch (e) {
      console.warn(`[generate-layers] R2 upload failed for ${layerType}, falling back to base64:`, e.message);
    }
  }

  return base64Audio;
}

function generateMockAudio(text, layerType) {
  return `mock_${layerType}_${Buffer.from(text).toString("base64").slice(0, 20)}`;
}

export function normalizeGeneratedAudioResult(result) {
  if (!result) {
    return {
      bed: null,
      texture: null,
      human: null,
      events: [],
      isMock: true,
      isPartial: true,
      layerStatus: { bed: { success: false }, texture: { success: false }, human: { success: false } },
    };
  }

  return {
    bed: result.bed,
    texture: result.texture,
    human: result.human,
    events: result.events || [],
    isMock: result.isMock ?? false,
    isPartial: result.isPartial ?? false,
    layerStatus: result.layerStatus || {
      bed: { success: !!result.bed },
      texture: { success: !!result.texture },
      human: { success: !!result.human },
    },
  };
}

export function isConfigured() {
  return elIsConfigured();
}