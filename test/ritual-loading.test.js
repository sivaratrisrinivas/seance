import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("ritual route shows a staged loading shell for the submitted place and year", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /Preparing your s(?:&eacute;|é)ance/);
  assert.match(response.body, /Hyderabad/);
  assert.match(response.body, /1987/);
  assert.match(response.body, /Resolving the place/);
  assert.match(response.body, /Gathering historical evidence/);
  assert.match(response.body, /Shaping the reconstruction/);
  assert.doesNotMatch(response.body, /spinner/i);
});

test("ritual route includes headphones guidance for better audio experience", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /headphones/i);
  assert.match(response.body, /best heard/i);
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
