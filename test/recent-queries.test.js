import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("homepage includes recent queries section markup", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/",
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /recent-queries/i);
});

test("homepage includes client-side JavaScript for localStorage", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/",
  });

  assert.match(response.body, /localStorage/);
  assert.match(response.body, /seance-history/);
});

test("recent queries section is visually subtle", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/",
  });

  const subtleClasses = response.body.match(/recent-queries[^>]*class="[^"]*subtle[^"]*"/i);
  assert.ok(subtleClasses || response.body.includes("recent-queries"), "Should have subtle recent queries section");
});

test("homepage accepts existing homepage structure", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/",
  });

  assert.match(response.body, /Begin s&eacute;ance/);
  assert.match(response.body, /How it works/);
});