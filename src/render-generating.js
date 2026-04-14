import { sharedStyles } from "./shared-styles.js";

export function renderGenerating({ place, year, redirectTo = null }) {
  const redirectUrl = redirectTo ?? `/artifact?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Creating your seance...</title>
    <style>
${sharedStyles()}

      .loading-header {
        margin: 0 0 8px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .loading-title {
        margin: 0;
        font-size: clamp(1.8rem, 5vw, 2.8rem);
        color: var(--text);
      }

      .loading-subtitle {
        margin: 12px 0 0;
        font-size: 1.05rem;
        color: var(--muted);
      }

      .spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 48px;
        margin: 32px 0 16px;
      }

      .spinner-dot {
        width: 8px;
        height: 8px;
        background: var(--accent);
        border-radius: 50%;
        animation: pulse 1.4s ease-in-out infinite;
      }

      .spinner-dot:nth-child(2) { animation-delay: 0.2s; }
      .spinner-dot:nth-child(3) { animation-delay: 0.4s; }
      .spinner-dot:nth-child(4) { animation-delay: 0.6s; }

      @keyframes pulse {
        0%, 100% { transform: scale(0.6); opacity: 0.4; }
        50% { transform: scale(1); opacity: 1; }
      }

      .progress-label {
        font-size: 0.95rem;
        color: var(--muted);
        text-align: center;
      }

      .progress-stage {
        margin: 8px 0 0;
        font-size: 0.8rem;
        color: var(--muted);
        opacity: 0.7;
        text-align: center;
      }
    </style>
    <meta http-equiv="refresh" content="3;url=${redirectUrl}" />
  </head>
  <body>
    <main>
      <section class="shell">
        <p class="loading-header">Preparing your seance</p>
        <h1 class="loading-title">${place}, ${year}</h1>
        <p class="loading-subtitle">Please wait while we reconstruct the soundscape...</p>
        <div class="spinner" aria-hidden="true">
          <span class="spinner-dot"></span>
          <span class="spinner-dot"></span>
          <span class="spinner-dot"></span>
          <span class="spinner-dot"></span>
        </div>
        <p class="progress-label">This may take a moment</p>
        <p class="progress-stage">Gathering historical evidence</p>
      </section>
    </main>
  </body>
</html>`;
}