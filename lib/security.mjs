import { createHash, timingSafeEqual } from 'node:crypto';

export function authorize(request) {
  const expected = process.env.STAYDRY_STAFF_ACCESS_TOKEN;
  if (!expected || expected.length < 32) return Response.json({ error: 'Staff access is not configured.' }, { status: 503 });
  const header = request.headers.get('authorization') || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  const hash = value => createHash('sha256').update(value).digest();
  if (supplied.length > 512 || !timingSafeEqual(hash(supplied), hash(expected))) {
    return Response.json({ error: 'Staff access required.' }, { status: 401 });
  }
  return null;
}

export async function readInput(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) { void reader.cancel(); throw new Error('large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = Buffer.concat(chunks);
  const data = JSON.parse(bytes.toString('utf8'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid');
  for (const value of Object.values(data)) {
    if (typeof value !== 'string' || value.length > 8000) throw new Error('invalid');
  }
  return data;
}

// Supplemental single-process protection; deployment-wide quotas require a
// durable gateway/provider spend limit. No client-controlled IP is trusted.
let windowStart = 0;
let calls = 0;
export function permitGeneration(now = Date.now()) {
  if (now - windowStart >= 60000) { windowStart = now; calls = 0; }
  if (calls >= 10) return false;
  calls += 1;
  return true;
}
