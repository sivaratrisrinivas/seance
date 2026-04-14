const HISTORICAL_PLACES = {
  "Rangoon": { modern: "Yangon", country: "Myanmar", since: 1989 },
  "Peking": { modern: "Beijing", country: "China", since: 1949 },
  "Bombay": { modern: "Mumbai", country: "India", since: 1995 },
  "Calcutta": { modern: "Kolkata", country: "India", since: 2001 },
  "Madras": { modern: "Chennai", country: "India", since: 1996 },
  "Trivandrum": { modern: "Thiruvananthapuram", country: "India", since: 1991 },
  "Lyttelton": { modern: "East London", country: "South Africa", since: 1910 },
  "St. Petersburg": { modern: "Saint Petersburg", country: "Russia", since: 1914 },
  "Constantinople": { modern: "Istanbul", country: "Turkey", since: 1923 },
  "Dacca": { modern: "Dhaka", country: "Bangladesh", since: 1982 },
  "Siam": { modern: "Thailand", country: "Thailand", since: 1939 },
  "Formosa": { modern: "Taiwan", country: "Taiwan", since: 1945 },
  "Ceylon": { modern: "Sri Lanka", country: "Sri Lanka", since: 1972 },
  "Gold Coast": { modern: "Ghana", country: "Ghana", since: 1957 },
  "Belgian Congo": { modern: "Democratic Republic of the Congo", country: "DRC", since: 1960 },
  "Rhodesia": { modern: "Zimbabwe", country: "Zimbabwe", since: 1980 },
};

export function getHistoricalVariant(place) {
  return HISTORICAL_PLACES[place] ?? null;
}

export function needsReinterpretation(place, year) {
  const variant = getHistoricalVariant(place);
  if (!variant) return false;

  const yearNum = parseInt(year, 10);
  return yearNum < variant.since;
}

export function resolvePlaceForYear(place, year) {
  const variant = getHistoricalVariant(place);
  if (!variant) return { original: place, modern: place, reinterpreted: false };

  const yearNum = parseInt(year, 10);
  if (yearNum < variant.since) {
    return {
      original: place,
      modern: variant.modern,
      reinterpreted: true,
      note: `Modern name: ${variant.modern}`,
    };
  }

  return { original: place, modern: place, reinterpreted: false };
}