import assert from "node:assert/strict";
import test from "node:test";

import { buildHeroPrompts } from "../src/prompt-builder.js";

test("prompt builder returns three distinct prompts for bed, event, and texture", async () => {
  const metadata = {
    place: "Hyderabad",
    year: "1987",
    confidence: "high",
    evidence: [
      { id: "e1", type: "audio", description: "Street market sounds", supports: ["bed", "texture"] },
      { id: "e2", type: "document", description: "Textile trade documentation", supports: ["event"] },
    ],
  };

  const prompts = buildHeroPrompts(metadata);

  assert.ok(prompts.bed, "Should have a bed prompt");
  assert.ok(prompts.event, "Should have an event prompt");
  assert.ok(prompts.texture, "Should have a texture prompt");

  assert.notEqual(prompts.bed, prompts.event, "Bed and event should be different");
  assert.notEqual(prompts.bed, prompts.texture, "Bed and texture should be different");
  assert.notEqual(prompts.event, prompts.texture, "Event and texture should be different");
});

test("prompt builder includes negative constraints to prevent modern contamination", async () => {
  const metadata = {
    place: "Hyderabad",
    year: "1987",
    confidence: "high",
    evidence: [],
  };

  const prompts = buildHeroPrompts(metadata);

  const allPrompts = `${prompts.bed} ${prompts.event} ${prompts.texture}`.toLowerCase();
  assert.match(allPrompts, /no (modern|synth|electronic|digital)/, "Prompts should mention no modern sounds");
  assert.match(allPrompts, /not (film|score|hollywood|dramatic)/, "Prompts should avoid film score style");
});

test("prompt builder includes place and year context in each prompt", async () => {
  const metadata = {
    place: "Hyderabad",
    year: "1987",
    confidence: "high",
    evidence: [],
  };

  const prompts = buildHeroPrompts(metadata);

  assert.match(prompts.bed, /Hyderabad|Indian|City/);
  assert.match(prompts.event, /Hyderabad|Indian|City/);
  assert.match(prompts.texture, /Hyderabad|Indian|City/);
});

test("prompt builder uses evidence in layer mapping", async () => {
  const metadata = {
    place: "Calcutta",
    year: "1945",
    confidence: "medium",
    evidence: [
      { id: "e1", type: "oral_history", description: "Tram bell sounds", supports: ["event"] },
      { id: "e2", type: "document", description: "River port documentation", supports: ["bed", "texture"] },
    ],
  };

  const prompts = buildHeroPrompts(metadata);

  const eventLower = prompts.event.toLowerCase();
  assert.match(eventLower, /tram|bell|port/);
});

test("prompt builder handles low confidence with degraded specificity", async () => {
  const metadata = {
    place: "UnknownTown",
    year: "1500",
    confidence: "low",
    evidence: [],
  };

  const prompts = buildHeroPrompts(metadata);

  assert.ok(prompts.bed.length > 0);
  assert.ok(prompts.event.length > 0);
  assert.ok(prompts.texture.length > 0);

  const allPrompts = `${prompts.bed} ${prompts.event} ${prompts.texture}`.toLowerCase();
  assert.match(allPrompts, /uncertain|inferred|reconstructed/i);
});