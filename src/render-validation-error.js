import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderValidationError({ place, year, message }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Year validation error</title>
    <style>
${sharedStyles()}

      .error-copy {
        margin: 18px 0 0;
        max-width: 34ch;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--muted);
      }

      .query-summary {
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
      }

      .query-summary li {
        margin-top: 8px;
        color: var(--muted);
      }

      .query-summary strong {
        color: var(--text);
      }

      .back-link {
        display: inline-block;
        margin-top: 28px;
        color: var(--accent);
        text-decoration: none;
        font-size: 1rem;
      }

      .back-link:hover,
      .back-link:focus {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-labelledby="validation-title">
        <p class="status-kicker">Validation required</p>
        <h1 class="brand" id="validation-title">Check the year</h1>
        <p class="error-copy">${escapeHtml(message)}</p>
        <ul class="query-summary" aria-label="Submitted query">
          <li><strong>Place:</strong> ${escapeHtml(place || "Not provided")}</li>
          <li><strong>Year:</strong> ${escapeHtml(year || "Not provided")}</li>
        </ul>
        <a class="back-link" href="/">Return to the form</a>
      </section>
    </main>
  </body>
</html>`;
}
