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
    result: null,
    error: null,
    preExtractedEvidence,
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
  job.updatedAt = new Date().toISOString();
  
  if (data.result) job.result = data.result;
  if (data.error) job.error = data.error;
  
  if (state === JobState.COMPLETED || state === JobState.FAILED) {
    clearInFlightJob(job.place, job.year);
  }
  
  return job;
}

export function clearOldJobs(maxAgeMs = 3600000) {
  const now = Date.now();
  for (const [id, job] of jobs) {
    const created = new Date(job.createdAt).getTime();
    if (now - created > maxAgeMs) {
      jobs.delete(id);
    }
  }
}