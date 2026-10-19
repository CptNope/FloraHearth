/**
 * FloraHearth sync Worker (Cloudflare Workers + D1)
 *
 * Stores a single FloraHearth backup and serves it back.
 *   GET  /  -> the stored backup JSON (404 if none yet)
 *   POST /  -> replace the stored backup with the request body
 *
 * Every request needs `Authorization: Bearer <SYNC_TOKEN>`.
 * See worker/README.md for setup.
 */

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB is far more than a season of garden data

function corsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

/** Constant-time string comparison so the token can't be guessed by timing. */
function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!env.SYNC_TOKEN || env.SYNC_TOKEN.length < 24) {
      return json({ error: 'Worker is not configured: set a SYNC_TOKEN secret of 24+ characters.' }, 500, cors);
    }

    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!safeEqual(token, env.SYNC_TOKEN)) {
      return json({ error: 'Unauthorized' }, 401, cors);
    }

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT body FROM backups WHERE id = ?').bind('default').first();
      if (!row) return json({ error: 'No backup stored yet' }, 404, cors);
      return new Response(row.body, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
      });
    }

    if (request.method === 'POST') {
      const length = Number(request.headers.get('Content-Length') || 0);
      if (length > MAX_BODY_BYTES) return json({ error: 'Backup too large' }, 413, cors);

      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ error: 'Backup too large' }, 413, cors);

      let bundle;
      try {
        bundle = JSON.parse(text);
      } catch {
        return json({ error: 'Body is not valid JSON' }, 400, cors);
      }
      if (!bundle || typeof bundle !== 'object' || !('exportedAt' in bundle)) {
        return json({ error: 'Body is not a FloraHearth backup' }, 400, cors);
      }

      await env.DB.prepare(
        `INSERT INTO backups (id, body, exported_at, updated_at)
         VALUES (?1, ?2, ?3, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET body = ?2, exported_at = ?3, updated_at = datetime('now')`
      ).bind('default', text, String(bundle.exportedAt)).run();

      return json({ ok: true, exportedAt: bundle.exportedAt }, 200, cors);
    }

    return json({ error: 'Method not allowed' }, 405, cors);
  },
};
