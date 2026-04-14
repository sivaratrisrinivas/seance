import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderDisambiguation({ place, year, candidates }) {
  const candidatesHtml = candidates
    .map(
      (c) =>
        `<li><a href="/ritual?place=${encodeURIComponent(c)}&year=${encodeURIComponent(year)}">${escapeHtml(c)}</a></li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Which ${escapeHtml(place)}?</title>
    <style>
${sharedStyles()}

      .disambig-header {
        margin: 0 0 8px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .disambig-title {
        margin: 0;
        font-size: clamp(1.8rem, 5vw, 2.8rem);
        color: var(--text);
      }

      .disambig-subtitle {
        margin: 12px 0 0;
        font-size: 1.05rem;
        color: var(--muted);
      }

      .candidate-list {
        display: grid;
        gap: 12px;
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
      }

      .candidate-item {
        display: block;
      }

      .candidate-item a {
        display: block;
        padding: 16px 20px;
        border: 1px solid rgba(74, 56, 38, 0.14);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.64);
        color: var(--text);
        font-size: 1.05rem;
        text-decoration: none;
        transition: background 0.2s, border-color 0.2s;
      }

      .candidate-item a:hover,
      .candidate-item a:focus {
        background: rgba(255, 253, 249, 0.92);
        border-color: var(--accent);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-labelledby="disambig-title">
        <p class="disambig-header">Which location?</p>
        <h1 class="disambig-title" id="disambig-title">Which ${escapeHtml(place)}?</h1>
        <p class="disambig-subtitle">Please choose the location you meant:</p>
        <ul class="candidate-list">
          ${candidatesHtml}
        </ul>
      </section>
    </main>
  </body>
</html>`;
}