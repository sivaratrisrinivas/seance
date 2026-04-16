import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

export function renderHomepage() {
  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Séance - Invocation</title>
    ${sharedHead()}
  </head>
  <body class="bg-background text-on-surface font-body overflow-hidden">
    <!-- The Obsidian Void Canvas -->
    <main class="relative h-screen w-full obsidian-void flex flex-col items-center justify-between py-12 px-8">
      
      <!-- Spectral Smoke Layer (Atmospheric) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="smoke-blur absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40"></div>
      </div>

      <!-- Header / Identity -->
      <header class="z-10 text-center">
          <h1 class="font-headline font-light italic text-[10px] tracking-[1em] text-on-surface-variant opacity-80">
              SÉANCE
          </h1>
      </header>

      <!-- Invocation Portal (Main Input Section) -->
      <div class="relative w-full max-w-4xl z-20 flex flex-col items-center group">
          <!-- Label Above: WHERE -->
          <div class="absolute -top-16 left-1/2 -translate-x-1/2">
              <span class="vertical-text font-label uppercase text-[8px] tracking-[0.4em] text-on-surface-variant/40">
                  WHERE
              </span>
          </div>

          <!-- The Input Element -->
          <form id="summon-form" action="/ritual" method="get" class="relative w-full text-center space-y-4">
              <input type="hidden" name="place" id="hidden-place" />
              <input type="hidden" name="year" id="hidden-year" />
              
              <input 
                  id="portal-input"
                  type="text" 
                  class="w-full bg-transparent border-none focus:ring-0 text-center font-headline italic text-4xl md:text-6xl text-primary spectral-glow placeholder:text-on-surface-variant/20 transition-all duration-1000 outline-none" 
                  placeholder="KYOTO, 1600" 
                  spellcheck="false"
                  autocomplete="off"
              />
              
              <!-- The Needle Line -->
              <div class="needle-line w-full opacity-60"></div>
          </form>

          <!-- Label Below: WHEN -->
          <div class="mt-8">
              <span class="font-label uppercase text-[8px] tracking-[0.4em] text-on-surface-variant/40">
                  WHEN
              </span>
          </div>
      </div>

      <!-- Footer / Call to Action -->
      <footer class="z-10 flex flex-col items-center gap-6">
          <div class="h-16 w-[1px] bg-gradient-to-b from-transparent via-outline-variant/30 to-transparent"></div>
          <button id="summon-btn" class="font-label bg-transparent uppercase text-[9px] tracking-[0.3em] text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors duration-700">
              Tap the void to summon
          </button>
      </footer>
    </main>

    <!-- Decorative Corner Accents (The Needle-Lines) -->
    <div class="fixed top-6 left-6 pointer-events-none opacity-20">
        <div class="w-12 h-[0.5px] bg-white"></div>
        <div class="w-[0.5px] h-12 bg-white"></div>
    </div>
    <div class="fixed bottom-6 right-6 pointer-events-none opacity-20 transform rotate-180">
        <div class="w-12 h-[0.5px] bg-white"></div>
        <div class="w-[0.5px] h-12 bg-white"></div>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('summon-form');
        const input = document.getElementById('portal-input');
        const hiddenPlace = document.getElementById('hidden-place');
        const hiddenYear = document.getElementById('hidden-year');
        const summonBtn = document.getElementById('summon-btn');

        function parseAndSubmit(e) {
          e.preventDefault();
          
          const raw = input.value.trim();
          if (!raw) return;

          // Simple heuristic: look for trailing digits for the year
          // "Paris 1920", "Paris, 1920", "New York, 2024"
          const match = raw.match(/^(.*?)[,\\s]+(\\d{1,4})$/);
          
          if (match) {
             hiddenPlace.value = match[1].trim();
             hiddenYear.value = match[2];
          } else {
             // Fallback: If they just type "Rome", default to a random historical year
             // or just let it pass to validation.
             hiddenPlace.value = raw;
             hiddenYear.value = new Date().getFullYear();
          }

          form.submit();
        }

        form.addEventListener('submit', parseAndSubmit);
        summonBtn.addEventListener('click', parseAndSubmit);
      });
    </script>
  </body>
</html>`;
}