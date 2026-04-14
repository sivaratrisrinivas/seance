import { renderHomepage } from "./render-homepage.js";
import { validateRitualQuery } from "./query-validation.js";
import { renderRitualLoading } from "./render-ritual-loading.js";
import { renderGenerating } from "./render-generating.js";
import { renderValidationError } from "./render-validation-error.js";
import { renderArtifact } from "./render-artifact.js";
import { renderDisambiguation } from "./render-disambiguation.js";
import { resolvePlaceForYear, needsReinterpretation } from "./place-reinterpretation.js";

const AMBIGUOUS_PLACES = {
  Springfield: ["Springfield, Missouri", "Springfield, Illinois"],
  Cambridge: ["Cambridge, UK", "Cambridge, Massachusetts"],
  York: ["York, UK", "New York, USA"],
  Beverly: ["Beverly Hills, California", "Beverly, Massachusetts"],
};

function generateOpaqueId(place, year) {
  return btoa(`${place}:${year}`).replace(/=/g, "");
}

export function handleRequest({
  method = "GET",
  pathname = "/",
  searchParams = new URLSearchParams(),
} = {}) {
  if (method === "GET" && pathname === "/") {
    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderHomepage(),
    };
  }

  if (method === "GET" && pathname === "/disambiguate") {
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";
    const candidates = AMBIGUOUS_PLACES[place] ?? [];

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderDisambiguation({ place, year, candidates }),
    };
  }

  if (method === "GET" && pathname === "/ritual") {
    const validation = validateRitualQuery({
      place: searchParams.get("place") ?? "",
      year: searchParams.get("year") ?? "",
    });

    if (!validation.ok) {
      return {
        status: 422,
        headers: { "content-type": "text/html; charset=utf-8" },
        body: renderValidationError(validation),
      };
    }

    const placeKey = validation.place.split(",")[0].trim();
    if (AMBIGUOUS_PLACES[placeKey]) {
      const disambigUrl = `/disambiguate?place=${encodeURIComponent(placeKey)}&year=${encodeURIComponent(validation.year)}`;
      return {
        status: 302,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          location: disambigUrl,
        },
        body: `Redirecting to ${disambigUrl}`,
      };
    }

    const reinterpretation = resolvePlaceForYear(placeKey, validation.year);
    let finalPlace = validation.place;
    let reinterpretNote = "";
    if (reinterpretation.reinterpreted) {
      finalPlace = `${reinterpretation.modern} (formerly ${reinterpretation.original})`;
      reinterpretNote = `&note=${encodeURIComponent(reinterpretation.note)}`;
    }

    const opaqueId = generateOpaqueId(finalPlace, validation.year);
    const generatingUrl = `/generating?id=${opaqueId}&place=${encodeURIComponent(validation.place)}&year=${encodeURIComponent(validation.year)}${reinterpretNote}`;
    return {
      status: 302,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        location: generatingUrl,
      },
      body: `Redirecting to ${generatingUrl}`,
    };
  }

  if (method === "GET" && pathname === "/generating") {
    const id = searchParams.get("id") ?? "";
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";
    const note = searchParams.get("note") ?? "";

    const finalId = id || (place && year ? generateOpaqueId(place, year) : "");

    const artifactUrl = finalId
      ? `/artifact?id=${finalId}${note ? `&note=${encodeURIComponent(note)}` : ""}`
      : `/artifact?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}${note ? `&note=${encodeURIComponent(note)}` : ""}`;

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderGenerating({ place, year, redirectTo: artifactUrl }),
    };
  }

  if (method === "GET" && pathname === "/artifact") {
    const id = searchParams.get("id");
    let place = searchParams.get("place") ?? "";
    let year = searchParams.get("year") ?? "";
    const note = searchParams.get("note") ?? "";
    const archived = searchParams.get("archived") === "true";

    if (id && !place && !year) {
      const decoded = atob(id);
      const parts = decoded.split(":");
      place = parts[0] || "";
      year = parts[1] || "";
    }

    const reinterpretation = note
      ? { reinterpreted: true, note: note }
      : null;

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderArtifact({ place, year, archived, reinterpretation }),
    };
  }

  return {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Not Found",
  };
}
