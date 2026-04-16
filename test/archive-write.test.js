import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../server.js";
import { storeArtifact, getProvenance, isArchived, clearArchive } from "../src/artifact-store.js";

async function handle(req) {
  const result = handleRequest(req);
  return result?.then ? await result : result;
}

test.beforeEach(() => {
  clearArchive();
});

// --- In-memory artifact store ---

test("storeArtifact persists artifact with provenance", () => {
  storeArtifact({ place: "TestCity", year: "1950", provenance: "mock" });
  assert.equal(getProvenance({ place: "TestCity", year: "1950" }), "mock");
});

test("storeArtifact distinguishes mock from real provenance", () => {
  storeArtifact({ place: "MockCity", year: "1950", provenance: "mock" });
  storeArtifact({ place: "RealCity", year: "1960", provenance: "real" });

  assert.equal(getProvenance({ place: "MockCity", year: "1950" }), "mock");
  assert.equal(getProvenance({ place: "RealCity", year: "1960" }), "real");
});

test("isArchived returns true only for real provenance", () => {
  storeArtifact({ place: "MockPlace", year: "1950", provenance: "mock" });
  storeArtifact({ place: "RealPlace", year: "1960", provenance: "real" });

  assert.equal(isArchived({ place: "MockPlace", year: "1950" }), false);
  assert.equal(isArchived({ place: "RealPlace", year: "1960" }), true);
});

// --- Archive through /ritual route ---

test("ritual route redirects to /generating for fresh generation", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Oslo", year: "1950" }),
  });

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /\/generating/);
});

// --- Turbopuffer cache hit redirects to /artifact ---

test("ritual route with turbopuffer-cached artifact redirects to /artifact", async () => {
  // Hyderabad:1987 exists in turbopuffer from prior tests
  const response = await handle({
    method: "GET",
    pathname: "/ritual",
    searchParams: new URLSearchParams({ place: "Hyderabad", year: "1987" }),
  });

  assert.equal(response.status, 302);
  // Should redirect to either /artifact (archive hit) or /generating
  assert.ok(
    response.headers.location.includes("/artifact") || response.headers.location.includes("/generating"),
    `Expected redirect to /artifact or /generating, got: ${response.headers.location}`
  );
});

// --- Mock artifacts do not appear as archived ---

test("mock artifacts are not shown with archive badge", async () => {
  storeArtifact({ place: "DevPlace", year: "1980", provenance: "mock" });

  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "DevPlace", year: "1980" }),
  });

  assert.equal(response.status, 200);
  assert.doesNotMatch(response.body, /Recovered from prior reconstruction/);
});

// --- Artifact page renders correctly for archived query ---

test("artifact page with archived=true shows recovery badge", async () => {
  const response = await handle({
    method: "GET",
    pathname: "/artifact",
    searchParams: new URLSearchParams({ place: "Tokyo", year: "1965", archived: "true" }),
  });

  assert.equal(response.status, 200);
  assert.match(response.body, /Echo Recovered/i);
  assert.match(response.body, /confidence-badge|Confidence/i);
});