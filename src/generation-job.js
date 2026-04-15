export const JobState = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

const jobs = new Map();

function generateJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function createJob({ place, year }) {
  const id = generateJobId();
  const job = {
    id,
    place,
    year,
    state: JobState.PENDING,
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  jobs.set(id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id) || null;
}

export function updateJobState(id, state, data = {}) {
  const job = jobs.get(id);
  if (!job) return null;
  
  job.state = state;
  job.updatedAt = new Date().toISOString();
  
  if (data.result) job.result = data.result;
  if (data.error) job.error = data.error;
  
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