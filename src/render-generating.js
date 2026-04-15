import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

const STAGES = [
  { key: "locating", label: "Locating place in time", hint: "Finding geographic and temporal coordinates" },
  { key: "resolving", label: "Resolving historical identity", hint: "Determining period-appropriate naming" },
  { key: "searching", label: "Searching for sensory evidence", hint: "Scanning archives for descriptions" },
  { key: "extracting", label: "Extracting sound cues", hint: "Identifying ambient, human, and mechanical sounds" },
  { key: "composing", label: "Composing ambient field", hint: "Building the foundation soundscape" },
  { key: "binding", label: "Binding the final scene", hint: "Synthesizing audio layers" },
];

function getStageFromJobState(jobState, jobStage) {
  if (jobState === "failed") return -1;
  if (jobState === "completed") return STAGES.length;
  
  const stageMap = {
    "EVIDENCE": 2,
    "PROMPTS": 3,
    "GENERATING": 4,
    "STORING": 5,
  };
  
  return stageMap[jobState] ?? 0;
}

export function renderGenerating({ place, year, redirectTo = null, jobId = null, stage = "Gathering historical evidence", jobState = null, jobStage = null }) {
  const redirectUrl = redirectTo ?? `/artifact?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}`;
  const currentStageIndex = jobId ? getStageFromJobState(jobState, jobStage) : 0;
  
  const stagesHtml = STAGES.map((s, i) => {
    const isActive = i === currentStageIndex;
    const isPast = i < currentStageIndex;
    const stateClass = isPast ? "past" : isActive ? "active" : "pending";
    return `
      <li class="stage-item ${stateClass}">
        <span class="stage-indicator" aria-hidden="true">
          ${isPast ? "✓" : i + 1}
        </span>
        <div class="stage-content">
          <span class="stage-label">${escapeHtml(s.label)}</span>
          <span class="stage-hint">${escapeHtml(s.hint)}</span>
        </div>
      </li>
    `;
  }).join("\n");

  const pollScript = jobId ? `
    <script>
      (function() {
        var jobId = "${jobId}";
        var redirectUrl = "${redirectUrl}";
        var maxAttempts = 60;
        var attempts = 0;
        
        var stages = ${JSON.stringify(STAGES.map(s => s.label))};
        var stageElements = document.querySelectorAll('.stage-item');
        var currentStageEl = document.getElementById('current-stage-label');
        var findingsEl = document.getElementById('findings-list');
        
        var findingsTemplates = [
          "Detected: ambient street activity",
          "Atmosphere: dense urban environment",
          "Detected: vendor voices, market traffic",
          "Evidence: period-appropriate machinery",
          "Detected: evening movement patterns",
          "Atmosphere: warm, crowded streets",
          "Evidence: colonial-era infrastructure sounds",
          "Detected: human activity clusters",
        ];
        
        function updateUI(state, stage) {
          var stageIndex = -1;
          if (state === 'completed') stageIndex = stages.length;
          else if (state === 'evidence') stageIndex = 2;
          else if (state === 'prompts') stageIndex = 3;
          else if (state === 'generating') stageIndex = 4;
          else if (state === 'storing') stageIndex = 5;
          
          stageElements.forEach(function(el, i) {
            el.classList.remove('active', 'past');
            if (i < stageIndex) el.classList.add('past');
            else if (i === stageIndex) el.classList.add('active');
          });
          
          if (stageIndex >= 0 && stageIndex < stages.length) {
            currentStageEl.textContent = stages[stageIndex];
          }
          
          if (stageIndex >= 2 && findingsEl.children.length < 3) {
            var idx = Math.min(stageIndex - 2, findingsTemplates.length - 1);
            var finding = document.createElement('li');
            finding.textContent = findingsTemplates[idx];
            findingsEl.appendChild(finding);
          }
        }
        
        function checkStatus() {
          fetch("/job/status?id=" + jobId)
            .then(function(r) { return r.json(); })
            .then(function(data) {
              attempts++;
              if (data.state === "completed") {
                window.location.href = redirectUrl + "&generated=true&jobId=" + jobId;
              } else if (data.state === "failed") {
                window.location.href = redirectUrl + "&error=" + encodeURIComponent(data.error || "generation failed");
              } else if (attempts >= maxAttempts) {
                window.location.href = redirectUrl;
              } else {
                updateUI(data.state, data.stage);
                setTimeout(checkStatus, 2500);
              }
            })
            .catch(function() {
              setTimeout(checkStatus, 2500);
            });
        }
        
        setTimeout(checkStatus, 2000);
      })();
    </script>
  ` : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reconstructing — ${escapeHtml(place)}, ${escapeHtml(year)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    <style>
      ${sharedStyles()}

      .generating-hero {
        text-align: center;
        padding: 20px 0 32px;
      }

      .gen-header {
        margin: 0 0 8px;
        font-size: 0.7rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .gen-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 2.8rem);
        font-weight: 400;
        color: var(--text);
      }

      .gen-year {
        display: inline-block;
        margin-top: 8px;
        padding: 6px 14px;
        background: var(--accent-glow);
        border-radius: 999px;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--accent);
      }

      .current-stage {
        margin: 32px 0 24px;
        padding: 24px 28px;
        background: linear-gradient(145deg, rgba(201, 166, 107, 0.06) 0%, rgba(201, 166, 107, 0.02) 100%);
        border: 1px solid var(--border-subtle);
        border-radius: 20px;
        text-align: center;
      }

      .stage-indicator-anim {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-bottom: 16px;
      }

      .stage-dot {
        width: 8px;
        height: 8px;
        background: var(--accent);
        border-radius: 50%;
        animation: pulse 1.6s ease-in-out infinite;
      }

      .stage-dot:nth-child(2) { animation-delay: 0.25s; }
      .stage-dot:nth-child(3) { animation-delay: 0.5s; }
      .stage-dot:nth-child(4) { animation-delay: 0.75s; }
      .stage-dot:nth-child(5) { animation-delay: 1s; }

      @keyframes pulse {
        0%, 100% { transform: scale(0.6); opacity: 0.4; }
        50% { transform: scale(1); opacity: 1; }
      }

      .current-stage-label {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-style: italic;
        color: var(--text-dim);
      }

      .stages-list {
        display: grid;
        gap: 10px;
        margin: 32px 0 0;
        padding: 0;
        list-style: none;
      }

      .stage-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        background: rgba(255, 253, 249, 0.02);
        transition: all 0.3s;
      }

      .stage-item.pending {
        opacity: 0.4;
      }

      .stage-item.active {
        background: rgba(201, 166, 107, 0.06);
        border-color: var(--accent-dim);
      }

      .stage-item.past {
        opacity: 0.7;
      }

      .stage-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--bg-elevated);
        font-size: 0.75rem;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .stage-item.active .stage-indicator {
        background: var(--accent);
        color: var(--bg-deep);
      }

      .stage-item.past .stage-indicator {
        background: var(--success, #7a9a6d);
        color: var(--bg-deep);
      }

      .stage-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stage-label {
        font-size: 0.95rem;
        color: var(--text);
      }

      .stage-hint {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-style: italic;
      }

      .findings-panel {
        margin-top: 32px;
        padding: 20px 24px;
        border: 1px solid var(--border-subtle);
        border-radius: 18px;
        background: rgba(30, 24, 18, 0.4);
      }

      .findings-title {
        margin: 0 0 14px;
        font-size: 0.7rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .findings-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .finding-item {
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(201, 166, 107, 0.04);
        font-size: 0.9rem;
        color: var(--text-dim);
        animation: fadeIn 0.4s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .nav-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 32px;
        color: var(--text-muted);
        font-size: 0.9rem;
        text-decoration: none;
        transition: color 0.2s;
      }

      .nav-back:hover {
        color: var(--accent);
      }

      .nav-back::before {
        content: "←";
      }
    </style>
    ${pollScript}
  </head>
  <body>
    <main>
      <div class="shell">
        <header class="generating-hero">
          <p class="gen-header">Reconstructing the atmosphere</p>
          <h1 class="gen-title">${escapeHtml(place)}</h1>
          <span class="gen-year">${escapeHtml(year)}</span>
        </header>

        <div class="current-stage">
          <div class="stage-indicator-anim" aria-hidden="true">
            <span class="stage-dot"></span>
            <span class="stage-dot"></span>
            <span class="stage-dot"></span>
            <span class="stage-dot"></span>
            <span class="stage-dot"></span>
          </div>
          <p class="current-stage-label" id="current-stage-label">Locating place in time</p>
        </div>

        <ol class="stages-list">
          ${stagesHtml}
        </ol>

        <aside class="findings-panel">
          <h2 class="findings-title">Live findings</h2>
          <ul class="findings-list" id="findings-list">
            <li class="finding-item">Searching archives...</li>
          </ul>
        </aside>

        <a class="nav-back" href="/">Start over</a>
      </div>
    </main>
  </body>
</html>`;
}