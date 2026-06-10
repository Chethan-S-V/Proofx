import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { get } from "node:https";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDir = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const cacheDir = join(rootDir, ".cache", "geonames");
const outputDir = join(rootDir, "src", "data", "geonames-postal-locations");
const countriesDir = join(outputDir, "countries");
const indexPath = join(outputDir, "index.json");
const sourceUrl = "https://download.geonames.org/export/zip/allCountries.zip";
const zipPath = join(cacheDir, basename(sourceUrl));
const extractDir = join(cacheDir, "postal");
const txtPath = join(extractDir, "allCountries.txt");

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const request = get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode ?? "unknown status"}`));
        return;
      }

      const file = createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    });

    request.on("error", reject);
  });
}

function parseRow(row) {
  const columns = row.split("\t");

  if (columns.length < 5) {
    return null;
  }

  const countryCode = columns[0]?.trim();
  const postalCode = columns[1]?.trim();
  const place = columns[2]?.trim();
  const state = columns[3]?.trim();
  const district = columns[5]?.trim() || place;

  if (!countryCode || !postalCode || !place || !state) {
    return null;
  }

  return {
    countryCode,
    countryName: countryNames.of(countryCode) ?? countryCode,
    district,
    pincode: postalCode,
    state,
  };
}

function dedupeKey(location) {
  return [location.countryCode, location.pincode, location.district, location.state].join("|").toLowerCase();
}

await mkdir(cacheDir, { recursive: true });
await mkdir(countriesDir, { recursive: true });

console.log(`Downloading ${sourceUrl}`);
await download(sourceUrl, zipPath);

await rm(extractDir, { force: true, recursive: true });
await mkdir(extractDir, { recursive: true });
await execFileAsync("powershell.exe", ["-NoProfile", "-Command", "Expand-Archive", "-LiteralPath", zipPath, "-DestinationPath", extractDir, "-Force"]);

const text = await readFile(txtPath, "utf8");
const locationsByCountry = new Map();
const seen = new Set();

for (const row of text.split(/\r?\n/)) {
  const location = parseRow(row);

  if (!location) {
    continue;
  }

  const key = dedupeKey(location);

  if (seen.has(key)) {
    continue;
  }

  seen.add(key);
  const countryLocations = locationsByCountry.get(location.countryCode) ?? [];
  countryLocations.push(location);
  locationsByCountry.set(location.countryCode, countryLocations);
}

const countries = [...locationsByCountry.entries()]
  .map(([countryCode, locations]) => ({
    countryCode,
    countryName: locations[0]?.countryName ?? countryCode,
    locations: locations.sort((first, second) => {
      const byState = first.state.localeCompare(second.state);
      const byDistrict = first.district.localeCompare(second.district);

      return byState || byDistrict || first.pincode.localeCompare(second.pincode);
    }),
  }))
  .sort((first, second) => first.countryName.localeCompare(second.countryName));

await rm(countriesDir, { force: true, recursive: true });
await mkdir(countriesDir, { recursive: true });

for (const country of countries) {
  await writeFile(join(countriesDir, `${country.countryCode}.json`), `${JSON.stringify(country.locations)}\n`);
}

await writeFile(
  indexPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      license: "GeoNames postal code data, Creative Commons Attribution 4.0",
      source: sourceUrl,
      countries: countries.map((country) => ({
        countryCode: country.countryCode,
        countryName: country.countryName,
        locationCount: country.locations.length,
      })),
    },
    null,
    2,
  )}\n`,
);

const total = countries.reduce((sum, country) => sum + country.locations.length, 0);
console.log(`Wrote ${total.toLocaleString()} postal locations across ${countries.length} countries to ${outputDir}`);
