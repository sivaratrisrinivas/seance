import assert from "node:assert/strict";
import test from "node:test";

import { renderArtifact } from "../src/render-artifact.js";

test("renderArtifact shows Partial reconstruction note when partial=true", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: true,
    audioLayers: { isPartial: true },
  });

  assert.match(html, /Partial Reconstruction/i);
});

test("renderArtifact does not show partial note when partial=false", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: false,
    audioLayers: { isPartial: false },
  });

  assert.doesNotMatch(html, /Partial Reconstruction/);
});

test("renderArtifact includes place and year in output", () => {
  const html = renderArtifact({
    place: "Tokyo",
    year: "1945",
    generated: true,
    partial: true,
    confidence: "medium",
    audioLayers: { bed: "abc", event: "def", texture: "ghi", isPartial: true },
  });

  assert.match(html, /Tokyo/);
  assert.match(html, /1945/);
});

test("renderArtifact shows Echo Recovered badge for archived artifacts", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    archived: true,
    partial: true,
    audioLayers: { isPartial: true },
  });

  assert.match(html, /Echo Recovered/);
});

test("renderArtifact shows Resonance Established for generated artifacts", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: false,
  });

  assert.match(html, /Resonance Established/);
});

test("renderArtifact shows Acoustic Shadow when no audio", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
  });

  assert.match(html, /Acoustic Shadow/);
});

test("renderArtifact shows listening modes and mixer when audio exists", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    audioLayers: { bed: "base64data", event: "base64data", texture: "base64data" },
  });

  assert.match(html, /listening-mode-btn/);
  assert.match(html, /bed-slider/);
  assert.match(html, /event-slider/);
  assert.match(html, /texture-slider/);
});