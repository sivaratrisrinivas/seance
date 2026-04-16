import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

function getStageFromJobState(jobState) {
  if (jobState === "failed") return -1;
  if (jobState === "completed") return 100;
  
  const stageMap = {
    "EVIDENCE": 10,
    "NORMALIZING": 20,
    "PLANNING": 40,
    "PROMPTS": 60,
    "GENERATING": 80,
    "STORING": 90,
  };
  
  return stageMap[jobState] ?? 0;
}

export function renderGenerating({ place, year, redirectTo = null, jobId = null, jobState = null }) {
  const redirectUrl = redirectTo ?? `/artifact?place=${encodeURIComponent(place)}&year=${encodeURIComponent(year)}`;
  
  const baseProgress = jobId ? getStageFromJobState(jobState) : 0;
  const p1 = Math.min(100, Math.floor(baseProgress * 1.2));
  const p2 = Math.min(100, Math.floor(baseProgress * 1.1));
  const p3 = Math.min(100, Math.floor(baseProgress * 0.9));

  const stageDescriptions = {
    "EVIDENCE": "Consulting the archives...",
    "NORMALIZING": "Processing evidence...",
    "PLANNING": "Composing soundscape...",
    "PROMPTS": "Preparing generation...",
    "GENERATING": "Creating audio layers...",
    "STORING": "Preserving the echo...",
  };

  const currentStage = jobState && stageDescriptions[jobState] ? stageDescriptions[jobState] : "Consulting the archives...";

  const pollScript = jobId ? `
    <script>
      (function() {
        var jobId = "${jobId}";
        var redirectUrl = "${redirectUrl}";
        var maxAttempts = 120;
        var attempts = 0;
        
        var stageLabels = {
          "EVIDENCE": "Consulting the archives...",
          "NORMALIZING": "Processing evidence...",
          "PLANNING": "Composing soundscape...",
          "PROMPTS": "Preparing generation...",
          "GENERATING": "Creating audio layers...",
          "STORING": "Preserving the echo..."
        };
        
        function updateProgress(state, progress) {
          document.getElementById('prog-1').innerText = Math.min(100, Math.floor(progress * 1.2)) + "%";
          document.getElementById('prog-2').innerText = Math.min(100, Math.floor(progress * 1.1)) + "%";
          document.getElementById('prog-3').innerText = Math.min(100, Math.floor(progress * 0.9)) + "%";
          
          if (state && stageLabels[state]) {
            document.getElementById('current-stage').innerText = stageLabels[state];
          }
          
          // Update progress ring
          var ring = document.getElementById('progress-ring-fill');
          if (ring) {
            var circumference = 2 * Math.PI * 54;
            var offset = circumference - (progress / 100) * circumference;
            ring.style.strokeDashoffset = offset;
          }
        }
        
        function checkStatus() {
          fetch("/job/status?id=" + jobId)
            .then(function(r) { return r.json(); })
            .then(function(data) {
              attempts++;
              if (data.state === "completed") {
                document.getElementById('current-stage').innerText = "Resonance established";
                setTimeout(function() {
                  window.location.href = redirectUrl + "&generated=true&jobId=" + jobId;
                }, 500);
              } else if (data.state === "failed") {
                window.location.href = "/?error=" + encodeURIComponent(data.error || "generation failed");
              } else if (attempts >= maxAttempts) {
                window.location.href = redirectUrl;
              } else {
                var baseVal = 0;
                if (data.state === "EVIDENCE") baseVal = 10;
                else if (data.state === "NORMALIZING") baseVal = 20;
                else if (data.state === "PLANNING") baseVal = 40;
                else if (data.state === "PROMPTS") baseVal = 60;
                else if (data.state === "GENERATING") baseVal = 80;
                else if (data.state === "STORING") baseVal = 90;
                updateProgress(data.state, baseVal);
                setTimeout(checkStatus, 2000);
              }
            })
            .catch(function() {
              setTimeout(checkStatus, 3000);
            });
        }
        
        setTimeout(checkStatus, 1500);
      })();
    </script>
  ` : "";

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Séance - Synthesis</title>
    ${sharedHead()}
    ${pollScript}
  </head>
  <body class="bg-[#050505] text-on-background font-body selection:bg-tertiary/30 overflow-hidden h-screen w-screen relative">
    
    <!-- Ambient Noise Layer -->
    <div class="noise"></div>
    
    <!-- Fog and Grain Layers -->
    <div class="fixed inset-0 grain-overlay z-10"></div>
    <div class="fixed inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-[#0e0e0e] z-0"></div>
    
    <!-- Top Navigation -->
    <header class="fixed top-0 left-0 w-full z-50 glass">
        <div class="flex justify-between items-center px-6 md:px-12 py-4">
            <a href="/" class="flex items-center gap-3 text-white/60 hover:text-red-400 transition-all duration-500 group">
                <span class="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">close</span>
                <span class="font-label text-xs uppercase tracking-[0.2em] hidden sm:inline">Cancel</span>
            </a>
            <h1 class="text-lg font-headline italic text-white tracking-[0.15em] uppercase">Séance</h1>
            <div class="w-20"></div>
        </div>
    </header>

    <!-- Main Content: The Synthesis Canvas -->
    <main class="relative z-20 h-full w-full flex flex-col items-center justify-center px-6">
        
        <!-- Animated Background Orbs -->
        <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div class="absolute w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 mote-blur -translate-x-[-20%] -translate-y-[-10%] animate-float" style="animation-delay: 0s;"></div>
            <div class="absolute w-[40vw] h-[40vw] rounded-full bg-cyan-900/10 mote-blur translate-x-[25%] translate-y-[15%] animate-float" style="animation-delay: -3s;"></div>
            <div class="absolute w-[45vw] h-[45vw] rounded-full bg-zinc-400/5 mote-blur -translate-x-[5%] translate-y-[25%] animate-float" style="animation-delay: -6s;"></div>
        </div>

        <!-- Central Status Display -->
        <div class="relative flex flex-col items-center text-center">
            
            <!-- Progress Ring -->
            <div class="relative mb-10">
                <svg class="w-32 h-32 md:w-40 md:h-40 progress-ring" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
                    <circle id="progress-ring-fill" cx="60" cy="60" r="54" fill="none" stroke="url(#progressGradient)" stroke-width="2" stroke-linecap="round" stroke-dasharray="339.292" stroke-dashoffset="339.292" class="progress-ring-circle" transform="rotate(-90 60 60)"/>
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#c9a66b"/>
                            <stop offset="100%" stop-color="#8a7048"/>
                        </linearGradient>
                    </defs>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                    <span id="progress-percent" class="font-headline italic text-2xl md:text-3xl text-white">0%</span>
                </div>
            </div>

            <!-- Place and Year -->
            <div class="space-y-6 mb-16">
                <p class="font-label uppercase text-[10px] tracking-[0.4em] text-accent/60 animate-pulse">Synthesis in Progress</p>
                <h2 class="font-headline italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary tracking-tight leading-tight">
                    ${escapeHtml(place)}<br/>
                    <span class="text-on-surface-variant/60">${escapeHtml(year)}</span>
                </h2>
            </div>
            
            <!-- Current Stage -->
            <p id="current-stage" class="font-body text-sm text-on-surface-variant/70 mb-12 animate-fade-in">
                ${currentStage}
            </p>
            
            <!-- Layers Progress -->
            <div class="grid grid-cols-1 gap-8 w-full max-w-md">
                <!-- Ambient Bed -->
                <div class="group flex flex-col items-center space-y-3">
                    <div class="flex justify-between w-full items-end pb-1">
                        <span class="font-headline italic text-base text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm text-indigo-400/60">air</span>
                            Ambient Bed
                        </span>
                        <span id="prog-1" class="font-mono text-sm tracking-widest text-on-surface-variant">${p1}%</span>
                    </div>
                    <div class="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-500/50 to-indigo-400/30 rounded-full transition-all duration-500" style="width: ${p1}%"></div>
                    </div>
                    <p class="font-label uppercase text-[8px] tracking-[0.3em] text-on-surface-variant/40">Stabilizing Sub-frequencies</p>
                </div>
                
                <!-- Events -->
                <div class="group flex flex-col items-center space-y-3">
                    <div class="flex justify-between w-full items-end pb-1">
                        <span class="font-headline italic text-base text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm text-cyan-400/60">notifications</span>
                            Events
                        </span>
                        <span id="prog-2" class="font-mono text-sm tracking-widest text-cyan-400/70">${p2}%</span>
                    </div>
                    <div class="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-cyan-500/50 to-cyan-400/30 rounded-full transition-all duration-500" style="width: ${p2}%"></div>
                    </div>
                    <p class="font-label uppercase text-[8px] tracking-[0.3em] text-on-surface-variant/40">Isolating Temporal Peaks</p>
                </div>
                
                <!-- Texture -->
                <div class="group flex flex-col items-center space-y-3">
                    <div class="flex justify-between w-full items-end pb-1">
                        <span class="font-headline italic text-base text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm text-zinc-400/60">texture</span>
                            Texture
                        </span>
                        <span id="prog-3" class="font-mono text-sm tracking-widest text-on-surface-variant/70">${p3}%</span>
                    </div>
                    <div class="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-zinc-500/50 to-zinc-400/30 rounded-full transition-all duration-500" style="width: ${p3}%"></div>
                    </div>
                    <p class="font-label uppercase text-[8px] tracking-[0.3em] text-on-surface-variant/40">Parsing Granular Residuals</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Decorative Corner Elements -->
    <div class="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-20">
        <div class="w-12 h-[0.5px] bg-white"></div>
        <div class="w-[0.5px] h-12 bg-white ml-[23px]"></div>
    </div>
    <div class="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-20 rotate-180">
        <div class="w-12 h-[0.5px] bg-white"></div>
        <div class="w-[0.5px] h-12 bg-white ml-[23px]"></div>
    </div>

    <!-- Floating Particles -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        ${Array.from({length: 15}).map((_, i) => `
            <div class="absolute rounded-full bg-white/5" style="
                left: ${Math.random() * 100}%;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                animation: particle ${Math.random() * 10 + 8}s linear infinite;
                animation-delay: -${Math.random() * 10}s;
            "></div>
        `).join("")}
    </div>

  </body>
</html>`;
}