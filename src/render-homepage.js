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
    <!-- Ambient Noise Layer -->
    <div class="noise"></div>

    <!-- The Obsidian Void Canvas -->
    <main class="relative h-screen w-full obsidian-void flex flex-col items-center justify-between py-12 px-8">
      
      <!-- Spectral Smoke Layer (Atmospheric) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="smoke-blur absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30"></div>
          <div class="smoke-blur absolute top-1/2 right-1/4 w-[500px] h-[500px] opacity-20"></div>
      </div>

      <!-- Floating Particles -->
      <div id="particles" class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true"></div>

      <!-- Header / Identity -->
      <header class="z-10 text-center animate-fade-in">
          <h1 class="font-headline font-light italic text-[10px] tracking-[1em] text-on-surface-variant opacity-80">
              SÉANCE
          </h1>
      </header>

      <!-- Invocation Portal (Main Input Section) -->
      <div class="relative w-full max-w-4xl z-20 flex flex-col items-center group animate-fade-in-up">
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
              
              <div class="relative">
                  <input 
                      id="portal-input"
                      type="text" 
                      class="w-full bg-transparent border-none focus:ring-0 text-center font-headline italic text-4xl md:text-6xl text-primary spectral-glow placeholder:text-on-surface-variant/20 transition-all duration-500 outline-none"
                      placeholder="KYOTO, 1600"
                      spellcheck="false"
                      autocomplete="off"
                      aria-label="Enter place and year"
                  />
                  <!-- Input underline glow effect -->
                  <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent transition-all duration-700 group-focus-within:w-full"></div>
              </div>
              
              <!-- The Needle Line -->
              <div class="needle-line w-full opacity-60 group-focus-within:opacity-100"></div>
          </form>

          <!-- Label Below: WHEN -->
          <div class="mt-8">
              <span class="font-label uppercase text-[8px] tracking-[0.4em] text-on-surface-variant/40">
                  WHEN
              </span>
          </div>

          <!-- Recent Queries (if any) -->
          <div id="recent-queries" class="mt-6 flex flex-wrap justify-center gap-3 max-w-lg opacity-0 transition-opacity duration-500">
          </div>
      </div>

      <!-- Footer / Call to Action -->
      <footer class="z-10 flex flex-col items-center gap-6 animate-fade-in stagger-3">
          <div class="h-16 w-[1px] bg-gradient-to-b from-transparent via-outline-variant/30 to-transparent"></div>
          
          <div class="flex flex-col items-center gap-4">
              <button id="summon-btn" class="font-label bg-transparent uppercase text-[9px] tracking-[0.3em] text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors duration-700 group flex items-center gap-3">
                  <span class="group-hover:translate-x-[-4px] transition-transform duration-300">Tap the void to summon</span>
                  <span class="material-symbols-outlined text-sm opacity-60 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </button>
              
              <!-- Keyboard hint -->
              <div class="flex items-center gap-2 opacity-0 animate-fade-in stagger-4" id="keyboard-hint">
                  <kbd class="px-2 py-1 text-[9px] font-label bg-white/5 border border-white/10 rounded">Enter</kbd>
                  <span class="text-[9px] text-on-surface-variant/40 font-label">or</span>
                  <kbd class="px-2 py-1 text-[9px] font-label bg-white/5 border border-white/10 rounded">⌘</kbd>
                  <span class="text-[9px] text-on-surface-variant/40 font-label">+</span>
                  <kbd class="px-2 py-1 text-[9px] font-label bg-white/5 border border-white/10 rounded">↵</kbd>
              </div>
              
              <!-- How it works link -->
              <a href="/how-it-works" class="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/40 hover:text-accent transition-colors duration-300">
                  How it works
              </a>
          </div>
      </footer>
    </main>

    <!-- Decorative Corner Accents (The Needle-Lines) -->
    <div class="fixed top-6 left-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div class="w-12 h-[0.5px] bg-white"></div>
        <div class="w-[0.5px] h-12 bg-white"></div>
    </div>
    <div class="fixed bottom-6 right-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div class="w-12 h-[0.5px] bg-white"></div>
        <div class="w-[0.5px] h-12 bg-white"></div>
    </div>

    <!-- Quick Examples -->
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 opacity-60">
        <span class="text-[9px] text-on-surface-variant/40 font-label mr-2">Try:</span>
        <button onclick="fillExample('Kyoto, 1600')" class="px-3 py-1 text-[9px] font-label bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300">Kyoto, 1600</button>
        <button onclick="fillExample('Cairo, 1920')" class="px-3 py-1 text-[9px] font-label bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300">Cairo, 1920</button>
        <button onclick="fillExample('Paris, 1889')" class="px-3 py-1 text-[9px] font-label bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300">Paris, 1889</button>
    </div>

    <script>
      const EXAMPLES = [
        'Kyoto, 1600',
        'Cairo, 1920',
        'Paris, 1889',
        'Venice, 1500',
        'London, 1940',
        'Tokyo, 1920',
        'Marrakesh, 1800',
        'Istanbul, 1600'
      ];

      function fillExample(text) {
        const input = document.getElementById('portal-input');
        input.value = text;
        input.focus();
      }

      function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'absolute rounded-full bg-white/5';
          particle.style.cssText = \`
            left: \${Math.random() * 100}%;
            width: \${Math.random() * 4 + 1}px;
            height: \${Math.random() * 4 + 1}px;
            animation: particle \${Math.random() * 10 + 8}s linear infinite;
            animation-delay: -\${Math.random() * 10}s;
          \`;
          container.appendChild(particle);
        }
      }

      function cyclePlaceholder() {
        const input = document.getElementById('portal-input');
        if (!input || input.value) return;
        
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;
        let currentText = '';
        
        function type() {
          const target = EXAMPLES[index];
          
          if (!isDeleting) {
            currentText = target.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === target.length) {
              setTimeout(() => { isDeleting = true; type(); }, 3000);
              return;
            }
          } else {
            currentText = target.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
              isDeleting = false;
              index = (index + 1) % EXAMPLES.length;
              setTimeout(type, 500);
              return;
            }
          }
          
          input.placeholder = currentText;
          setTimeout(type, isDeleting ? 50 : 100);
        }
        
        setTimeout(type, 2000);
      }

      function loadRecentQueries() {
        try {
          const recent = JSON.parse(localStorage.getItem('seance_recent') || '[]');
          const container = document.getElementById('recent-queries');
          if (!container || recent.length === 0) return;
          
          container.innerHTML = recent.slice(0, 4).map(item => 
            \`<a href="/artifact?place=\${encodeURIComponent(item.place)}&year=\${encodeURIComponent(item.year)}&archived=true" 
                class="px-3 py-1.5 text-[10px] font-label bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 text-on-surface-variant/80 hover:text-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-xs opacity-50">history</span>
                \${escapeHtml(item.place)}, \${item.year}
               </a>\`
          ).join('');
          container.classList.remove('opacity-0');
        } catch (e) {}
      }

      function saveQuery(place, year) {
        try {
          const recent = JSON.parse(localStorage.getItem('seance_recent') || '[]');
          const newItem = { place, year, timestamp: Date.now() };
          const filtered = recent.filter(r => !(r.place === place && r.year === year));
          const updated = [newItem, ...filtered].slice(0, 8);
          localStorage.setItem('seance_recent', JSON.stringify(updated));
        } catch (e) {}
      }

      document.addEventListener('DOMContentLoaded', () => {
        createParticles();
        cyclePlaceholder();
        loadRecentQueries();
        
        const form = document.getElementById('summon-form');
        const input = document.getElementById('portal-input');
        const hiddenPlace = document.getElementById('hidden-place');
        const hiddenYear = document.getElementById('hidden-year');
        const summonBtn = document.getElementById('summon-btn');

        function parseAndSubmit(e) {
          e.preventDefault();
          
          const raw = input.value.trim();
          if (!raw) return;

          const match = raw.match(/^(.*?)[,\\s]+(\\d{1,4})$/);
          
          if (match) {
            hiddenPlace.value = match[1].trim();
            hiddenYear.value = match[2];
            saveQuery(match[1].trim(), match[2]);
          } else {
            hiddenPlace.value = raw;
            hiddenYear.value = new Date().getFullYear();
            saveQuery(raw, new Date().getFullYear());
          }

          form.submit();
        }

        form.addEventListener('submit', parseAndSubmit);
        summonBtn.addEventListener('click', parseAndSubmit);
        
        // Keyboard shortcut hints visibility
        const hint = document.getElementById('keyboard-hint');
        if (hint) {
          setTimeout(() => hint.classList.remove('opacity-0'), 1500);
        }
      });
    </script>
  </body>
</html>`;
}