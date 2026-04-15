import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("moderation blocks place without evidence in sensitive period 1914-1945", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "UnknownConflict", year: "1939" }),
  });
  assert.equal(response.status, 422);
});

test("moderation allows places with historical evidence in sensitive periods", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "London", year: "1940" }),
  });
  // London has evidence, should not be blocked (status 302 or 200, not 422-blocked)
  assert.notEqual(response.status, 422);
});

test("moderation allows places with evidence outside sensitive periods", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "1987" }),
  });
  assert.notEqual(response.status, 422);
});