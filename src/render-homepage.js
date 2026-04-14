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

      .recent-queries {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid rgba(74, 56, 38, 0.1);
      }

      .recent-kicker {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
        opacity: 0.7;
      }

      .recent-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px 0 0;
        padding: 0;
        list-style: none;
      }

      .recent-list li a {
        display: block;
        padding: 6px 12px;
        border-radius: 999px;
        color: var(--muted);
        font-size: 0.8rem;
        text-decoration: none;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .recent-list li a:hover {
        opacity: 1;
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
        <aside class="recent-queries" aria-label="Recent queries" hidden>
          <p class="recent-kicker">Recent</p>
          <ul class="recent-list"></ul>
        </aside>
      </section>
    </main>
    <script>
(function() {
  var KEY = 'seance-history';
  var MAX = 4;
  var form = document.querySelector('form');
  var recentSection = document.querySelector('.recent-queries');
  var recentList = document.querySelector('.recent-list');
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function save(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
    } catch (e) {}
  }
  function render(items) {
    if (!items.length) return;
    recentSection.hidden = false;
    recentList.innerHTML = items.map(function(item) {
      return '<li><a href="/ritual?place=' + encodeURIComponent(item.place) + '&year=' + encodeURIComponent(item.year) + '">' + item.place + ' · ' + item.year + '</a></li>';
    }).join('');
  }
  form.addEventListener('submit', function(e) {
    var place = form.querySelector('[name="place"]').value.trim();
    var year = form.querySelector('[name="year"]').value.trim();
    if (!place || !year) return;
    var items = load().filter(function(item) {
      return !(item.place === place && item.year === year);
    });
    items.unshift({ place: place, year: year, at: Date.now() });
    save(items);
  });
  render(load());
})();
    </script>
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
