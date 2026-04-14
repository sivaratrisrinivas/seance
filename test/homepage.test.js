import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("homepage shows the premise and both inputs", () => {
  const response = handleRequest({ method: "GET", pathname: "/" });

  assert.equal(response.status, 200);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /Hear a grounded sound reconstruction of any place and year\./);
  assert.match(response.body, /name="place"/);
  assert.match(response.body, /name="year"/);
  assert.match(response.body, /type="number"/);
});

test("homepage exposes a single Begin seance action tied to the ritual flow", () => {
  const response = handleRequest({ method: "GET", pathname: "/" });

  assert.match(response.body, /<form action="\/ritual" method="get"/);
  assert.match(response.body, />Begin s(?:&eacute;|é)ance</);
});

test("homepage stays anonymous and account free", () => {
  const response = handleRequest({ method: "GET", pathname: "/" });

  for (const phrase of ["Sign in", "Log in", "Create account", "Profile", "Saved"]) {
    assert.doesNotMatch(response.body, new RegExp(phrase));
  }
});

test("homepage supports mobile and desktop layouts", () => {
  const response = handleRequest({ method: "GET", pathname: "/" });

  assert.match(response.body, /name="viewport"/);
  assert.match(response.body, /@media \(max-width: 720px\)/);
});
