export function validateRitualQuery({ place = "", year = "" } = {}) {
  if (!place.trim()) {
    return {
      ok: false,
      place,
      year,
      message: "A place name is required — try London, Tokyo, or Mumbai.",
    };
  }

  if (!/^\d+$/.test(year)) {
    return {
      ok: false,
      place,
      year,
      message: "Year must use whole digits like 1987.",
    };
  }

  const numericYear = Number.parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (numericYear > currentYear) {
    return {
      ok: false,
      place,
      year,
      message: `Year ${numericYear} must be this year or earlier.`,
    };
  }

  return {
    ok: true,
    place,
    year,
  };
}
