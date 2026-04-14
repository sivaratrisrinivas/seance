import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("E2E: complete ritual flow from entry through artifact", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/",
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Begin s/)

  const formAction = response.body.match(/action="([^"]+)"/)?.[1];
  assert.equal(formAction, "/ritual");
});

test("E2E: ritual route accepts valid query and redirects to generating", () => {
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

test("E2E: generating page shows loading state then redirects to artifact", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/generating",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Preparing your seance/);
  assert.match(response.body, /reconstruct/);
  assert.match(response.body, /meta http-equiv="refresh"/);
});

test("E2E: artifact page shows playable artifact with place and year", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      id: btoa("Hyderabad:1987").replace(/=/g, ""),
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Hyderabad.*1987/);
  assert.match(response.body, /Hear it again/);
});

test("E2E: replay affordance allows hearing artifact again", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 200);
  const replayLink = response.body.match(/href="([^"]+)">Hear it again/)?.[1];
  assert.ok(replayLink, "Replay link should exist");
  assert.match(replayLink, /place=Hyderabad/);
  assert.match(replayLink, /year=1987/);
});