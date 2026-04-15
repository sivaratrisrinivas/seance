import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

const LISTENING_MODES = [
  { id: "full", label: "Full scene", description: "All layers combined" },
  { id: "atmosphere", label: "Atmosphere", description: "Ambient bed and texture" },
  { id: "streetlife", label: "Street life", description: "Human activity emphasis" },
  { id: "machines", label: "Machines", description: "Mechanical and industrial" },
  { id: "voices", label: "Voices", description: "Crowd and speech elements" },
];

const CONFIDENCE_LABELS = {
  high: "Archive-backed",
  medium: "Moderate inference",
  low: "Sparse evidence",
  gemini: "AI-generated context",
};

function getConfidenceLabel(confidence) {
  return CONFIDENCE_LABELS[confidence] ?? "Confidence: unknown";
}

function formatEvidence(evidence) {
  if (!evidence || evidence.length === 0) return "";
  
  return evidence.slice(0, 6).map((e, i) => `
    <article class="evidence-card">
      <p class="evidence-excerpt">${escapeHtml(e.description || e.text || "No description")}</p>
      <footer class="evidence-meta">
        ${e.source ? `<span class="evidence-source">${escapeHtml(e.source)}</span>` : ""}
        ${e.tags ? `
          <div class="evidence-tags">
            ${e.tags.split(",").map(t => `<span class="evidence-tag">${escapeHtml(t.trim())}</span>`).join("")}
          </div>
        ` : ""}
      </footer>
    </article>
  `).join("\n");
}

function getNearbyYears(year) {
  const y = parseInt(year);
  if (isNaN(y)) return [];
  return [y - 10, y - 5, y + 5, y + 10].filter(y => y > 0 && y <= 2100);
}

export function renderArtifact({ place, year, archived = false, confidence = "high", confidenceScore = null, reinterpretation = null, generated = false, error = null, audioLayers = null, evidence = null, evidenceNote = null, sourceNotes = null, partial = false }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");
  const headerText = archived ? "Recovered from prior reconstruction" : generated ? "Freshly summoned" : "Your seance";
  const reinterpretNote = reinterpretation?.reinterpreted
    ? `<p class="meta-line"><strong>Historically interpreted:</strong> ${escapeHtml(reinterpretation.note)}</p>`
    : "";
  
  const partialNote = partial
    ? `<p class="meta-line"><strong>Partial reconstruction:</strong> Some audio layers unavailable</p>`
    : "";

  const confidenceLabel = getConfidenceLabel(confidence);
  const hasAudio = audioLayers && (audioLayers.bed || audioLayers.event || audioLayers.texture);

  const hasEvidence = evidence && evidence.length > 0;
  const evidenceSection = hasEvidence ? `
    <section class="evidence-section">
      <h2 class="section-title">What this is built from</h2>
      <div class="evidence-grid">
        ${formatEvidence(evidence)}
      </div>
      ${evidenceNote ? `<p class="evidence-note">${escapeHtml(evidenceNote)}</p>` : ""}
    </section>
  ` : "";

  const sourceNote = sourceNotes
    ? `<p class="meta-line">${escapeHtml(sourceNotes)}</p>`
    : evidenceNote && !hasEvidence
      ? `<p class="meta-line">${escapeHtml(evidenceNote)}</p>`
      : "";

  const nearbyYears = getNearbyYears(year);
  const nearbySection = nearbyYears.length > 0 ? `
    <section class="nearby-section">
      <h2 class="section-title">Explore nearby timelines</h2>
      <div class="nearby-years">
        ${nearbyYears.map(y => `<a href="/ritual?place=${encodeURIComponent(place)}&year=${encodeURIComponent(y)}" class="year-link">${y}</a>`).join("\n")}
      </div>
    </section>
  ` : "";

  const audioSection = hasAudio ? `
    <section class="player-section" aria-label="Audio playback">
      <div class="mode-selector" role="tablist" aria-label="Listening modes">
        ${LISTENING_MODES.map((m, i) => `
          <button 
            role="tab" 
            aria-selected="${i === 0 ? 'true' : 'false'}"
            class="mode-btn ${i === 0 ? 'active' : ''}" 
            data-mode="${m.id}"
            aria-controls="player-panel"
          >
            <span class="mode-label">${m.label}</span>
            <span class="mode-desc">${m.description}</span>
          </button>
        `).join("\n")}
      </div>
      
      <div class="main-player" id="player-panel" role="tabpanel">
        <div class="player-visual" aria-hidden="true">
          <canvas id="wave-canvas"></canvas>
        </div>
        <div class="player-controls">
          <button class="play-btn" id="main-play-btn" aria-label="Play">
            <svg class="play-icon" viewBox="0 0 24 24" width="28" height="28"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>
            <svg class="pause-icon hidden" viewBox="0 0 24 24" width="28" height="28"><rect x="5" y="4" width="4" height="16" fill="currentColor"/><rect x="15" y="4" width="4" height="16" fill="currentColor"/></svg>
          </button>
          <div class="progress-track">
            <div class="progress-fill" id="main-progress"></div>
          </div>
          <span class="time-display" id="time-display">0:00</span>
        </div>
        <div class="layer-mixer">
          <div class="mixer-row">
            <span class="mixer-label">Bed</span>
            <input type="range" class="mixer-slider" id="bed-slider" min="0" max="100" value="80" aria-label="Bed volume">
          </div>
          <div class="mixer-row">
            <span class="mixer-label">Events</span>
            <input type="range" class="mixer-slider" id="event-slider" min="0" max="100" value="70" aria-label="Event volume">
          </div>
          <div class="mixer-row">
            <span class="mixer-label">Texture</span>
            <input type="range" class="mixer-slider" id="texture-slider" min="0" max="100" value="60" aria-label="Texture volume">
          </div>
        </div>
      </div>
    </section>
  ` : `
    <section class="player-section empty-state">
      <div class="empty-visual">
        <div class="empty-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <p class="empty-label">Audio layers not available</p>
    </section>
  `;

  const sceneSummary = evidence && evidence.length > 0
    ? evidence.slice(0, 3).map(e => e.description || e.text).filter(Boolean).join("; ")
    : null;

  const errorMessage = error 
    ? `<aside class="error-callout"><p>Generation encountered an issue: ${escapeHtml(error)}</p></aside>` 
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${queryLabel} — Séance</title>
    <meta property="og:title" content="Séance: ${queryLabel}" />
    <meta property="og:description" content="Hear what ${queryLabel} sounded like" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Séance: ${queryLabel}" />
    <meta name="twitter:description" content="Hear what ${queryLabel} sounded like" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    <style>
      ${sharedStyles()}

      .artifact-header {
        text-align: center;
        padding: 20px 0 32px;
      }

      .artifact-badge {
        display: inline-block;
        margin-bottom: 16px;
        padding: 6px 14px;
        border-radius: 999px;
        background: var(--accent-glow);
        font-size: 0.7rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .artifact-badge.archived {
        background: rgba(122, 154, 109, 0.15);
        color: var(--success);
      }

      .artifact-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(2.2rem, 6vw, 3.2rem);
        font-weight: 400;
        color: var(--text);
      }

      .artifact-year {
        display: inline-block;
        margin-top: 12px;
        padding: 8px 16px;
        background: rgba(201, 166, 107, 0.08);
        border-radius: 999px;
        font-family: var(--font-mono);
        font-size: 1rem;
        color: var(--accent);
      }

      .artifact-subtitle {
        margin: 20px auto 0;
        font-size: 1.05rem;
        color: var(--text-dim);
        font-style: italic;
        max-width: 48ch;
        line-height: 1.6;
      }

      .confidence-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 16px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(201, 166, 107, 0.06);
        font-size: 0.8rem;
        color: var(--text-dim);
      }

      .confidence-badge::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent);
      }

      .meta-line {
        margin: 16px auto 0;
        padding: 14px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        background: rgba(201, 166, 107, 0.04);
        font-size: 0.92rem;
        color: var(--text-dim);
        max-width: 52ch;
      }

      .meta-line strong {
        color: var(--text);
      }

      .section-title {
        margin: 40px 0 20px;
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .evidence-grid {
        display: grid;
        gap: 16px;
      }

      .evidence-card {
        padding: 20px 22px;
        border: 1px solid var(--border-subtle);
        border-radius: 18px;
        background: linear-gradient(145deg, var(--bg-elevated) 0%, var(--bg-card) 100%);
      }

      .evidence-excerpt {
        margin: 0;
        font-size: 1rem;
        line-height: 1.7;
        color: var(--text);
        font-style: italic;
      }

      .evidence-meta {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .evidence-source {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .evidence-tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .evidence-tag {
        padding: 3px 8px;
        border-radius: 4px;
        background: rgba(201, 166, 107, 0.08);
        font-size: 0.7rem;
        color: var(--accent-dim);
      }

      .evidence-note {
        margin-top: 16px;
        font-size: 0.9rem;
        color: var(--text-muted);
        font-style: italic;
      }

      .player-section {
        margin-top: 40px;
        padding: 28px;
        border: 1px solid var(--border-subtle);
        border-radius: 24px;
        background: linear-gradient(145deg, var(--bg-elevated) 0%, rgba(30, 24, 18, 0.6) 100%);
      }

      .player-section.empty-state {
        text-align: center;
        padding: 48px 28px;
      }

      .empty-visual {
        margin-bottom: 20px;
      }

      .empty-wave {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 48px;
      }

      .empty-wave span {
        width: 4px;
        background: var(--text-muted);
        border-radius: 2px;
        animation: wave 1s ease-in-out infinite;
      }

      .empty-wave span:nth-child(1) { height: 20%; animation-delay: 0s; }
      .empty-wave span:nth-child(2) { height: 40%; animation-delay: 0.1s; }
      .empty-wave span:nth-child(3) { height: 60%; animation-delay: 0.2s; }
      .empty-wave span:nth-child(4) { height: 80%; animation-delay: 0.3s; }
      .empty-wave span:nth-child(5) { height: 60%; animation-delay: 0.4s; }
      .empty-wave span:nth-child(6) { height: 40%; animation-delay: 0.5s; }
      .empty-wave span:nth-child(7) { height: 20%; animation-delay: 0.6s; }

      @keyframes wave {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.5); }
      }

      .empty-label {
        color: var(--text-muted);
        font-size: 0.95rem;
      }

      .mode-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 24px;
      }

      .mode-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 12px 16px;
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mode-btn:hover {
        background: rgba(201, 166, 107, 0.06);
      }

      .mode-btn.active {
        background: var(--accent-glow);
        border-color: var(--accent-dim);
      }

      .mode-label {
        font-size: 0.95rem;
        color: var(--text);
      }

      .mode-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      .player-visual {
        height: 80px;
        margin-bottom: 20px;
        background: rgba(13, 10, 6, 0.4);
        border-radius: 12px;
        overflow: hidden;
      }

      .player-visual canvas {
        width: 100%;
        height: 100%;
      }

      .player-controls {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }

      .play-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
        color: var(--bg-deep);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s, box-shadow 0.2s;
        box-shadow: 0 4px 20px rgba(201, 166, 107, 0.3);
        flex-shrink: 0;
      }

      .play-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 28px rgba(201, 166, 107, 0.4);
      }

      .hidden { display: none; }

      .progress-track {
        flex: 1;
        height: 6px;
        background: var(--border-subtle);
        border-radius: 3px;
        overflow: hidden;
        cursor: pointer;
      }

      .progress-fill {
        width: 0%;
        height: 100%;
        background: var(--accent);
        transition: width 0.1s linear;
      }

      .time-display {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-muted);
        min-width: 60px;
      }

      .layer-mixer {
        padding-top: 20px;
        border-top: 1px solid var(--border-subtle);
        display: grid;
        gap: 14px;
      }

      .mixer-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .mixer-label {
        width: 60px;
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .mixer-slider {
        flex: 1;
        height: 4px;
        appearance: none;
        background: var(--border-subtle);
        border-radius: 2px;
        cursor: pointer;
      }

      .mixer-slider::-webkit-slider-thumb {
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--accent);
        cursor: pointer;
      }

      .nearby-section {
        margin-top: 40px;
        padding-top: 28px;
        border-top: 1px solid var(--border-subtle);
      }

      .nearby-years {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .year-link {
        padding: 10px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        background: transparent;
        color: var(--text-dim);
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.2s;
      }

      .year-link:hover {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        color: var(--accent);
      }

      .actions-row {
        display: flex;
        gap: 12px;
        margin-top: 32px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn {
        padding: 12px 24px;
        border: 1px solid var(--border-medium);
        border-radius: 999px;
        background: transparent;
        color: var(--text-dim);
        font: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .btn:hover {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        color: var(--accent);
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
        border: none;
        color: var(--bg-deep);
        font-weight: 600;
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #d4b07a 0%, var(--accent) 100%);
        box-shadow: 0 4px 20px rgba(201, 166, 107, 0.3);
      }

      .error-callout {
        margin-top: 24px;
        padding: 16px 20px;
        border: 1px solid rgba(154, 107, 92, 0.3);
        border-radius: 14px;
        background: rgba(154, 107, 92, 0.08);
        color: var(--text-dim);
        font-size: 0.9rem;
      }

      .scene-summary {
        margin-top: 16px;
        padding: 16px 20px;
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        background: rgba(201, 166, 107, 0.04);
        font-size: 1rem;
        color: var(--text-dim);
        font-style: italic;
        line-height: 1.6;
      }

      @media (max-width: 640px) {
        .mode-selector {
          flex-direction: column;
        }

        .player-controls {
          flex-wrap: wrap;
        }

        .progress-track {
          order: 3;
          width: 100%;
          flex: none;
        }

        .mixer-row {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .mixer-label {
          width: auto;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="shell">
        <header class="artifact-header">
          <span class="artifact-badge ${archived ? 'archived' : ''}">${escapeHtml(headerText)}</span>
          <h1 class="artifact-title">${escapeHtml(place)}</h1>
          <span class="artifact-year">${escapeHtml(year)}</span>
          <p class="artifact-subtitle">Reconstructed from archival descriptions</p>
          <span class="confidence-badge">${escapeHtml(confidenceLabel)}</span>
          ${sceneSummary ? `<p class="scene-summary">${escapeHtml(sceneSummary.slice(0, 200))}</p>` : ""}
          ${reinterpretNote}
          ${sourceNote}
          ${partialNote}
        </header>

        ${audioSection}

        ${errorMessage}

        ${evidenceSection}

        ${nearbySection}

        <div class="actions-row">
          <a class="btn btn-primary" href="/ritual?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}">
            <span>Hear again</span>
          </a>
          <a class="btn" href="/">
            <span>New reconstruction</span>
          </a>
        </div>
      </div>
    </main>
    ${hasAudio ? `
    <script>
      (function() {
        var audioCtx = null;
        var isPlaying = false;
        var audioBuffer = null;
        var sourceNode = null;
        var startTime = 0;
        var pauseTime = 0;
        var animationId = null;
        var gainNodes = {};

        var playBtn = document.getElementById('main-play-btn');
        var playIcon = document.querySelector('.play-icon');
        var pauseIcon = document.querySelector('.pause-icon');
        var progress = document.getElementById('main-progress');
        var timeDisplay = document.getElementById('time-display');
        var canvas = document.getElementById('wave-canvas');
        var ctx = canvas ? canvas.getContext('2d') : null;

        var bedSlider = document.getElementById('bed-slider');
        var eventSlider = document.getElementById('event-slider');
        var textureSlider = document.getElementById('texture-slider');

        function initAudio() {
          if (audioCtx) return;
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          
          gainNodes.bed = audioCtx.createGain();
          gainNodes.event = audioCtx.createGain();
          gainNodes.texture = audioCtx.createGain();
          
          gainNodes.bed.connect(audioCtx.destination);
          gainNodes.event.connect(audioCtx.destination);
          gainNodes.texture.connect(audioCtx.destination);

          updateGains();
        }

        function updateGains() {
          if (!audioCtx) return;
          var b = parseInt(bedSlider.value) / 100;
          var e = parseInt(eventSlider.value) / 100;
          var t = parseInt(textureSlider.value) / 100;
          gainNodes.bed.gain.value = b * 0.8;
          gainNodes.event.gain.value = e * 0.7;
          gainNodes.texture.gain.value = t * 0.6;
        }

        bedSlider.addEventListener('input', updateGains);
        eventSlider.addEventListener('input', updateGains);
        textureSlider.addEventListener('input', updateGains);

        async function loadAudio() {
          if (audioBuffer) return;
          try {
            var base64Data = ${JSON.stringify(audioLayers || {})};
            var audioData = null;
            
            // Check if it's a URL (R2 or external)
            if (base64Data.bed && (base64Data.bed.startsWith('http://') || base64Data.bed.startsWith('https://'))) {
              console.log('Loading audio from URL:', base64Data.bed);
              var response = await fetch(base64Data.bed);
              if (!response.ok) throw new Error('Failed to fetch audio');
              var arrayBuffer = await response.arrayBuffer();
              audioData = new Uint8Array(arrayBuffer);
            } else if (base64Data.bed && base64Data.bed.startsWith('mock_')) {
              // Mock audio - generate white noise for demo
              console.log('Using mock audio (no real audio generated)');
              audioData = generateWhiteNoise(44100 * 10); // 10 seconds of noise
            } else if (base64Data.bed) {
              // Legacy base64 encoded audio
              var binaryString = atob(base64Data.bed);
              audioData = new Uint8Array(binaryString.length);
              for (var i = 0; i < binaryString.length; i++) audioData[i] = binaryString.charCodeAt(i);
            }
            
            if (audioData) {
              audioBuffer = await audioCtx.decodeAudioData(audioData.buffer);
            }
          } catch (e) {
            console.log('Audio load error:', e.message);
          }
        }
        
        function generateWhiteNoise(sampleRate, durationSeconds) {
          var length = sampleRate * durationSeconds;
          var buffer = new Uint8Array(length);
          for (var i = 0; i < length; i++) {
            buffer[i] = Math.random() * 256;
          }
          return buffer;
        }

        function drawWave() {
          if (!ctx || !audioBuffer) return;
          var width = canvas.width;
          var height = canvas.height;
          var data = audioBuffer.getChannelData(0);
          var step = Math.ceil(data.length / width);
          var amp = height / 2;
          
          ctx.fillStyle = 'rgba(13, 10, 6, 0.3)';
          ctx.fillRect(0, 0, width, height);
          
          ctx.beginPath();
          ctx.moveTo(0, amp);
          
          for (var i = 0; i < width; i++) {
            var min = 1.0;
            var max = -1.0;
            for (var j = 0; j < step; j++) {
              var datum = data[(i * step) + j];
              if (datum < min) min = datum;
              if (datum > max) max = datum;
            }
            ctx.lineTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
          }
          
          ctx.strokeStyle = '#c9a66b';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        function updateTime() {
          if (!isPlaying || !audioBuffer) return;
          var elapsed = (pauseTime + audioCtx.currentTime - startTime) % audioBuffer.duration;
          var pct = (elapsed / audioBuffer.duration) * 100;
          progress.style.width = pct + '%';
          
          var curr = Math.floor(elapsed);
          var mins = Math.floor(curr / 60);
          var secs = curr % 60;
          timeDisplay.textContent = mins + ':' + String(secs).padStart(2, '0');
          
          drawWave();
          animationId = requestAnimationFrame(updateTime);
        }

        playBtn.addEventListener('click', async function() {
          initAudio();
          await loadAudio();
          if (!audioBuffer) return;

          if (isPlaying) {
            sourceNode.stop();
            pauseTime += audioCtx.currentTime - startTime;
            isPlaying = false;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            sourceNode = null;
            cancelAnimationFrame(animationId);
          } else {
            sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(gainNodes.bed);
            sourceNode.connect(gainNodes.event);
            sourceNode.connect(gainNodes.texture);
            
            sourceNode.onended = function() {
              if (isPlaying) {
                isPlaying = false;
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                pauseTime = 0;
                progress.style.width = '0%';
                timeDisplay.textContent = '0:00';
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

        document.querySelector('.progress-track').addEventListener('click', function(e) {
          if (!audioBuffer) return;
          var rect = e.target.getBoundingClientRect();
          var pct = (e.clientX - rect.left) / rect.width;
          var seekTime = pct * audioBuffer.duration;
          if (isPlaying) {
            sourceNode.stop();
            pauseTime = seekTime;
            sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(gainNodes.bed);
            sourceNode.connect(gainNodes.event);
            sourceNode.connect(gainNodes.texture);
            sourceNode.start(0, pauseTime);
            startTime = audioCtx.currentTime;
          } else {
            pauseTime = seekTime;
          }
        });

        var modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            modeBtns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            var mode = btn.dataset.mode;
            if (mode === 'atmosphere') {
              bedSlider.value = 90; eventSlider.value = 30; textureSlider.value = 80;
            } else if (mode === 'streetlife') {
              bedSlider.value = 50; eventSlider.value = 90; textureSlider.value = 40;
            } else if (mode === 'machines') {
              bedSlider.value = 80; eventSlider.value = 20; textureSlider.value = 30;
            } else if (mode === 'voices') {
              bedSlider.value = 40; eventSlider.value = 80; textureSlider.value = 60;
            } else {
              bedSlider.value = 80; eventSlider.value = 70; textureSlider.value = 60;
            }
            updateGains();
          });
        });
      })();
    </script>
    ` : ""}
  </body>
</html>`;
}