/**
 * Data Compass — Definition Sync API
 *
 * Lightweight Express server that accepts definition upserts from the
 * warehouse GitHub Actions pipeline and persists them to data/definitions.json.
 *
 * Endpoints:
 *   GET    /api/definitions                     List all definitions
 *   POST   /api/definitions/:schema/:viewname   Upsert a definition
 *   DELETE /api/definitions/:schema/:viewname   Soft-delete a definition
 *
 * Auth: X-API-Key header must match WEBHOOK_API_KEY env var.
 *       If WEBHOOK_API_KEY is not set, auth is skipped (local dev).
 *
 * Run:  node server/index.js
 * Dev:  node --watch server/index.js
 */

import express from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '../data');
const DATA_FILE = join(DATA_DIR, 'definitions.json');
const PORT      = process.env.PORT || 3001;
const API_KEY   = process.env.WEBHOOK_API_KEY;

// Ensure data directory and file exist on startup
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, '[]', 'utf8');

const app = express();
app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
function requireApiKey(req, res, next) {
  if (!API_KEY) {
    // No key configured — allow all (useful for local development)
    return next();
  }
  const provided = req.headers['x-api-key'];
  if (provided !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function load() {
  return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
}

function persist(defs) {
  writeFileSync(DATA_FILE, JSON.stringify(defs, null, 2), 'utf8');
}

// Match on naam (case-insensitive), mirroring glossary-store.ts behaviour
function findIndex(defs, naam) {
  return defs.findIndex(d => d.naam.toLowerCase() === naam.toLowerCase());
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', definitions: load().length });
});

// GET /api/definitions
app.get('/api/definitions', requireApiKey, (_req, res) => {
  res.json(load());
});

// POST /api/definitions/:schema/:viewname — upsert
app.post('/api/definitions/:schema/:viewname', requireApiKey, (req, res) => {
  const { schema, viewname } = req.params;
  const body = req.body;

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'JSON body required' });
  }

  const defs = load();
  const idx  = findIndex(defs, viewname);

  if (idx >= 0) {
    // Preserve original id, update everything else
    defs[idx] = {
      ...defs[idx],
      ...body,
      naam:   viewname,
      schema,
      id:     defs[idx].id,
    };
    persist(defs);
    return res.json({ action: 'updated', id: defs[idx].id, naam: viewname, schema });
  }

  const newDef = {
    transformaties:  [],
    lineageBranches: null,
    mergeStappen:    null,
    ...body,
    id:     randomUUID(),
    naam:   viewname,
    schema,
  };
  defs.push(newDef);
  persist(defs);
  res.status(201).json({ action: 'created', id: newDef.id, naam: viewname, schema });
});

// DELETE /api/definitions/:schema/:viewname — soft-delete
app.delete('/api/definitions/:schema/:viewname', requireApiKey, (req, res) => {
  const { viewname } = req.params;
  const defs = load();
  const idx  = findIndex(defs, viewname);

  if (idx < 0) {
    return res.status(404).json({ error: `Definition '${viewname}' not found` });
  }

  // Soft-delete: downgrade status so it remains visible but flagged
  defs[idx] = { ...defs[idx], status: 'Concept', _deleted: true };
  persist(defs);
  res.json({ action: 'soft-deleted', id: defs[idx].id, naam: viewname });
});

// ---------------------------------------------------------------------------
// Production: serve React build alongside the API
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const distDir = join(__dirname, '../dist');
  if (existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => res.sendFile(join(distDir, 'index.html')));
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  const authStatus = API_KEY ? 'API key auth enabled' : 'No API key set (auth disabled)';
  console.log(`Data Compass API listening on http://localhost:${PORT}`);
  console.log(`Auth: ${authStatus}`);
  console.log(`Data file: ${DATA_FILE}`);
});
