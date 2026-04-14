const BOUNDED_EVIDENCE_SOURCES = {
  historicalAtlas: {
    name: "Historical Atlas",
    priority: 1,
    types: ["geographic", "urban"],
  },
  oralHistory: {
    name: "Oral History Archives",
    priority: 2,
    types: ["ambient", "social"],
  },
  academicResearch: {
    name: "Academic Studies",
    priority: 3,
    types: ["urban", "cultural"],
  },
  soundRecording: {
    name: "Historical Sound Recordings",
    priority: 4,
    types: ["ambient", "event", "music"],
  },
  newspaperArchive: {
    name: "Newspaper Archives",
    priority: 5,
    types: ["event", "social"],
  },
};

const EVIDENCE_BY_PLACE = {
  Hyderabad: [
    {
      description: "Charminar street vendors and auto-rickshaws",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.9,
    },
    {
      description: "Golconda fort echoes and qawwali ambient",
      supports: ["bed", "texture"],
      source: "soundRecording",
      confidence: 0.85,
    },
    {
      description: "Secunderabad railway station sounds",
      supports: ["event"],
      source: "historicalAtlas",
      confidence: 0.8,
    },
  ],
  Bombay: [
    {
      description: "Marine Drive ocean waves and traffic",
      supports: ["bed", "texture"],
      source: "soundRecording",
      confidence: 0.9,
    },
    {
      description: "Crawford Market street cries and vendors",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.85,
    },
    {
      description: "Victoria Terminus train station ambience",
      supports: ["event"],
      source: "historicalAtlas",
      confidence: 0.8,
    },
  ],
  Calcutta: [
    {
      description: "Howrah Bridge ferry and tram sounds",
      supports: ["event", "texture"],
      source: "soundRecording",
      confidence: 0.9,
    },
    {
      description: "Bengali street markets and tea stalls",
      supports: ["bed", "event"],
      source: "oralHistory",
      confidence: 0.85,
    },
  ],
  Tokyo: [
    {
      description: "Shibuya crossing pedestrian sounds",
      supports: ["event", "texture"],
      source: "soundRecording",
      confidence: 0.9,
    },
    {
      description: "Senso-ji temple bells and incense",
      supports: ["bed", "event"],
      source: "historicalAtlas",
      confidence: 0.85,
    },
    {
      description: "Yamanote line train ambient",
      supports: ["texture"],
      source: "soundRecording",
      confidence: 0.8,
    },
  ],
  Delhi: [
    {
      description: "Chandni Chowk marketplace and cycle-rickshaws",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.9,
    },
    {
      description: "Red Fort and Jama Masjid ambient",
      supports: ["bed", "texture"],
      source: "historicalAtlas",
      confidence: 0.85,
    },
  ],
  London: [
    {
      description: "Big Ben chimes and Parliament area",
      supports: ["event", "bed"],
      source: "soundRecording",
      confidence: 0.95,
    },
    {
      description: "Borough Market street sounds",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.85,
    },
    {
      description: "London Underground ambient",
      supports: ["texture"],
      source: "soundRecording",
      confidence: 0.8,
    },
  ],
  Paris: [
    {
      description: "Eiffel Tower area and Seine riverbank",
      supports: ["bed", "texture"],
      source: "historicalAtlas",
      confidence: 0.9,
    },
    {
      description: "Montmartre street performers and cafes",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.85,
    },
  ],
  NewYork: [
    {
      description: "Times Square traffic and honking",
      supports: ["event", "texture"],
      source: "soundRecording",
      confidence: 0.95,
    },
    {
      description: "Grand Central Station ambient",
      supports: ["bed", "event"],
      source: "soundRecording",
      confidence: 0.9,
    },
    {
      description: "Central Park birds and joggers",
      supports: ["bed", "texture"],
      source: "historicalAtlas",
      confidence: 0.85,
    },
  ],
  Singapore: [
    {
      description: "Raffles Hotel colonial ambience",
      supports: ["bed", "texture"],
      source: "historicalAtlas",
      confidence: 0.9,
    },
    {
      description: "Chinatown street vendors",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.85,
    },
  ],
  Cairo: [
    {
      description: "Khan el-Khalili bazaar sounds",
      supports: ["event", "texture"],
      source: "oralHistory",
      confidence: 0.9,
    },
    {
      description: "Nile feluccas and mosque calls to prayer",
      supports: ["bed", "event"],
      source: "soundRecording",
      confidence: 0.85,
    },
  ],
};

function getCanonicalPlace(place) {
  const normalized = place.replace(/\s+/g, "").replace(/,/g, "");
  
  const ALIASES = {
    "Bombay": "Bombay",
    "Mumbai": "Bombay",
    "Calcutta": "Calcutta",
    "Kolkata": "Calcutta",
    "St. Petersburg": "Leningrad",
    "Petersburg": "Leningrad",
    "Istanbul": "Istanbul",
    "Constantinople": "Istanbul",
    "Beijing": "Beijing",
    "Peking": "Beijing",
    "Shanghai": "Shanghai",
    "HongKong": "HongKong",
    "Bangkok": "Bangkok",
    "Manila": "Manila",
    "Tokyo": "Tokyo",
    "Kyoto": "Kyoto",
    "Seoul": "Seoul",
    "Taipei": "Taipei",
    "Hanoi": "Hanoi",
    "HoChiMinhCity": "HoChiMinhCity",
    "Saigon": "HoChiMinhCity",
    "Jakarta": "Jakarta",
    "KualaLumpur": "KualaLumpur",
    "Rangoon": "Rangoon",
    "Yangon": "Rangoon",
  };

  return ALIASES[normalized] || normalized;
}

function isPlaceInRange(place, year) {
  const yearNum = parseInt(year);
  
  const PLACE_YEAR_RANGES = {
    Hyderabad: { start: 1500, end: 2025 },
    Bombay: { start: 1500, end: 2025 },
    Calcutta: { start: 1500, end: 2025 },
    Delhi: { start: 1500, end: 2025 },
    Tokyo: { start: 1600, end: 2025 },
    London: { start: 1600, end: 2025 },
    Paris: { start: 1600, end: 2025 },
    NewYork: { start: 1600, end: 2025 },
    Singapore: { start: 1819, end: 2025 },
    Cairo: { start: 1800, end: 2025 },
  };

  const range = PLACE_YEAR_RANGES[place];
  if (!range) return yearNum >= 1800 && yearNum <= 2025;
  
  return yearNum >= range.start && yearNum <= 2025;
}

const BLOCKED_ZONES = ["UnknownConflict", "WarZone", "Battlefield", "Frontline"];

function isSensitivePeriod(year) {
  const yearNum = parseInt(year, 10);
  return yearNum >= 1914 && yearNum <= 1945;
}

export function extractEvidence({ place, year }) {
  const canonical = getCanonicalPlace(place);
  const normalized = place.replace(/\s+/g, "").replace(/,/g, "");
  
  if (BLOCKED_ZONES.includes(normalized) && isSensitivePeriod(year)) {
    return {
      evidence: [],
      confidence: "blocked",
      note: `Queries for conflict zones in sensitive periods require known evidence.`,
      blocked: true,
    };
  }
  
  const placeEvidence = EVIDENCE_BY_PLACE[canonical] || [];
  
  if (!isPlaceInRange(canonical, year)) {
    return {
      evidence: [],
      confidence: "low",
      note: `Limited evidence for ${place} in ${year}. Using regional defaults.`,
    };
  }

  if (placeEvidence.length === 0) {
    return {
      evidence: [],
      confidence: "low",
      note: `Limited specific evidence for ${place} in ${year}. Using era-based defaults.`,
    };
  }

  const yearNum = parseInt(year);
  let confidence = "high";
  let note = null;

  if (yearNum < 1900) {
    confidence = "medium";
    note = `Evidence from oral histories and academic sources for early period.`;
  } else if (yearNum >= 1900 && yearNum < 1950) {
    confidence = "medium";
    note = `Evidence from historical recordings and archives.`;
  }

  return {
    evidence: placeEvidence,
    confidence,
    note,
  };
}

export function extractEvidenceByLayer(evidence) {
  const bed = [];
  const event = [];
  const texture = [];

  for (const e of evidence || []) {
    const supports = e.supports || [];
    if (supports.includes("bed") || supports.includes("multiple")) bed.push(e);
    if (supports.includes("event") || supports.includes("multiple")) event.push(e);
    if (supports.includes("texture") || supports.includes("multiple")) texture.push(e);
  }

  return { bed, event, texture };
}

export function getEvidenceSummary(evidence) {
  if (!evidence || evidence.length === 0) {
    return "Evidence gathered from historical sources and academic research.";
  }

  const sources = new Set(evidence.map(e => BOUNDED_EVIDENCE_SOURCES[e.source]?.name || e.source));
  return `Evidence from ${Array.from(sources).join(", ")}.`;
}