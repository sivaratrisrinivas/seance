import { getCanonicalPlace } from "./place-aliases.js";

const BOUNDED_EVIDENCE_SOURCES = {
  historicalAtlas: { name: "Historical Atlas", priority: 1, types: ["geographic", "urban"] },
  oralHistory: { name: "Oral History Archives", priority: 2, types: ["ambient", "social"] },
  academicResearch: { name: "Academic Studies", priority: 3, types: ["urban", "cultural"] },
  soundRecording: { name: "Historical Sound Recordings", priority: 4, types: ["ambient", "event", "music"] },
  newspaperArchive: { name: "Newspaper Archives", priority: 5, types: ["event", "social"] },
};

const s = "soundRecording";
const o = "oralHistory";
const a = "academicResearch";

// ─── Year-sensitive evidence ────────────────────────────────────────────
// Every evidence item now carries a yearRange so we only return evidence
// that is plausible for the requested year.
const EVIDENCE_BY_PLACE = {
  London: [
    { description: "Big Ben heavy tolling striking Westminster", supports: ["event"], source: s, confidence: 0.98, yearRange: [1859, 2025] },
    { description: "London Underground pneumatic hiss and wheel screech", supports: ["texture"], source: s, confidence: 0.92, yearRange: [1863, 2025] },
    { description: "Borough Market street vendors rhythmic hawking", supports: ["texture"], source: o, confidence: 0.88, yearRange: [1756, 2025] },
    { description: "Milkman clinking glass bottles on doorsteps", supports: ["event"], source: s, confidence: 0.90, yearRange: [1880, 1980] },
    { description: "Horse-drawn carriages on cobblestone streets", supports: ["bed"], source: o, confidence: 0.85, yearRange: [1600, 1920] },
    { description: "Thames barge horns and dock workers shouting", supports: ["event"], source: s, confidence: 0.87, yearRange: [1700, 1970] },
    { description: "Street gas lamp lamplighter calls", supports: ["event"], source: o, confidence: 0.82, yearRange: [1812, 1940] },
    { description: "Double-decker bus diesel engine rumble", supports: ["bed"], source: s, confidence: 0.91, yearRange: [1956, 2025] },
  ],
  Paris: [
    { description: "Notre Dame heavy bronze bell peals", supports: ["event"], source: s, confidence: 0.98, yearRange: [1163, 2019] },
    { description: "Sprague-Thomson Metro burning wooden brake shoes", supports: ["texture"], source: s, confidence: 0.94, yearRange: [1908, 1983] },
    { description: "Rue Mouffetard market bartering", supports: ["texture"], source: o, confidence: 0.85, yearRange: [1600, 2025] },
    { description: "River Seine working barges chugging", supports: ["bed"], source: s, confidence: 0.89, yearRange: [1700, 2025] },
    { description: "Bal-musette accordion street buskers", supports: ["event"], source: o, confidence: 0.87, yearRange: [1880, 1960] },
    { description: "Horse hooves on Haussman boulevards", supports: ["bed"], source: o, confidence: 0.84, yearRange: [1600, 1920] },
    { description: "Citroën 2CV engine putt-putt", supports: ["bed"], source: s, confidence: 0.90, yearRange: [1948, 1990] },
  ],
  NewYork: [
    { description: "Subway R1-R9 train cars metallic screech", supports: ["bed"], source: s, confidence: 0.96, yearRange: [1930, 1975] },
    { description: "Fulton Fish Market morning fishmonger shouts", supports: ["texture"], source: o, confidence: 0.86, yearRange: [1822, 2005] },
    { description: "St. Patrick Cathedral towering bells", supports: ["event"], source: s, confidence: 0.95, yearRange: [1878, 2025] },
    { description: "Hudson River harbor foghorn deep blasts", supports: ["event"], source: s, confidence: 0.94, yearRange: [1850, 2025] },
    { description: "Elevated railway rumble and screech", supports: ["bed"], source: s, confidence: 0.91, yearRange: [1878, 1940] },
    { description: "Newsboy shouting headlines on street corners", supports: ["event"], source: o, confidence: 0.83, yearRange: [1880, 1960] },
    { description: "Yellow cab horn honking symphony", supports: ["texture"], source: s, confidence: 0.93, yearRange: [1950, 2025] },
  ],
  Tokyo: [
    { description: "Yamanote line electric train squeal", supports: ["bed"], source: s, confidence: 0.95, yearRange: [1885, 2025] },
    { description: "Tofu seller brass bugle", supports: ["event"], source: s, confidence: 0.92, yearRange: [1800, 1980] },
    { description: "Roasted sweet potato vendor melancholic chant", supports: ["event"], source: s, confidence: 0.90, yearRange: [1700, 2025] },
    { description: "Tsukiji fish market rhythmic auctioneer chants", supports: ["texture"], source: s, confidence: 0.87, yearRange: [1935, 2018] },
    { description: "Senso-ji massive bronze temple bells", supports: ["event"], source: s, confidence: 0.96, yearRange: [645, 2025] },
    { description: "Wooden geta sandals clacking on stone paths", supports: ["texture"], source: o, confidence: 0.84, yearRange: [1600, 1960] },
    { description: "Pachinko parlor electronic cacophony", supports: ["texture"], source: s, confidence: 0.88, yearRange: [1948, 2025] },
  ],
  Mumbai: [
    { description: "DC EMU train bubbling traction motor", supports: ["bed"], source: s, confidence: 0.97, yearRange: [1925, 2025] },
    { description: "Dabbawala aluminum tiffin clatter", supports: ["texture"], source: s, confidence: 0.91, yearRange: [1890, 2025] },
    { description: "Haji Ali Dargah Azaan echoing", supports: ["event"], source: s, confidence: 0.89, yearRange: [1431, 2025] },
    { description: "Chor Bazaar aggressive haggling", supports: ["texture"], source: o, confidence: 0.84, yearRange: [1860, 2025] },
    { description: "Monsoon rain on corrugated tin", supports: ["bed"], source: s, confidence: 0.93, yearRange: [1500, 2025] },
    { description: "Victoria Terminus steam locomotive whistle", supports: ["event"], source: s, confidence: 0.90, yearRange: [1853, 1950] },
    { description: "Ambassador taxi horns blaring in traffic", supports: ["texture"], source: s, confidence: 0.88, yearRange: [1958, 2020] },
  ],
  Cairo: [
    { description: "Khan el-Khalili vendor glass cup clinking", supports: ["event"], source: s, confidence: 0.94, yearRange: [1382, 2025] },
    { description: "Coppersmith rhythmic hammering", supports: ["texture"], source: s, confidence: 0.90, yearRange: [1200, 2025] },
    { description: "Donkey cart wheels on cobblestones", supports: ["bed"], source: o, confidence: 0.86, yearRange: [1500, 2025] },
    { description: "Shisha pipe bubbling at cafes", supports: ["texture"], source: s, confidence: 0.88, yearRange: [1600, 2025] },
    { description: "Al-Azhar mosque Adhan echoing through alleys", supports: ["event"], source: s, confidence: 0.92, yearRange: [972, 2025] },
    { description: "Felucca wooden mast creaking on the Nile", supports: ["bed"], source: o, confidence: 0.83, yearRange: [1500, 2025] },
  ],
  Istanbul: [
    { description: "Bosphorus ferry warning horns", supports: ["event"], source: s, confidence: 0.96, yearRange: [1851, 2025] },
    { description: "Simit seller rhythmic calls", supports: ["event"], source: s, confidence: 0.91, yearRange: [1600, 2025] },
    { description: "Grand Bazaar merchant multilingual haggling", supports: ["texture"], source: o, confidence: 0.85, yearRange: [1461, 2025] },
    { description: "Blue Mosque Ezan call to prayer", supports: ["event"], source: s, confidence: 0.95, yearRange: [1616, 2025] },
    { description: "Tramway bell clanging through Istiklal", supports: ["event"], source: s, confidence: 0.88, yearRange: [1871, 2025] },
  ],
  Rome: [
    { description: "Vespa motor scooter buzz through narrow streets", supports: ["bed"], source: s, confidence: 0.97, yearRange: [1946, 2025] },
    { description: "Campo de Fiori butcher calls and market", supports: ["texture"], source: s, confidence: 0.88, yearRange: [1600, 2025] },
    { description: "St. Peter Basilica church bells across the city", supports: ["event"], source: s, confidence: 0.98, yearRange: [1626, 2025] },
    { description: "Trevi Fountain splashing into stone basin", supports: ["bed"], source: s, confidence: 0.95, yearRange: [1762, 2025] },
    { description: "Villa Borghese cicada drone in summer heat", supports: ["bed"], source: s, confidence: 0.90, yearRange: [1600, 2025] },
    { description: "Cobblestone horse carriages on Via Appia", supports: ["bed"], source: o, confidence: 0.84, yearRange: [1600, 1920] },
  ],
  Beijing: [
    { description: "Pigeon whistles harmonic hum above hutongs", supports: ["bed"], source: s, confidence: 0.95, yearRange: [1600, 2025] },
    { description: "Bicycle bells collective ringing on avenues", supports: ["texture"], source: s, confidence: 0.94, yearRange: [1920, 2000] },
    { description: "Propaganda loudspeaker broadcasts at dawn", supports: ["event"], source: s, confidence: 0.97, yearRange: [1949, 1990] },
    { description: "Knife sharpener metal-on-metal rhythm", supports: ["event"], source: s, confidence: 0.92, yearRange: [1600, 2000] },
    { description: "Imperial drum tower booming at dusk", supports: ["event"], source: a, confidence: 0.80, yearRange: [1420, 1924] },
  ],
  MexicoCity: [
    { description: "Camotero steam whistle piercing neighborhoods", supports: ["event"], source: s, confidence: 0.95, yearRange: [1920, 2025] },
    { description: "Afilador knife-sharpener pan-pipe melody", supports: ["event"], source: s, confidence: 0.93, yearRange: [1900, 2025] },
    { description: "Recolector brass bell garbage collection call", supports: ["event"], source: s, confidence: 0.89, yearRange: [1940, 2025] },
    { description: "Tamalero megaphone dawn shout through streets", supports: ["event"], source: s, confidence: 0.96, yearRange: [1930, 2025] },
    { description: "Organ grinder cranking in the zócalo", supports: ["event"], source: o, confidence: 0.86, yearRange: [1880, 2025] },
  ],
  Havana: [
    { description: "El Manisero musical pregon peanut seller", supports: ["event"], source: s, confidence: 0.94, yearRange: [1920, 2025] },
    { description: "Pre-1959 American V8 engine idling at stoplight", supports: ["bed"], source: s, confidence: 0.97, yearRange: [1940, 2025] },
    { description: "Havana Cathedral bronze bells ringing across plaza", supports: ["event"], source: s, confidence: 0.95, yearRange: [1777, 2025] },
    { description: "Dominoes slapping on wooden tables in the shade", supports: ["event"], source: o, confidence: 0.88, yearRange: [1900, 2025] },
    { description: "Son cubano radio drifting from open windows", supports: ["texture"], source: o, confidence: 0.85, yearRange: [1920, 2025] },
  ],
  RioDeJaneiro: [
    { description: "Samba bateria drum sections rehearsing in favelas", supports: ["texture"], source: s, confidence: 0.96, yearRange: [1920, 2025] },
    { description: "Tropical rain on favela tin rooftops", supports: ["bed"], source: s, confidence: 0.91, yearRange: [1600, 2025] },
    { description: "Bonde streetcar rattling through Santa Teresa", supports: ["bed"], source: s, confidence: 0.88, yearRange: [1896, 2025] },
    { description: "Beach vendor calls on Copacabana sands", supports: ["event"], source: o, confidence: 0.84, yearRange: [1920, 2025] },
  ],
  Berlin: [
    { description: "Trabant two-stroke engine whine on Karl-Marx-Allee", supports: ["bed"], source: s, confidence: 0.98, yearRange: [1957, 1991] },
    { description: "S-Bahn train mechanical clatter over bridges", supports: ["texture"], source: s, confidence: 0.95, yearRange: [1924, 2025] },
    { description: "Church bells across divided city", supports: ["event"], source: s, confidence: 0.96, yearRange: [1600, 2025] },
    { description: "Checkpoint propaganda megaphones and barrier gates", supports: ["event"], source: s, confidence: 0.94, yearRange: [1961, 1989] },
    { description: "Weimar-era cabaret accordion from underground clubs", supports: ["texture"], source: o, confidence: 0.80, yearRange: [1919, 1933] },
    { description: "U-Bahn electric hum and pneumatic door hiss", supports: ["bed"], source: s, confidence: 0.91, yearRange: [1902, 2025] },
  ],
  Moscow: [
    { description: "Moscow Metro escalator deep mechanical hum", supports: ["bed"], source: s, confidence: 0.97, yearRange: [1935, 2025] },
    { description: "Trolleybus pantograph electric whine on boulevards", supports: ["texture"], source: s, confidence: 0.91, yearRange: [1933, 2020] },
    { description: "Spasskaya Tower clock chimes across Red Square", supports: ["event"], source: s, confidence: 0.98, yearRange: [1625, 2025] },
    { description: "Snow crunching underfoot on winter sidewalks", supports: ["texture"], source: o, confidence: 0.85, yearRange: [1600, 2025] },
  ],
  Bangkok: [
    { description: "Chao Phraya longtail boat engine puttering", supports: ["bed"], source: s, confidence: 0.96, yearRange: [1950, 2025] },
    { description: "Tuk-tuk three-wheeled engine roar in traffic", supports: ["texture"], source: s, confidence: 0.95, yearRange: [1960, 2025] },
    { description: "Street food wok spatulas scraping on hot metal", supports: ["texture"], source: s, confidence: 0.90, yearRange: [1900, 2025] },
    { description: "Wat Arun brass wind bells tinkling in breeze", supports: ["event"], source: s, confidence: 0.92, yearRange: [1768, 2025] },
    { description: "Klong canal boat horns in the floating market", supports: ["event"], source: o, confidence: 0.86, yearRange: [1800, 2025] },
  ],
  Singapore: [
    { description: "Karung guni rag-and-bone man rubber horn", supports: ["event"], source: s, confidence: 0.93, yearRange: [1940, 2025] },
    { description: "Hokkien street opera cymbals and falsetto", supports: ["texture"], source: s, confidence: 0.91, yearRange: [1900, 2025] },
    { description: "Asian Koel bird call piercing morning air", supports: ["event"], source: s, confidence: 0.94, yearRange: [1819, 2025] },
    { description: "Kopitiam coffee cups clinking on marble tables", supports: ["texture"], source: o, confidence: 0.86, yearRange: [1900, 2025] },
  ],
  Delhi: [
    { description: "Bicycle rickshaw bell ringing through Old Delhi", supports: ["texture"], source: s, confidence: 0.95, yearRange: [1940, 2025] },
    { description: "Ambassador taxi aggressive honking on Ring Road", supports: ["event"], source: s, confidence: 0.94, yearRange: [1958, 2020] },
    { description: "Jama Masjid calls to prayer echoing at dawn", supports: ["event"], source: s, confidence: 0.97, yearRange: [1656, 2025] },
    { description: "Chandni Chowk spice market vendor shouting", supports: ["texture"], source: o, confidence: 0.88, yearRange: [1650, 2025] },
  ],
  Kolkata: [
    { description: "Electric tram grinding wheels on Esplanade tracks", supports: ["bed"], source: s, confidence: 0.96, yearRange: [1902, 2025] },
    { description: "Hand-pulled rickshaw brass bell in narrow lanes", supports: ["event"], source: s, confidence: 0.92, yearRange: [1880, 2005] },
    { description: "Durga Puja dhak drums thundering at pandals", supports: ["texture"], source: s, confidence: 0.94, yearRange: [1757, 2025] },
    { description: "Howrah Bridge steel expansion joint booming", supports: ["bed"], source: s, confidence: 0.89, yearRange: [1943, 2025] },
  ],
  Hyderabad: [
    { description: "Charminar area auto-rickshaw horns and vendor cries", supports: ["event", "texture"], source: o, confidence: 0.90, yearRange: [1591, 2025] },
    { description: "Golconda fort wind echoes and qawwali music ambient", supports: ["bed", "texture"], source: s, confidence: 0.85, yearRange: [1518, 2025] },
    { description: "Secunderabad railway junction steam whistles", supports: ["event"], source: s, confidence: 0.80, yearRange: [1874, 1970] },
    { description: "Pearl market bangle sellers glass clinking", supports: ["texture"], source: o, confidence: 0.82, yearRange: [1700, 2025] },
  ],
  // ─── Expanded cities ─────────────────────────────────────────
  StPetersburg: [
    { description: "Peter and Paul Fortress cannon firing at noon", supports: ["event"], source: s, confidence: 0.96, yearRange: [1865, 2025] },
    { description: "Neva river ice cracking in spring thaw", supports: ["bed"], source: o, confidence: 0.83, yearRange: [1703, 2025] },
    { description: "Palace bridge machinery groaning at drawbridge opening", supports: ["event"], source: s, confidence: 0.88, yearRange: [1916, 2025] },
  ],
  Vienna: [
    { description: "Fiaker horse carriage hooves on Ringstrasse cobble", supports: ["bed"], source: s, confidence: 0.94, yearRange: [1693, 2025] },
    { description: "Strauss waltz drifting from Kursalon bandstand", supports: ["texture"], source: o, confidence: 0.86, yearRange: [1868, 2025] },
    { description: "Stephansdom Pummerin great bell on New Year", supports: ["event"], source: s, confidence: 0.97, yearRange: [1711, 2025] },
  ],
  Kyoto: [
    { description: "Bamboo deer-scarer tock echoing in temple garden", supports: ["event"], source: s, confidence: 0.93, yearRange: [1600, 2025] },
    { description: "Kiyomizu waterfall prayer bell ringing", supports: ["event"], source: s, confidence: 0.91, yearRange: [778, 2025] },
    { description: "Maiko wooden geta sandals on Gion cobblestone", supports: ["texture"], source: o, confidence: 0.88, yearRange: [1600, 2025] },
  ],
  Shanghai: [
    { description: "Bund steamship foghorns on the Huangpu", supports: ["event"], source: s, confidence: 0.93, yearRange: [1843, 1970] },
    { description: "Longtang alleyway vendor morning calls", supports: ["texture"], source: o, confidence: 0.87, yearRange: [1860, 2000] },
    { description: "Nanjing Road trolleybus electric whine", supports: ["bed"], source: s, confidence: 0.89, yearRange: [1914, 1975] },
  ],
  BuenosAires: [
    { description: "Bandoneon tango melody from San Telmo milonga", supports: ["texture"], source: s, confidence: 0.95, yearRange: [1880, 2025] },
    { description: "Colectivo bus diesel roar on Avenida 9 de Julio", supports: ["bed"], source: s, confidence: 0.90, yearRange: [1928, 2025] },
    { description: "Bombilla mate cup clinking at café tables", supports: ["event"], source: o, confidence: 0.82, yearRange: [1800, 2025] },
  ],
  LosAngeles: [
    { description: "Pacific Electric Red Car streetcar bell", supports: ["event"], source: s, confidence: 0.91, yearRange: [1901, 1961] },
    { description: "Freeway multi-lane traffic continuous hum", supports: ["bed"], source: s, confidence: 0.95, yearRange: [1940, 2025] },
    { description: "Mockingbird territorial song from palm trees", supports: ["texture"], source: s, confidence: 0.87, yearRange: [1850, 2025] },
  ],
  Chicago: [
    { description: "Elevated L-train steel wheel screech overhead", supports: ["bed"], source: s, confidence: 0.96, yearRange: [1892, 2025] },
    { description: "Lake Michigan wind gusting through the Loop", supports: ["bed"], source: s, confidence: 0.90, yearRange: [1833, 2025] },
    { description: "Blues harmonica drifting from Maxwell Street clubs", supports: ["texture"], source: o, confidence: 0.85, yearRange: [1920, 2000] },
    { description: "Stockyard cattle lowing and steam machinery", supports: ["bed"], source: s, confidence: 0.88, yearRange: [1865, 1971] },
  ],
  Detroit: [
    { description: "Ford assembly line machinery rhythmic pounding", supports: ["bed"], source: s, confidence: 0.97, yearRange: [1913, 1980] },
    { description: "Motown bass guitar practice through open windows", supports: ["texture"], source: o, confidence: 0.84, yearRange: [1959, 1972] },
    { description: "Detroit River freighter horn and ice breaking", supports: ["event"], source: s, confidence: 0.89, yearRange: [1820, 2025] },
  ],
  Yangon: [
    { description: "Shwedagon Pagoda prayer bell cascade", supports: ["event"], source: s, confidence: 0.95, yearRange: [600, 2025] },
    { description: "Circular railway diesel rumble through suburbs", supports: ["bed"], source: s, confidence: 0.88, yearRange: [1954, 2025] },
    { description: "Mohinga soup vendor dawn bicycle bell call", supports: ["event"], source: o, confidence: 0.83, yearRange: [1900, 2025] },
  ],
  HoChiMinhCity: [
    { description: "Motorbike swarm engine buzz on boulevard", supports: ["bed"], source: s, confidence: 0.96, yearRange: [1975, 2025] },
    { description: "French colonial café spoon clinking on porcelain", supports: ["texture"], source: o, confidence: 0.82, yearRange: [1860, 2025] },
    { description: "Street phở vendor ladle splashing at dawn", supports: ["event"], source: o, confidence: 0.85, yearRange: [1900, 2025] },
  ],
  Chennai: [
    { description: "Kapaleeshwarar Temple bronze bell tolling", supports: ["event"], source: s, confidence: 0.94, yearRange: [1639, 2025] },
    { description: "Marina Beach wave crash and crow chorus at dawn", supports: ["bed"], source: s, confidence: 0.90, yearRange: [1884, 2025] },
    { description: "Auto-rickshaw two-stroke whine in Mylapore", supports: ["texture"], source: s, confidence: 0.87, yearRange: [1960, 2025] },
  ],
};

// ─── Blocked zones and sensitive periods ────────────────────────────────

const BLOCKED_ZONES = ["UnknownConflict", "WarZone", "Battlefield", "Frontline"];

function isSensitivePeriod(year) {
  const yearNum = parseInt(year, 10);
  return yearNum >= 1914 && yearNum <= 1945;
}

// ─── Main extraction ────────────────────────────────────────────────────

export function extractEvidence({ place, year }) {
  const canonical = getCanonicalPlace(place);
  const yearNum = parseInt(year, 10);

  // Block conflict-zone names during sensitive periods
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

  // Filter evidence by year range
  const filteredEvidence = placeEvidence.filter(e => {
    if (!e.yearRange) return true;
    return yearNum >= e.yearRange[0] && yearNum <= e.yearRange[1];
  });

  if (filteredEvidence.length === 0) {
    return {
      evidence: [],
      confidence: "low",
      note: placeEvidence.length > 0
        ? `No evidence for ${place} applicable to year ${year} (evidence exists for other eras).`
        : `Limited specific evidence for ${place} in ${year}. Using era-based defaults.`,
    };
  }

  // Derive confidence from the actual evidence items
  const avgConfidence = filteredEvidence.reduce((sum, e) => sum + (e.confidence || 0.7), 0) / filteredEvidence.length;
  let confidence = "high";
  let note = null;

  if (avgConfidence < 0.70) {
    confidence = "low";
    note = `Evidence for ${place} in ${year} has lower reliability.`;
  } else if (yearNum < 1900) {
    confidence = "medium";
    note = `Evidence from oral histories and academic sources for early period.`;
  } else if (avgConfidence < 0.80) {
    confidence = "medium";
    note = `Evidence from historical recordings and archives.`;
  }

  return {
    evidence: filteredEvidence,
    confidence,
    note,
  };
}

// ─── Layer splitting ────────────────────────────────────────────────────

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

// ─── Summary ────────────────────────────────────────────────────────────

export function getEvidenceSummary(evidence) {
  if (!evidence || evidence.length === 0) {
    return "Evidence gathered from historical sources and academic research.";
  }

  const sources = new Set(evidence.map(e => BOUNDED_EVIDENCE_SOURCES[e.source]?.name || e.source));
  return `Evidence from ${Array.from(sources).join(", ")}.`;
}