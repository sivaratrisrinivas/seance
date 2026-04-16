import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

export function renderRitualLoading({ place, year }) {
  const queryLabel = [place, year].filter(Boolean).join(", ");

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preparing your Séance — Séance</title>
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
                <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">close</span>
                <span class="font-label text-xs uppercase tracking-[0.2em]">Cancel</span>
            </a>
            <h1 class="text-lg font-headline italic text-white tracking-[0.15em] uppercase">Séance</h1>
            <div class="w-24"></div>
        </div>
    </header>

    <main class="relative z-20 pt-28 pb-20 px-6 md:px-12 lg:px-24 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        
        <!-- Loading Animation -->
        <div class="mb-10 animate-fade-in">
            <div class="relative w-24 h-24">
                <div class="absolute inset-0 rounded-full border border-white/5 animate-pulse"></div>
                <div class="absolute inset-2 rounded-full border border-accent/20 animate-pulse" style="animation-delay: 0.2s;"></div>
                <div class="absolute inset-4 rounded-full border border-accent/30 animate-pulse" style="animation-delay: 0.4s;"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-accent animate-pulse">headphones</span>
                </div>
            </div>
        </div>

        <!-- Header -->
        <div class="text-center mb-10 animate-fade-in-up">
            <p class="font-label uppercase text-[10px] tracking-[0.4em] text-accent/60 mb-3">Ritual in Progress</p>
            <h1 class="font-headline italic text-3xl sm:text-4xl text-primary tracking-tight mb-4">Preparing your Séance</h1>
            <p class="font-body text-sm text-on-surface-variant/60">Tracing an evidence-grounded listening perspective for <span class="text-on-surface-variant/80">${escapeHtml(queryLabel || "your query")}</span></p>
        </div>

        <!-- Progress Steps -->
        <div class="w-full space-y-4 animate-fade-in-up stagger-1">
            <div class="glass rounded-xl p-5 border border-white/5 flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-sm text-accent">search</span>
                </div>
                <div>
                    <p class="font-headline italic text-base text-on-surface mb-1">Resolving the place</p>
                    <p class="font-body text-xs text-on-surface-variant/50">Locating the listening perspective implied by your query.</p>
                </div>
            </div>

            <div class="glass rounded-xl p-5 border border-white/5 flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-sm text-accent">library_books</span>
                </div>
                <div>
                    <p class="font-headline italic text-base text-on-surface mb-1">Gathering historical evidence</p>
                    <p class="font-body text-xs text-on-surface-variant/50">Collecting the details that can support the reconstruction.</p>
                </div>
            </div>

            <div class="glass rounded-xl p-5 border border-white/5 flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-sm text-accent">tune</span>
                </div>
                <div>
                    <p class="font-headline italic text-base text-on-surface mb-1">Shaping the reconstruction</p>
                    <p class="font-body text-xs text-on-surface-variant/50">Preparing the first soundscape pass from the evidence.</p>
                </div>
            </div>
        </div>

        <!-- Headphones Hint -->
        <p class="mt-10 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40 animate-fade-in stagger-2">
            <span class="material-symbols-outlined text-sm align-middle mr-2">headphones</span>
            Best heard with headphones
        </p>
    </main>

  </body>
</html>`;
}
