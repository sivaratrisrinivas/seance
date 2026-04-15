import assert from "node:assert/strict";
import test from "node:test";

import { validateRitualQuery } from "../src/query-validation.js";
import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

// --- Unit: validateRitualQuery ---

test("validation rejects empty place", () => {
  const result = validateRitualQuery({ place: "", year: "1987" });
  assert.equal(result.ok, false);
  assert.match(result.message, /place name/i);
});

test("validation rejects whitespace-only place", () => {
  const result = validateRitualQuery({ place: "   ", year: "1987" });
  assert.equal(result.ok, false);
  assert.match(result.message, /place name/i);
});

test("validation rejects non-numeric year", () => {
  const result = validateRitualQuery({ place: "London", year: "abc" });
  assert.equal(result.ok, false);
  assert.match(result.message, /Year must use whole digits/);
});

test("validation rejects decimal year", () => {
  const result = validateRitualQuery({ place: "London", year: "2026.0" });
  assert.equal(result.ok, false);
  assert.match(result.message, /Year must use whole digits/);
});

test("validation rejects future year", () => {
  const currentYear = new Date().getFullYear();
  const result = validateRitualQuery({ place: "London", year: String(currentYear + 1) });
  assert.equal(result.ok, false);
  assert.match(result.message, /must be this year or earlier/);
});

test("validation accepts valid place and year", () => {
  const result = validateRitualQuery({ place: "Hyderabad", year: "1987" });
  assert.equal(result.ok, true);
  assert.equal(result.place, "Hyderabad");
  assert.equal(result.year, "1987");
});

test("validation accepts current year", () => {
  const currentYear = String(new Date().getFullYear());
  const result = validateRitualQuery({ place: "Sydney", year: currentYear });
  assert.equal(result.ok, true);
});

// --- Integration: validation through /ritual ---

test("ritual route returns 422 for future year", async () => {
  const futureYear = String(new Date().getFullYear() + 1);
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: futureYear }),
  });
  assert.equal(response.status, 422);
  assert.match(response.body, /Year out of range/);
});

test("ritual route returns 422 for non-numeric year", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "2026.0" }),
  });
  assert.equal(response.status, 422);
  assert.match(response.body, /Year out of range/);
});

test("ritual route returns 422 for empty place", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "", year: "1987" }),
  });
  assert.equal(response.status, 422);
  assert.match(response.body, /place name/i);
});
