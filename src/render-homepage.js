import { sharedStyles } from "./shared-styles.js";

const EXAMPLES = [
  { place: "Old City, Hyderabad", year: "1987" },
  { place: "Riverside, California", year: "1962" },
  { place: "Kyoto, Japan", year: "1912" },
];

export function renderHomepage() {
  const examplesHtml = EXAMPLES.map(
    ({ place, year }) =>
      `<li><a href="/ritual?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}">${escapeHtml(place)} &middot; ${escapeHtml(year)}</a></li>`
  ).join("\n            ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Seance</title>
    <style>
${sharedStyles()}
      .example-queries {
        margin-top: 24px;
        padding-top: 18px;
        border-top: 1px solid rgba(74, 56, 38, 0.12);
      }

      .example-kicker {
        margin: 0;
        font-size: 0.78rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .example-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 12px 0 0;
        padding: 0;
        list-style: none;
      }

      .example-list li a {
        display: block;
        padding: 10px 14px;
        border: 1px solid rgba(74, 56, 38, 0.12);
        border-radius: 999px;
        background: rgba(255, 253, 249, 0.64);
        color: var(--muted);
        font-size: 0.92rem;
        line-height: 1.3;
        text-decoration: none;
      }

      .example-list li a:hover,
      .example-list li a:focus {
        background: rgba(255, 253, 249, 0.92);
        border-color: var(--accent);
      }

      .footer-nav {
        margin-top: 24px;
        text-align: center;
      }

      .footer-nav a {
        color: var(--muted);
        font-size: 0.85rem;
        text-decoration: none;
      }

      .footer-nav a:hover,
      .footer-nav a:focus {
        color: var(--accent);
      }

    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-labelledby="home-title">
        <h1 class="brand" id="home-title">S&eacute;ance</h1>
        <p class="premise">Hear a grounded sound reconstruction of any place and year.</p>
        <form action="/ritual" method="get" aria-label="Historical sound reconstruction query">
          <label>
            Place
            <input name="place" type="text" autocomplete="off" placeholder="Old City, Hyderabad" required />
          </label>
          <label>
            Year
            <input name="year" type="number" inputmode="numeric" placeholder="1987" step="1" required />
          </label>
          <button class="cta" type="submit">Begin s&eacute;ance</button>
        </form>
        <aside class="example-queries" aria-label="Example queries">
          <p class="example-kicker">Example queries</p>
          <ul class="example-list">
            ${examplesHtml}
          </ul>
        </aside>
        <nav class="footer-nav">
          <a href="/how-it-works">How it works</a>
        </nav>
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
