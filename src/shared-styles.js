export function sharedHead() {
  return `
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
              "primary-fixed": "#735a39",
              "on-primary-container": "#000000",
              "outline": "#919191",
              "on-background": "#e5e2e1",
              "inverse-surface": "#e5e2e1",
              "error": "#ffb4ab",
              "surface-dim": "#131313",
              "on-secondary-fixed-variant": "#3c3b3b",
              "secondary-fixed-dim": "#adabaa",
              "surface-container-highest": "#353534",
              "on-tertiary-container": "#000000",
              "surface-container-low": "#1c1b1b",
              "primary-container": "#f0cfa5",
              "tertiary-fixed-dim": "#004b70",
              "primary-fixed-dim": "#594323",
              "on-primary-fixed-variant": "#ffddb2",
              "outline-variant": "#474747",
              "on-surface-variant": "#c6c6c6",
              "inverse-on-surface": "#313030",
              "tertiary-container": "#5997c4",
              "surface-container-lowest": "#0e0e0e",
              "on-tertiary": "#001e30",
              "secondary-fixed": "#c9c6c5",
              "surface-variant": "#353534",
              "on-surface": "#e5e2e1",
              "primary": "#ffffff",
              "on-primary": "#291800",
              "tertiary": "#cae6ff",
              "surface-container": "#201f1f",
              "on-secondary-container": "#e5e2e1",
              "on-error-container": "#ffdad6",
              "on-error": "#690005",
              "tertiary-fixed": "#1c648e",
              "surface-tint": "#e1c198",
              "on-secondary-fixed": "#1c1b1b",
              "on-tertiary-fixed": "#ffffff",
              "on-secondary": "#1c1b1b",
              "inverse-primary": "#735a39",
              "on-primary-fixed": "#ffffff",
              "secondary-container": "#474646",
              "background": "#050505",
              "surface-bright": "#3a3939",
              "surface": "#131313",
              "error-container": "#93000a",
              "surface-container-high": "#2a2a2a",
              "secondary": "#c9c6c5",
              "on-tertiary-fixed-variant": "#cae6ff",
              "accent": "#c9a66b",
              "accent-dim": "#8a7048"
            },
            "fontFamily": {
              "headline": ["Noto Serif", "serif"],
              "body": ["Space Grotesk", "sans-serif"],
              "label": ["Space Grotesk", "sans-serif"]
            },
            "animation": {
              "float": "float 6s ease-in-out infinite",
              "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              "fade-in": "fadeIn 0.8s ease-out forwards",
              "fade-in-up": "fadeInUp 0.6s ease-out forwards",
              "glow": "glow 3s ease-in-out infinite alternate",
              "rotate-slow": "rotateSlow 20s linear infinite",
              "particle": "particle 8s ease-in-out infinite"
            },
            "keyframes": {
              "float": {
                "0%, 100%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(-20px)" }
              },
              "fadeIn": {
                "from": { opacity: "0" },
                "to": { opacity: "1" }
              },
              "fadeInUp": {
                "from": { opacity: "0", transform: "translateY(20px)" },
                "to": { opacity: "1", transform: "translateY(0)" }
              },
              "glow": {
                "from": { filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))" },
                "to": { filter: "drop-shadow(0 0 30px rgba(255,255,255,0.2))" }
              },
              "rotateSlow": {
                "from": { transform: "rotate(0deg)" },
                "to": { transform: "rotate(360deg)" }
              },
              "particle": {
                "0%": { transform: "translateY(100vh) scale(0)", opacity: "0" },
                "10%": { opacity: "1" },
                "90%": { opacity: "1" },
                "100%": { transform: "translateY(-100vh) scale(1)", opacity: "0" }
              }
            }
          }
        }
      }
    </script>
    <style>
      :root {
        --bg-deep: #050505;
        --bg-surface: #131313;
        --bg-elevated: #1c1c1c;
        --text: #e5e2e1;
        --text-muted: #c6c6c6;
        --text-dim: #919191;
        --accent: #c9a66b;
        --accent-dim: #8a7048;
        --border-subtle: rgba(255, 255, 255, 0.08);
        --border-medium: rgba(255, 255, 255, 0.15);
        --font-display: "Noto Serif", serif;
        --font-body: "Space Grotesk", sans-serif;
        --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
      }

      * {
        scrollbar-width: thin;
        scrollbar-color: var(--accent-dim) var(--bg-surface);
      }

      *::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      *::-webkit-scrollbar-track {
        background: var(--bg-surface);
      }

      *::-webkit-scrollbar-thumb {
        background: var(--accent-dim);
        border-radius: 3px;
      }

      ::selection {
        background: rgba(201, 166, 107, 0.3);
        color: var(--text);
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        min-height: max(884px, 100dvh);
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      :focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
      }

      .obsidian-void {
        background: radial-gradient(circle at center, #1a1a1a 0%, #050505 100%);
      }

      .needle-line {
        height: 0.5px;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
        transition: opacity 0.5s var(--transition-smooth);
      }

      .spectral-glow {
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
      }

      .vertical-text {
        writing-mode: vertical-rl;
        text-orientation: mixed;
      }

      .smoke-blur {
        filter: blur(40px);
        background: radial-gradient(circle, rgba(202, 230, 255, 0.08) 0%, transparent 70%);
        animation: float 8s ease-in-out infinite;
      }

      .smoke-blur:nth-child(2) {
        animation-delay: -2s;
        animation-duration: 10s;
      }

      .grain-overlay {
        background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDj3jyhb5qrY9ftxHnrNvrsFKao8TM0oQEN-ok12uccMAR-UKuMiR_cRE9gSPXoUXKQxFKd525138SuXUi4FNfPS3PFBUYRVSr2q10wsPN_lZRhicd6Nap5a6TZeIUApMMx5XJRJ6F2bUNeAvhXPhqtb04obGn3XcKxdVDiqWPgSAGT0gHeahJFX-o0Uw55m0dk_Xn0-rnFEVA7Oqys3EmmQ1QCXmqUG5UDo_x3jTRCJLYWbjn-UjdXofuwFD9Jx_83dpV0WB6GZWrq");
        opacity: 0.03;
        pointer-events: none;
      }

      .mote-blur {
        filter: blur(80px);
      }

      .glow-pulse {
        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.1));
        animation: glow 3s ease-in-out infinite alternate;
      }

      .light-rill {
        background: linear-gradient(to bottom, transparent, rgba(202, 230, 255, 0.2), transparent);
      }

      .shard-blur {
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
      }

      .glass {
        background: rgba(19, 19, 19, 0.6);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--border-subtle);
      }

      .gradient-text {
        background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stagger-1 { animation-delay: 0.1s; }
      .stagger-2 { animation-delay: 0.2s; }
      .stagger-3 { animation-delay: 0.3s; }
      .stagger-4 { animation-delay: 0.4s; }

      .noise {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.015;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .shimmer {
        background: linear-gradient(90deg, transparent 0%, rgba(201, 166, 107, 0.1) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }

      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spin-slow {
        animation: spin-slow 20s linear infinite;
      }

      .progress-ring {
        transform: rotate(-90deg);
        transform-origin: center;
      }

      .progress-ring-circle {
        transition: stroke-dashoffset 0.35s;
        transform-origin: center;
        transform: rotate(-90deg);
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  `;
}