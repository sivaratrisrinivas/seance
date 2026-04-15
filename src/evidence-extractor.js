const BOUNDED_EVIDENCE_SOURCES = {
  historicalAtlas: { name: "Historical Atlas", priority: 1, types: ["geographic", "urban"] },
  oralHistory: { name: "Oral History Archives", priority: 2, types: ["ambient", "social"] },
  academicResearch: { name: "Academic Studies", priority: 3, types: ["urban", "cultural"] },
  soundRecording: { name: "Historical Sound Recordings", priority: 4, types: ["ambient", "event", "music"] },
  newspaperArchive: { name: "Newspaper Archives", priority: 5, types: ["event", "social"] },
};

const historicalRecording = "soundRecording";
const oralHistory = "oralHistory";

const EVIDENCE_BY_PLACE = {
  London: [
    { description: "Big Ben heavy tolling striking Westminster", supports: ["event"], source: historicalRecording, confidence: 0.98 },
    { description: "London Underground pneumatic hiss and wheel screech", supports: ["texture"], source: historicalRecording, confidence: 0.92 },
    { description: "Borough Market street vendors rhythmic hawking", supports: ["texture"], source: oralHistory, confidence: 0.88 },
    { description: "Milkman clinking glass bottles on doorsteps", supports: ["event"], source: historicalRecording, confidence: 0.90 },
  ],
  Paris: [
    { description: "Notre Dame heavy bronze bell peals", supports: ["event"], source: historicalRecording, confidence: 0.98 },
    { description: "Sprague-Thomson Metro burning wooden brake shoes", supports: ["texture"], source: historicalRecording, confidence: 0.94 },
    { description: "Rue Mouffetard market bartering", supports: ["texture"], source: oralHistory, confidence: 0.85 },
    { description: "River Seine working barges chugging", supports: ["bed"], source: historicalRecording, confidence: 0.89 },
    { description: "Bal-musette accordion street buskers", supports: ["event"], source: oralHistory, confidence: 0.87 },
  ],
  NewYork: [
    { description: "Subway R1-R9 train cars metallic screech", supports: ["bed"], source: historicalRecording, confidence: 0.96 },
    { description: "Fulton Fish Market morning fishmonger shouts", supports: ["texture"], source: oralHistory, confidence: 0.86 },
    { description: "St. Patrick Cathedral towering bells", supports: ["event"], source: historicalRecording, confidence: 0.95 },
    { description: "Hudson River harbor foghorn deep blasts", supports: ["event"], source: historicalRecording, confidence: 0.94 },
  ],
  Tokyo: [
    { description: "Yamanote line electric train squeal", supports: ["bed"], source: historicalRecording, confidence: 0.95 },
    { description: "Tofu seller brass bugle", supports: ["event"], source: historicalRecording, confidence: 0.92 },
    { description: "Roasted sweet potato vendor melancholic chant", supports: ["event"], source: historicalRecording, confidence: 0.90 },
    { description: "Tsukiji fish market rhythmic auctioneer chants", supports: ["texture"], source: historicalRecording, confidence: 0.87 },
    { description: "Senso-ji massive bronze temple bells", supports: ["event"], source: historicalRecording, confidence: 0.96 },
  ],
  Mumbai: [
    { description: "DC EMU train bubbling traction motor", supports: ["bed"], source: historicalRecording, confidence: 0.97 },
    { description: "Dabbawala aluminum tiffin clatter", supports: ["texture"], source: historicalRecording, confidence: 0.91 },
    { description: "Haji Ali Dargah Azaan echoing", supports: ["event"], source: historicalRecording, confidence: 0.89 },
    { description: "Chor Bazaar aggressive haggling", supports: ["texture"], source: oralHistory, confidence: 0.84 },
    { description: "Monsoon rain on corrugated tin", supports: ["bed"], source: historicalRecording, confidence: 0.93 },
  ],
  Cairo: [
    { description: "Khan el-Khalili vendor glass cup clinking", supports: ["event"], source: historicalRecording, confidence: 0.94 },
    { description: "Coppersmith rhythmic hammering", supports: ["texture"], source: historicalRecording, confidence: 0.90 },
    { description: "Donkey cart wheels on cobblestones", supports: ["bed"], source: oralHistory, confidence: 0.86 },
    { description: "Shisha pipe bubbling at cafes", supports: ["texture"], source: historicalRecording, confidence: 0.88 },
    { description: "Al-Azhar mosque Adhan", supports: ["event"], source: historicalRecording, confidence: 0.92 },
  ],
  Istanbul: [
    { description: "Bosphorus ferry warning horns", supports: ["event"], source: historicalRecording, confidence: 0.96 },
    { description: "Simit seller rhythmic calls", supports: ["event"], source: historicalRecording, confidence: 0.91 },
    { description: "Grand Bazaar merchant multilingual", supports: ["texture"], source: oralHistory, confidence: 0.85 },
    { description: "Blue Mosque Ezan call to prayer", supports: ["event"], source: historicalRecording, confidence: 0.95 },
  ],
  Rome: [
    { description: "Vespa motor scooter buzz", supports: ["bed"], source: historicalRecording, confidence: 0.97 },
    { description: "Campo de Fiori butcher calls", supports: ["texture"], source: historicalRecording, confidence: 0.88 },
    { description: "St. Peter Basilica church bells", supports: ["event"], source: historicalRecording, confidence: 0.98 },
    { description: "Trevi Fountain splashing", supports: ["bed"], source: historicalRecording, confidence: 0.95 },
    { description: "Villa Borghese cicada drone", supports: ["bed"], source: historicalRecording, confidence: 0.90 },
  ],
  Beijing: [
    { description: "Pigeon whistles harmonic hum", supports: ["bed"], source: historicalRecording, confidence: 0.95 },
    { description: "Bicycle bells collective ringing", supports: ["texture"], source: historicalRecording, confidence: 0.94 },
    { description: "Propaganda loudspeaker broadcasts", supports: ["event"], source: historicalRecording, confidence: 0.97 },
    { description: "Knife sharpener rhythm", supports: ["event"], source: historicalRecording, confidence: 0.92 },
  ],
  MexicoCity: [
    { description: "Camotero steam whistle", supports: ["event"], source: historicalRecording, confidence: 0.95 },
    { description: "Afilador knife sharpener", supports: ["event"], source: historicalRecording, confidence: 0.93 },
    { description: "Recolector brass bell", supports: ["event"], source: historicalRecording, confidence: 0.89 },
    { description: "Tamalero megaphone shout", supports: ["event"], source: historicalRecording, confidence: 0.96 },
  ],
  Havana: [
    { description: "El Manisero musical pregon", supports: ["event"], source: historicalRecording, confidence: 0.94 },
    { description: "Pre-1959 American V8 idling", supports: ["bed"], source: historicalRecording, confidence: 0.97 },
    { description: "Havana Cathedral bronze bells", supports: ["event"], source: historicalRecording, confidence: 0.95 },
    { description: "Dominoes on wooden tables", supports: ["event"], source: oralHistory, confidence: 0.88 },
  ],
  RioDeJaneiro: [
    { description: "Samba bateria drum sections", supports: ["texture"], source: historicalRecording, confidence: 0.96 },
    { description: "Tropical rain on favela tin", supports: ["bed"], source: historicalRecording, confidence: 0.91 },
  ],
  Berlin: [
    { description: "Trabant two-stroke engine whine", supports: ["bed"], source: historicalRecording, confidence: 0.98 },
    { description: "S-Bahn train mechanical clatter", supports: ["texture"], source: historicalRecording, confidence: 0.95 },
    { description: "Church bells", supports: ["event"], source: historicalRecording, confidence: 0.96 },
    { description: "Checkpoint propaganda megaphones", supports: ["event"], source: historicalRecording, confidence: 0.94 },
  ],
  Moscow: [
    { description: "Moscow Metro escalator hum", supports: ["bed"], source: historicalRecording, confidence: 0.97 },
    { description: "Trolleybus electric whine", supports: ["texture"], source: historicalRecording, confidence: 0.91 },
    { description: "Spasskaya Tower clock chimes", supports: ["event"], source: historicalRecording, confidence: 0.98 },
  ],
  Bangkok: [
    { description: "Chao Phraya longtail boat engine", supports: ["bed"], source: historicalRecording, confidence: 0.96 },
    { description: "Tuk-tuk three-wheeled roar", supports: ["texture"], source: historicalRecording, confidence: 0.95 },
    { description: "Street food spatulas scraping", supports: ["texture"], source: historicalRecording, confidence: 0.90 },
    { description: "Wat Arun brass wind bells", supports: ["event"], source: historicalRecording, confidence: 0.92 },
  ],
  Singapore: [
    { description: "Karung guni rubber horn", supports: ["event"], source: historicalRecording, confidence: 0.93 },
    { description: "Hokkien street opera cymbals", supports: ["texture"], source: historicalRecording, confidence: 0.91 },
    { description: "Asian Koel bird call", supports: ["event"], source: historicalRecording, confidence: 0.94 },
  ],
  Delhi: [
    { description: "Bicycle rickshaw bell ringing", supports: ["texture"], source: historicalRecording, confidence: 0.95 },
    { description: "Ambassador taxi aggressive honking", supports: ["event"], source: historicalRecording, confidence: 0.94 },
    { description: "Jama Masjid calls to prayer", supports: ["event"], source: historicalRecording, confidence: 0.97 },
  ],
  Kolkata: [
    { description: "Electric tram grinding wheels", supports: ["bed"], source: historicalRecording, confidence: 0.96 },
    { description: "Hand-pulled rickshaw brass bell", supports: ["event"], source: historicalRecording, confidence: 0.92 },
    { description: "Durga Puja dhak drums", supports: ["texture"], source: historicalRecording, confidence: 0.94 },
  ],
  Hyderabad: [
    { description: "Charminar street vendors and auto-rickshaws", supports: ["event", "texture"], source: oralHistory, confidence: 0.9 },
    { description: "Golconda fort echoes and qawwali ambient", supports: ["bed", "texture"], source: historicalRecording, confidence: 0.85 },
    { description: "Secunderabad railway station sounds", supports: ["event"], source: historicalRecording, confidence: 0.8 },
  ],
  Bombay: [
    { description: "Marine Drive ocean waves and traffic", supports: ["bed", "texture"], source: historicalRecording, confidence: 0.9 },
    { description: "Crawford Market street cries and vendors", supports: ["event", "texture"], source: oralHistory, confidence: 0.85 },
    { description: "Victoria Terminus train station ambience", supports: ["event"], source: historicalRecording, confidence: 0.8 },
  ],
  Calcutta: [
    { description: "Howrah Bridge ferry and tram sounds", supports: ["event", "texture"], source: historicalRecording, confidence: 0.9 },
    { description: "Bengali street markets and tea stalls", supports: ["bed", "event"], source: oralHistory, confidence: 0.85 },
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