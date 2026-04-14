import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";
import { needsReinterpretation } from "../src/place-reinterpretation.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("ritual route handles historical place name variants via generating", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Rangoon",
      year: "1900",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
});

test("artifact page shows historical place metadata for reinterpreted queries", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Rangoon",
      year: "1900",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Rangoon.*1900|Reconstructed|formerly/);
});

test("artifact page shows modern name alongside historical query for place-year reinterpretation", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      id: btoa("Yangon:1800").replace(/=/g, ""),
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /[Pp]lace|[Rr]econstructed|[Gg]eographic/);
});

test("needsReinterpretation returns true for anachronistic queries that need geographic reinterpretation", async () => {
  const result = needsReinterpretation("Singapore", "1800");
  assert.equal(result, true);
});

test("needsReinterpretation returns true for modern place queried with pre-existence year", async () => {
  const result = needsReinterpretation("Dubai", "1800");
  assert.equal(result, true);
});

test("needsReinterpretation returns false for valid place-year combinations", async () => {
  const result = needsReinterpretation("Hyderabad", "1987");
  assert.equal(result, false);
});

test("anachronistic query shows geographic reinterpretation note in artifact", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Singapore",
      year: "1800",
      note: "reconstructed area",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /[Rr]econstruct|[Gg]eographic|[Aa]rea/);
});