import { escapeHtml } from "./html.js";
import { sharedStyles } from "./shared-styles.js";

export function renderHowItWorks() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How It Works — Séance</title>
    <style>
${sharedStyles()}

      .how-header {
        margin: 0 0 8px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .how-title {
        margin: 0;
        font-size: clamp(1.8rem, 5vw, 2.8rem);
        color: var(--text);
      }

      .how-section {
        margin: 32px 0 0;
      }

      .how-section h2 {
        margin: 0 0 12px;
        font-size: 1.2rem;
        font-weight: normal;
        color: var(--text);
      }

      .how-section p {
        margin: 0;
        font-size: 1rem;
        color: var(--muted);
        line-height: 1.6;
      }

      .how-steps {
        display: grid;
        gap: 24px;
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
      }

      .how-step {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .step-number {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--accent);
        color: #fffaf2;
        font: inherit;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .step-content h3 {
        margin: 0 0 4px;
        font-size: 1.05rem;
        font-weight: normal;
        color: var(--text);
      }

      .step-content p {
        margin: 0;
        font-size: 0.95rem;
        color: var(--muted);
        line-height: 1.5;
      }

      .tech-stack {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin: 16px 0 0;
      }

      .tech-item {
        padding: 8px 16px;
        border: 1px solid rgba(74, 56, 38, 0.14);
        border-radius: 8px;
        background: rgba(255, 253, 249, 0.5);
        font-size: 0.9rem;
        color: var(--text);
      }

      .nav-link {
        display: inline-block;
        margin: 24px 0 0;
        color: var(--accent);
        text-decoration: none;
      }

      .nav-link:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell">
        <p class="how-header">About</p>
        <h1 class="how-title">How Séance Works</h1>

        <div class="how-section">
          <p>Séance reconstructs the soundscape of any place and year using AI audio generation. Enter a location and a year, and hear what that place sounded like in the past.</p>
        </div>

        <div class="how-section">
          <h2>The Process</h2>
          <ol class="how-steps">
            <li class="how-step">
              <span class="step-number">1</span>
              <div class="step-content">
                <h3>Ground in Evidence</h3>
                <p>We research historical records, oral histories, and period documentation to understand what the location sounded like in your chosen year.</p>
              </div>
            </li>
            <li class="how-step">
              <span class="step-number">2</span>
              <div class="step-content">
                <h3>Generate the Soundscape</h3>
                <p>Using ElevenLabs audio generation, we create an immersive audio reconstruction combining ambient bed, event sounds, and texture layers.</p>
              </div>
            </li>
            <li class="how-step">
              <span class="step-number">3</span>
              <div class="step-content">
                <h3>Archive for Later</h3>
                <p>Your seance is saved so you can revisit it anytime. Re-running the same query pulls from the archive instead of regenerating.</p>
              </div>
            </li>
          </ol>
        </div>

        <div class="how-section">
          <h2>Built With</h2>
          <p>Séance combines modern AI technologies to reconstruct historical soundscapes:</p>
          <div class="tech-stack">
            <span class="tech-item">ElevenLabs Audio AI</span>
            <span class="tech-item">Turbopuffer Vector Search</span>
            <span class="tech-item">OpenStreetMap Geography</span>
          </div>
        </div>

        <div class="how-section">
          <h2>Why It Matters</h2>
          <p>Soundscapes shape our memories of place. By reconstructing historical audio environments, we gain a new way to connect with the past — hearing history, not just reading it.</p>
        </div>

        <a class="nav-link" href="/">Start a new seance →</a>
      </section>
    </main>
  </body>
</html>`;
}