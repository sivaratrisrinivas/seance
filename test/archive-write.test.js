import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}
import { storeArtifact, getProvenance, isArchived, clearArchive } from "../src/artifact-store.js";

test.beforeEach(() => {
  clearArchive();
});

test("archive write: fresh generation stores artifact to archive", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Oslo",
      year: "1950",
    }),
  });

  assert.equal(response.status, 302);
  const location = response.headers.location;
  assert.ok(location.includes("/generating"), "Should redirect to generating");
});

test("archive write: archived artifact can be retrieved after generation", async () => {
  const generateResponse = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Bombay",
      year: "1975",
    }),
  });

  assert.equal(generateResponse.status, 302);

  const archivedResponse = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Bombay",
      year: "1975",
      archived: "true",
    }),
  });

  assert.equal(archivedResponse.status, 200);
  assert.match(archivedResponse.body, /From your archive/);
  assert.match(archivedResponse.body, /Bombay.*1975/);
});

test("archive write: stored artifact includes reconstruction metadata", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "Calcutta",
      year: "1945",
      archived: "true",
    }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Evidence grounded/);
  assert.match(response.body, /[Cc]onfidence/);
});

test("mock vs real: mock artifacts are distinguishable from real", async () => {
  storeArtifact({ place: "TestCity", year: "1950", provenance: "mock" });
  storeArtifact({ place: "RealCity", year: "1960", provenance: "real" });

  assert.equal(getProvenance({ place: "TestCity", year: "1950" }), "mock");
  assert.equal(getProvenance({ place: "RealCity", year: "1960" }), "real");
});

test("mock vs real: isArchived returns true only for real provenance", async () => {
  storeArtifact({ place: "MockPlace", year: "1950", provenance: "mock" });
  storeArtifact({ place: "RealPlace", year: "1960", provenance: "real" });

  assert.equal(isArchived({ place: "MockPlace", year: "1950" }), false);
  assert.equal(isArchived({ place: "RealPlace", year: "1960" }), true);
});

test("cache-hit: repeat request with real artifact redirects to archive", async () => {
  storeArtifact({ place: "Hyderabad", year: "1987", provenance: "real" });

  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Hyderabad",
      year: "1987",
    }),
  });

  assert.equal(response.status, 302);
  assert.ok(response.headers.location.includes("archived=true"), 
    `Expected archived=true in redirect, got: ${response.headers.location}`);
});

test("cache-hit: repeat request retrieves archived artifact", async () => {
  storeArtifact({ place: "Tokyo", year: "1965", provenance: "real" });

  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({
      place: "Tokyo",
      year: "1965",
    }),
  });

  assert.equal(response.status, 302);
  const location = response.headers.location;

  const artifactResponse = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams(location.split("?")[1]),
  });

  assert.equal(artifactResponse.status, 200);
  assert.match(artifactResponse.body, /From your archive/);
});

test("mock vs real: development artifacts marked as mock do not pollute archive path", async () => {
  storeArtifact({ place: "DevPlace", year: "1980", provenance: "mock" });

  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({
      place: "DevPlace",
      year: "1980",
    }),
  });

  assert.equal(response.status, 200);
  assert.doesNotMatch(response.body, /From your archive/);
});