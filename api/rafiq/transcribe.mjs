// Best-effort per-instance throttling, not authentication or a global billing cap.
const requests = new Map();
const WINDOW_MS = 60000;
function tooManyRequests(req) {
  const now = Date.now();
  for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
  const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const key = String(ip).slice(0, 128);
  if (!requests.has(key)) {
    if (requests.size >= 10000) return true;
    requests.set(key, { count: 0, until: now + WINDOW_MS });
  }
  return ++requests.get(key).count > 10;
}
const MAX_AUDIO = 4 * 1024 * 1024;
const audioTypes = new Map([['audio/webm','webm'],['audio/wav','wav'],['audio/x-wav','wav'],['audio/mpeg','mp3'],['audio/mp4','mp4'],['audio/x-m4a','m4a']]);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe';

  if (req.headers['x-rafiq-consent'] !== 'adult-test-recording') return res.status(403).json({ error: 'يلزم تأكيد الموافقة من التطبيق.' });
  if (!apiKey) return res.status(503).json({ error: 'التفريغ الصوتي غير مفعّل. أضف مفتاح API.' });

  const mime = (req.headers['content-type'] || '').split(';')[0];
  if (!audioTypes.has(mime)) return res.status(415).json({ error: 'استخدم ملف WAV أو MP3 أو MP4 أو M4A أو WebM.' });
  if (tooManyRequests(req)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests. Please wait one minute.' });
  }

  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_AUDIO) return res.status(413).json({ error: 'الحد الأقصى ٤ ميجابايت.' });
      chunks.push(chunk);
    }
    if (!size) return res.status(400).json({ error: 'ملف الصوت فارغ.' });

    const form = new FormData();
    form.set('file', new Blob(chunks, { type: mime }), `reading.${audioTypes.get(mime)}`);
    form.set('model', model);
    form.set('language', 'ar');
    form.set('response_format', 'json');

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(45000)
    });
    if (!upstream.ok) return res.status(502).json({ error: 'تعذّر التفريغ من مزوّد الخدمة.' });
    const result = await upstream.json();
    if (typeof result.text !== 'string' || !result.text.trim() || result.text.length > 15000) return res.status(502).json({ error: 'تعذّر قراءة نتيجة التفريغ.' });
    return res.json({ text: result.text, provider: 'OpenAI', model, confidence: null, requiresTeacherReview: true });
  } catch (error) {
    return res.status(error.name === 'TimeoutError' ? 504 : 500).json({ error: 'تعذّرت العملية.' });
  }
}
