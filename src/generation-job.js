/**
 * generation-job.js — Job state machine with single-flight deduplication.
 *
 * Improvements:
 * - Per-stage timeout support
 * - Auto-cleanup of old jobs on interval
 * - Progress percentage estimation based on typical stage durations
 */

export const JobState = {
  PENDING: "pending",
  EVIDENCE: "evidence",
  NORMALIZING: "normalizing",
  PLANNING: "planning",
  PROMPTS: "prompts",
  GENERATING: "generating",
  STORING: "storing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const JobStage = {
  PENDING: "Gathering historical evidence",
  EVIDENCE: "Gathering historical evidence",
  NORMALIZING: "Normalizing evidence structure",
  PLANNING: "Planning soundscape layers",
  PROMPTS: "Building generation prompts",
  GENERATING: "Generating audio layers",
  STORING: "Storing artifact",
  COMPLETED: "Complete",
  FAILED: "Generation failed",
};

// Estimated progress percentages for each stage
const STAGE_PROGRESS = {
  pending: 0,
  evidence: 10,
  normalizing: 25,
  planning: 40,
  prompts: 55,
  generating: 65,
  storing: 90,
  completed: 100,
  failed: 0,
};

// Per-stage timeouts in milliseconds
const STAGE_TIMEOUTS = {
  evidence: 30000,    // 30s for Gemini evidence
  normalizing: 15000, // 15s for normalization
  planning: 30000,    // 30s for Gemini planning
  prompts: 5000,      // 5s for prompt building
  generating: 90000,  // 90s for ElevenLabs (3 parallel + events)
  storing: 15000,     // 15s for storage
};

const jobs = new Map();
const inFlightJobs = new Map();

function getLockKey(place, year) {
  return `${place.toLowerCase()}:${year}`;
}

function generateJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getInFlightJob(place, year) {
  const lockKey = getLockKey(place, year);
  return inFlightJobs.get(lockKey) || null;
}

export function setInFlightJob(job) {
  const lockKey = getLockKey(job.place, job.year);
  inFlightJobs.set(lockKey, job);
}

export function clearInFlightJob(place, year) {
  const lockKey = getLockKey(place, year);
  inFlightJobs.delete(lockKey);
}

export function createJob({ place, year, registerFlight = true, preExtractedEvidence = null }) {
  const id = generateJobId();
  const job = {
    id,
    place,
    year,
    state: JobState.PENDING,
    stage: JobStage.PENDING,
    progress: 0,
    result: null,
    error: null,
    preExtractedEvidence,
    stageStartedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  jobs.set(id, job);

  if (registerFlight) {
    setInFlightJob(job);
  }

  return job;
}

export function getJob(id) {
  return jobs.get(id) || null;
}

export function updateJobState(id, state, data = {}) {
  const job = jobs.get(id);
  if (!job) return null;

  job.state = state;
  job.stage = JobStage[state.toUpperCase()] || JobStage.PENDING;
  job.progress = STAGE_PROGRESS[state] || 0;
  job.updatedAt = new Date().toISOString();
  job.stageStartedAt = Date.now();

  if (data.result) job.result = data.result;
  if (data.error) job.error = data.error;

  if (state === JobState.COMPLETED || state === JobState.FAILED) {
    clearInFlightJob(job.place, job.year);
  }

  return job;
}

/**
 * Check if the current stage has exceeded its timeout.
 */
export function isStageTimedOut(id) {
  const job = jobs.get(id);
  if (!job || !job.stageStartedAt) return false;

  const timeout = STAGE_TIMEOUTS[job.state];
  if (!timeout) return false;

  return Date.now() - job.stageStartedAt > timeout;
}

/**
 * Get the timeout for a specific stage (for use with Promise.race).
 */
export function getStageTimeout(state) {
  return STAGE_TIMEOUTS[state] || 30000;
}

/**
 * Clean up completed/failed jobs older than maxAgeMs.
 */
export function clearOldJobs(maxAgeMs = 3600000) {
  const now = Date.now();
  let cleared = 0;
  for (const [id, job] of jobs) {
    const created = new Date(job.createdAt).getTime();
    if (now - created > maxAgeMs) {
      jobs.delete(id);
      cleared++;
    }
  }
  if (cleared > 0) {
    console.log(`[generation-job] Cleared ${cleared} old jobs`);
  }
}

// ── Auto-cleanup interval ───────────────────────────────────────────────
// Runs every 5 minutes to prevent memory leaks from accumulated jobs.
let _cleanupInterval = null;

export function startAutoCleanup(intervalMs = 300000) {
  if (_cleanupInterval) return;
  _cleanupInterval = setInterval(() => clearOldJobs(), intervalMs);
  // Don't block process exit
  if (_cleanupInterval.unref) _cleanupInterval.unref();
}

export function stopAutoCleanup() {
  if (_cleanupInterval) {
    clearInterval(_cleanupInterval);
    _cleanupInterval = null;
  }
}

// Start auto-cleanup on module load
startAutoCleanup();