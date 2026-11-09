import { passages } from '../../lib/rafiq/content.mjs';
import { CONSENT_VERSION, splitSentences, wordTokens, interpretAssessment, validateWav } from '../../lib/rafiq/assessment.mjs';

export const config = { api: { bodyParser: false } };
const limits = new Map();
function allowed(req) {
  const now = Date.now();
  for (const [key, row] of limits) if (row.until <= now) limits.delete(key);
  const key = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').slice(0, 128);
  if (!limits.has(key)) {
    if (limits.size >= 10000) return false;
    limits.set(key, { count: 0, until: now + 60000 });
  }
  return ++limits.get(key).count <= 6;
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const region = process.env.AZURE_SPEECH_REGION;
  const enabled = process.env.RAFIQ_LEARNER_SPEECH_ENABLED === 'true' && !!process.env.AZURE_SPEECH_KEY && /^[a-z0-9-]{2,40}$/.test(region || '');
  if (req.method === 'GET') return res.json({ enabled, consentVersion: CONSENT_VERSION, provider: 'Microsoft Azure Speech', locale: 'ar-SA', maxSeconds: 29 });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.headers['x-rafiq-consent'] !== CONSENT_VERSION) return res.status(403).json({ error: 'Guardian consent is required' });
  if (!enabled) return res.status(503).json({ error: 'Speech assessment is not enabled' });
  if (req.headers['content-type']?.split(';')[0] !== 'audio/wav') return res.status(415).json({ error: '16 kHz mono PCM WAV required' });
  const story = passages.find(p => p.id === req.headers['x-rafiq-story']);
  const sentenceValue = req.headers['x-rafiq-sentence'];
  if (!story || !/^\d{1,2}$/.test(sentenceValue || '')) return res.status(400).json({ error: 'Invalid story or sentence' });
  let reference = splitSentences(story.text)[Number(sentenceValue)];
  if (!reference) return res.status(400).json({ error: 'Invalid sentence' });
  const word = req.headers['x-rafiq-word'];
  if (word !== undefined) {
    if (!/^\d{1,2}$/.test(word)) return res.status(400).json({ error: 'Invalid word' });
    reference = wordTokens(reference)[Number(word)];
    if (!reference) return res.status(400).json({ error: 'Invalid word' });
  }
  if (!allowed(req)) { res.setHeader('Retry-After', '60'); return res.status(429).json({ error: 'Wait a minute before trying again' }); }
  try {
    let size = 0; const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 1024 * 1024) return res.status(413).json({ error: 'Recording too large' });
      chunks.push(chunk);
    }
    const audio = Buffer.concat(chunks);
    if (!validateWav(audio)) return res.status(400).json({ error: 'Record 0.25–29 seconds of mono PCM audio' });
    const assessment = Buffer.from(JSON.stringify({ ReferenceText: reference, GradingSystem: 'HundredMark', Granularity: 'Phoneme', Dimension: 'Comprehensive', EnableMiscue: true })).toString('base64');
    const upstream = await fetch(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=ar-SA&format=detailed`, {
      method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY, 'Pronunciation-Assessment': assessment, 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', Accept: 'application/json' },
      body: audio, signal: AbortSignal.timeout(25000)
    });
    if (!upstream.ok) return res.status(upstream.status === 429 ? 429 : 502).json({ error: 'Speech service unavailable; no reading judgment was made' });
    return res.json(interpretAssessment(await upstream.json(), reference));
  } catch (error) {
    return res.status(error.name === 'TimeoutError' ? 504 : 502).json({ error: 'Assessment unavailable; please retry' });
  }
}
