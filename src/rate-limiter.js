const LIMITS = {
  generation: { max: 5, windowMs: 60 * 1000 },
  archive: { max: Number.MAX_SAFE_INTEGER, windowMs: 0 },
};

const COOLDOWN_MS = 30 * 1000;

const windows = new Map();

function cleanOldEntries() {
  const now = Date.now();
  const windowMs = LIMITS.generation.windowMs;
  for (const [key, data] of windows) {
    if (now - data.start > windowMs * 2) {
      windows.delete(key);
    }
  }
}

export function checkRateLimit({ identifier, type = "generation" }) {
  cleanOldEntries();
  
  const limit = LIMITS[type] ?? LIMITS.generation;
  
  if (limit.max >= Number.MAX_SAFE_INTEGER) {
    return { allowed: true };
  }
  
  const key = `${type}:${identifier}`;
  const now = Date.now();
  let window = windows.get(key);
  
  if (!window || now - window.start > limit.windowMs) {
    window = { start: now, count: 0 };
    windows.set(key, window);
  }
  
  window.count++;
  
  if (window.count <= limit.max) {
    return { allowed: true };
  }
  
  const retryAfter = Math.ceil((window.start + limit.windowMs - now) / 1000) + COOLDOWN_MS / 1000;
  
  return {
    allowed: false,
    reason: "Rate limit exceeded. Please wait before trying again.",
    retryAfter: Math.max(1, retryAfter),
  };
}