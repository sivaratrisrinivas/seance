import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("how-it-works route serves the explanation page", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/how-it-works",
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Ground in Evidence/);
  assert.match(response.body, /Generate the Soundscape/);
  assert.match(response.body, /Archive for Later/);
});

test("how-it-works page explains the tech stack", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/how-it-works",
  });

  assert.match(response.body, /ElevenLabs/);
  assert.match(response.body, /Turbopuffer/);
});

test("how-it-works page includes link back to homepage", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/how-it-works",
  });

  assert.match(response.body, /href="\/"/);
});

test("homepage includes link to how-it-works page", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/",
  });

  assert.match(response.body, /href="\/how-it-works"/);
  assert.match(response.body, /How it works/);
});