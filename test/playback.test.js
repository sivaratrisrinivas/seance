import assert from "node:assert/strict";
import test from "node:test";

import { renderArtifact } from "../src/render-artifact.js";

test("artifact with audio layers shows player section", () => {
  const html = renderArtifact({
    place: "Athens",
    year: "1800",
    audioLayers: { bed: "base64audio", event: "base64audio", texture: "base64audio" },
  });

  assert.match(html, /Vox Aeterna Player/);
  assert.match(html, /main-play-btn/);
});

test("artifact without audio does not show Vox Aeterna player", () => {
  const html = renderArtifact({
    place: "Rome",
    year: "1600",
  });

  assert.doesNotMatch(html, /Vox Aeterna Player/);
  assert.match(html, /Acoustic Shadow/);
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

test("artifact player section includes audio layers labes", () => {
  const html = renderArtifact({
    place: "Paris",
    year: "1920",
    audioLayers: { bed: "data1", event: "data2", texture: "data3" },
  });

  assert.match(html, /Atmosphere/i);
  assert.match(html, /Events/i);
  assert.match(html, /Texture/i);
});