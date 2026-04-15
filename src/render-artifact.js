import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderArtifact({ place, year, archived = false, confidence = "high", confidenceScore = null, reinterpretation = null, generated = false, error = null, audioLayers = null, evidence = null, evidenceNote = null, sourceNotes = null, partial = false }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");
  const headerText = archived ? "From your archive" : generated ? "Freshly summoned" : "Your seance";
  const reinterpretNote = reinterpretation?.reinterpreted
    ? `<p class="trust-line"><em>Reconstructed</em> &middot; ${escapeHtml(reinterpretation.note)}</p>`
    : "";
  
  const partialNote = partial && audioLayers?.isPartial
    ? `<p class="trust-line"><em>Partial reconstruction</em> &middot; Some audio layers unavailable</p>`
    : "";

  const confidenceLabel = {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence",
  }[confidence] ?? "Confidence: unknown";

  const hasAudio = audioLayers && (audioLayers.bed || audioLayers.event || audioLayers.texture);

  let evidenceBullet = "";
  if (sourceNotes) {
    evidenceBullet = `<p class="trust-line">${escapeHtml(sourceNotes)}</p>`;
  } else if (evidenceNote) {
    evidenceBullet = `<p class="trust-line">${escapeHtml(evidenceNote)}</p>`;
  } else if (evidence && evidence.length > 0) {
    const evDescriptions = evidence.slice(0, 2).map(e => e.description).join("; ");
    evidenceBullet = `<p class="trust-line">Evidence: ${escapeHtml(evDescriptions)}</p>`;
  }

  let audioElements = "";
  if (hasAudio) {
    audioElements = `
      <div class="audio-player" id="audio-player">
        <div class="audio-visualizer" aria-hidden="true">
          <canvas id="visualizer"></canvas>
        </div>
        <div class="audio-controls">
          <button class="play-btn" id="play-btn" type="button" aria-label="Play soundscape">
            <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24"><polygon points="5,3 19,12 5,21" fill="currentColor"/></svg>
            <svg class="pause-icon hidden" viewBox="0 0 24 24" width="24" height="24"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>
          </button>
          <div class="audio-timeline">
            <div class="timeline-progress" id="timeline-progress"></div>
          </div>
          <span class="audio-time" id="audio-time">0:00 / 0:33</span>
        </div>
      </div>
      <script>
        (function() {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          let isPlaying = false;
          let audioBuffer = null;
          let sourceNode = null;
          let startTime = 0;
          let pauseTime = 0;
          let duration = 33;
          let audioDuration = 0;

          const playBtn = document.getElementById('play-btn');
          const playIcon = document.querySelector('.play-icon');
          const pauseIcon = document.querySelector('.pause-icon');
          const progress = document.getElementById('timeline-progress');
          const timeDisplay = document.getElementById('audio-time');

          async function initAudio() {
            if (audioBuffer) return;
            const base64Data = ${JSON.stringify(audioLayers || {})};
            try {
              const binaryString = atob(base64Data.bed || '');
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
              audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
              audioDuration = audioBuffer.duration;
              duration = Math.floor(audioDuration);
            } catch (e) {
              console.log('Audio not available');
            }
          }

          playBtn.addEventListener('click', async () => {
            await initAudio();
            if (!audioBuffer) return;

            if (isPlaying) {
              sourceNode.stop();
              pauseTime += audioCtx.currentTime - startTime;
              isPlaying = false;
              playIcon.classList.remove('hidden');
              pauseIcon.classList.add('hidden');
              sourceNode = null;
            } else {
              sourceNode = audioCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(audioCtx.destination);
              sourceNode.onended = () => {
                if (isPlaying) {
                  isPlaying = false;
                  playIcon.classList.remove('hidden');
                  pauseIcon.classList.add('hidden');
                  pauseTime = 0;
                  progress.style.width = '0%';
                }
              };
              sourceNode.start(0, pauseTime);
              startTime = audioCtx.currentTime;
              isPlaying = true;
              playIcon.classList.add('hidden');
              pauseIcon.classList.remove('hidden');
              updateTime();
            }
          });

          function updateTime() {
            if (!isPlaying) return;
            const elapsed = (pauseTime + audioCtx.currentTime - startTime) % audioBuffer.duration;
            const pct = (elapsed / audioBuffer.duration) * 100;
            progress.style.width = pct + '%';
            const curr = Math.floor(elapsed);
            timeDisplay.textContent = curr + ':' + String(Math.floor((elapsed % 1) * 60)).padStart(2, '0') + ' / ' + duration + ':00';
            requestAnimationFrame(updateTime);
          }
        })();
      </script>
    `;
  }

  const errorMessage = error ? `<p class="error-note">Generation note: ${escapeHtml(error)}</p>` : "";

  const shareTitle = `Séance: ${queryLabel}`;
  const shareDesc = archived 
    ? `Hear ${queryLabel} from the archive` 
    : `Hear what ${queryLabel} sounded like`;
  
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${queryLabel} — Séance</title>
    <meta property="og:title" content="${shareTitle}" />
    <meta property="og:description" content="${shareDesc}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${shareTitle}" />
    <meta name="twitter:description" content="${shareDesc}" />
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

      .audio-player {
        margin: 32px 0 0;
        padding: 24px;
        border: 1px solid rgba(74, 56, 38, 0.14);
        border-radius: 24px;
        background: rgba(255, 253, 249, 0.64);
      }

      .audio-visualizer {
        height: 60px;
        margin: 0 0 16px;
        background: rgba(74, 56, 38, 0.05);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .audio-visualizer canvas {
        width: 100%;
        height: 60px;
      }

      .audio-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .play-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: var(--text);
        color: #fffaf2;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s;
      }

      .play-btn:hover {
        transform: scale(1.05);
      }

      .play-icon, .pause-icon {
        position: absolute;
      }

      .hidden {
        display: none;
      }

      .audio-timeline {
        flex: 1;
        height: 6px;
        background: rgba(74, 56, 38, 0.15);
        border-radius: 3px;
        overflow: hidden;
      }

      .timeline-progress {
        width: 0%;
        height: 100%;
        background: var(--accent);
        transition: width 0.1s;
      }

      .audio-time {
        font-size: 0.8rem;
        color: var(--muted);
        min-width: 80px;
      }

      .error-note {
        margin: 16px 0 0;
        padding: 12px 16px;
        border: 1px solid rgba(74, 56, 38, 0.1);
        border-radius: 12px;
        background: rgba(255, 253, 249, 0.5);
        font-size: 0.85rem;
        color: var(--muted);
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
        ${evidenceBullet}
        ${reinterpretNote}
        ${partialNote}
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
          ${hasAudio ? audioElements : `
          <div class="playback-wave" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <p class="playback-label">Mock playback placeholder</p>
          `}
        </div>
        ${errorMessage}
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