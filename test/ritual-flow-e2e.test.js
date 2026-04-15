import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("ritual route returns 302 redirect for valid query", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "1987" }),
  });
  assert.equal(response.status, 302);
  // May redirect to /generating (fresh) or /artifact (cached in turbopuffer)
  assert.ok(
    response.headers.location.includes("/generating") || response.headers.location.includes("/artifact"),
    `Expected /generating or /artifact redirect, got: ${response.headers.location}`
  );
});

test("ritual route includes place and year in redirect URL", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "1987" }),
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.location, /place=Hyderabad/);
  assert.match(response.headers.location, /year=1987/);
});

test("ritual route for uncached place redirects to /generating", async () => {
  // Use a unique place that won't be in turbopuffer
  const uniquePlace = "TestUncachedVillage" + Date.now();
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: uniquePlace, year: "1850" }),
  });
  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating\?/);
});

test("generating page returns 200 with reconstruction stages", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/generating",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Locating place in time/);
  assert.match(response.body, /Searching for sensory evidence/);
  assert.match(response.body, /Composing ambient field/);
});

test("generating page includes back home link", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/generating",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1987" }),
  });
  assert.match(response.body, /href="\/"/);
});

test("artifact page returns 200 for known place-year", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Venice/);
  assert.match(response.body, /1500/);
});

test("artifact page shows Recovered from for turbopuffer-cached artifacts", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500", archived: "true" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Recovered from prior reconstruction/);
});

test("artifact page shows Your seance for non-cached artifacts", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "UnknownPlace", year: "1800" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance/);
});

test("artifact page shows confidence badge", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500" }),
  });
  assert.match(response.body, /confidence-badge/);
});

test("artifact page shows Explore nearby timelines", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500" }),
  });
  assert.match(response.body, /Explore nearby timelines/);
});

test("artifact page includes Hear again and New reconstruction actions", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500" }),
  });
  assert.match(response.body, /Hear again/);
  assert.match(response.body, /New reconstruction/);
});

test("artifact page shows Reconstructed from archival descriptions", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Venice", year: "1500" }),
  });
  assert.match(response.body, /Reconstructed from archival descriptions/);
});

test("artifact page works with opaque ID parameter", async () => {
  const validId = btoa("Hyderabad:1987").replace(/=/g, "");
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ id: validId }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance|Recovered from|Freshly summoned/);
});

test("artifact page handles historical place names", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Bombay", year: "1920" }),
  });
  assert.equal(response.status, 200);
  assert.match(response.body, /Bombay/);
  assert.match(response.body, /1920/);
});

test("E2E: homepage form action points to /ritual", async () => {
  const homepage = await handle({ method: "GET", pathname: "/" });
  assert.equal(homepage.status, 200);
  assert.match(homepage.body, /action="\/ritual"/);
});

test("E2E: ritual route for valid query returns 302", async () => {
  const ritual = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "1987" }),
  });
  assert.equal(ritual.status, 302);
  assert.match(ritual.headers.location, /place=Hyderabad/);
});