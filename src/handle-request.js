import { renderHomepage } from "./render-homepage.js";
import { validateRitualQuery } from "./query-validation.js";
import { renderRitualLoading } from "./render-ritual-loading.js";
import { renderValidationError } from "./render-validation-error.js";
import { renderArtifact } from "./render-artifact.js";

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

    const artifactUrl = `/artifact?place=${encodeURIComponent(validation.place)}&year=${encodeURIComponent(validation.year)}`;
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
    const place = searchParams.get("place") ?? "";
    const year = searchParams.get("year") ?? "";

    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderArtifact({ place, year }),
    };
  }

  return {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Not Found",
  };
}
