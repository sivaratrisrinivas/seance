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
              "on-tertiary-fixed-variant": "#cae6ff"
            },
            "fontFamily": {
              "headline": ["Noto Serif", "serif"],
              "body": ["Space Grotesk", "sans-serif"],
              "label": ["Space Grotesk", "sans-serif"]
            }
          }
        }
      }
    </script>
    <style>
      body {
        min-height: max(884px, 100dvh);
        overflow: hidden;
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
      }
      .light-rill {
        background: linear-gradient(to bottom, transparent, rgba(202, 230, 255, 0.2), transparent);
      }
      .shard-blur {
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
      }
    </style>
  `;
}