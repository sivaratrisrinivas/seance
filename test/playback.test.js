import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("archived artifact plays audio from storage", async () => {
  const response = await handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Athens",
      year: "1800",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /audio-player/);
  assert.match(response.body, /base64Data/);
});

test("generated artifact includes audio data", async () => {
  const response = await handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Rome",
      year: "1600",
      generated: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /audio-player/);
});