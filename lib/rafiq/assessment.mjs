// Azure acoustic assessment only. A transcript match is never a pronunciation score.
export const CONSENT_VERSION = 'guardian-speech-v1';
export const normalizeWord = value => String(value).normalize('NFC').replace(/[\u064B-\u0652\u0670\u0640]/gu, '').replace(/[^\p{L}\p{N}]/gu, '');
export const splitSentences = text => text.match(/[^.!؟?\n]+[.!؟?]*/gu)?.map(s => s.trim()).filter(Boolean) || [text];
export const wordTokens = text => text.split(/\s+/u).map(w => w.replace(/[.!؟?،,:؛]/gu, '')).filter(Boolean);

export function interpretAssessment(result, reference) {
  const expected = wordTokens(reference);
  const uncertain = () => ({ status: 'uncertain', words: expected.map(word => ({ word, outcome: 'uncertain' })), provider: 'Azure Speech', locale: 'ar-SA' });
  const best = result?.NBest?.[0];
  if (result?.RecognitionStatus !== 'Success' || !best || !Number.isFinite(best.Confidence) || best.Confidence < 0.65) return uncertain();
  // REST returns scores directly on each word; SDK responses may nest them.
  const acoustic = row => row.PronunciationAssessment ?? row;
  const rows = best.Words?.filter(row => acoustic(row).ErrorType !== 'Insertion');
  // Do not guess an alignment when the provider omitted/malformed word-level output.
  if (!Array.isArray(rows) || rows.length !== expected.length || rows.some((row, i) => normalizeWord(row.Word) !== normalizeWord(expected[i]))) return uncertain();
  const words = rows.map((row, i) => {
    const a = acoustic(row), score = a?.AccuracyScore;
    let outcome = 'uncertain';
    if (a?.ErrorType === 'Omission') outcome = 'try-again';
    else if (Number.isFinite(score) && score >= 0 && score <= 100) {
      if (a.ErrorType === 'None' && score >= 80) outcome = 'clear';
      else if (a.ErrorType === 'Mispronunciation' && score < 60) outcome = 'try-again';
    }
    // Thresholds are conservative practice hints, not validated child norms or grades.
    return { word: expected[i], outcome };
  });
  return { status: words.some(w => w.outcome === 'uncertain') ? 'uncertain' : 'assessed', words, provider: 'Azure Speech', locale: 'ar-SA' };
}

export function validateWav(bytes) {
  if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') return false;
  let fmt = false, dataSize = 0;
  for (let at = 12; at + 8 <= bytes.length;) {
    const tag = bytes.toString('ascii', at, at + 4), size = bytes.readUInt32LE(at + 4), start = at + 8;
    if (start + size > bytes.length) return false;
    if (tag === 'fmt ') {
      if (size < 16) return false;
      fmt = bytes.readUInt16LE(start) === 1 && bytes.readUInt16LE(start + 2) === 1 && bytes.readUInt32LE(start + 4) === 16000 && bytes.readUInt16LE(start + 14) === 16;
    }
    if (tag === 'data') dataSize += size;
    at = start + size + (size % 2);
  }
  return fmt && dataSize >= 8000 && dataSize <= 16000 * 2 * 30;
}
