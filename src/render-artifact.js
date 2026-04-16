import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

const LISTENING_MODES = [
  { id: "full", label: "Full scene", description: "All layers combined" },
  { id: "atmosphere", label: "Atmosphere", description: "Ambient bed and texture" },
  { id: "streetlife", label: "Street life", description: "Human activity emphasis" },
  { id: "machines", label: "Machines", description: "Mechanical and industrial" },
  { id: "voices", label: "Voices", description: "Crowd and speech elements" },
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
    <div class="shard-blur border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors duration-500 transform hover:-translate-y-1">
        <p class="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3">
            "${escapeHtml(e.description || e.text || "No description")}"
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
            ${e.source ? `<span class="px-2 py-1 bg-white/5 rounded text-[10px] font-label uppercase tracking-widest text-on-surface-variant/80">${escapeHtml(e.source)}</span>` : ""}
            ${e.tags ? e.tags.split(",").map(t => `<span class="px-2 py-1 bg-accent/10 text-accent rounded text-[10px] font-label uppercase tracking-widest">${escapeHtml(t.trim())}</span>`).join("") : ""}
        </div>
    </div>
  `).join("\n");
}

function getNearbyYears(year) {
  const y = parseInt(year);
  if (isNaN(y)) return [];
  return [y - 10, y - 5, y + 5, y + 10].filter(y => y > 0 && y <= 2100);
}

export function renderArtifact({ place, year, archived = false, confidence = "high", confidenceScore = null, reinterpretation = null, generated = false, error = null, audioLayers = null, evidence = null, evidenceNote = null, sourceNotes = null, partial = false }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");
  const headerText = archived ? "Echo Recovered" : generated ? "Resonance Established" : "Séance Active";
  const confidenceLabel = getConfidenceLabel(confidence);
  const hasAudio = audioLayers && (audioLayers.bed || audioLayers.event || audioLayers.texture);
  const hasEvidence = evidence && evidence.length > 0;

  const errorMessage = error 
    ? `<div class="fixed top-24 left-1/2 -translate-x-1/2 shard-blur border border-red-900/30 text-red-400 px-6 py-3 rounded-full text-xs font-label uppercase tracking-widest z-50">Signal Interference: ${escapeHtml(error)}</div>` 
    : "";

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Séance - Vox Aeterna</title>
    ${sharedHead()}
  </head>
  <body class="bg-[#050505] text-on-background font-body selection:bg-tertiary/30 min-h-screen overflow-x-hidden relative">
    
    <!-- Fog and Grain Layers -->
    <div class="fixed inset-0 grain-overlay z-10 pointer-events-none"></div>
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a0a] via-[#050505] to-black z-0 pointer-events-none"></div>
    
    <!-- Navigation -->
    <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-8 mix-blend-difference">
        <div class="flex items-center gap-4">
            <a href="/" class="text-white/60 hover:text-white transition-all duration-700 ease-in-out font-label text-xs uppercase tracking-[0.3em] truncate">
                Sever Connection
            </a>
        </div>
    </header>

    ${errorMessage}

    <main class="relative z-20 pt-24 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col min-h-[90vh] justify-center">
        
        <!-- Header Information -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-24">
            <div class="md:col-span-8 flex flex-col justify-end">
                <p class="font-label uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/60 mb-6">${escapeHtml(headerText)}</p>
                <h1 class="font-headline italic text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-primary tracking-tight leading-none mb-4 break-words">
                    ${escapeHtml(place)}
                </h1>
                <div class="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <span class="font-h1 text-2xl sm:text-3xl text-on-surface-variant/50">${escapeHtml(year)}</span>
                    <div class="h-px w-12 sm:w-24 bg-white/10 hidden sm:block"></div>
                    <span class="font-label text-[10px] uppercase tracking-widest text-accent/70">${escapeHtml(confidenceLabel)}</span>
                </div>
            </div>
            
            <div class="md:col-span-4 flex flex-col justify-end">
                <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed sm:text-right">
                    ${reinterpretation?.reinterpreted ? `<em>Notice:</em> ${escapeHtml(reinterpretation.note)}` : sourceNotes ? escapeHtml(sourceNotes) : "Audio projection constructed from fragmentary archival evidence."}
                    ${partial ? "<br/><span class='text-accent mt-2 block'>Partial reconstruction active.</span>" : ""}
                </p>
            </div>
        </div>

        ${hasAudio ? `
        <!-- The Mixing Conduit (Vox Aeterna Player) -->
        <div class="mb-24 md:mb-32">
            <!-- Master Control -->
            <div class="flex justify-center mb-12 md:mb-16 relative">
                <!-- Decorative rings -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div id="play-pulse-ring" class="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/5 scale-100 opacity-50 transition-all duration-1000"></div>
                </div>
                
                <button id="main-play-btn" class="group relative w-20 h-20 md:w-24 md:h-24 rounded-full shard-blur border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all duration-700 ease-out z-10 hover:scale-105 active:scale-95">
                    <span class="play-icon material-symbols-outlined text-3xl md:text-4xl text-white font-light group-hover:text-cyan-400 transition-colors">play_arrow</span>
                    <span class="pause-icon material-symbols-outlined text-3xl md:text-4xl text-white font-light group-hover:text-cyan-400 transition-colors hidden">pause</span>
                </button>
            </div>
            
            <!-- Progress Line -->
            <div class="w-full max-w-4xl mx-auto mb-12 md:mb-16 group cursor-pointer" id="progress-container">
                <div class="flex justify-between items-end mb-4 px-2">
                    <span class="font-mono text-xs text-on-surface-variant/50" id="time-display">00:00</span>
                    <span class="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface-variant/30 hidden sm:block">Timeline</span>
                    <span class="font-mono text-xs text-on-surface-variant/50" id="duration-display">--:--</span>
                </div>
                <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <div id="main-progress" class="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-transparent via-cyan-900 to-cyan-400 transition-all duration-100 ease-linear"></div>
                </div>
                <div class="mt-4 h-8 w-full opacity-20 group-hover:opacity-60 transition-opacity duration-500 overflow-hidden rounded">
                    <!-- Simple waveform replacement -->
                    <canvas id="wave-canvas" class="w-full h-full"></canvas>
                </div>
            </div>

            <!-- Light Rills (Sliders) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-4xl mx-auto px-4">
                
                <!-- Rill: Bed -->
                <div class="flex flex-col gap-4 md:gap-6 group">
                    <div class="flex justify-between items-center">
                        <label class="font-headline italic text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors cursor-pointer">Atmosphere</label>
                        <span class="font-mono text-xs text-on-surface-variant/50" id="bed-val">80%</span>
                    </div>
                    <div class="relative h-12 flex items-center">
                        <input type="range" id="bed-slider" min="0" max="100" value="80" class="absolute w-full h-full opacity-0 cursor-pointer z-20">
                        <div class="w-full h-[1px] bg-white/10 relative z-10 group-hover:bg-white/20 transition-colors">
                            <div id="bed-fill" class="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-indigo-400 w-[80%] shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-all duration-75"></div>
                            <div id="bed-thumb" class="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white left-[80%] -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75 group-hover:scale-y-125 group-active:scale-y-150"></div>
                        </div>
                    </div>
                </div>

                <!-- Rill: Event -->
                <div class="flex flex-col gap-4 md:gap-6 group">
                    <div class="flex justify-between items-center">
                        <label class="font-headline italic text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors cursor-pointer">Events</label>
                        <span class="font-mono text-xs text-on-surface-variant/50" id="event-val">70%</span>
                    </div>
                    <div class="relative h-12 flex items-center">
                        <input type="range" id="event-slider" min="0" max="100" value="70" class="absolute w-full h-full opacity-0 cursor-pointer z-20">
                        <div class="w-full h-[1px] bg-white/10 relative z-10 group-hover:bg-white/20 transition-colors">
                            <div id="event-fill" class="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-cyan-400 w-[70%] shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-75"></div>
                            <div id="event-thumb" class="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white left-[70%] -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75 group-hover:scale-y-125 group-active:scale-y-150"></div>
                        </div>
                    </div>
                </div>

                <!-- Rill: Texture -->
                <div class="flex flex-col gap-4 md:gap-6 group">
                    <div class="flex justify-between items-center">
                        <label class="font-headline italic text-lg md:text-xl text-on-surface group-hover:text-primary transition-colors cursor-pointer">Texture</label>
                        <span class="font-mono text-xs text-on-surface-variant/50" id="texture-val">60%</span>
                    </div>
                    <div class="relative h-12 flex items-center">
                        <input type="range" id="texture-slider" min="0" max="100" value="60" class="absolute w-full h-full opacity-0 cursor-pointer z-20">
                        <div class="w-full h-[1px] bg-white/10 relative z-10 group-hover:bg-white/20 transition-colors">
                            <div id="texture-fill" class="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-zinc-300 w-[60%] shadow-[0_0_15px_rgba(212,212,216,0.3)] transition-all duration-75"></div>
                            <div id="texture-thumb" class="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white left-[60%] -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75 group-hover:scale-y-125 group-active:scale-y-150"></div>
                        </div>
                    </div>
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
        <div class="mt-auto">
            <div class="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div class="h-px w-8 sm:w-12 bg-white/10"></div>
                <h2 class="font-label uppercase text-[9px] sm:text-[10px] tracking-[0.4em] text-on-surface-variant/40">Fragments of Origin</h2>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                ${formatEvidence(evidence)}
            </div>
            ${evidenceNote ? `<p class="mt-6 sm:mt-8 font-body text-xs sm:text-sm text-on-surface-variant/50 max-w-2xl italic">${escapeHtml(evidenceNote)}</p>` : ""}
        </div>
        ` : ""}
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
          if (buffers.bed) return; // already loaded
          
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
              durationDisplay.textContent = '0' + mins + ':' + String(secs).padStart(2, '0');
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
          if (!ctx || !buffers.bed) return;
          var width = canvas.width = canvas.offsetWidth;
          var height = canvas.height = canvas.offsetHeight;
          var data = buffers.bed.getChannelData(0);
          var step = Math.ceil(data.length / width);
          var amp = height / 2;
          
          ctx.clearRect(0, 0, width, height);
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
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        function updateTime() {
          if (!isPlaying || !mainDuration) return;
          var elapsed = (pauseTime + audioCtx.currentTime - startTime) % mainDuration;
          var pct = (elapsed / mainDuration) * 100;
          if(progressLine) progressLine.style.width = pct + '%';
          
          var curr = Math.floor(elapsed);
          var mins = Math.floor(curr / 60);
          var secs = curr % 60;
          if(timeDisplay) timeDisplay.textContent = '0' + mins + ':' + String(secs).padStart(2, '0');
          
          if (pulseRing) {
              pulseRing.style.transform = 'scale(' + (1 + (Math.sin(elapsed * 2) * 0.1)) + ')';
              pulseRing.style.opacity = parseFloat(0.2 + (Math.sin(elapsed * 4) * 0.1));
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

        playBtn.addEventListener('click', async function() {
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
                pulseRing.style.opacity = '0.5';
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
        });

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
        }
        
        window.addEventListener('resize', function(){ if(isPlaying) drawWave(); });


      })();
    </script>
    ` : ""}
  </body>
</html>`;
}