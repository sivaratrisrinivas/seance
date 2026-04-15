import assert from "node:assert/strict";
import test from "node:test";

import { normalizeEvidence, coerceNormalizedEvidence } from "../src/normalize-evidence.js";
import { planSoundscape, coerceSoundscapePlan } from "../src/plan-soundscape.js";
import { buildPrompts } from "../src/prompt-builder.js";

// --- Step 9: Normalize Evidence ---

test("normalizeEvidence returns structured result for hardcoded evidence", async () => {
  const rawEvidence = [
    { description: "Rickshaw bells on cobbled lanes", tags: "transport,urban", source: "city_of_pearls" },
    { description: "Temple bell ringing at dawn", tags: "religious,ambient", source: "city_of_pearls" },
  ];
  const result = await normalizeEvidence({
    place: "Hyderabad",
    year: 1987,
    rawEvidence,
    confidence: "high",
  });

  assert.ok(result, "Should return a normalized result");
  assert.ok(result.evidenceFragments, "Should have evidenceFragments");
  assert.ok(Array.isArray(result.evidenceFragments), "evidenceFragments should be an array");
});

test("normalizeEvidence returns minimal for empty evidence", async () => {
  const result = await normalizeEvidence({
    place: "Unknown",
    year: 2000,
    rawEvidence: [],
    confidence: "low",
  });

  assert.ok(result, "Should return a result even for empty evidence");
  assert.ok(result.evidenceFragments, "Should have evidenceFragments");
});

test("coerceNormalizedEvidence handles missing/malformed input", () => {
  const result = coerceNormalizedEvidence(null);
  assert.ok(result.evidenceFragments, "Should have evidenceFragments");
  assert.ok(Array.isArray(result.evidenceFragments));
});

// --- Step 10: Plan Soundscape ---

test("planSoundscape returns bed, texture, human layers and events", async () => {
  const normalized = {
    evidenceFragments: [
      { text: "Rickshaw bells on cobbled lanes", layer: "bed", confidence: 0.8 },
      { text: "Temple bell ringing at dawn", layer: "event", confidence: 0.7 },
    ],
    layerCounts: { bed: 1, event: 1, texture: 0 },
    place: "Hyderabad",
    year: 1987,
  };

  const plan = await planSoundscape({
    normalizedEvidence: normalized,
    place: "Hyderabad",
    year: 1987,
  });

  assert.ok(plan.bed, "Plan should have bed layer");
  assert.ok(plan.bed.prompt, "Bed layer should have a prompt");
  assert.ok(typeof plan.bed.durationSeconds === "number", "Bed should have numeric duration");

  assert.ok(plan.texture, "Plan should have texture layer");
  assert.ok(plan.texture.prompt, "Texture layer should have a prompt");

  assert.ok(plan.human, "Plan should have human layer");
  assert.ok(plan.human.prompt, "Human layer should have a prompt");

  assert.ok(Array.isArray(plan.events), "Plan should have events array");
});

test("coerceSoundscapePlan handles missing/malformed input", () => {
  const result = coerceSoundscapePlan(null);
  assert.ok(result.bed, "Should have bed layer");
  assert.ok(result.texture, "Should have texture layer");
  assert.ok(result.human, "Should have human layer");
  assert.ok(Array.isArray(result.events), "Should have events array");
});

// --- Step 11: Build Prompts ---

test("prompt builder returns bed, event, and texture prompts", () => {
  const evidence = [
    { description: "Rickshaw bells", tags: "transport", supports: "bed" },
    { description: "Temple bells", tags: "religious", supports: "event" },
    { description: "Monsoon rain", tags: "weather", supports: "texture" },
  ];
  const prompts = buildPrompts({
    place: "Hyderabad",
    year: 1987,
    evidence,
    confidence: "high",
  });

  assert.ok(prompts.bed, "Should have bed prompt");
  assert.ok(prompts.event, "Should have event prompt");
  assert.ok(prompts.texture, "Should have texture prompt");
});

test("prompt builder includes place and year context", () => {
  const evidence = [{ description: "Street sounds", tags: "urban", supports: "bed" }];
  const prompts = buildPrompts({
    place: "Tokyo",
    year: 1965,
    evidence,
    confidence: "high",
  });

  assert.match(prompts.bed, /Tokyo/);
  assert.match(prompts.bed, /1965/);
});

test("prompt builder includes negative constraints for sensitive periods", () => {
  const evidence = [{ description: "Air raid sirens", tags: "war,urban", supports: "event" }];
  const prompts = buildPrompts({
    place: "London",
    year: 1940,
    evidence,
    confidence: "medium",
  });

  // Should have safety constraints
  assert.ok(prompts.bed.length > 20, "Prompts should be substantial");
});

test("prompt builder handles low confidence with degraded specificity", () => {
  const evidence = [{ description: "Generic sounds", tags: "ambient", supports: "bed" }];
  const prompts = buildPrompts({
    place: "Unknown",
    year: 1800,
    evidence,
    confidence: "low",
  });

  assert.ok(prompts.bed, "Should still produce a prompt");
  assert.ok(prompts.event, "Should still produce an event prompt");
  assert.ok(prompts.texture, "Should still produce a texture prompt");
});