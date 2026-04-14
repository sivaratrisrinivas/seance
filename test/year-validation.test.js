import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("ritual route rejects future years with a clear validation response", () => {
  const currentYear = new Date().getFullYear();
  const futureYear = String(currentYear + 1);

  const response = handleRequest({
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

test("ritual route rejects non-exact numeric year formats", () => {
  const response = handleRequest({
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

test("ritual route allows the current year for a valid place query", () => {
  const currentYear = String(new Date().getFullYear());

  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: currentYear,
    }),
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, `/artifact?place=Hyderabad&year=${currentYear}`);
});
