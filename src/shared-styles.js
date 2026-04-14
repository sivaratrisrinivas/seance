export function sharedStyles() {
  return `
      :root {
        color-scheme: light;
        --bg: #f6efe3;
        --panel: rgba(255, 250, 242, 0.84);
        --border: rgba(65, 47, 29, 0.14);
        --text: #20160f;
        --muted: #6f5845;
        --accent: #9c5d28;
        font-family: "Georgia", "Times New Roman", serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--text);
        background:
          radial-gradient(circle at top, rgba(255, 255, 255, 0.86), transparent 45%),
          linear-gradient(160deg, #f8f3ea 0%, var(--bg) 52%, #eadfce 100%);
      }

      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 20px;
      }

      .shell {
        width: min(100%, 720px);
        padding: 44px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: var(--panel);
        box-shadow: 0 24px 80px rgba(72, 51, 24, 0.12);
      }

      .brand {
        margin: 0;
        font-size: clamp(2.2rem, 6vw, 4.2rem);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .premise {
        margin: 18px 0 0;
        max-width: 28ch;
        font-size: clamp(1.15rem, 2.6vw, 1.55rem);
        line-height: 1.45;
        color: var(--muted);
      }

      form {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
        gap: 18px;
        margin-top: 36px;
      }

      label {
        display: grid;
        gap: 10px;
        font-size: 0.9rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      input {
        width: 100%;
        padding: 16px 18px;
        border: 1px solid rgba(74, 56, 38, 0.2);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.92);
        color: var(--text);
        font: inherit;
        font-size: 1.05rem;
      }

      .cta {
        grid-column: 1 / -1;
        justify-self: start;
        padding: 14px 24px;
        border: 0;
        border-radius: 999px;
        background: var(--text);
        color: #fffaf2;
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
      }

      .status-kicker {
        margin: 0 0 12px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .loading-copy {
        margin: 18px 0 0;
        max-width: 34ch;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--muted);
      }

      .stage-list {
        display: grid;
        gap: 12px;
        margin: 32px 0 0;
        padding: 0;
        list-style: none;
      }

      .stage {
        padding: 14px 16px;
        border: 1px solid rgba(74, 56, 38, 0.14);
        border-radius: 18px;
        background: rgba(255, 253, 249, 0.78);
      }

      .stage strong {
        display: block;
        font-size: 0.95rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .stage span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
      }

      input:focus {
        outline: 2px solid rgba(156, 93, 40, 0.2);
        border-color: var(--accent);
      }

      @media (max-width: 720px) {
        main {
          padding: 20px 14px;
        }

        .shell {
          padding: 28px 20px;
          border-radius: 24px;
        }

        form {
          grid-template-columns: 1fr;
        }
      }
  `;
}
