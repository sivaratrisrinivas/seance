import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

test("E2E: repeat request resolves to archived artifact", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /From your archive/);
  assert.match(response.body, /Hyderabad.*1987/);
});

test("E2E: archived artifact shows archive-specific language", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Old City, Hyderabad",
      year: "1962",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /[Ff]rom your archive/);
  assert.doesNotMatch(response.body, /cache/i);
  assert.doesNotMatch(response.body, /hit/i);
});

test("E2E: archived artifacts maintain same identity", () => {
  const firstResponse = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Tokyo",
      year: "1965",
      archived: "true",
    }),
  });

  const secondResponse = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Tokyo",
      year: "1965",
      archived: "true",
    }),
  });

  assert.equal(firstResponse.body, secondResponse.body);
});

test("E2E: non-archived artifacts show live generation language", () => {
  const response = handleRequest({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Kyoto",
      year: "1912",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Your seance/);
  assert.doesNotMatch(response.body, /[Ff]rom your archive/);
});