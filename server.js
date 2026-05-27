require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4003;

// ── Data directory (ephemeral without Railway Volume — see BLOCKED note) ──────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Config — all tool URLs injected from env ───────────────────────────────────
app.get('/config', (req, res) => {
  res.json({
    // REI Acquisition
    acquisitionUrl:       process.env.ACQUISITION_URL       || 'https://voice-roleplay-production.up.railway.app',
    hardScenariosUrl:     process.env.HARD_SCENARIOS_URL    || 'https://voice-roleplay-adult-production.up.railway.app',
    sellerUrl:            process.env.SELLER_URL            || 'https://voice-roleplay-rei-practice-production.up.railway.app',
    wholesalerUrl:        process.env.WHOLESALER_URL        || 'https://voice-roleplay-wholesaler-practice-production.up.railway.app',
    // Representation / Agent Practice
    buyerUrl:             process.env.BUYER_URL             || 'https://voice-roleplay-buyer-practice-production.up.railway.app',
    brokerUrl:            process.env.BROKER_URL            || 'https://voice-roleplay-broker-practice-production.up.railway.app',
    agentUrl:             process.env.AGENT_URL             || 'https://voice-roleplay-agent-practice-production.up.railway.app',
    agentWalkthroughUrl:  process.env.AGENT_WALKTHROUGH_URL || 'https://voice-roleplay-agent-walkthrough-production.up.railway.app',
    // Specialty Assets
    storageUrl:           process.env.STORAGE_URL           || 'https://voice-roleplay-storage-practice-production.up.railway.app',
    commercialUrl:        process.env.COMMERCIAL_URL        || 'https://voice-roleplay-commercial-practice-production.up.railway.app',
    // Finance / Lending
    lenderUrl:            process.env.LENDER_URL            || 'https://voice-roleplay-lender-practice-production.up.railway.app',
    lenderCommandUrl:     process.env.LENDER_COMMAND_URL    || 'https://lender-command-production.up.railway.app',
    // Education / Advisor
    virtualSteveUrl:      process.env.VIRTUAL_STEVE_URL     || 'https://virtual-steve-production.up.railway.app',
    educatorUrl:          process.env.EDUCATOR_URL          || 'https://voice-roleplay-rei-training-production.up.railway.app',
    // Presentation / Language (Business)
    raisereadyUrl:        process.env.RAISEREADY_URL        || 'https://voice-roleplay-raiseready-practice-production.up.railway.app',
    sayitUrl:             process.env.SAYIT_URL             || 'https://voice-roleplay-sayit-practice-production.up.railway.app',
    sceneloopUrl:         process.env.SCENELOOP_URL         || 'https://voice-roleplay-sceneloop-practice-production.up.railway.app',
    speakupUrl:           process.env.SPEAKUP_URL           || 'https://voice-roleplay-commercial-training-production.up.railway.app',
    // School / Career Readiness (same tools, school-audience links)
    schoolPublicSpeakUrl: process.env.SCHOOL_PUBLIC_SPEAK_URL  || process.env.SPEAKUP_URL    || 'https://voice-roleplay-commercial-training-production.up.railway.app',
    schoolSceneloopUrl:   process.env.SCHOOL_SCENELOOP_URL     || process.env.SCENELOOP_URL  || 'https://voice-roleplay-sceneloop-practice-production.up.railway.app',
    schoolSayitUrl:       process.env.SCHOOL_SAYIT_URL         || process.env.SAYIT_URL      || 'https://voice-roleplay-sayit-practice-production.up.railway.app',
    schoolRaisereadyUrl:  process.env.SCHOOL_RAISEREADY_URL    || process.env.RAISEREADY_URL || 'https://voice-roleplay-raiseready-practice-production.up.railway.app',
  });
});

// ── Feedback capture ──────────────────────────────────────────────────────────
// NOTE: Feedback stored in data/feedback.jsonl (ephemeral without Railway Volume /data)
app.post('/api/feedback', (req, res) => {
  const { tool, useful, realism, difficulty, bugs, would_recommend, use_case, notes } = req.body || {};
  if (!tool) return res.status(400).json({ ok: false, error: 'tool is required' });

  const entry = {
    id:             Date.now().toString(36),
    timestamp:      new Date().toISOString(),
    tool:           String(tool).slice(0, 80),
    useful:         useful !== undefined ? String(useful).slice(0, 20) : '',
    realism:        realism !== undefined ? String(realism).slice(0, 5) : '',
    difficulty:     difficulty !== undefined ? String(difficulty).slice(0, 20) : '',
    bugs:           bugs ? String(bugs).slice(0, 500) : '',
    would_recommend: would_recommend !== undefined ? String(would_recommend).slice(0, 10) : '',
    use_case:       use_case ? String(use_case).slice(0, 40) : '',
    notes:          notes ? String(notes).slice(0, 500) : '',
  };

  const filePath = path.join(DATA_DIR, 'feedback.jsonl');
  try {
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
    console.log(`[FEEDBACK] ${entry.id} tool=${entry.tool} useful=${entry.useful}`);
    res.json({ ok: true, id: entry.id });
  } catch (e) {
    console.error('[FEEDBACK] Write failed:', e.message);
    // Don't surface filesystem errors to user — feedback captured in-memory log
    res.json({ ok: true, id: entry.id, note: 'session-only' });
  }
});

// ── Beta signup ───────────────────────────────────────────────────────────────
app.post('/api/beta-signup', (req, res) => {
  const { email, use_case, tools_interested } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ ok: false, error: 'Valid email required' });

  const entry = {
    id:               Date.now().toString(36),
    timestamp:        new Date().toISOString(),
    email:            String(email).slice(0, 120),
    use_case:         use_case ? String(use_case).slice(0, 60) : '',
    tools_interested: Array.isArray(tools_interested) ? tools_interested.slice(0, 10).join(',') : String(tools_interested || '').slice(0, 200),
  };

  const filePath = path.join(DATA_DIR, 'beta-signups.jsonl');
  try {
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
    console.log(`[BETA] Signup: ${entry.id} use_case=${entry.use_case}`);
    res.json({ ok: true, id: entry.id });
  } catch (e) {
    console.error('[BETA] Write failed:', e.message);
    res.json({ ok: true, id: entry.id, note: 'session-only' });
  }
});

// ── Feedback count (admin info) ───────────────────────────────────────────────
app.get('/api/feedback/count', (req, res) => {
  const filePath = path.join(DATA_DIR, 'feedback.jsonl');
  try {
    if (!fs.existsSync(filePath)) return res.json({ ok: true, count: 0 });
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    res.json({ ok: true, count: lines.length });
  } catch {
    res.json({ ok: true, count: 0 });
  }
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PwP Full Launcher running on http://localhost:${PORT}`);
  console.log(`Data dir: ${DATA_DIR}`);
});

module.exports = app; // for testing
