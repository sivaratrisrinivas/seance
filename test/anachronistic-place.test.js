import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("ritual route handles historical place name variants via generating", async () => {
  const response = handleRequest({
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

test("artifact page shows historical place metadata for reinterpreted queries", () => {
  const response = handleRequest({
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

test("artifact page shows modern name alongside historical query for place-year reinterpretation", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      id: btoa("Yangon:1800").replace(/=/g, ""),
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /[Pp]lace|[Rr]econstructed|[Gg]eographic/);
});