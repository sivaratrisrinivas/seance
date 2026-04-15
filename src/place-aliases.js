/**
 * place-aliases.js — Single source of truth for place name canonicalization.
 *
 * Used by evidence-extractor.js AND place-reinterpretation.js to ensure
 * consistent alias resolution throughout the entire pipeline.
 */

// Maps variant/historical spellings → canonical key used in EVIDENCE_BY_PLACE
const PLACE_ALIASES = {
  // South Asia
  "Bombay": "Mumbai",
  "Mumbai": "Mumbai",
  "Calcutta": "Kolkata",
  "Kolkata": "Kolkata",
  "Madras": "Chennai",
  "Chennai": "Chennai",
  "Trivandrum": "Thiruvananthapuram",
  "Thiruvananthapuram": "Thiruvananthapuram",
  "Delhi": "Delhi",
  "NewDelhi": "Delhi",
  "Hyderabad": "Hyderabad",
  "Bangalore": "Bangalore",
  "Bengaluru": "Bangalore",

  // East Asia
  "Peking": "Beijing",
  "Beijing": "Beijing",
  "Shanghai": "Shanghai",
  "HongKong": "HongKong",
  "Hong Kong": "HongKong",
  "Tokyo": "Tokyo",
  "Kyoto": "Kyoto",
  "Seoul": "Seoul",
  "Taipei": "Taipei",

  // Southeast Asia
  "Saigon": "HoChiMinhCity",
  "HoChiMinhCity": "HoChiMinhCity",
  "Ho Chi Minh City": "HoChiMinhCity",
  "Rangoon": "Yangon",
  "Yangon": "Yangon",
  "Bangkok": "Bangkok",
  "Singapore": "Singapore",
  "Manila": "Manila",
  "Jakarta": "Jakarta",
  "KualaLumpur": "KualaLumpur",
  "Kuala Lumpur": "KualaLumpur",

  // Middle East
  "Constantinople": "Istanbul",
  "Istanbul": "Istanbul",
  "Cairo": "Cairo",
  "Jerusalem": "Jerusalem",
  "Beirut": "Beirut",

  // Europe
  "St. Petersburg": "StPetersburg",
  "Saint Petersburg": "StPetersburg",
  "Petersburg": "StPetersburg",
  "Leningrad": "StPetersburg",
  "London": "London",
  "Paris": "Paris",
  "Berlin": "Berlin",
  "Rome": "Rome",
  "Vienna": "Vienna",
  "Moscow": "Moscow",

  // Americas
  "NewYork": "NewYork",
  "New York": "NewYork",
  "LosAngeles": "LosAngeles",
  "Los Angeles": "LosAngeles",
  "Chicago": "Chicago",
  "Detroit": "Detroit",
  "Havana": "Havana",
  "RioDeJaneiro": "RioDeJaneiro",
  "Rio de Janeiro": "RioDeJaneiro",
  "BuenosAires": "BuenosAires",
  "Buenos Aires": "BuenosAires",
  "MexicoCity": "MexicoCity",
  "Mexico City": "MexicoCity",
};

/**
 * Resolve a place name to its canonical form.
 * Tries exact match first, then stripped match (no spaces/commas).
 */
export function getCanonicalPlace(place) {
  const trimmed = place.trim();

  // Exact match
  if (PLACE_ALIASES[trimmed]) {
    return PLACE_ALIASES[trimmed];
  }

  // Try without commas / extra qualifiers — "London, UK" → "London"
  const basePlace = trimmed.split(",")[0].trim();
  if (PLACE_ALIASES[basePlace]) {
    return PLACE_ALIASES[basePlace];
  }

  // Try collapsed (no spaces)
  const collapsed = basePlace.replace(/\s+/g, "");
  if (PLACE_ALIASES[collapsed]) {
    return PLACE_ALIASES[collapsed];
  }

  // Unknown place — return cleaned base name
  return basePlace;
}

/**
 * Normalize a user-typed place name for display and storage.
 * Trims, collapses whitespace, and title-cases.
 */
export function normalizePlaceName(place) {
  return place
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

export { PLACE_ALIASES };
