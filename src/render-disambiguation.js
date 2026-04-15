import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderDisambiguation({ place, year, candidates }) {
  const candidatesHtml = candidates
    .map(
      (c) =>
        `<li><a href="/ritual?place=${encodeURIComponent(c)}&year=${encodeURIComponent(year)}">
          <span class="candidate-name">${escapeHtml(c)}</span>
          <span class="candidate-arrow" aria-hidden="true">→</span>
        </a></li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Which ${escapeHtml(place)}?</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    <style>
      ${sharedStyles()}

      .disambig-hero {
        text-align: center;
        padding: 20px 0 32px;
      }

      .disambig-header {
        margin: 0 0 12px;
        font-size: 0.7rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .disambig-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 2.8rem);
        font-weight: 400;
        color: var(--text);
      }

      .disambig-subtitle {
        margin: 16px 0 0;
        font-size: 1.05rem;
        color: var(--text-dim);
        line-height: 1.6;
      }

      .candidate-list {
        display: grid;
        gap: 14px;
        margin: 36px 0 0;
        padding: 0;
        list-style: none;
      }

      .candidate-item {
        display: block;
      }

      .candidate-item a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border: 1px solid var(--border-subtle);
        border-radius: 20px;
        background: rgba(255, 253, 249, 0.02);
        color: var(--text);
        font-size: 1.1rem;
        text-decoration: none;
        transition: all 0.25s;
      }

      .candidate-item a:hover,
      .candidate-item a:focus {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        transform: translateY(-2px);
      }

      .candidate-name {
        font-weight: 500;
      }

      .candidate-arrow {
        color: var(--accent);
        font-size: 1.2rem;
        opacity: 0;
        transform: translateX(-8px);
        transition: all 0.25s;
      }

      .candidate-item a:hover .candidate-arrow {
        opacity: 1;
        transform: translateX(0);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 32px;
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
        <header class="disambig-hero">
          <p class="disambig-header">Which location?</p>
          <h1 class="disambig-title">${escapeHtml(place)}, ${escapeHtml(year)}</h1>
          <p class="disambig-subtitle">This name refers to multiple places. Choose the one you want to reconstruct.</p>
        </header>
        
        <ul class="candidate-list">
          ${candidatesHtml}
        </ul>

        <a class="back-link" href="/">Choose a different place</a>
      </div>
    </main>
  </body>
</html>`;
}