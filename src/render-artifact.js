import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderArtifact({ place, year, archived = false, confidence = "high", reinterpretation = null }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");
  const headerText = archived ? "From your archive" : "Your seance";
  const reinterpretNote = reinterpretation?.reinterpreted
    ? `<p class="trust-line"><em>Reconstructed</em> &middot; ${escapeHtml(reinterpretation.note)}</p>`
    : "";

  const confidenceLabel = {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence",
  }[confidence] ?? "Confidence: unknown";

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

      .trust-line {
        margin: 16px 0 0;
        padding: 12px 16px;
        border: 1px solid rgba(74, 56, 38, 0.1);
        border-radius: 12px;
        background: rgba(255, 253, 249, 0.5);
        font-size: 0.85rem;
        color: var(--muted);
      }

      .trust-line strong {
        color: var(--text);
        font-weight: normal;
      }

      .about-panel {
        margin: 16px 0 0;
        border: 1px solid rgba(74, 56, 38, 0.1);
        border-radius: 12px;
        background: rgba(255, 253, 249, 0.4);
        overflow: hidden;
      }

      .about-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 0.85rem;
        color: var(--muted);
        cursor: pointer;
        text-align: left;
      }

      .about-toggle:hover {
        background: rgba(255, 253, 249, 0.5);
      }

      .about-toggle::after {
        content: "▼";
        font-size: 0.7rem;
        transition: transform 0.2s;
      }

      .about-panel[open] .about-toggle::after {
        transform: rotate(180deg);
      }

      .about-content {
        padding: 0 16px 16px;
        font-size: 0.85rem;
        color: var(--muted);
        line-height: 1.5;
      }

      .about-content ul {
        margin: 8px 0 0;
        padding-left: 20px;
      }

      .about-content li {
        margin: 4px 0;
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

      .share-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        justify-content: center;
      }

      .share-btn {
        padding: 10px 16px;
        border: 1px solid rgba(74, 56, 38, 0.2);
        border-radius: 999px;
        background: transparent;
        color: var(--muted);
        font: inherit;
        font-size: 0.85rem;
        cursor: pointer;
      }

      .share-btn:hover {
        background: rgba(255, 253, 249, 0.5);
        border-color: var(--accent);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell" aria-labelledby="artifact-title">
        <p class="artifact-header">${escapeHtml(headerText)}</p>
        <h1 class="artifact-place" id="artifact-title">${escapeHtml(queryLabel)}</h1>
        <p class="trust-line"><strong>Evidence grounded</strong> &middot; ${escapeHtml(confidenceLabel)}</p>
        ${reinterpretNote}
        <details class="about-panel">
          <summary class="about-toggle">About this reconstruction</summary>
          <div class="about-content">
            <p>This soundscape was generated using historical evidence from multiple sources. The audio combines ambient bed, event sounds, and texture layers to create an immersive historical soundscape.</p>
            <ul>
              <li>Historical audio recordings from the period</li>
              <li>Documented soundscapes and oral histories</li>
              <li>Academic research on historical soundscapes</li>
            </ul>
          </div>
        </details>
        <div class="playback" aria-label="Audio playback">
          <div class="playback-wave" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <p class="playback-label">Mock playback placeholder</p>
        </div>
        <div class="actions">
          <a class="btn" href="/artifact?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}">Hear it again</a>
        </div>
        <div class="share-actions">
          <button class="share-btn" type="button" onclick="if(navigator.share){navigator.share({title:'Seance: '+'${escapeHtml(queryLabel)}',url:window.location.href}).catch(()=>{})}else{alert('Sharing not supported in this browser')}">Share</button>
          <button class="share-btn" type="button" onclick="navigator.clipboard.writeText(window.location.href)">Copy link</button>
          <button class="share-btn" type="button">Save card</button>
        </div>
      </section>
    </main>
  </body>
</html>`;
}