import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

export function renderDisambiguation({ place, year, candidates }) {
  const candidatesHtml = candidates
    .map(
      (c, i) =>
        `<li class="animate-fade-in-up stagger-${i + 1}">
          <a href="/ritual?place=${encodeURIComponent(c)}&year=${encodeURIComponent(year)}" class="group flex items-center justify-between p-6 glass rounded-2xl border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all duration-500">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-xl text-accent/40 group-hover:text-accent transition-colors">location_on</span>
              <span class="font-headline italic text-xl text-on-surface group-hover:text-primary transition-colors">${escapeHtml(c)}</span>
            </div>
            <span class="material-symbols-outlined text-xl text-accent/0 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300">arrow_forward</span>
          </a>
        </li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Which ${escapeHtml(place)}? — Séance</title>
    ${sharedHead()}
  </head>
  <body class="bg-[#050505] text-on-background font-body min-h-screen relative">
    
    <!-- Ambient Noise Layer -->
    <div class="noise"></div>
    
    <!-- Background -->
    <div class="fixed inset-0 grain-overlay z-10 pointer-events-none"></div>
    <div class="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0e0e0e] z-0"></div>
    
    <!-- Navigation -->
    <header class="fixed top-0 left-0 w-full z-50 glass">
        <div class="flex justify-between items-center px-6 md:px-12 py-4">
            <a href="/" class="flex items-center gap-3 text-white/60 hover:text-white transition-all duration-500 group">
                <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span class="font-label text-xs uppercase tracking-[0.2em]">Choose Again</span>
            </a>
        </div>
    </header>

    <main class="relative z-20 pt-28 pb-20 px-6 md:px-12 lg:px-24 max-w-2xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-12 animate-fade-in-up">
            <p class="font-label uppercase text-[10px] tracking-[0.4em] text-accent/60 mb-4">Clarification Required</p>
            <h1 class="font-headline italic text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight mb-4">
                ${escapeHtml(place)}, ${escapeHtml(year)}
            </h1>
            <p class="font-body text-sm text-on-surface-variant/60 max-w-md mx-auto">
                This name refers to multiple places. Select the one you wish to reconstruct.
            </p>
        </div>
        
        <!-- Candidates -->
        <ul class="space-y-4">
          ${candidatesHtml}
        </ul>

        <!-- Back Link -->
        <div class="text-center mt-10 animate-fade-in-up stagger-4">
            <a href="/" class="inline-flex items-center gap-2 text-on-surface-variant/60 hover:text-accent transition-colors duration-300 group">
                <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span class="font-label text-xs uppercase tracking-widest">Choose a different place</span>
            </a>
        </div>
    </main>

  </body>
</html>`;
}