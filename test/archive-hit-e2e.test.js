import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("archived artifact shows Recovered from prior reconstruction badge", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Echo Recovered/);
  assert.match(response.body, /Hyderabad.*1987/s);
});

test("archived artifact avoids cache/hit terminology", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Old City, Hyderabad",
      year: "1962",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Echo Recovered/);
  assert.doesNotMatch(response.body, /\bcache\b/i);
});

test("same archived artifact produces identical output", async () => {
  const params = new URLSearchParams({ place: "Tokyo", year: "1965", archived: "true" });

  const first = await handle({ method: "GET", pathname: "/artifact", searchParams: params });
  const second = await handle({ method: "GET", pathname: "/artifact", searchParams: new URLSearchParams({ place: "Tokyo", year: "1965", archived: "true" }) });

  assert.equal(first.body, second.body);
});

test("non-archived artifact shows Your seance badge", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Kyoto", year: "1912" }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Séance Active/);
  assert.doesNotMatch(response.body, /Echo Recovered/);
});