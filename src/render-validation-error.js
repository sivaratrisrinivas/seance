import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

export function renderValidationError({ place, year, message }) {
  const isRateLimit = message && message.toLowerCase().includes("rate");
  const isYearInvalid = message && message.toLowerCase().includes("year");

  let heading = "Check the input";
  let subtitle = message;
  let icon = "warning";

  if (isRateLimit) {
    heading = "Recently reconstructed";
    subtitle = "This moment has been reconstructed recently. Try a nearby year or listen to the existing version.";
    icon = "schedule";
  } else if (isYearInvalid) {
    heading = "Year out of range";
    subtitle = "Please enter a year between 1 and 2100.";
    icon = "calendar_today";
  }

  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)} — Séance</title>
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
                <span class="font-label text-xs uppercase tracking-[0.2em]">Return to Invocation</span>
            </a>
        </div>
    </header>

    <main class="relative z-20 pt-28 pb-20 px-6 md:px-12 lg:px-24 max-w-lg mx-auto">
        
        <!-- Error Card -->
        <div class="glass rounded-3xl p-10 text-center animate-fade-in-up">
            
            <!-- Icon -->
            <div class="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-8">
                <span class="material-symbols-outlined text-4xl text-accent">${icon}</span>
            </div>
            
            <!-- Header -->
            <p class="font-label uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/50 mb-3">Attention Required</p>
            <h1 class="font-headline italic text-2xl sm:text-3xl text-primary mb-4">${escapeHtml(heading)}</h1>
            <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed mb-8">${escapeHtml(subtitle)}</p>
            
            <!-- Query Summary -->
            <div class="p-5 bg-white/5 rounded-2xl border border-white/5 text-left mb-8">
                <div class="flex items-center gap-3 mb-3">
                    <span class="material-symbols-outlined text-sm text-accent/60">search</span>
                    <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50">Your Query</span>
                </div>
                <p class="font-headline italic text-lg text-on-surface">${escapeHtml(place || "Not provided")}</p>
                <p class="font-mono text-sm text-on-surface-variant/60">${escapeHtml(year || "—")}</p>
            </div>

            <!-- Suggestions -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
                <a href="/" class="px-6 py-3 glass rounded-full border border-white/10 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent">
                    Try Another Place
                </a>
                ${year ? `
                <a href="/ritual?place=${encodeURIComponent(place || "London")}&year=${encodeURIComponent(Math.max(1, parseInt(year) - 5))}" class="px-6 py-3 glass rounded-full border border-white/10 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent">
                    Earlier Year
                </a>
                <a href="/ritual?place=${encodeURIComponent(place || "London")}&year=${encodeURIComponent(Math.min(2100, parseInt(year) + 5))}" class="px-6 py-3 glass rounded-full border border-white/10 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent">
                    Later Year
                </a>
                ` : ""}
            </div>

            <!-- Back Link -->
            <a href="/" class="inline-flex items-center gap-2 text-on-surface-variant/50 hover:text-accent transition-colors duration-300 group">
                <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span class="font-label text-xs uppercase tracking-widest">Return to Start</span>
            </a>
        </div>
    </main>

  </body>
</html>`;
}