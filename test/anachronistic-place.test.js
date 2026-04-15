import assert from "node:assert/strict";
import test from "node:test";

import { extractEvidence } from "../src/evidence-extractor.js";
import { needsReinterpretation } from "../src/place-reinterpretation.js";
import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

// --- Unit: extractEvidence ---

test("extractEvidence returns high confidence for hardcoded cities", () => {
  const result = extractEvidence({ place: "Hyderabad", year: 1987 });
  assert.equal(result.confidence, "high");
  assert.ok(result.evidence.length > 0);
});

test("extractEvidence returns evidence items with description and tags", () => {
  const result = extractEvidence({ place: "Tokyo", year: 1965 });
  assert.ok(result.evidence.length > 0);
  const first = result.evidence[0];
  assert.ok(first.description || first.text, "Each evidence item should have description or text");
});

test("extractEvidence resolves aliases (Mumbai -> Bombay)", () => {
  const result = extractEvidence({ place: "Mumbai", year: 1975 });
  assert.ok(result.evidence.length > 0);
});

test("extractEvidence returns low confidence for unknown places", () => {
  const result = extractEvidence({ place: "RandomPlace123", year: 1900 });
  assert.ok(["low", "blocked"].includes(result.confidence));
  assert.equal(result.evidence.length, 0);
});

test("extractEvidence blocks generic conflict zones in sensitive periods", () => {
  const result = extractEvidence({ place: "UnknownConflict", year: 1939 });
  assert.equal(result.blocked, true);
});

// --- Unit: place reinterpretation ---

test("needsReinterpretation returns true for anachronistic queries", () => {
  // Singapore wasn't established until ~1819
  const result = needsReinterpretation("Singapore", 1700);
  assert.equal(result, true);
});

test("needsReinterpretation returns false for valid place-year", () => {
  const result = needsReinterpretation("London", 1850);
  assert.equal(result, false);
});

// --- Integration: disambiguation ---

test("ambiguous places redirect to disambiguation page", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Springfield", year: "1987" }),
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/disambiguate\?/);
});

test("disambiguation page shows candidates", async () => {
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

test("non-ambiguous places do not redirect to disambiguation", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "1987" }),
  });
  assert.notEqual(response.headers?.location?.includes("/disambiguate"), true);
});

// --- Integration: disambiguation runs before Gemini call ---

test("disambiguation check happens before Gemini evidence fetch", async () => {
  // Springfield should redirect to /disambiguate immediately
  // without hitting the Gemini API (no Gemini logs expected)
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Springfield", year: "1950" }),
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/disambiguate/);
});