import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("ritual route redirects to generating then artifact", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
});

test("artifact route shows mock result page with playback placeholder", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1950",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Oslo.*1950/);
  assert.match(response.body, /playback/i);
  assert.match(response.body, /Hear it again/i);
  assert.doesNotMatch(response.body, /scrub/i);
  assert.doesNotMatch(response.body, /download/i);
});

test("artifact route supports direct navigation without homepage", async () => {
  const response = await handle({
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

test.skip("artifact page shows archive status language without internal terms", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "BrandNewPlaceXyz123",
      year: "1500",
    }),
  });

  assert.equal(response.status, 200);
  assert.doesNotMatch(response.body, /cache/i);
  assert.doesNotMatch(response.body, /warm lookup/i);
  assert.doesNotMatch(response.body, /hit/i);
});

test("artifact page can display archive status for retrieved artifacts", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /archive/i);
  assert.doesNotMatch(response.body, /cache/i);
  assert.doesNotMatch(response.body, /hit/i);
});

test("artifact page shows always-visible trust line with confidence", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Evidence grounded/i);
  assert.match(response.body, /confidence/i);
  assert.doesNotMatch(response.body, /spinner/i);
});

test("artifact page includes expandable About this reconstruction panel", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /About this reconstruction/i);
  assert.match(response.body, /details/i);
});

test("artifact page includes copy link and save card share actions", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Copy link/i);
  assert.match(response.body, /Save card/i);
});

test("artifact page includes native share option that falls back gracefully", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Share/i);
});

test("ritual route generates opaque ID for stable routing", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /id=/);
});

test("artifact route accepts opaque ID for stable identity", async () => {
  const validId = btoa("Hyderabad:1987").replace(/=/g, "");
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      id: validId,
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance/i);
});

test("ritual route completes successfully with opaque ID", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Venice",
      year: "1500",
    }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?id=/);
});

test("artifact displays resolved place metadata for unambiguous inputs", async () => {
  const response = await handle({
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

test("ambiguous place input triggers disambiguation step with candidates", async () => {
  const response = await handle({
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

test("historical place names are accepted and preserved in artifact display", async () => {
  const response = await handle({
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
