import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("how-it-works returns 200 with correct title", async () => {
  const response = await handle({ method: "GET", pathname: "/how-it-works" });
  assert.equal(response.status, 200);
  assert.match(response.body, /How It Works/);
});

test("how-it-works mentions ElevenLabs as part of the tech stack", async () => {
  const response = await handle({ method: "GET", pathname: "/how-it-works" });
  assert.match(response.body, /ElevenLabs/);
});

test("how-it-works mentions evidence, soundscape, and audio concepts", async () => {
  const response = await handle({ method: "GET", pathname: "/how-it-works" });
  assert.match(response.body, /evidence/i);
  assert.match(response.body, /soundscape/i);
  assert.match(response.body, /audio/i);
});

test("how-it-works includes link back to homepage", async () => {
  const response = await handle({ method: "GET", pathname: "/how-it-works" });
  assert.match(response.body, /href="\/"/);
});

test("homepage includes link to how-it-works", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /\/how-it-works/);
});