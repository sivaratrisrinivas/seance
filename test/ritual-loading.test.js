import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("ritual route redirects to artifact after valid query", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, "/artifact?place=Hyderabad&year=1987");
});

test("artifact route shows mock result page with playback placeholder", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Hyderabad.*1987/);
  assert.match(response.body, /playback/i);
  assert.match(response.body, /Hear it again/i);
  assert.doesNotMatch(response.body, /scrub/i);
  assert.doesNotMatch(response.body, /download/i);
});

test("artifact route supports direct navigation without homepage", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Old City, Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance/);
  assert.match(response.body, /Old City, Hyderabad.*1987/);
});

test("ritual route redirects to artifact after successful run", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, "/artifact?place=Hyderabad&year=1987");
});
