import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderArtifact({ place, year, archived = false }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");
  const headerText = archived ? "From your archive" : "Your seance";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Seance</title>
    <style>
${sharedStyles()}

      .artifact-header {
        margin: 0 0 8px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .artifact-place {
        margin: 0;
        font-size: clamp(1.8rem, 5vw, 2.8rem);
        color: var(--text);
      }

      .playback {
        margin: 32px 0 0;
        padding: 32px 24px;
        border: 1px solid rgba(74, 56, 38, 0.14);
        border-radius: 24px;
        background: rgba(255, 253, 249, 0.64);
        text-align: center;
      }

      .playback-wave {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 48px;
        margin: 0 0 16px;
      }

      .playback-wave span {
        width: 4px;
        background: var(--accent);
        border-radius: 2px;
        animation: wave 1s ease-in-out infinite;
      }

      .playback-wave span:nth-child(1) { height: 20%; animation-delay: 0s; }
      .playback-wave span:nth-child(2) { height: 40%; animation-delay: 0.1s; }
      .playback-wave span:nth-child(3) { height: 60%; animation-delay: 0.2s; }
      .playback-wave span:nth-child(4) { height: 80%; animation-delay: 0.3s; }
      .playback-wave span:nth-child(5) { height: 60%; animation-delay: 0.4s; }
      .playback-wave span:nth-child(6) { height: 40%; animation-delay: 0.5s; }
      .playback-wave span:nth-child(7) { height: 20%; animation-delay: 0.6s; }

      @keyframes wave {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.5); }
      }

      .playback-label {
        font-size: 0.95rem;
        color: var(--muted);
      }

      .actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        justify-content: center;
      }

      .btn {
        padding: 12px 20px;
        border: 1px solid rgba(74, 56, 38, 0.2);
        border-radius: 999px;
        background: var(--text);
        color: #fffaf2;
        font: inherit;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }

      .btn-secondary {
        background: transparent;
        color: var(--text);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-labelledby="artifact-title">
        <p class="artifact-header">${escapeHtml(headerText)}</p>
        <h1 class="artifact-place" id="artifact-title">${escapeHtml(queryLabel)}</h1>
        <div class="playback" aria-label="Audio playback">
          <div class="playback-wave" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <p class="playback-label">Mock playback placeholder</p>
        </div>
        <div class="actions">
          <a class="btn" href="/artifact?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}">Hear it again</a>
        </div>
      </section>
    </main>
  </body>
</html>`;
}