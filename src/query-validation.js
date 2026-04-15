/**
 * query-validation.js — Input validation for ritual queries.
 *
 * Validates and normalizes place + year input with:
 * - Minimum year floor (year >= 100)
 * - Place name sanitization (whitespace, length, numeric-only rejection)
 * - Basic fuzzy matching for common misspellings
 * - Case normalization
 */

const COMMON_MISSPELLINGS = {
  "bejing": "Beijing",
  "peijing": "Beijing",
  "tokio": "Tokyo",
  "tokoyo": "Tokyo",
  "mosco": "Moscow",
  "moscwo": "Moscow",
  "parris": "Paris",
  "londen": "London",
  "londan": "London",
  "nyc": "New York",
  "newyork": "New York",
  "new york city": "New York",
  "bombai": "Mumbai",
  "mumbai": "Mumbai",
  "deli": "Delhi",
  "dehli": "Delhi",
  "new dehli": "Delhi",
  "calcuta": "Kolkata",
  "kolkatta": "Kolkata",
  "bangalor": "Bangalore",
  "banglore": "Bangalore",
  "hydrabad": "Hyderabad",
  "hyderbad": "Hyderabad",
  "instanbul": "Istanbul",
  "istambul": "Istanbul",
  "cairro": "Cairo",
  "buenosaires": "Buenos Aires",
  "buenos aries": "Buenos Aires",
  "rio de janiero": "Rio de Janeiro",
  "mexicocity": "Mexico City",
  "mexico": "Mexico City",
  "la": "Los Angeles",
  "losangeles": "Los Angeles",
  "sanfrancisco": "San Francisco",
  "sf": "San Francisco",
  "chicgo": "Chicago",
  "chicaco": "Chicago",
  "detrot": "Detroit",
  "detriot": "Detroit",
  "singapur": "Singapore",
  "singapor": "Singapore",
  "bangkoc": "Bangkok",
  "bangcock": "Bangkok",
  "saigon": "Ho Chi Minh City",
  "berln": "Berlin",
  "berin": "Berlin",
  "viena": "Vienna",
  "venna": "Vienna",
  "mosow": "Moscow",
};

const MIN_YEAR = 100;
const MIN_PLACE_LENGTH = 2;

export function validateRitualQuery({ place = "", year = "" } = {}) {
  // ── Place validation ────────────────────────────────────────
  const trimmedPlace = place.trim().replace(/\s+/g, " ");

  if (!trimmedPlace) {
    return {
      ok: false,
      place,
      year,
      message: "A place name is required — try London, Tokyo, or Mumbai.",
    };
  }

  if (trimmedPlace.length < MIN_PLACE_LENGTH) {
    return {
      ok: false,
      place: trimmedPlace,
      year,
      message: "Place name is too short — provide a city or region name.",
    };
  }

  // Reject purely numeric place names
  if (/^\d+$/.test(trimmedPlace)) {
    return {
      ok: false,
      place: trimmedPlace,
      year,
      message: "Place name cannot be a number — provide a city or region name.",
    };
  }

  // ── Year validation ─────────────────────────────────────────
  if (!/^\d+$/.test(year)) {
    return {
      ok: false,
      place: trimmedPlace,
      year,
      message: "Year must use whole digits like 1987.",
    };
  }

  const numericYear = Number.parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (numericYear > currentYear) {
    return {
      ok: false,
      place: trimmedPlace,
      year,
      message: `Year ${numericYear} must be this year or earlier.`,
    };
  }

  if (numericYear < MIN_YEAR) {
    return {
      ok: false,
      place: trimmedPlace,
      year,
      message: `Year ${numericYear} is too early — we need at least year ${MIN_YEAR} for meaningful soundscape reconstruction.`,
    };
  }

  // ── Fuzzy place name correction ─────────────────────────────
  const normalizedPlace = applyFuzzyMatch(trimmedPlace);

  return {
    ok: true,
    place: normalizedPlace,
    year,
    corrected: normalizedPlace !== trimmedPlace ? trimmedPlace : undefined,
  };
}

function applyFuzzyMatch(place) {
  const lower = place.toLowerCase().trim();

  // Exact misspelling match
  if (COMMON_MISSPELLINGS[lower]) {
    return COMMON_MISSPELLINGS[lower];
  }

  // Try without spaces
  const collapsed = lower.replace(/\s+/g, "");
  if (COMMON_MISSPELLINGS[collapsed]) {
    return COMMON_MISSPELLINGS[collapsed];
  }

  // Title-case the original if no match found
  return place
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
