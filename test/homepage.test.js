import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test("homepage returns 200 with html content", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.equal(response.status, 200);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
});

test("homepage has ritual form with place and year inputs", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /action="\/ritual"/);
  assert.match(response.body, /name="place"/);
  assert.match(response.body, /name="year"/);
});

test("homepage shows Begin séance CTA button", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /Begin s/);
  assert.match(response.body, /type="submit"/);
});

test("homepage shows example queries as clickable links", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /Hyderabad/);
  assert.match(response.body, /href="\/ritual\?place=/);
});

test("homepage supports responsive layout with media queries", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /@media/);
  assert.match(response.body, /viewport/);
});

test("homepage includes link to how-it-works page", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /\/how-it-works/);
});

test("homepage includes recent queries section for localStorage history", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /recent-queries/);
});

test("homepage has no accounts or login UI", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.doesNotMatch(response.body, /login/i);
  assert.doesNotMatch(response.body, /sign up/i);
  assert.doesNotMatch(response.body, /account/i);
});
