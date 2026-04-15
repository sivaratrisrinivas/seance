import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("E2E: complete ritual flow from entry through artifact", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/",
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Begin s/)

  const formAction = response.body.match(/action="([^"]+)"/)?.[1];
  assert.equal(formAction, "/ritual");
});

test("E2E: ritual route accepts valid query and redirects to generating", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
});

test("E2E: generating page shows loading state then redirects to artifact", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/generating",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Preparing your seance/);
  assert.match(response.body, /reconstruct/);
});

test("E2E: artifact page shows playable artifact with place and year", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Venice",
      year: "1500",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Venice.*1500/);
  assert.match(response.body, /playback/i);
  assert.match(response.body, /Hear it again/i);
});

test("E2E: replay affordance allows hearing artifact again", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Venice",
      year: "1500",
    }),
  });

  assert.equal(response.status, 200);
  const replayLink = response.body.match(/href="([^"]+)">Hear it again/)?.[1];
  assert.ok(replayLink, "Replay link should exist");
  assert.match(replayLink, /place=Venice/);
  assert.match(replayLink, /year=1500/);
});