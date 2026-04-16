import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

// We adapt the existing STAGES mapping from the backend states
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
  
  // Basic math to simulate the 3 distinct "mote" progresses based on the overall job state
  const baseProgress = jobId ? getStageFromJobState(jobState) : 0;
  const p1 = Math.min(100, Math.floor(baseProgress * 1.5));
  const p2 = Math.min(100, Math.floor(baseProgress * 1.1));
  const p3 = Math.min(100, Math.floor(baseProgress * 0.8));

  const pollScript = jobId ? `
    <script>
      (function() {
        var jobId = "${jobId}";
        var redirectUrl = "${redirectUrl}";
        var maxAttempts = 60;
        var attempts = 0;
        
        function updateProgress(state) {
          var baseVal = 0;
          if (state === "failed") baseVal = -1;
          else if (state === "completed") baseVal = 100;
          else if (state === "EVIDENCE") baseVal = 10;
          else if (state === "NORMALIZING") baseVal = 20;
          else if (state === "PLANNING") baseVal = 40;
          else if (state === "PROMPTS") baseVal = 60;
          else if (state === "GENERATING") baseVal = 80;
          else if (state === "STORING") baseVal = 90;

          document.getElementById('prog-1').innerText = Math.min(100, Math.floor(baseVal * 1.5)) + "%";
          document.getElementById('prog-2').innerText = Math.min(100, Math.floor(baseVal * 1.1)) + "%";
          document.getElementById('prog-3').innerText = Math.min(100, Math.floor(baseVal * 0.8)) + "%";
        }
        
        function checkStatus() {
          fetch("/job/status?id=" + jobId)
            .then(function(r) { return r.json(); })
            .then(function(data) {
              attempts++;
              if (data.state === "completed") {
                window.location.href = redirectUrl + "&generated=true&jobId=" + jobId;
              } else if (data.state === "failed") {
                window.location.href = "/?error=" + encodeURIComponent(data.error || "generation failed");
              } else if (attempts >= maxAttempts) {
                window.location.href = redirectUrl;
              } else {
                updateProgress(data.state);
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
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Séance - Synthesis</title>
    ${sharedHead()}
    ${pollScript}
  </head>
  <body class="bg-[#050505] text-on-background font-body selection:bg-tertiary/30 overflow-hidden h-screen w-screen relative">
    
    <!-- Fog and Grain Layers -->
    <div class="fixed inset-0 grain-overlay z-10"></div>
    <div class="fixed inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-[#0e0e0e] z-0"></div>
    
    <!-- Top Navigation Anchor (Shared Component: TopAppBar) -->
    <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-8 bg-[#050505]/60 backdrop-blur-2xl">
        <div class="flex items-center gap-4">
            <a href="/" class="text-white hover:text-cyan-400 transition-all duration-700 ease-in-out active:opacity-70">
                <span class="material-symbols-outlined">close</span>
            </a>
        </div>
        <h1 class="text-xl font-headline italic text-white tracking-[0.2em] uppercase">Séance</h1>
        <div class="flex items-center gap-4">
            <!-- Hidden equivalent to balance spacing -->
            <button class="text-transparent disabled pointer-events-none">
                <span class="material-symbols-outlined">more_vert</span>
            </button>
        </div>
    </header>

    <!-- Main Content: The Synthesis Canvas -->
    <main class="relative z-20 h-full w-full flex flex-col items-center justify-center">
        <!-- Spectral Orbs (Motes) -->
        <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <!-- Ambient Bed Mote (Deep Violet) -->
            <div class="absolute w-[45vw] h-[45vw] rounded-full bg-indigo-900/20 mote-blur translate-x-[-15%] translate-y-[-10%] opacity-60"></div>
            <!-- Events Mote (Cool Cyan) -->
            <div class="absolute w-[35vw] h-[35vw] rounded-full bg-cyan-900/20 mote-blur translate-x-[20%] translate-y-[15%] opacity-50"></div>
            <!-- Texture Mote (Misty White) -->
            <div class="absolute w-[40vw] h-[40vw] rounded-full bg-zinc-400/10 mote-blur translate-x-[-5%] translate-y-[20%] opacity-40"></div>
        </div>

        <!-- Central Status Display -->
        <div class="relative flex flex-col items-center text-center space-y-16">
            <div class="space-y-4">
                <p class="font-label uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/60">Synthesis in Progress</p>
                <h2 class="font-headline italic text-4xl md:text-5xl lg:text-6xl text-primary tracking-tight">Extracting echoes from ${escapeHtml(year)}...</h2>
            </div>
            
            <!-- Layers Progress (The Biological Process) -->
            <div class="grid grid-cols-1 gap-12 w-full max-w-xl px-6">
                <!-- Ambient Bed -->
                <div class="group flex flex-col items-center space-y-3">
                    <div class="flex justify-between w-full items-end pb-1">
                        <span class="font-headline italic text-lg text-on-surface group-hover:text-primary transition-colors">Ambient Bed</span>
                        <span id="prog-1" class="font-label text-sm tracking-widest text-on-surface-variant drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">${p1}%</span>
                    </div>
                    <div class="needle-line w-full opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <p class="font-label uppercase text-[8px] tracking-[0.3em] text-on-surface-variant/40 pt-1">Stabilizing Sub-frequencies</p>
                </div>
                
                <!-- Events -->
                <div class="group flex flex-col items-center space-y-3">
                    <div class="flex justify-between w-full items-end pb-1">
                        <span class="font-headline italic text-lg text-on-surface group-hover:text-primary transition-colors">Events</span>
                        <span id="prog-2" class="font-label text-sm tracking-widest text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">${p2}%</span>
                    </div>
                    <div class="needle-line w-full opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <p class="font-label uppercase text-[8px] tracking-[0.3em] text-on-surface-variant/40 pt-1">Isolating Temporal Peaks</p>
                </div>
                
                <!-- Texture -->
                <div class="group flex flex-col items-center space-y-3">
                    <div class="flex justify-between w-full items-end pb-1">
                        <span class="font-headline italic text-lg text-on-surface group-hover:text-primary transition-colors">Texture</span>
                        <span id="prog-3" class="font-label text-sm tracking-widest text-on-surface-variant animate-pulse opacity-60">${p3}%</span>
                    </div>
                    <div class="needle-line w-full opacity-20 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <p class="font-label uppercase text-[8px] tracking-[0.3em] text-on-surface-variant/40 pt-1">Parsing Granular Residuals</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Detail Meta-Information (Asymmetric Data) -->
    <div class="fixed bottom-32 left-10 hidden md:block space-y-2 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <p class="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Source Entity</p>
        <p class="font-label text-xs text-white">${escapeHtml(place)}</p>
    </div>
    <div class="fixed bottom-32 right-10 hidden md:block text-right space-y-2 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <p class="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Spectral Density</p>
        <p class="font-label text-xs text-white">42.8 mS/cm³</p>
    </div>

    <!-- Decorative Needle Lines -->
    <div class="fixed left-0 top-1/2 -translate-y-1/2 h-40 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-30"></div>
    <div class="fixed right-0 top-1/2 -translate-y-1/2 h-40 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-30"></div>

  </body>
</html>`;
}