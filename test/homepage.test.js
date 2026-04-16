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

test("homepage shows summon CTA button", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.match(response.body, /summon/i);
  assert.match(response.body, /button/i);
});



test("homepage has no accounts or login UI", async () => {
  const response = await handle({ method: "GET", pathname: "/" });
  assert.doesNotMatch(response.body, /login/i);
  assert.doesNotMatch(response.body, /sign up/i);
  assert.doesNotMatch(response.body, /account/i);
});
