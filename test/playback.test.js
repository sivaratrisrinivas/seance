import assert from "node:assert/strict";
import test from "node:test";

import { renderArtifact } from "../src/render-artifact.js";

test("artifact with audio layers shows player section", () => {
  const html = renderArtifact({
    place: "Athens",
    year: "1800",
    audioLayers: { bed: "base64audio", event: "base64audio", texture: "base64audio" },
  });

  assert.match(html, /player-section/);
  assert.match(html, /mode-selector/);
});

test("artifact without audio shows empty state", () => {
  const html = renderArtifact({
    place: "Rome",
    year: "1600",
  });

  assert.match(html, /Audio layers not available/);
  assert.match(html, /empty-state/);
});

test("artifact player section includes volume mixer for bed, event, texture", () => {
  const html = renderArtifact({
    place: "Paris",
    year: "1920",
    audioLayers: { bed: "data1", event: "data2", texture: "data3" },
  });

  assert.match(html, /bed-slider/);
  assert.match(html, /event-slider/);
  assert.match(html, /texture-slider/);
});

test("artifact player section includes listening modes", () => {
  const html = renderArtifact({
    place: "Paris",
    year: "1920",
    audioLayers: { bed: "data1", event: "data2", texture: "data3" },
  });

  assert.match(html, /Full scene/);
  assert.match(html, /Atmosphere/);
  assert.match(html, /Street life/);
});