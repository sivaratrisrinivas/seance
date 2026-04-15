import assert from "node:assert/strict";
import test from "node:test";

import { checkRateLimit } from "../src/rate-limiter.js";

test("fresh-generation requests are rate limited after threshold", () => {
  const identifier = "test-rate-limit-" + Date.now();
  
  const first = checkRateLimit({ identifier, type: "generation" });
  assert.equal(first.allowed, true, "first request should be allowed");
  
  for (let i = 0; i < 4; i++) {
    const result = checkRateLimit({ identifier, type: "generation" });
    assert.equal(result.allowed, true, `request ${i + 2} should be allowed`);
  }
  
  const fifth = checkRateLimit({ identifier, type: "generation" });
  assert.equal(fifth.allowed, false, "request over limit should be blocked");
  assert.match(fifth.reason, /try again|cooldown|rate limit/i);
});

test("archive-hit retrieval is not rate limited", () => {
  const identifier = "test-archive-" + Date.now();
  
  const result = checkRateLimit({ identifier, type: "archive" });
  assert.equal(result.allowed, true, "archive requests should always be allowed");
});

test("rate limit provides retry timing", () => {
  const identifier = "test-retry-" + Date.now();
  
  for (let i = 0; i < 5; i++) {
    checkRateLimit({ identifier, type: "generation" });
  }
  
  const blocked = checkRateLimit({ identifier, type: "generation" });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0, "blocked request should have retry timing");
});

test("separate limits for generation vs archive", () => {
  const identifier = "test-separate-" + Date.now();
  
  for (let i = 0; i < 5; i++) {
    checkRateLimit({ identifier, type: "generation" });
  }
  
  const blocked = checkRateLimit({ identifier, type: "generation" });
  assert.equal(blocked.allowed, false, "generation should be blocked");
  
  const archiveOk = checkRateLimit({ identifier, type: "archive" });
  assert.equal(archiveOk.allowed, true, "archive should still be allowed");
});