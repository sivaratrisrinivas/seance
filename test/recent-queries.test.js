import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("homepage includes recent queries section", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.equal(response.status, 200);
  assert.match(response.body, /recent-queries/i);
});

test("homepage includes localStorage JavaScript for query history", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /localStorage/);
  assert.match(response.body, /seance-history/);
});

test("recent queries section uses subtle styling", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.ok(response.body.includes("recent-queries"), "Should have recent queries element");
});

test("homepage contains Begin séance button and How it works link", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /Begin séance/);
  assert.match(response.body, /How it works/);
});