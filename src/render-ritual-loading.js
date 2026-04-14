import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderRitualLoading({ place, year }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Preparing your Seance</title>
    <style>
${sharedStyles()}

      .headphones-hint {
        margin: 28px 0 0;
        font-size: 0.9rem;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-labelledby="ritual-title">
        <p class="status-kicker">Ritual in progress</p>
        <h1 class="brand" id="ritual-title">Preparing your s&eacute;ance</h1>
        <p class="loading-copy">Tracing an evidence-grounded listening perspective for ${escapeHtml(queryLabel || "your query")}.</p>
        <ol class="stage-list" aria-label="Reconstruction stages">
          <li class="stage">
            <strong>Resolving the place</strong>
            <span>Locating the listening perspective implied by your query.</span>
          </li>
          <li class="stage">
            <strong>Gathering historical evidence</strong>
            <span>Collecting the details that can support the reconstruction.</span>
          </li>
          <li class="stage">
            <strong>Shaping the reconstruction</strong>
            <span>Preparing the first soundscape pass from the mocked backend stages.</span>
          </li>
        </ol>
        <p class="headphones-hint">Best heard with headphones.</p>
      </section>
    </main>
  </body>
</html>`;
}
