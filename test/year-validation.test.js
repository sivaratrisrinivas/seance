import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("ritual route rejects future years with a clear validation response", async () => {
  const currentYear = new Date().getFullYear();
  const futureYear = String(currentYear + 1);

  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: futureYear,
    }),
  });

  assert.equal(response.status, 422);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /Year .* must be this year or earlier\./);
  assert.match(response.body, /Hyderabad/);
});

test("ritual route rejects non-exact numeric year formats", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "2026.0",
    }),
  });

  assert.equal(response.status, 422);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /Year must use whole digits like 1987\./);
  assert.match(response.body, /2026\.0/);
});

test("ritual route allows the current year for a valid place query", async () => {
  const currentYear = String(new Date().getFullYear());

  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Sydney",
      year: currentYear,
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
});
