const ARCHIVE = new Map();

export function storeArtifact({ place, year, metadata = {}, provenance = "mock" }) {
  const key = `${place}:${year}`;
  const artifact = {
    place,
    year,
    metadata,
    provenance,
    storedAt: Date.now(),
  };
  ARCHIVE.set(key, artifact);
  return artifact;
}

export function getArtifact({ place, year }) {
  const key = `${place}:${year}`;
  return ARCHIVE.get(key) ?? null;
}

export function getProvenance({ place, year }) {
  const artifact = getArtifact({ place, year });
  return artifact?.provenance ?? null;
}

export function isArchived({ place, year }) {
  const key = `${place}:${year}`;
  const artifact = ARCHIVE.get(key);
  return artifact?.provenance === "real";
}

export function clearArchive() {
  ARCHIVE.clear();
}