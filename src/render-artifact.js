import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

const LISTENING_MODES = [
  { id: "full", label: "Full Scene", description: "All layers combined", icon: "layers" },
  { id: "atmosphere", label: "Atmosphere", description: "Ambient bed and texture", icon: "air" },
  { id: "streetlife", label: "Street Life", description: "Human activity emphasis", icon: "groups" },
  { id: "machines", label: "Machines", description: "Mechanical and industrial", icon: "precision_manufacturing" },
  { id: "voices", label: "Voices", description: "Crowd and speech elements", icon: "record_voice_over" },
];

const CONFIDENCE_LABELS = {
  high: "High Confidence — Archival Convergence",
  medium: "Moderate Inference",
  low: "Sparse Evidence",
  gemini: "AI Gen Context",
};

function getConfidenceLabel(confidence) {
  return CONFIDENCE_LABELS[confidence] ?? "Spectral Density: Unknown";
}

function formatEvidence(evidence) {
  if (!evidence || evidence.length === 0) return "";
  
  return evidence.slice(0, 4).map((e, i) => `
    <div class="shard-blur border border-white/5 rounded-2xl p-6 hover:bg-white/5 hover:border-white/10 transition-all duration-500 transform hover:-translate-y-1 group">
        <div class="flex items-start justify-between gap-4 mb-3">
            <span class="text-[8px] font-label uppercase tracking-[0.2em] text-accent/60">Fragment ${i + 1}</span>
            ${e.reliability ? `<span class="text-[8px] font-label text-on-surface-variant/30">${Math.round(e.reliability * 100)}%</span>` : ""}
        </div>
        <p class="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3 group-hover:text-on-surface transition-colors">
            "${escapeHtml(e.description || e.text || "No description")}"
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
            ${e.source ? `<span class="px-2 py-1 bg-white/5 rounded text-[10px] font-label uppercase tracking-widest text-on-surface-variant/80">${escapeHtml(e.source)}</span>` : ""}
            ${e.tags ? e.tags.split(",").map(t => `<span class="px-2 py-1 bg-accent/10 text-accent/80 rounded text-[10px] font-label uppercase tracking-widest">${escapeHtml(t.trim())}</span>`).join("") : ""}
        </div>
    </div>
  `).join("\n");
}

export function renderArtifact({ place, year, archived = false, confidence = "high", confidenceScore = null, reinterpretation = null, generated = false, error = null, audioLayers = null, evidence = null, evidenceNote = null, sourceNotes = null, partial = false }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");
  const headerText = archived ? "Echo Recovered" : generated ? "Resonance Established" : "Séance Active";
  const confidenceLabel = getConfidenceLabel(confidence);
  const hasAudio = audioLayers && (audioLayers.bed || audioLayers.event || audioLayers.texture);
  const hasEvidence = evidence && evidence.length > 0;
  const listeningModesHtml = LISTENING_MODES.map(mode => `
    <button 
      class="listening-mode-btn flex flex-col items-center gap-2 px-4 py-3 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all duration-300 group"
      data-mode="${mode.id}"
      aria-label="${mode.label}: ${mode.description}"
    >
      <span class="material-symbols-outlined text-xl text-on-surface-variant/60 group-hover:text-accent transition-colors">${mode.icon}</span>
      <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 group-hover:text-on-surface transition-colors">${mode.label}</span>
    </button>
  `).join("");

  const errorMessage = error 
    ? `<div class="fixed top-24 left-1/2 -translate-x-1/2 glass border border-red-900/30 text-red-400 px-6 py-3 rounded-full text-xs font-label uppercase tracking-widest z-50 animate-fade-in">Signal Interference: ${escapeHtml(error)}</div>` 
    : "";

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Listen to ${escapeHtml(place)} in ${escapeHtml(year)}. An AI-reconstructed historical soundscape." />
    <title>Séance - ${escapeHtml(place)}, ${escapeHtml(year)}</title>
    ${sharedHead()}
  </head>
  <body class="bg-[#050505] text-on-background font-body selection:bg-tertiary/30 min-h-screen overflow-x-hidden relative">
     
    <!-- Ambient Noise Layer -->
    <div class="noise"></div>
    
    <!-- Fog and Grain Layers -->
    <div class="fixed inset-0 grain-overlay z-10 pointer-events-none"></div>
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a0a] via-[#050505] to-black z-0 pointer-events-none"></div>
    
    <!-- Navigation -->
    <header class="fixed top-0 left-0 w-full z-50 glass">
        <div class="flex justify-between items-center px-6 md:px-12 py-4">
            <a href="/" class="flex items-center gap-3 text-white/60 hover:text-white transition-all duration-500 group">
                <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span class="font-label text-xs uppercase tracking-[0.2em] hidden sm:inline">New Invocation</span>
            </a>
            
            <div class="flex items-center gap-4">
                <button id="share-btn" class="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-white/60 hover:text-white" aria-label="Share this soundscape">
                    <span class="material-symbols-outlined text-sm">share</span>
                    <span class="font-label text-[10px] uppercase tracking-widest hidden sm:inline">Share</span>
                </button>
                <a href="/how-it-works" class="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-white/60 hover:text-white">
                    <span class="material-symbols-outlined text-sm">info</span>
                    <span class="font-label text-[10px] uppercase tracking-widest hidden sm:inline">About</span>
                </a>
            </div>
        </div>
    </header>

    ${errorMessage}

    <main class="relative z-20 pt-20 pb-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto flex flex-col min-h-[90vh]">
        
        <!-- Header Information -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-in-up">
            <div class="lg:col-span-8 flex flex-col justify-end">
                <p class="font-label uppercase text-[10px] tracking-[0.4em] text-accent/60 mb-4 flex items-center gap-2">
                    <span class="w-8 h-px bg-accent/30"></span>
                    ${escapeHtml(headerText)}
                </p>
                <h1 class="font-headline italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary tracking-tight leading-none mb-4 break-words">
                    ${escapeHtml(place)}
                </h1>
                <div class="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <span class="font-headline text-2xl sm:text-3xl text-on-surface-variant/60">${escapeHtml(year)}</span>
                    <div class="h-px w-12 sm:w-24 bg-white/10 hidden sm:block"></div>
                    <span class="font-label text-[10px] uppercase tracking-widest text-accent/70">${escapeHtml(confidenceLabel)}</span>
                </div>
            </div>
            
            <div class="lg:col-span-4 flex flex-col justify-end">
                <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed sm:text-right">
                    ${reinterpretation?.reinterpreted ? `<em class="text-accent/80">Note:</em> ${escapeHtml(reinterpretation.note)}` : sourceNotes ? escapeHtml(sourceNotes) : "Audio projection constructed from fragmentary archival evidence."}
                    ${partial ? "<br/><span class='text-amber-400 mt-2 block font-label text-[10px] uppercase tracking-widest'>Partial Reconstruction</span>" : ""}
                </p>
            </div>
        </div>

        ${hasAudio ? `
        <!-- The Mixing Conduit (Vox Aeterna Player) -->
        <div class="mb-16 lg:mb-24 animate-fade-in-up stagger-1">
            
            <!-- Listening Modes -->
            <div class="flex flex-wrap justify-center gap-3 mb-12">
                ${listeningModesHtml}
            </div>

            <!-- Master Control -->
            <div class="flex justify-center mb-10 md:mb-14 relative">
                <!-- Decorative rings -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div id="play-pulse-ring" class="w-24 h-24 md:w-28 md:h-28 rounded-full border border-white/5 scale-100 opacity-40 transition-all duration-1000"></div>
                    <div id="play-pulse-ring-outer" class="absolute w-32 h-32 md:w-36 md:h-36 rounded-full border border-white/[0.02] scale-100 animate-pulse-slow"></div>
                </div>
                
                <button id="main-play-btn" class="group relative w-20 h-20 md:w-24 md:h-24 rounded-full glass border border-white/10 flex items-center justify-center hover:border-white/20 hover:bg-white/5 transition-all duration-500 ease-out z-10 hover:scale-105 active:scale-95" aria-label="Play or pause soundscape">
                    <span class="play-icon material-symbols-outlined text-3xl md:text-4xl text-white font-light group-hover:text-accent transition-colors duration-300">play_arrow</span>
                    <span class="pause-icon material-symbols-outlined text-3xl md:text-4xl text-white font-light group-hover:text-accent transition-colors duration-300 hidden">pause</span>
                </button>
            </div>
            
            <!-- Progress Line -->
            <div class="w-full max-w-3xl mx-auto mb-10 md:mb-14 group cursor-pointer" id="progress-container" role="slider" aria-label="Playback progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
                <div class="flex justify-between items-end mb-4 px-2">
                    <span class="font-mono text-xs text-on-surface-variant/50 tabular-nums" id="time-display">00:00</span>
                    <span class="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/30 hidden sm:block">Timeline</span>
                    <span class="font-mono text-xs text-on-surface-variant/50 tabular-nums" id="duration-display">--:--</span>
                </div>
                <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all duration-300">
                    <div id="main-progress" class="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-accent-dim to-accent transition-all duration-100 ease-linear"></div>
                </div>
                <div class="mt-4 h-10 w-full opacity-30 group-hover:opacity-70 transition-opacity duration-500 overflow-hidden rounded">
                    <canvas id="wave-canvas" class="w-full h-full"></canvas>
                </div>
            </div>

            <!-- Light Rills (Sliders) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-3xl mx-auto px-4">
                
                <!-- Rill: Bed -->
                <div class="flex flex-col gap-4 group">
                    <div class="flex justify-between items-center">
                        <label class="font-headline italic text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                            <span class="material-symbols-outlined text-base text-accent/60">air</span>
                            Atmosphere
                        </label>
                        <span class="font-mono text-xs text-on-surface-variant/50 tabular-nums" id="bed-val">80%</span>
                    </div>
                    <div class="relative h-14 flex items-center">
                        <input type="range" id="bed-slider" min="0" max="100" value="80" class="absolute w-full h-full opacity-0 cursor-pointer z-20" aria-label="Atmosphere volume">
                        <div class="w-full h-[2px] bg-white/10 relative z-10 group-hover:bg-white/15 transition-colors rounded-full">
                            <div id="bed-fill" class="absolute top-1/2 -translate-y-1/2 left-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-400 w-[80%] rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-75"></div>
                            <div id="bed-thumb" class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white left-[80%] -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-75 group-hover:scale-125 group-active:scale-150"></div>
                        </div>
                    </div>
                </div>

                <!-- Rill: Event -->
                <div class="flex flex-col gap-4 group">
                    <div class="flex justify-between items-center">
                        <label class="font-headline italic text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                            <span class="material-symbols-outlined text-base text-accent/60">notifications</span>
                            Events
                        </label>
                        <span class="font-mono text-xs text-on-surface-variant/50 tabular-nums" id="event-val">70%</span>
                    </div>
                    <div class="relative h-14 flex items-center">
                        <input type="range" id="event-slider" min="0" max="100" value="70" class="absolute w-full h-full opacity-0 cursor-pointer z-20" aria-label="Events volume">
                        <div class="w-full h-[2px] bg-white/10 relative z-10 group-hover:bg-white/15 transition-colors rounded-full">
                            <div id="event-fill" class="absolute top-1/2 -translate-y-1/2 left-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 w-[70%] rounded-full shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-75"></div>
                            <div id="event-thumb" class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white left-[70%] -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-75 group-hover:scale-125 group-active:scale-150"></div>
                        </div>
                    </div>
                </div>

                <!-- Rill: Texture -->
                <div class="flex flex-col gap-4 group">
                    <div class="flex justify-between items-center">
                        <label class="font-headline italic text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                            <span class="material-symbols-outlined text-base text-accent/60">texture</span>
                            Texture
                        </label>
                        <span class="font-mono text-xs text-on-surface-variant/50 tabular-nums" id="texture-val">60%</span>
                    </div>
                    <div class="relative h-14 flex items-center">
                        <input type="range" id="texture-slider" min="0" max="100" value="60" class="absolute w-full h-full opacity-0 cursor-pointer z-20" aria-label="Texture volume">
                        <div class="w-full h-[2px] bg-white/10 relative z-10 group-hover:bg-white/15 transition-colors rounded-full">
                            <div id="texture-fill" class="absolute top-1/2 -translate-y-1/2 left-0 h-full bg-gradient-to-r from-zinc-400 to-zinc-300 w-[60%] rounded-full shadow-[0_0_12px_rgba(212,212,216,0.3)] transition-all duration-75"></div>
                            <div id="texture-thumb" class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white left-[60%] -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-75 group-hover:scale-125 group-active:scale-150"></div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Keyboard Shortcuts Hint -->
            <div class="flex justify-center mt-8 opacity-40 hover:opacity-70 transition-opacity duration-500">
                <div class="flex items-center gap-3 text-[10px] text-on-surface-variant/50 font-label">
                    <kbd class="px-2 py-1 bg-white/5 border border-white/10 rounded">Space</kbd>
                    <span>Play/Pause</span>
                    <span class="mx-2 opacity-30">|</span>
                    <kbd class="px-2 py-1 bg-white/5 border border-white/10 rounded">←</kbd>
                    <kbd class="px-2 py-1 bg-white/5 border border-white/10 rounded">→</kbd>
                    <span>Seek</span>
                </div>
            </div>
        </div>
        ` : `
        <div class="mb-32 flex flex-col items-center justify-center opacity-30">
            <div class="w-24 h-24 rounded-full border border-white/10 border-dashed flex items-center justify-center mb-6">
                <span class="material-symbols-outlined text-4xl font-light">mic_off</span>
            </div>
            <p class="font-label uppercase tracking-widest text-xs text-center">Acoustic Shadow<br/><span class="text-[9px] opacity-70 normal-case mt-2 block">No audio layers reconstructed</span></p>
        </div>
        `}

        <!-- Floating Evidence Shards -->
        ${hasEvidence ? `
        <div class="mt-auto animate-fade-in-up stagger-2">
            <div class="flex items-center gap-4 mb-8">
                <div class="h-px w-8 bg-white/10"></div>
                <h2 class="font-label uppercase text-[9px] tracking-[0.4em] text-on-surface-variant/40">Fragments of Origin</h2>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                ${formatEvidence(evidence)}
            </div>
            ${evidenceNote ? `<p class="mt-8 font-body text-xs sm:text-sm text-on-surface-variant/50 max-w-2xl italic leading-relaxed">${escapeHtml(evidenceNote)}</p>` : ""}
        </div>
        ` : ""}

        <!-- Nearby Years -->
        <div class="mt-16 pt-8 border-t border-white/5">
            <p class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40 mb-4">Explore Nearby Years</p>
            <div class="flex flex-wrap gap-3">
                ${[year - 20, year - 10, year + 10, year + 20].filter(y => y > 0 && y <= 2100).map(y => `
                    <a href="/artifact?place=${encodeURIComponent(place)}&year=${y}" class="px-4 py-2 rounded-full border border-white/10 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent">
                        ${y}
                    </a>
                `).join("")}
            </div>
        </div>
    </main>

    <!-- Toast Notification -->
    <div id="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full border border-white/10 opacity-0 translate-y-4 pointer-events-none transition-all duration-300 z-50">
        <span class="font-label text-xs text-on-surface-variant flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-accent">check</span>
            <span id="toast-message">Link copied to clipboard</span>
        </span>
    </div>

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
        var currentMode = 'full';

        var playBtn = document.getElementById('main-play-btn');
        var playIcon = document.querySelector('.play-icon');
        var pauseIcon = document.querySelector('.pause-icon');
        var pulseRing = document.getElementById('play-pulse-ring');
        var progressContainer = document.getElementById('progress-container');
        var progressLine = document.getElementById('main-progress');
        var timeDisplay = document.getElementById('time-display');
        var durationDisplay = document.getElementById('duration-display');
        var canvas = document.getElementById('wave-canvas');
        var ctx = canvas ? canvas.getContext('2d') : null;

        var bedSlider = document.getElementById('bed-slider');
        var eventSlider = document.getElementById('event-slider');
        var textureSlider = document.getElementById('texture-slider');

        // Mode configurations
        var modeConfigs = {
          full: { bed: 0.8, event: 0.7, texture: 0.6 },
          atmosphere: { bed: 0.9, event: 0.0, texture: 0.5 },
          streetlife: { bed: 0.4, event: 0.8, texture: 0.7 },
          machines: { bed: 0.9, event: 0.3, texture: 0.2 },
          voices: { bed: 0.2, event: 0.9, texture: 0.5 }
        };

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
          var config = modeConfigs[currentMode] || modeConfigs.full;
          var b = parseInt(bedSlider.value) / 100 * config.bed;
          var e = parseInt(eventSlider.value) / 100 * config.event;
          var t = parseInt(textureSlider.value) / 100 * config.texture;
          gainNodes.bed.gain.value = b;
          gainNodes.event.gain.value = e;
          gainNodes.texture.gain.value = t;
        }

        function bindSliderUI(id) {
            var slider = document.getElementById(id + '-slider');
            if(!slider) return;
            var fill = document.getElementById(id + '-fill');
            var thumb = document.getElementById(id + '-thumb');
            var valDisplay = document.getElementById(id + '-val');

            slider.addEventListener('input', function() {
                var val = this.value;
                if(fill) fill.style.width = val + '%';
                if(thumb) thumb.style.left = val + '%';
                if(valDisplay) valDisplay.textContent = val + '%';
                updateGains();
            });
        }

        bindSliderUI('bed');
        bindSliderUI('event');
        bindSliderUI('texture');

        // Listening mode buttons
        document.querySelectorAll('.listening-mode-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var mode = this.dataset.mode;
            currentMode = mode;
            
            document.querySelectorAll('.listening-mode-btn').forEach(function(b) {
              b.classList.remove('border-accent/30', 'bg-accent/5');
            });
            this.classList.add('border-accent/30', 'bg-accent/5');
            
            updateGains();
          });
        });

        // Set initial mode
        document.querySelector('.listening-mode-btn[data-mode="full"]')?.classList.add('border-accent/30', 'bg-accent/5');

        var buffers = { bed: null, event: null, texture: null };
        var sourceNodes = { bed: null, event: null, texture: null };
        var mainDuration = 0;

        async function fetchLayer(url) {
          if (!url) return null;
          try {
            if (url.startsWith('mock_')) {
              var data = generateWhiteNoise(44100 * 10);
              return await audioCtx.decodeAudioData(data.buffer);
            }
            if (url.startsWith('http')) {
              var response = await fetch('/audio-proxy?url=' + encodeURIComponent(url));
              if (!response.ok) return null;
              return await audioCtx.decodeAudioData(await response.arrayBuffer());
            }
            var binaryString = atob(url);
            var data = new Uint8Array(binaryString.length);
            for (var i = 0; i < binaryString.length; i++) data[i] = binaryString.charCodeAt(i);
            return await audioCtx.decodeAudioData(data.buffer);
          } catch(e) {
            console.warn('Failed to load layer', e);
            return null;
          }
        }

        async function loadAudio() {
          if (buffers.bed) return;
          
          var base64Data = ${JSON.stringify(audioLayers || {})};
          playBtn.style.opacity = '0.5';
          playBtn.style.pointerEvents = 'none';
          if(playIcon) playIcon.innerText = "hourglass_empty";
          
          var eventUrl = base64Data.events && base64Data.events.length > 0 ? base64Data.events[0].audioUrl : base64Data.human;
          
          const [bedBuf, texBuf, evtBuf] = await Promise.all([
            fetchLayer(base64Data.bed),
            fetchLayer(base64Data.texture),
            fetchLayer(eventUrl)
          ]);
          
          buffers.bed = bedBuf;
          buffers.texture = texBuf;
          buffers.event = evtBuf;
          
          if (buffers.bed) mainDuration = buffers.bed.duration;
          else if (buffers.texture) mainDuration = buffers.texture.duration;
          else if (buffers.event) mainDuration = buffers.event.duration;
          
          if (mainDuration && durationDisplay) {
              var mins = Math.floor(mainDuration / 60);
              var secs = Math.floor(mainDuration % 60);
              durationDisplay.textContent = mins + ':' + String(secs).padStart(2, '0');
          }

          playBtn.style.opacity = '1';
          playBtn.style.pointerEvents = 'auto';
          if(playIcon) playIcon.innerText = "play_arrow";
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
          if (!ctx) return;
          var buffer = buffers.bed || buffers.texture || buffers.event;
          if (!buffer) return;
          
          var width = canvas.width = canvas.offsetWidth;
          var height = canvas.height = canvas.offsetHeight;
          var data = buffer.getChannelData(0);
          var step = Math.ceil(data.length / width);
          var amp = height / 2;
          
          ctx.clearRect(0, 0, width, height);
          
          // Gradient for wave
          var gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, 'rgba(201, 166, 107, 0.3)');
          gradient.addColorStop(0.5, 'rgba(201, 166, 107, 0.5)');
          gradient.addColorStop(1, 'rgba(201, 166, 107, 0.3)');
          
          ctx.beginPath();
          ctx.moveTo(0, amp);
          
          for (var i = 0; i < width; i++) {
            var min = 1.0;
            var max = -1.0;
            for (var j = 0; j < Math.min(step, data.length - (i * step)); j++) {
              var datum = data[(i * step) + j];
              if (datum < min) min = datum;
              if (datum > max) max = datum;
            }
            if(isFinite(min) && isFinite(max)) {
                ctx.lineTo(i, (1 + min) * amp * 0.8);
                ctx.lineTo(i, (1 + max) * amp * 0.8);
            }
          }
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        function updateTime() {
          if (!isPlaying || !mainDuration) return;
          var elapsed = (pauseTime + audioCtx.currentTime - startTime) % mainDuration;
          var pct = (elapsed / mainDuration) * 100;
          if(progressLine) progressLine.style.width = pct + '%';
          if(progressContainer) progressContainer.setAttribute('aria-valuenow', Math.round(pct));
          
          var curr = Math.floor(elapsed);
          var mins = Math.floor(curr / 60);
          var secs = curr % 60;
          if(timeDisplay) timeDisplay.textContent = mins + ':' + String(secs).padStart(2, '0');
          
          if (pulseRing) {
              var scale = 1 + (Math.sin(elapsed * 2) * 0.1);
              pulseRing.style.transform = 'scale(' + scale + ')';
              pulseRing.style.opacity = 0.2 + (Math.sin(elapsed * 4) * 0.1);
          }

          animationId = requestAnimationFrame(updateTime);
        }

        function stopSources() {
          ['bed', 'event', 'texture'].forEach(function(layer) {
            if (sourceNodes[layer]) {
              try { sourceNodes[layer].stop(); } catch(e) {}
              sourceNodes[layer] = null;
            }
          });
        }
        
        function startSources(offset) {
          ['bed', 'event', 'texture'].forEach(function(layer) {
            if (buffers[layer]) {
              var src = audioCtx.createBufferSource();
              src.buffer = buffers[layer];
              src.connect(gainNodes[layer]);
              if (layer === 'bed') {
                src.onended = function() {
                  if (isPlaying) {
                     stopSources();
                     pauseTime = 0;
                     startSources(0);
                     startTime = audioCtx.currentTime;
                  }
                };
              }
              src.start(0, offset);
              sourceNodes[layer] = src;
            }
          });
          drawWave();
        }

        async function togglePlay() {
          initAudio();
          if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
          }
          await loadAudio();
          if (!buffers.bed && !buffers.texture && !buffers.event) return;

          if (isPlaying) {
            stopSources();
            pauseTime += audioCtx.currentTime - startTime;
            isPlaying = false;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            if(pulseRing) {
                pulseRing.style.transform = 'scale(1)';
                pulseRing.style.opacity = '0.4';
            }
            cancelAnimationFrame(animationId);
          } else {
            startSources(pauseTime);
            startTime = audioCtx.currentTime;
            isPlaying = true;
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            updateTime();
          }
        }

        playBtn.addEventListener('click', togglePlay);

        if(progressContainer) {
            progressContainer.addEventListener('click', function(e) {
              if (!mainDuration) return;
              var rect = this.getBoundingClientRect();
              var pct = (e.clientX - rect.left) / rect.width;
              var seekTime = pct * mainDuration;
              if (isPlaying) {
                stopSources();
                pauseTime = seekTime;
                startSources(pauseTime);
                startTime = audioCtx.currentTime;
              } else {
                pauseTime = seekTime;
                progressLine.style.width = (pct * 100) + '%';
              }
            });
            
            // Keyboard support for progress bar
            progressContainer.addEventListener('keydown', function(e) {
              if (!mainDuration) return;
              var step = mainDuration * 0.05;
              if (e.key === 'ArrowLeft') {
                pauseTime = Math.max(0, pauseTime - step);
              } else if (e.key === 'ArrowRight') {
                pauseTime = Math.min(mainDuration, pauseTime + step);
              } else {
                return;
              }
              e.preventDefault();
              if (isPlaying) {
                stopSources();
                startSources(pauseTime);
                startTime = audioCtx.currentTime;
              } else {
                progressLine.style.width = (pauseTime / mainDuration * 100) + '%';
              }
            });
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
          
          if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePlay();
          } else if (e.key === 'ArrowLeft') {
            if (!mainDuration) return;
            pauseTime = Math.max(0, pauseTime - (mainDuration * 0.05));
            if (!isPlaying) progressLine.style.width = (pauseTime / mainDuration * 100) + '%';
          } else if (e.key === 'ArrowRight') {
            if (!mainDuration) return;
            pauseTime = Math.min(mainDuration, pauseTime + (mainDuration * 0.05));
            if (!isPlaying) progressLine.style.width = (pauseTime / mainDuration * 100) + '%';
          }
        });
        
        // Share functionality
        var shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
          shareBtn.addEventListener('click', function() {
            var url = window.location.href;
            var text = 'Listen to ${escapeHtml(place)} in ${escapeHtml(year)} - A historical soundscape reconstruction';
            
            if (navigator.share) {
              navigator.share({ title: 'Séance - ' + '${escapeHtml(place)}', text: text, url: url });
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(url).then(function() {
                showToast('Link copied to clipboard');
              });
            }
          });
        }
        
        function showToast(message) {
          var toast = document.getElementById('toast');
          var msg = document.getElementById('toast-message');
          if (msg) msg.textContent = message;
          toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
          toast.classList.add('opacity-100', 'translate-y-0');
          setTimeout(function() {
            toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            toast.classList.remove('opacity-100', 'translate-y-0');
          }, 3000);
        }
        
        window.addEventListener('resize', function(){ if(isPlaying) drawWave(); });
      })();
    </script>
    ` : ""}
  </body>
</html>`;
}