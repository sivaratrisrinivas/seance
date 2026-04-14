import { renderHomepage } from "./render-homepage.js";
import { validateRitualQuery } from "./query-validation.js";
import { renderRitualLoading } from "./render-ritual-loading.js";
import { renderValidationError } from "./render-validation-error.js";
import { renderArtifact } from "./render-artifact.js";

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

    const opaqueId = generateOpaqueId(validation.place, validation.year);
    const artifactUrl = `/artifact?id=${opaqueId}`;
    return {
      status: 302,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        location: artifactUrl,
      },
      body: `Redirecting to ${artifactUrl}`,
    };
  }

  if (method === "GET" && pathname === "/artifact") {
    const id = searchParams.get("id");
    let place = searchParams.get("place") ?? "";
    let year = searchParams.get("year") ?? "";
    const archived = searchParams.get("archived") === "true";

    if (id && !place && !year) {
      const decoded = atob(id);
      const parts = decoded.split(":");
      place = parts[0] || "";
      year = parts[1] || "";
    }

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderArtifact({ place, year, archived }),
    };
  }

  return {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Not Found",
  };
}
