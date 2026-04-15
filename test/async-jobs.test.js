import assert from "node:assert/strict";
import test from "node:test";

import { createJob, getJob, JobState } from "../src/generation-job.js";

test("createJob returns job with pending state", () => {
  const job = createJob({ place: "London", year: "1940" });
  
  assert.ok(job.id);
  assert.equal(job.state, JobState.PENDING);
  assert.equal(job.place, "London");
  assert.equal(job.year, "1940");
});

test("getJob retrieves existing job by id", () => {
  const created = createJob({ place: "Tokyo", year: "1945" });
  const retrieved = getJob(created.id);
  
  assert.equal(retrieved?.id, created.id);
  assert.equal(retrieved?.place, "Tokyo");
});

test("job state transitions from pending to processing", () => {
  const job = createJob({ place: "Paris", year: "1920" });
  
  job.state = JobState.PROCESSING;
  assert.equal(job.state, JobState.PROCESSING);
});

test("job state transitions to completed", () => {
  const job = createJob({ place: "Berlin", year: "1930" });
  
  job.state = JobState.COMPLETED;
  job.result = { bed: "abc", event: "def", texture: "ghi" };
  
  assert.equal(job.state, JobState.COMPLETED);
  assert.ok(job.result);
});

test("job state transitions to failed", () => {
  const job = createJob({ place: "Rome", year: "1950" });
  
  job.state = JobState.FAILED;
  job.error = "Generation failed";
  
  assert.equal(job.state, JobState.FAILED);
  assert.equal(job.error, "Generation failed");
});