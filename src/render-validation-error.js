import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderValidationError({ place, year, message }) {
  const isRateLimit = message && message.toLowerCase().includes("rate");
  const isYearInvalid = message && message.toLowerCase().includes("year");

  let heading = "Check the input";
  let subtitle = message;

  if (isRateLimit) {
    heading = "Recently reconstructed";
    subtitle = "This moment has been reconstructed recently. Try a nearby year or listen to the existing version.";
  } else if (isYearInvalid) {
    heading = "Year out of range";
    subtitle = "Please enter a year between 1 and 2100.";
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(heading)} — Séance</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    <style>
      ${sharedStyles()}

      .error-page {
        text-align: center;
        padding: 32px 0 40px;
      }

      .error-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        margin-bottom: 24px;
        border: 1px solid var(--border-subtle);
        border-radius: 50%;
        font-size: 1.5rem;
        color: var(--accent);
      }

      .error-header {
        margin: 0 0 12px;
        font-size: 0.7rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .error-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(1.8rem, 5vw, 2.4rem);
        font-weight: 400;
        color: var(--text);
      }

      .error-message {
        margin: 20px auto 0;
        font-size: 1.05rem;
        color: var(--text-dim);
        max-width: 40ch;
        line-height: 1.6;
      }

      .query-summary {
        margin: 32px auto 0;
        padding: 20px 24px;
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        background: rgba(30, 24, 18, 0.4);
        display: inline-block;
        text-align: left;
      }

      .query-summary p {
        margin: 8px 0;
        font-size: 0.9rem;
        color: var(--text-muted);
      }

      .query-summary strong {
        color: var(--text);
        font-weight: 500;
      }

      .suggestions {
        margin: 32px 0 0;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
      }

      .suggestion-btn {
        padding: 12px 20px;
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        background: transparent;
        color: var(--text-dim);
        font: inherit;
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.2s;
      }

      .suggestion-btn:hover {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        color: var(--accent);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 40px;
        color: var(--text-muted);
        font-size: 0.95rem;
        text-decoration: none;
        transition: color 0.2s;
      }

      .back-link:hover {
        color: var(--accent);
      }

      .back-link::before {
        content: "←";
      }
    </style>
  </head>
  <body>
    <main>
      <div class="shell">
        <div class="error-page">
          <div class="error-icon" aria-hidden="true">?</div>
          <p class="error-header">Attention required</p>
          <h1 class="error-title">${escapeHtml(heading)}</h1>
          <p class="error-message">${escapeHtml(subtitle)}</p>
          
          <div class="query-summary">
            <p><strong>Place:</strong> ${escapeHtml(place || "Not provided")}</p>
            <p><strong>Year:</strong> ${escapeHtml(year || "Not provided")}</p>
          </div>

          <div class="suggestions">
            <a href="/" class="suggestion-btn">Try another place</a>
            ${year ? `<a href="/ritual?place=${encodeURIComponent(place || "London")}&year=${encodeURIComponent(parseInt(year) + 5)}" class="suggestion-btn">Nearby year</a>` : ""}
          </div>

          <a class="back-link" href="/">Return to start</a>
        </div>
      </div>
    </main>
  </body>
</html>`;
}