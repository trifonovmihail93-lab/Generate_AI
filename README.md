# AI Image Generator — Stability AI

This is a ready-to-run site (frontend + Node backend) that generates images via Stability AI.

## Quick start
1. Install Node.js 18+.
2. In this folder, run:
   ```bash
   npm install
   ```
3. Create `.env` with your key:
   ```
   STABILITY_API_KEY=your_stability_api_key_here
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open http://localhost:3000 and generate an image.

> Security: Never commit your real API key. Use `.env` and keep it out of git.

## Files
- `index.html` — the UI.
- `server.js` — Express backend proxy to Stability API.
- `.env.example` — template for environment variable.
- `package.json` — dependencies and scripts.
- `.gitignore` — prevents committing secrets and node_modules.

## Notes
- Endpoint used: `POST https://api.stability.ai/v2beta/stable-image/generate/ultra`
- The frontend posts to `/api/generate` and expects `{ base64 }`.
- You can change size, seed, and negative prompt from the UI.
