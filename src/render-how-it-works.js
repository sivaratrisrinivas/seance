import { escapeHtml } from "./html.js";
import { sharedHead } from "./shared-styles.js";

export function renderHowItWorks() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How It Works — Séance</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
    <style>
      ${sharedHead()}

      .how-hero {
        text-align: center;
        padding: 20px 0 32px;
      }

      .how-header {
        margin: 0 0 12px;
        font-size: 0.7rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .how-title {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 2.8rem);
        font-weight: 400;
        color: var(--text);
      }

      .how-intro {
        margin: 20px auto 0;
        font-size: 1.1rem;
        color: var(--text-dim);
        max-width: 48ch;
        line-height: 1.7;
      }

      .how-section {
        margin: 40px 0 0;
        padding-top: 28px;
        border-top: 1px solid var(--border-subtle);
      }

      .how-section h2 {
        margin: 0 0 16px;
        font-family: var(--font-display);
        font-size: 1.3rem;
        font-weight: 400;
        color: var(--text);
      }

      .how-section > p {
        margin: 0;
        font-size: 1rem;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .how-steps {
        display: grid;
        gap: 20px;
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
      }

      .how-step {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        padding: 20px 22px;
        border: 1px solid var(--border-subtle);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.02);
        transition: all 0.2s;
      }

      .how-step:hover {
        background: rgba(201, 166, 107, 0.04);
        border-color: var(--border-medium);
      }

      .step-number {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--accent);
        color: var(--bg-deep);
        font: inherit;
        font-size: 0.95rem;
        font-weight: 600;
      }

      .step-content h3 {
        margin: 0 0 8px;
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 400;
        color: var(--text);
      }

      .step-content p {
        margin: 0;
        font-size: 0.95rem;
        color: var(--text-muted);
        line-height: 1.6;
      }

      .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 16px 0 0;
      }

      .tech-item {
        padding: 8px 16px;
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        background: rgba(201, 166, 107, 0.04);
        font-size: 0.85rem;
        color: var(--text-dim);
      }

      .nav-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 40px;
        color: var(--accent);
        font-size: 1rem;
        text-decoration: none;
        transition: all 0.2s;
      }

      .nav-link:hover {
        transform: translateX(4px);
      }

      .nav-link::after {
        content: "→";
      }
    </style>
  </head>
  <body>
    <main>
      <div class="shell">
        <header class="how-hero">
          <p class="how-header">About</p>
          <h1 class="how-title">How Séance Works</h1>
          <p class="how-intro">We reconstruct the soundscape of any place and year by combining archival research with AI audio generation.</p>
        </header>

        <section class="how-section">
          <h2>The Process</h2>
          <ol class="how-steps">
            <li class="how-step">
              <span class="step-number">1</span>
              <div class="step-content">
                <h3>Ground in Evidence</h3>
                <p>We search through historical records, memoirs, and period documentation to understand what the location sounded like in your chosen year.</p>
              </div>
            </li>
            <li class="how-step">
              <span class="step-number">2</span>
              <div class="step-content">
                <h3>Compose the Soundscape</h3>
                <p>Using AI audio generation, we create an immersive reconstruction combining ambient layers, human activity, and mechanical sounds.</p>
              </div>
            </li>
            <li class="how-step">
              <span class="step-number">3</span>
              <div class="step-content">
                <h3>Archive for Later</h3>
                <p>Your reconstruction is saved so you can revisit it anytime. Re-running the same query pulls from the archive instead of regenerating.</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="how-section">
          <h2>Built With</h2>
          <p>Séance combines modern AI technologies to reconstruct historical soundscapes:</p>
          <div class="tech-stack">
            <span class="tech-item">ElevenLabs Audio AI</span>
            <span class="tech-item">Turbopuffer Vector Search</span>
            <span class="tech-item">Historical Archives</span>
          </div>
        </section>

        <section class="how-section">
          <h2>Why It Matters</h2>
          <p>Soundscapes shape our memories of place. By reconstructing historical audio environments, we gain a new way to connect with the past — hearing history, not just reading it.</p>
        </section>

        <a class="nav-link" href="/">Begin a reconstruction</a>
      </div>
    </main>
  </body>
</html>`;
}