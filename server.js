import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

// --- Quick sanity check for the API key (masked) ---
const _key = process.env.STABILITY_API_KEY;
if (!_key) {
  console.error('⚠️  STABILITY_API_KEY is not set. Create a .env file with STABILITY_API_KEY=your_key');
} else {
  try {
    const masked = `${_key.slice(0,4)}...${_key.slice(-4)}`;
    console.log(`🔑 STABILITY_API_KEY found: ${masked}`);
  } catch (e) {
    console.log('🔑 STABILITY_API_KEY found (unable to mask)');
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static('.')); // serve index.html if hosted together

// === API endpoint ===
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, negative, seed, size = '1024x1024' } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    // Parse size (e.g. "1024x1024")
    const [w, h] = size.split('x').map(n => parseInt(n, 10));

    // Create form-data for Stability API
    const form = new FormData();
    form.append('prompt', prompt);
    if (negative) form.append('negative_prompt', negative);
    form.append('width', String(w));
    form.append('height', String(h));
    form.append('output_format', 'png');
    if (seed !== undefined && seed !== null && seed !== '') {
      form.append('seed', String(seed));
    }

    // === Stability AI Request ===
    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      {
        method: 'POST',
        headers: {
          ...form.getHeaders(), // 👈 додає boundary + content-type
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Accept': 'image/*'    // 👈 ключове виправлення
        },
        body: form
      }
    );

    // === Handle API errors ===
    if (!response.ok) {
      const text = await response.text();
      console.error('Stability error:', text);
      return res
        .status(response.status)
        .json({ error: `Stability API error: ${text}` });
    }

    // === Convert image to Base64 ===
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Send JSON back to frontend
    res.json({ base64 });
  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// === Start server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
