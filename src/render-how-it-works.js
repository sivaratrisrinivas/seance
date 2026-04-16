import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

export function renderHowItWorks() {
  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>How It Works — Séance</title>
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
                <span class="font-label text-xs uppercase tracking-[0.2em]">Back to Invocation</span>
            </a>
        </div>
    </header>

    <main class="relative z-20 pt-28 pb-20 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        
        <!-- Hero -->
        <div class="text-center mb-20 animate-fade-in-up">
            <p class="font-label uppercase text-[10px] tracking-[0.4em] text-accent/60 mb-4">About</p>
            <h1 class="font-headline italic text-4xl sm:text-5xl md:text-6xl text-primary tracking-tight mb-6">How Séance Works</h1>
            <p class="font-body text-lg text-on-surface-variant/70 max-w-2xl mx-auto leading-relaxed">
                Hear a place the way history felt. We reconstruct the soundscape of any place and year by combining archival research with AI audio generation.
            </p>
        </div>

        <!-- Process Section -->
        <section class="mb-20 animate-fade-in-up stagger-1">
            <div class="flex items-center gap-4 mb-8">
                <div class="h-px w-12 bg-white/10"></div>
                <h2 class="font-label uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40">The Process</h2>
            </div>
            
            <div class="grid gap-6">
                <!-- Step 1 -->
                <div class="glass rounded-2xl p-8 hover:border-white/15 transition-all duration-500 group">
                    <div class="flex items-start gap-6">
                        <div class="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                            <span class="font-headline italic text-xl text-accent">I</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-headline italic text-xl text-on-surface mb-3 group-hover:text-primary transition-colors">Ground in Evidence</h3>
                            <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed">
                                We search through historical records, memoirs, and period documentation to understand what the location sounded like in your chosen year. Each reconstruction is evidence-backed.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="glass rounded-2xl p-8 hover:border-white/15 transition-all duration-500 group">
                    <div class="flex items-start gap-6">
                        <div class="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                            <span class="font-headline italic text-xl text-cyan-400">II</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-headline italic text-xl text-on-surface mb-3 group-hover:text-primary transition-colors">Compose the Soundscape</h3>
                            <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed">
                                Using ElevenLabs audio AI, we create an immersive three-layer reconstruction: ambient atmosphere, environmental texture, and human/mechanical events.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="glass rounded-2xl p-8 hover:border-white/15 transition-all duration-500 group">
                    <div class="flex items-start gap-6">
                        <div class="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                            <span class="font-headline italic text-xl text-indigo-400">III</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-headline italic text-xl text-on-surface mb-3 group-hover:text-primary transition-colors">Archive for Later</h3>
                            <p class="font-body text-sm text-on-surface-variant/70 leading-relaxed">
                                Your reconstruction is preserved. Revisit anytime — identical queries load from the archive instantly instead of regenerating.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Tech Stack Section -->
        <section class="mb-20 animate-fade-in-up stagger-2">
            <div class="flex items-center gap-4 mb-8">
                <div class="h-px w-12 bg-white/10"></div>
                <h2 class="font-label uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40">Built With</h2>
            </div>
            
            <div class="flex flex-wrap gap-3">
                <span class="px-5 py-2.5 glass rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent hover:border-accent/30 transition-all duration-300">
                    ElevenLabs Audio AI
                </span>
                <span class="px-5 py-2.5 glass rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent hover:border-accent/30 transition-all duration-300">
                    Turbopuffer
                </span>
                <span class="px-5 py-2.5 glass rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent hover:border-accent/30 transition-all duration-300">
                    Google Gemini
                </span>
                <span class="px-5 py-2.5 glass rounded-full font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70 hover:text-accent hover:border-accent/30 transition-all duration-300">
                    Cloudflare R2
                </span>
            </div>
        </section>

        <!-- Why It Matters Section -->
        <section class="mb-20 animate-fade-in-up stagger-3">
            <div class="flex items-center gap-4 mb-8">
                <div class="h-px w-12 bg-white/10"></div>
                <h2 class="font-label uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40">Why It Matters</h2>
            </div>
            
            <div class="glass rounded-2xl p-8">
                <p class="font-body text-base text-on-surface-variant/70 leading-relaxed">
                    Soundscapes shape our memories of place. By reconstructing historical audio environments, we gain a new way to connect with the past — <em class="text-on-surface">hearing history, not just reading it.</em>
                </p>
            </div>
        </section>

        <!-- CTA -->
        <div class="text-center animate-fade-in-up stagger-4">
            <a href="/" class="inline-flex items-center gap-3 px-8 py-4 glass rounded-full border border-white/10 hover:border-accent/30 hover:bg-accent/5 transition-all duration-500 group">
                <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant/70 group-hover:text-accent transition-colors">Begin a Reconstruction</span>
                <span class="material-symbols-outlined text-sm text-on-surface-variant/50 group-hover:text-accent group-hover:translate-x-1 transition-all">arrow_forward</span>
            </a>
        </div>
    </main>

  </body>
</html>`;
}