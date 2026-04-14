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

const MODERN_PLACE_ESTABLISHMENT = {
  "Singapore": { established: 1819, region: "Southeast Asia" },
  "Dubai": { established: 1833, region: "Middle East" },
  "Abu Dhabi": { established: 1761, region: "Middle East" },
  "Doha": { established: 1825, region: "Middle East" },
  "Kuwait City": { established: 1705, region: "Middle East" },
  "Manila": { established: 1571, region: "Southeast Asia" },
  "Mumbai": { established: 1534, region: "South Asia" },
  "Kolkata": { established: 1690, region: "South Asia" },
  "Chennai": { established: 1639, region: "South Asia" },
  "Bangalore": { established: 1537, region: "South Asia" },
  "Karachi": { established: 1724, region: "South Asia" },
  "Lahore": { established: 1524, region: "South Asia" },
  "Hong Kong": { established: 1842, region: "East Asia" },
  "Macau": { established: 1557, region: "East Asia" },
  "Shanghai": { established: 1843, region: "East Asia" },
  "Tokyo": { established: 1603, region: "East Asia" },
  "Osaka": { established: 1583, region: "East Asia" },
  "Seoul": { established: 1394, region: "East Asia" },
  "Bangkok": { established: 1782, region: "Southeast Asia" },
  "Kuala Lumpur": { established: 1857, region: "Southeast Asia" },
  "Jakarta": { established: 1527, region: "Southeast Asia" },
  "Surabaya": { established: 1901, region: "Southeast Asia" },
  "Hanoi": { established: 1010, region: "Southeast Asia" },
  "Ho Chi Minh City": { established: 1698, region: "Southeast Asia" },
  "Yangon": { established: 1044, region: "Southeast Asia" },
  "Colombo": { established: 1517, region: "South Asia" },
  "Tehran": { established: 1788, region: "Middle East" },
  "Baghdad": { established: 762, region: "Middle East" },
  "Beirut": { established: 1500, region: "Middle East" },
  "Damascus": { established: 1100, region: "Middle East" },
  "Tel Aviv": { established: 1909, region: "Middle East" },
  "Haifa": { established: 1754, region: "Middle East" },
  "Jeddah": { established: 646, region: "Middle East" },
  "Mecca": { established: 570, region: "Middle East" },
  "Riyadh": { established: 1744, region: "Middle East" },
  "Muscat": { established: 1508, region: "Middle East" },
  "Sharjah": { established: 1500, region: "Middle East" },
  "Ajman": { established: 1500, region: "Middle East" },
  "Fujairah": { established: 1500, region: "Middle East" },
  "Ras Al Khaimah": { established: 1700, region: "Middle East" },
  "Umm Al Quwain": { established: 1775, region: "Middle East" },
  "Detroit": { established: 1701, region: "North America" },
  "Chicago": { established: 1790, region: "North America" },
  "Los Angeles": { established: 1781, region: "North America" },
  "San Francisco": { established: 1776, region: "North America" },
  "Seattle": { established: 1851, region: "North America" },
  "Miami": { established: 1566, region: "North America" },
  "Las Vegas": { established: 1905, region: "North America" },
  "Phoenix": { established: 1867, region: "North America" },
  "Houston": { established: 1836, region: "North America" },
  "Dallas": { established: 1841, region: "North America" },
  "Atlanta": { established: 1837, region: "North America" },
  "Denver": { established: 1858, region: "North America" },
  "Boston": { established: 1630, region: "North America" },
  "Philadelphia": { established: 1682, region: "North America" },
  "Toronto": { established: 1793, region: "North America" },
  "Vancouver": { established: 1886, region: "North America" },
  "Montreal": { established: 1642, region: "North America" },
  "Calgary": { established: 1875, region: "North America" },
  "Ottawa": { established: 1826, region: "North America" },
  "Mexico City": { established: 1521, region: "North America" },
  "Guadalajara": { established: 1542, region: "North America" },
  "Monterrey": { established: 1596, region: "North America" },
  "Brasilia": { established: 1960, region: "South America" },
  "Sao Paulo": { established: 1554, region: "South America" },
  "Rio de Janeiro": { established: 1565, region: "South America" },
  "Buenos Aires": { established: 1536, region: "South America" },
  "Santiago": { established: 1541, region: "South America" },
  "Lima": { established: 1535, region: "South America" },
  "Bogota": { established: 1538, region: "South America" },
  "Medellin": { established: 1616, region: "South America" },
  "Caracas": { established: 1567, region: "South America" },
  "Quito": { established: 1541, region: "South America" },
  "Cusco": { established: 1534, region: "South America" },
  "Asuncion": { established: 1537, region: "South America" },
  "Montevideo": { established: 1724, region: "South America" },
  "Havana": { established: 1515, region: "Caribbean" },
  "San Juan": { established: 1508, region: "Caribbean" },
  "Kingston": { established: 1692, region: "Caribbean" },
  "Nassau": { established: 1666, region: "Caribbean" },
  "Port of Spain": { established: 1757, region: "Caribbean" },
  "Roseau": { established: 1725, region: "Caribbean" },
  "St. Johns": { established: 1632, region: "Caribbean" },
  "Bridgetown": { established: 1628, region: "Caribbean" },
  "Castries": { established: 1650, region: "Caribbean" },
  "Fort-de-France": { established: 1664, region: "Caribbean" },
  "Oranjestad": { established: 1796, region: "Caribbean" },
  "Willemstad": { established: 1493, region: "Caribbean" },
  "San Jose": { established: 1563, region: "Central America" },
  "Panama City": { established: 1519, region: "Central America" },
  "San Salvador": { established: 1525, region: "Central America" },
  "Tegucigalpa": { established: 1578, region: "Central America" },
  "Managua": { established: 1544, region: "Central America" },
  "Guatemala City": { established: 1543, region: "Central America" },
  "Belize City": { established: 1638, region: "Central America" },
};

export function getHistoricalVariant(place) {
  return HISTORICAL_PLACES[place] ?? null;
}

export function needsReinterpretation(place, year) {
  const variant = getHistoricalVariant(place);
  if (variant) {
    const yearNum = parseInt(year, 10);
    return yearNum < variant.since;
  }

  const establishment = MODERN_PLACE_ESTABLISHMENT[place];
  if (establishment) {
    const yearNum = parseInt(year, 10);
    return yearNum < establishment.established;
  }

  return false;
}

export function resolvePlaceForYear(place, year) {
  const variant = getHistoricalVariant(place);
  if (variant) {
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

  const establishment = MODERN_PLACE_ESTABLISHMENT[place];
  if (establishment) {
    const yearNum = parseInt(year, 10);
    if (yearNum < establishment.established) {
      return {
        original: place,
        modern: place,
        reinterpreted: true,
        note: `Reconstructed geographic area near modern ${place}`,
      };
    }
  }

  return { original: place, modern: place, reinterpreted: false };
}