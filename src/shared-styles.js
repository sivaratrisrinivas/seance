export function sharedStyles() {
  return `
      :root {
        color-scheme: dark;
        --bg-deep: #0d0a06;
        --bg-surface: #18130f;
        --bg-elevated: #252019;
        --bg-card: #1e1812;
        --border-subtle: rgba(180, 160, 130, 0.12);
        --border-medium: rgba(180, 160, 130, 0.2);
        --border-strong: rgba(180, 160, 130, 0.3);
        --text: #e8e0d5;
        --text-dim: #a89f94;
        --text-muted: #756a5c;
        --accent: #c9a66b;
        --accent-dim: #9a7d52;
        --accent-glow: rgba(201, 166, 107, 0.15);
        --success: #7a9a6d;
        --warning: #b08d5b;
        --error: #9a6b5c;
        --glow: 0 0 40px rgba(201, 166, 107, 0.08);
        --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.4);
        --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
        --font-display: "Playfair Display", "Cormorant Garamond", "Georgia", serif;
        --font-body: "Crimson Text", "Georgia", serif;
        --font-mono: "JetBrains Mono", "SF Mono", monospace;
        font-family: var(--font-body);
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      html {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--text);
        background: 
          radial-gradient(ellipse at top center, rgba(201, 166, 107, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at bottom center, rgba(30, 24, 18, 0.8) 0%, transparent 60%),
          linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-surface) 50%, var(--bg-deep) 100%);
        background-attachment: fixed;
        line-height: 1.6;
      }

      body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        opacity: 0.03;
        pointer-events: none;
        z-index: 0;
      }

      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 48px 24px;
        position: relative;
        z-index: 1;
      }

      .shell {
        width: min(100%, 680px);
        padding: 48px 56px;
        border: 1px solid var(--border-subtle);
        border-radius: 32px;
        background: linear-gradient(145deg, var(--bg-card) 0%, rgba(30, 24, 18, 0.6) 100%);
        box-shadow: var(--shadow-soft), var(--glow);
        backdrop-filter: blur(12px);
      }

      .brand {
        margin: 0 0 8px;
        font-family: var(--font-display);
        font-size: clamp(2.4rem, 7vw, 4rem);
        font-weight: 400;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
        text-shadow: 0 0 60px rgba(201, 166, 107, 0.2);
      }

      .tagline {
        margin: 24px 0 0;
        font-family: var(--font-display);
        font-size: clamp(1.4rem, 3vw, 1.8rem);
        font-weight: 400;
        font-style: italic;
        color: var(--text-dim);
        line-height: 1.5;
      }

      .premise {
        margin: 16px 0 0;
        font-size: 1.1rem;
        line-height: 1.7;
        color: var(--text-muted);
        max-width: 52ch;
      }

      form {
        display: grid;
        grid-template-columns: 1fr 140px;
        gap: 16px;
        margin-top: 40px;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      label {
        font-size: 0.75rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      input {
        width: 100%;
        padding: 18px 22px;
        border: 1px solid var(--border-medium);
        border-radius: 16px;
        background: rgba(13, 10, 6, 0.6);
        color: var(--text);
        font: inherit;
        font-size: 1.1rem;
        transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
      }

      input::placeholder {
        color: var(--text-muted);
        opacity: 0.6;
      }

      input:focus {
        outline: none;
        border-color: var(--accent-dim);
        box-shadow: 0 0 0 3px var(--accent-glow), inset 0 0 20px rgba(201, 166, 107, 0.05);
        background: rgba(13, 10, 6, 0.8);
      }

      .cta {
        grid-column: 1 / -1;
        justify-self: start;
        padding: 16px 36px;
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
        color: var(--bg-deep);
        font-family: var(--font-body);
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.25s;
        box-shadow: 0 4px 20px rgba(201, 166, 107, 0.25);
      }

      .cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(201, 166, 107, 0.35);
      }

      .cta:active {
        transform: translateY(0);
      }

      .section-kicker {
        margin: 40px 0 16px;
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .example-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 12px 0 0;
        padding: 0;
        list-style: none;
      }

      .example-list li a {
        display: block;
        padding: 10px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        background: rgba(255, 253, 249, 0.03);
        color: var(--text-dim);
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.2s;
      }

      .example-list li a:hover,
      .example-list li a:focus {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        color: var(--accent);
      }

      .footer-nav {
        margin-top: 40px;
        text-align: center;
        border-top: 1px solid var(--border-subtle);
        padding-top: 24px;
      }

      .footer-nav a {
        color: var(--text-muted);
        font-size: 0.9rem;
        text-decoration: none;
        transition: color 0.2s;
      }

      .footer-nav a:hover,
      .footer-nav a:focus {
        color: var(--accent);
      }

      .status-kicker {
        margin: 0 0 12px;
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .page-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 2.8rem);
        font-weight: 400;
        color: var(--text);
      }

      .page-subtitle {
        margin: 12px 0 0;
        font-size: 1.1rem;
        color: var(--text-dim);
        line-height: 1.6;
      }

      .meta-line {
        margin: 16px 0 0;
        padding: 14px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        background: rgba(201, 166, 107, 0.04);
        font-size: 0.92rem;
        color: var(--text-dim);
        font-style: italic;
      }

      .meta-line strong {
        color: var(--text);
        font-style: normal;
      }

      .card {
        margin-top: 24px;
        padding: 20px 24px;
        border: 1px solid var(--border-subtle);
        border-radius: 20px;
        background: linear-gradient(145deg, var(--bg-elevated) 0%, var(--bg-card) 100%);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .card-title {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .badge {
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--accent-glow);
        font-size: 0.7rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .evidence-card {
        padding: 16px 0;
        border-bottom: 1px solid var(--border-subtle);
      }

      .evidence-card:last-child {
        border-bottom: none;
      }

      .evidence-excerpt {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--text);
        font-style: italic;
      }

      .evidence-source {
        margin-top: 10px;
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .evidence-tags {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .evidence-tag {
        padding: 3px 8px;
        border-radius: 4px;
        background: rgba(201, 166, 107, 0.08);
        font-size: 0.7rem;
        color: var(--accent-dim);
      }

      .actions-row {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 12px 24px;
        border: 1px solid var(--border-medium);
        border-radius: 999px;
        background: transparent;
        color: var(--text-dim);
        font: inherit;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .btn:hover {
        background: rgba(201, 166, 107, 0.08);
        border-color: var(--accent-dim);
        color: var(--accent);
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
        border: none;
        color: var(--bg-deep);
        font-weight: 600;
      }

      .btn-primary:hover {
        background: linear-gradient(135deg, #d4b07a 0%, var(--accent) 100%);
        box-shadow: 0 4px 20px rgba(201, 166, 107, 0.3);
      }

      .list-clean {
        display: grid;
        gap: 12px;
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
      }

      .list-clean li a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px;
        border: 1px solid var(--border-subtle);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.02);
        color: var(--text);
        text-decoration: none;
        transition: all 0.2s;
      }

      .list-clean li a:hover,
      .list-clean li a:focus {
        background: rgba(201, 166, 107, 0.06);
        border-color: var(--accent-dim);
      }

      .list-clean .place-name {
        font-size: 1.05rem;
      }

      .list-clean .year-badge {
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--accent-glow);
        font-size: 0.75rem;
        color: var(--accent);
      }

      .hidden {
        display: none !important;
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      @media (max-width: 640px) {
        main {
          padding: 24px 16px;
        }

        .shell {
          padding: 32px 24px;
          border-radius: 24px;
        }

        form {
          grid-template-columns: 1fr;
        }

        .cta {
          width: 100%;
          text-align: center;
        }
      }
  `;
}