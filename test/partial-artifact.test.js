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

  assert.match(html, /Partial reconstruction/i);
  assert.match(html, /Some audio layers unavailable/i);
});

test("renderArtifact does not show partial note when partial=false", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: false,
    audioLayers: { isPartial: false },
  });

  assert.doesNotMatch(html, /Partial reconstruction/i);
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

test("renderArtifact shows Recovered badge for archived artifacts", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    archived: true,
    partial: true,
    audioLayers: { isPartial: true },
  });

  assert.match(html, /Recovered from prior reconstruction/);
});

test("renderArtifact shows Freshly summoned for generated artifacts", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    generated: true,
    partial: false,
  });

  assert.match(html, /Freshly summoned/);
});

test("renderArtifact shows Audio layers not available when no audio", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
  });

  assert.match(html, /Audio layers not available/);
});

test("renderArtifact shows player section with mixer when audio exists", () => {
  const html = renderArtifact({
    place: "London",
    year: "1940",
    audioLayers: { bed: "base64data", event: "base64data", texture: "base64data" },
  });

  assert.match(html, /player-section/);
  assert.match(html, /mode-selector/);
  assert.match(html, /mixer-slider/);
});