import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type LocationSuggestion = {
  countryCode: string;
  countryName: string;
  district: string;
  label: string;
  pincode: string;
  state: string;
  value: string;
};

type StoredLocation = {
  countryCode: string;
  countryName: string;
  district: string;
  pincode: string;
  state: string;
};

const locationsDir = join(process.cwd(), "src", "data", "geonames-postal-locations", "countries");
const countryCache = new Map<string, StoredLocation[]>();

function formatValue(location: StoredLocation) {
  return [location.district, location.state, location.countryName].filter(Boolean).join(", ");
}

function formatLabel(location: StoredLocation) {
  return [location.pincode, location.district, location.state, location.countryName].filter(Boolean).join(", ");
}

function safeCountryCode(countryCode: string) {
  return countryCode.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
}

async function getCountryLocations(countryCode: string) {
  const normalizedCountryCode = safeCountryCode(countryCode);

  if (!normalizedCountryCode) {
    return [];
  }

  const cached = countryCache.get(normalizedCountryCode);

  if (cached) {
    return cached;
  }

  try {
    const text = await readFile(join(locationsDir, `${normalizedCountryCode}.json`), "utf8");
    const locations = JSON.parse(text) as StoredLocation[];
    countryCache.set(normalizedCountryCode, locations);

    return locations;
  } catch {
    countryCache.set(normalizedCountryCode, []);

    return [];
  }
}

export async function searchLocations(countryCode: string, query: string, limit = 40): Promise<LocationSuggestion[]> {
  const normalizedQuery = query.trim().toLowerCase();
  const locations = await getCountryLocations(countryCode);
  const matches: StoredLocation[] = [];

  for (const location of locations) {
    if (
      normalizedQuery &&
      ![location.district, location.state, location.pincode, location.countryName].some((field) => field.toLowerCase().includes(normalizedQuery))
    ) {
      continue;
    }

    matches.push(location);

    if (matches.length >= limit) {
      break;
    }
  }

  return matches.map((location) => ({
    ...location,
    label: formatLabel(location),
    value: formatValue(location),
  }));
}
