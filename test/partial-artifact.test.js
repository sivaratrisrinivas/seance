import assert from "node:assert/strict";
import test from "node:test";

import { renderArtifact } from "../src/render-artifact.js";

test("renderArtifact shows partial note when partial flag is true", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: true,
    audioLayers: { isPartial: true },
  });

  assert.match(html, /partial/i, "Should show partial status for partial artifact");
});

test("renderArtifact does not show partial note when partial is false", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: false,
    audioLayers: { isPartial: false },
  });

  const hasPartialNote = /Partial reconstruction/i.test(html);
  assert.equal(hasPartialNote, false, "Should not show partial note");
});

test("renderArtifact accepts partial parameter in API", () => {
  const html = renderArtifact({
    place: "Tokyo",
    year: "1945",
    generated: true,
    partial: true,
    confidence: "medium",
    audioLayers: { bed: "abc", event: "def", texture: "ghi", isPartial: true },
  });

  assert.match(html, /partial/i);
  assert.match(html, /Tokyo.*1945/);
});

test("renderArtifact shows trust line for partial artifacts", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    archived: true,
    partial: true,
    audioLayers: { isPartial: true },
  });

  assert.match(html, /trust-line/i);
});