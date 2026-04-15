import assert from "node:assert/strict";
import test from "node:test";

import { createJob, getJob, updateJobState, getInFlightJob, clearInFlightJob, JobState, JobStage } from "../src/generation-job.js";

test("createJob returns job with pending state", () => {
  const job = createJob({ place: "TestPlace", year: 2000, registerFlight: false });
  assert.ok(job.id, "Job should have an ID");
  assert.equal(job.state, JobState.PENDING);
  assert.equal(job.place, "TestPlace");
  assert.equal(job.year, 2000);
});

test("createJob sets initial stage to Gathering historical evidence", () => {
  const job = createJob({ place: "TestPlace2", year: 1950, registerFlight: false });
  assert.equal(job.stage, JobStage.PENDING);
  assert.equal(job.stage, "Gathering historical evidence");
});

test("updateJobState advances state and updates stage label", () => {
  const job = createJob({ place: "TestAdvance", year: 1960, registerFlight: false });
  updateJobState(job.id, "NORMALIZING");
  const updated = getJob(job.id);
  assert.equal(updated.state, "NORMALIZING");
  assert.equal(updated.stage, JobStage.NORMALIZING);
  assert.equal(updated.stage, "Normalizing evidence structure");
});

test("getJob retrieves existing job by id", () => {
  const job = createJob({ place: "TestGet", year: 1970, registerFlight: false });
  const retrieved = getJob(job.id);
  assert.equal(retrieved.id, job.id);
  assert.equal(retrieved.place, "TestGet");
});

test("job state transitions to COMPLETED", () => {
  const job = createJob({ place: "TestComplete", year: 1980, registerFlight: false });
  updateJobState(job.id, JobState.COMPLETED);
  const updated = getJob(job.id);
  assert.equal(updated.state, JobState.COMPLETED);
});

test("job state transitions to FAILED", () => {
  const job = createJob({ place: "TestFail", year: 1990, registerFlight: false });
  updateJobState(job.id, JobState.FAILED);
  const updated = getJob(job.id);
  assert.equal(updated.state, JobState.FAILED);
});

test("single-flight: getInFlightJob returns existing job for same place-year", () => {
  const job = createJob({ place: "TestFlight", year: 1985 });
  const existing = getInFlightJob("TestFlight", 1985);
  assert.ok(existing, "Should find in-flight job");
  assert.equal(existing.id, job.id);
});

test("single-flight: clearing in-flight returns null for same place-year", () => {
  const job = createJob({ place: "TestClear2", year: 1986 });
  clearInFlightJob("TestClear2", 1986);
  const found = getInFlightJob("TestClear2", 1986);
  assert.equal(found, null, "Should return null after clearing in-flight job");
});

test("job includes preExtractedEvidence when provided", () => {
  const evidence = [{ description: "Test evidence" }];
  const job = createJob({ place: "TestEvidence", year: 1975, registerFlight: false, preExtractedEvidence: evidence });
  assert.deepEqual(job.preExtractedEvidence, evidence);
});

test("completed job clears in-flight automatically", () => {
  const job = createJob({ place: "TestAutoClr", year: 1977 });
  assert.ok(getInFlightJob("TestAutoClr", 1977), "Should be in-flight after creation");
  updateJobState(job.id, JobState.COMPLETED);
  assert.equal(getInFlightJob("TestAutoClr", 1977), null, "Should be cleared after completion");
});