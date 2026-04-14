import http from "node:http";

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
    return {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: renderRitualLoading({
        place: searchParams.get("place") ?? "",
        year: searchParams.get("year") ?? "",
      }),
    };
  }

  return {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: "Not Found",
  };
}

export function renderHomepage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Seance</title>
    <style>
${sharedStyles()}
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
      </section>
    </main>
  </body>
</html>`;
}

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
      </section>
    </main>
  </body>
</html>`;
}

function sharedStyles() {
  return `
      :root {
        color-scheme: light;
        --bg: #f6efe3;
        --panel: rgba(255, 250, 242, 0.84);
        --border: rgba(65, 47, 29, 0.14);
        --text: #20160f;
        --muted: #6f5845;
        --accent: #9c5d28;
        font-family: "Georgia", "Times New Roman", serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--text);
        background:
          radial-gradient(circle at top, rgba(255, 255, 255, 0.86), transparent 45%),
          linear-gradient(160deg, #f8f3ea 0%, var(--bg) 52%, #eadfce 100%);
      }

      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 20px;
      }

      .shell {
        width: min(100%, 720px);
        padding: 44px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: var(--panel);
        box-shadow: 0 24px 80px rgba(72, 51, 24, 0.12);
      }

      .brand {
        margin: 0;
        font-size: clamp(2.2rem, 6vw, 4.2rem);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .premise {
        margin: 18px 0 0;
        max-width: 28ch;
        font-size: clamp(1.15rem, 2.6vw, 1.55rem);
        line-height: 1.45;
        color: var(--muted);
      }

      form {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
        gap: 18px;
        margin-top: 36px;
      }

      label {
        display: grid;
        gap: 10px;
        font-size: 0.9rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      input {
        width: 100%;
        padding: 16px 18px;
        border: 1px solid rgba(74, 56, 38, 0.2);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.92);
        color: var(--text);
        font: inherit;
        font-size: 1.05rem;
      }

      .cta {
        grid-column: 1 / -1;
        justify-self: start;
        padding: 14px 24px;
        border: 0;
        border-radius: 999px;
        background: var(--text);
        color: #fffaf2;
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
      }

      .status-kicker {
        margin: 0 0 12px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .loading-copy {
        margin: 18px 0 0;
        max-width: 34ch;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--muted);
      }

      .stage-list {
        display: grid;
        gap: 12px;
        margin: 32px 0 0;
        padding: 0;
        list-style: none;
      }

      .stage {
        padding: 14px 16px;
        border: 1px solid rgba(74, 56, 38, 0.14);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.78);
      }

      .stage strong {
        display: block;
        font-size: 0.95rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .stage span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
      }

      input:focus {
        outline: 2px solid rgba(156, 93, 40, 0.2);
        border-color: var(--accent);
      }

      @media (max-width: 720px) {
        main {
          padding: 20px 14px;
        }

        .shell {
          padding: 28px 20px;
          border-radius: 24px;
        }

        form {
          grid-template-columns: 1fr;
        }
      }
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    const result = handleRequest({
      method: request.method ?? "GET",
      pathname: url.pathname,
      searchParams: url.searchParams,
    });

    response.writeHead(result.status, result.headers);
    response.end(result.body);
  });
}

export function startServer() {
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number.parseInt(process.env.PORT ?? "8000", 10);
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`Serving Seance on http://${host}:${port}`);
  });

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
