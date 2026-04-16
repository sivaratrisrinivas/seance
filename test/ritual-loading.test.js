import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

// --- Ritual Route ---

test("ritual route returns 302 for valid query", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1950" }),
  });
  assert.equal(response.status, 302);
  // May go to /artifact (cached) or /generating (fresh)
  assert.ok(
    response.headers.location.includes("/generating") || response.headers.location.includes("/artifact"),
    `Expected /generating or /artifact, got: ${response.headers.location}`
  );
});

test("ritual route for uncached place goes to /generating", async () => {
  const unique = "TestRLUncached" + Date.now();
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: unique, year: "1850" }),
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
});

// --- Artifact Display ---

test("artifact route shows place and year in title", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1950" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Oslo/);
  assert.match(response.body, /1950/);
});

test("artifact page supports direct navigation without homepage", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Old City, Hyderabad", year: "1987" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Séance Active|Echo Recovered|Resonance Established/i);
  assert.match(response.body, /Old City, Hyderabad/);
});

test("artifact page with archived=true shows Recovered badge", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987", archived: "true" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Echo Recovered/i);
  assert.doesNotMatch(response.body, /\bcache\b/i);
});

test("artifact page shows confidence badge", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Confidence|Spectral Density/i);
});



test("artifact page has main play button", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987" }),
  });
  assert.match(response.body, /id="main-play-btn"/);
});

test("artifact page has Sever Connection action", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987" }),
  });
  assert.match(response.body, /Sever Connection/);
});

test("artifact route accepts opaque ID parameter", async () => {
  const validId = btoa("Hyderabad:1987").replace(/=/g, "");
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ id: validId }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Séance Active|Echo Recovered|Resonance Established/i);
});

test("ritual route completes with redirect for Venice", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500" }),
  });
  assert.equal(response.status, 302);
});

test("artifact displays resolved place metadata", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Old City, Hyderabad", year: "1987" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Old City, Hyderabad.*1987/s);
});

test("ambiguous place triggers disambiguation", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/disambiguate",
    searchParams: new URLSearchParams({ place: "Springfield", year: "1987" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Springfield/i);
  assert.match(response.body, /Missouri/i);
  assert.match(response.body, /Illinois/i);
});

test("historical place names are preserved in artifact display", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Bombay, British India", year: "1920" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Bombay.*1920/s);
});
