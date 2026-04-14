import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("ritual route redirects to generating then artifact", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
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

test("artifact page shows archive status language without internal terms", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance/i);
  assert.doesNotMatch(response.body, /cache/i);
  assert.doesNotMatch(response.body, /warm lookup/i);
  assert.doesNotMatch(response.body, /hit/i);
});

test("artifact page can display archive status for retrieved artifacts", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /archive/i);
  assert.doesNotMatch(response.body, /cache/i);
  assert.doesNotMatch(response.body, /hit/i);
});

test("artifact page shows always-visible trust line with confidence", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Evidence grounded/i);
  assert.match(response.body, /confidence/i);
  assert.doesNotMatch(response.body, /spinner/i);
});

test("artifact page includes expandable About this reconstruction panel", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /About this reconstruction/i);
  assert.match(response.body, /details/i);
});

test("artifact page includes copy link and save card share actions", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Copy link/i);
  assert.match(response.body, /Save card/i);
});

test("artifact page includes native share option that falls back gracefully", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Share/i);
});

test("ritual route generates opaque ID for stable routing", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /id=/);
});

test("artifact route accepts opaque ID for stable identity", () => {
  const validId = btoa("Hyderabad:1987").replace(/=/g, "");
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      id: validId,
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance/i);
});

test("ritual route completes successfully with opaque ID", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?id=/);
});

test("artifact displays resolved place metadata for unambiguous inputs", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Old City, Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Old City, Hyderabad.*1987/);
});

test("ambiguous place input triggers disambiguation step with candidates", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/disambiguate",
    searchParams: new URLSearchParams({
      place: "Springfield",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Which Springfield/i);
  assert.match(response.body, /Missouri/i);
  assert.match(response.body, /Illinois/i);
});

test("historical place names are accepted and preserved in artifact display", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Bombay, British India",
      year: "1920",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Bombay.*1920/);
});
