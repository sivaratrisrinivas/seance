/**
 * generate-layers.js — Audio layer generation via ElevenLabs.
 *
 * This is the SINGLE entry point for audio generation. (elevenlabs-client.js
 * provides only the primitive generateAudioLayer and isConfigured.)
 *
 * Improvements over original:
 * - Parallel generation of bed/texture/human via Promise.allSettled
 * - Retry logic for failed individual layers
 * - Adaptive prompt_influence based on evidence confidence
 */

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

// ─── Prompt enhancers ───────────────────────────────────────────────────

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

// ─── Core audio generation ──────────────────────────────────────────────

export async function generateAudioLayer({ text, layerType, durationSeconds = 10, place = "", year = "", confidence = 0.7 }) {
  if (!ELEVENLABS_API_KEY) {
    return generateMockAudio(text, layerType);
  }

  // Adaptive prompt_influence based on evidence confidence
  const promptInfluence = layerType === "bed"
    ? (confidence > 0.8 ? 0.35 : 0.25)
    : (confidence > 0.8 ? 0.55 : 0.45);

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
      prompt_influence: promptInfluence,
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

// ─── Single layer with retry ────────────────────────────────────────────

async function generateLayerWithRetry({ text, layerType, durationSeconds, place, year, confidence, maxRetries = 1 }) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateAudioLayer({ text, layerType, durationSeconds, place, year, confidence });
      return { success: true, result, error: null };
    } catch (e) {
      if (attempt < maxRetries) {
        console.warn(`[generate-layers] ${layerType} attempt ${attempt + 1} failed: ${e.message}. Retrying...`);
        await new Promise(r => setTimeout(r, 1000));
      } else {
        return { success: false, result: null, error: e.message };
      }
    }
  }
}

// ─── Main parallel generation ───────────────────────────────────────────

export async function generateLayers({ soundscapePlan, place, year, confidence = 0.7 }) {
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
    // ── PARALLEL generation of core layers ──────────────────────
    console.log(`[generate-layers] Starting PARALLEL generation of 3 core layers for ${place} ${year}`);
    const startTime = Date.now();

    const [bedResult, textureResult, humanResult] = await Promise.allSettled([
      generateLayerWithRetry({
        text: buildBedPrompt(plan.bed.prompt, place, year),
        layerType: "bed",
        durationSeconds: plan.bed.durationSeconds,
        place,
        year,
        confidence,
      }),
      generateLayerWithRetry({
        text: buildTexturePrompt(plan.texture.prompt, place, year),
        layerType: "texture",
        durationSeconds: plan.texture.durationSeconds,
        place,
        year,
        confidence,
      }),
      generateLayerWithRetry({
        text: buildHumanPrompt(plan.human.prompt, place, year),
        layerType: "human",
        durationSeconds: plan.human.durationSeconds,
        place,
        year,
        confidence,
      }),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`[generate-layers] Core layers completed in ${elapsed}ms (parallel)`);

    // Extract results
    const bedData = bedResult.status === "fulfilled" ? bedResult.value : { success: false, error: "Promise rejected" };
    const textureData = textureResult.status === "fulfilled" ? textureResult.value : { success: false, error: "Promise rejected" };
    const humanData = humanResult.status === "fulfilled" ? humanResult.value : { success: false, error: "Promise rejected" };

    layerResults.bed = bedData.success ? bedData.result : null;
    layerResults.layerStatus.bed = { success: bedData.success, error: bedData.error };

    layerResults.texture = textureData.success ? textureData.result : null;
    layerResults.layerStatus.texture = { success: textureData.success, error: textureData.error };

    layerResults.human = humanData.success ? humanData.result : null;
    layerResults.layerStatus.human = { success: humanData.success, error: humanData.error };

    // ── Events (sequential, up to 5) ────────────────────────────
    const maxEvents = 5;
    const eventsToGenerate = (plan.events || []).slice(0, maxEvents);

    for (const eventSpec of eventsToGenerate) {
      const eventResult = await generateLayerWithRetry({
        text: buildEventPrompt(eventSpec.prompt),
        layerType: "event",
        durationSeconds: eventSpec.durationSeconds,
      });

      layerResults.events.push({
        name: eventSpec.name,
        audioUrl: eventResult.success ? eventResult.result : null,
        prompt: eventSpec.prompt,
        durationSeconds: eventSpec.durationSeconds,
        weight: eventSpec.weight,
        success: eventResult.success,
        error: eventResult.error,
      });
      layerResults.eventStatus.push({
        name: eventSpec.name,
        success: eventResult.success,
        error: eventResult.error,
      });
    }
  } else {
    // Mock mode
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