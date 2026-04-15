import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

const EXAMPLES = [
  { place: "Hyderabad", year: "1987", hint: "Old City" },
  { place: "Bombay", year: "1890", hint: "Colonial era" },
  { place: "Lahore", year: "1946", hint: "Partition year" },
  { place: "Berlin", year: "1928", hint: "Weimar Republic" },
];

export function renderHomepage() {
  const examplesHtml = EXAMPLES.map(
    ({ place, year, hint }) =>
      `<li><a href="/ritual?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}"><span class="ex-place">${escapeHtml(place)}</span><span class="ex-year">${escapeHtml(year)}</span><span class="ex-hint">${escapeHtml(hint)}</span></a></li>`
  ).join("\n            ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Séance — Hear a place the way history felt</title>
    <meta name="description" content="Enter any place and year. Séance reconstructs its soundscape from archival traces, memoirs, and lived descriptions." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    <style>
      ${sharedStyles()}
      
      .hero {
        text-align: center;
        padding: 20px 0 40px;
      }

      .hero .brand {
        margin-bottom: 32px;
      }

      .tagline {
        font-family: var(--font-display);
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        font-style: italic;
        font-weight: 400;
        color: var(--text-dim);
        line-height: 1.4;
        margin: 0;
      }

      .premise {
        font-size: 1.15rem;
        color: var(--text-muted);
        max-width: 48ch;
        margin: 20px auto 0;
        line-height: 1.7;
      }

      .ritual-form {
        margin-top: 48px;
        background: linear-gradient(145deg, rgba(30, 24, 18, 0.7) 0%, rgba(20, 16, 12, 0.8) 100%);
        border: 1px solid var(--border-subtle);
        border-radius: 28px;
        padding: 32px 36px;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
      }

      .ritual-form form {
        display: grid;
        grid-template-columns: 1fr 140px;
        gap: 16px;
        margin: 0;
      }

      .ritual-form .cta {
        grid-column: 1 / -1;
        margin-top: 8px;
      }

      .examples-section {
        margin-top: 40px;
        text-align: center;
      }

      .example-kicker {
        font-size: 0.7rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 16px;
      }

      .example-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }

      .example-list li a {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 20px;
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        background: rgba(255, 253, 249, 0.02);
        color: var(--text);
        text-decoration: none;
        transition: all 0.25s;
      }

      .example-list li a:hover {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        transform: translateY(-2px);
      }

      .example-list .ex-place {
        font-size: 1rem;
        font-weight: 600;
      }

      .example-list .ex-year {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--accent);
        padding: 3px 8px;
        background: var(--accent-glow);
        border-radius: 4px;
      }

      .example-list .ex-hint {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-style: italic;
      }

      .footer-nav {
        margin-top: 48px;
        text-align: center;
        border-top: 1px solid var(--border-subtle);
        padding-top: 28px;
      }

      .footer-nav a {
        color: var(--text-muted);
        font-size: 0.9rem;
        text-decoration: none;
        transition: color 0.2s;
      }

      .footer-nav a:hover {
        color: var(--accent);
      }

      .recent-queries {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--border-subtle);
        text-align: center;
      }

      .recent-kicker {
        font-size: 0.7rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
        opacity: 0.7;
        margin-bottom: 12px;
      }

      .recent-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .recent-list li a {
        display: block;
        padding: 6px 12px;
        border-radius: 999px;
        color: var(--text-dim);
        font-size: 0.85rem;
        text-decoration: none;
        opacity: 0.6;
        transition: all 0.2s;
      }

      .recent-list li a:hover {
        opacity: 1;
        background: rgba(201, 166, 107, 0.08);
      }

      @media (max-width: 640px) {
        .ritual-form form {
          grid-template-columns: 1fr;
        }

        .example-list li a {
          flex-direction: column;
          gap: 6px;
          padding: 12px 16px;
        }

        .example-list .ex-hint {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="shell">
        <header class="hero">
          <h1 class="brand">Séance</h1>
          <p class="tagline">Hear a place the way history felt.</p>
          <p class="premise">Enter any place and year. Séance reconstructs its soundscape from archival traces, memoirs, and lived descriptions.</p>
        </header>

        <section class="ritual-form" aria-label="Begin a reconstruction">
          <form action="/ritual" method="get">
            <div class="input-group">
              <label for="place-input">Place</label>
              <input 
                id="place-input"
                name="place" 
                type="text" 
                autocomplete="off" 
                placeholder="Hyderabad, Lahore, Berlin..." 
                required 
              />
            </div>
            <div class="input-group">
              <label for="year-input">Year</label>
              <input 
                id="year-input"
                name="year" 
                type="number" 
                inputmode="numeric" 
                placeholder="1987" 
                min="1" 
                max="2100" 
                step="1" 
                required 
              />
            </div>
            <button class="cta" type="submit">Begin séance</button>
          </form>
        </section>

        <section class="examples-section" aria-label="Example reconstructions">
          <p class="example-kicker">Try these</p>
          <ul class="example-list">
            ${examplesHtml}
          </ul>
        </section>

        <aside class="recent-queries" aria-label="Recent reconstructions" hidden>
          <p class="recent-kicker">Recent</p>
          <ul class="recent-list"></ul>
        </aside>

        <nav class="footer-nav">
          <a href="/how-it-works">How it works</a>
        </nav>
      </div>
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