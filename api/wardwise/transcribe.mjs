import { allowedVoiceAccess } from '../../lib/wardwise/access.mjs';
import { createHash } from 'node:crypto';
import { parseBuffer } from 'music-metadata';

export const config = { api: { bodyParser: false } };
const MAX_BYTES = 1500000;
const ALLOWED_TYPES = new Set(['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/mpeg', 'audio/webm', 'audio/wav']);
const digest = value => createHash('sha256').update(value).digest();

// Private beta credential, never an OpenAI key and never embedded in the app.
export function createHandler({ env = process.env, upstream = fetch, metadata = parseBuffer, now = Date.now } = {}) {
  const budget = new Map();
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
    const expected = env.WARDWISE_BETA_ACCESS_TOKEN;
    if (!expected || !env.OPENAI_API_KEY) return res.status(503).json({ error: 'Voice transcription is not configured.' });
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    if (!allowedVoiceAccess(token, env, now())) return res.status(401).json({ error: 'Check your private voice access code in Settings.' });
    if (req.headers['x-wardwise-consent'] !== 'fictional-practice-audio-v1') return res.status(403).json({ error: 'Please consent before sending a recording.' });
    const mime = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
    if (!ALLOWED_TYPES.has(mime)) return res.status(415).json({ error: 'Use an M4A, MP3, WAV or WebM recording.' });
    const time = now();
    // Per-instance guard only. Private beta access is the authorization boundary.
    for (const [key, entry] of budget) if (entry.until <= time) budget.delete(key);
    const key = digest(token).toString('hex');
    const entry = budget.get(key) || { count: 0, until: time + 3600000 };
    if (entry.count >= 60) return res.status(429).json({ error: 'Voice beta allowance reached. Please try again later or type your response.' });
    entry.count++; budget.set(key, entry);
    try {
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BYTES) return res.status(413).json({ error: 'Recording is too large. Please record a shorter response.' });
        chunks.push(chunk);
      }
      if (!size) return res.status(400).json({ error: 'No recording was received.' });
      const bytes = Buffer.concat(chunks);
      let info;
      try { info = await metadata(bytes, { mimeType: mime }, { duration: true }); }
      catch { return res.status(400).json({ error: 'This recording could not be read. Please record again.' }); }
      const duration = info.format.duration;
      if (!Number.isFinite(duration) || duration < 0.3 || duration > 46) return res.status(400).json({ error: 'Record between 1 and 45 seconds of speech.' });
      const form = new FormData();
      const extension = mime.includes('webm') ? 'webm' : mime.includes('wav') ? 'wav' : mime.includes('mpeg') ? 'mp3' : 'm4a';
      form.set('file', new Blob([bytes], { type: mime }), `practice.${extension}`);
      form.set('model', 'gpt-transcribe');
      // Do not supply a sample answer: that could bias a transcript toward words the learner never said.
      const response = await upstream('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: form,
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) return res.status(502).json({ error: 'Transcription is temporarily unavailable. Your recording is still on this screen; retry or type your words.' });
      const result = await response.json();
      if (typeof result.text !== 'string' || !result.text.trim() || result.text.length > 5000) return res.status(422).json({ error: 'No clear speech was found. Please try again or type your response.' });
      return res.status(200).json({ text: result.text.trim(), provider: 'OpenAI', requiresConfirmation: true });
    } catch (error) {
      return res.status(error?.name === 'TimeoutError' ? 504 : 500).json({ error: 'Transcription could not finish. Retry or type your response.' });
    }
  };
}
export default createHandler();
