import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";
import { validateRitualQuery } from "../src/query-validation.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("query validation allows places with historical evidence", async () => {
  const result = validateRitualQuery({ place: "London", year: "1940" });
  assert.equal(result.ok, true, "Should allow valid place with evidence");
});

test("query validation allows places involved in historical events with evidence", async () => {
  const placesWithEvidence = ["London", "Tokyo", "Berlin", "Hiroshima", "Nagasaki"];
  
  for (const place of placesWithEvidence) {
    const result = validateRitualQuery({ place, year: "1945" });
    assert.equal(result.ok, true, `Should allow ${place} 1945 with evidence`);
  }
});

test("ritual route blocks place-year without evidence for sensitive periods", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams("place=UnknownConflict&year=1939"),
  });

  assert.equal(response.status, 422, "Should block queries without evidence");
});

test("ritual route allows place-year with known evidence in system", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams("place=London&year=1940"),
  });

  assert.notEqual(response.status, 422, "Should allow London 1940 which has evidence");
});

test("prompt builder includes safety constraints for sensitive contexts", async () => {
  const { buildPrompts } = await import("../src/prompt-builder.js");
  
  const prompts = buildPrompts({
    place: "Hiroshima",
    year: "1945",
    evidence: [
      { description: "city destruction and aftermath", supports: ["bed"], source: "historicalAtlas" }
    ]
  });

  for (const [layer, prompt] of Object.entries(prompts)) {
    assert.match(prompt, /no graphic|not violent/i, `${layer} prompt should have safety constraint`);
  }
});