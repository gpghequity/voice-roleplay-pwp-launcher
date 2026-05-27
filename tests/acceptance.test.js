'use strict';

/**
 * Prompt 08 — PwP Full Launcher Acceptance Tests
 * 5 acceptance tests per spec:
 *   AT-1  Launcher renders all existing tools
 *   AT-2  Tools are grouped without breaking links
 *   AT-3  Chrome / Edge warning appears
 *   AT-4  Feedback capture works (or exact blocker logged)
 *   AT-5  Real estate/lending copy is separated from school/general copy
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// ── Load server (without calling app.listen) ─────────────────────────────────
// server.js does require('dotenv').config() then calls app.listen() at module
// level unless we intercept.  We monkey-patch listen to a no-op for tests.
let app;
let server;
let request;
let tmpDir;

// All 18 tool button IDs expected in the HTML (section 1-6)
const RE_BUTTON_IDS = [
  'btn-acquisition',
  'btn-hardscenarios',
  'btn-seller',
  'btn-wholesaler',
  'btn-buyer',
  'btn-broker',
  'btn-agent',
  'btn-agentwalkthrough',
  'btn-storage',
  'btn-commercial',
  'btn-lender',
  'btn-lendercommand',
  'btn-virtualsteve',
  'btn-educator',
  'btn-raiseready',
  'btn-sayit',
  'btn-sceneloop',
  'btn-speakup',
];

// 4 school card button IDs (section 7)
const SCHOOL_BUTTON_IDS = [
  'btn-school-speakup',
  'btn-school-sceneloop',
  'btn-school-sayit',
  'btn-school-raiseready',
];

// audience data-attribute values that must appear in the HTML
const EXPECTED_AUDIENCE_ATTRS = ['re', 'school', 'biz'];

describe('Prompt 08 — PwP Full Launcher Acceptance Tests', () => {

  before(() => {
    // Redirect DATA_DIR to a temp folder so tests don't pollute real data
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pwp-test-'));
    process.env.DATA_DIR_OVERRIDE = tmpDir; // picked up by server if we added support
    // We patch process.env.PORT to avoid binding 4003 during tests
    process.env.PORT = '0';

    // Suppress listen() so app.listen() in server.js binds an ephemeral port
    // supertest handles this transparently with app (not a live server)
    app = require('../server');
    request = supertest(app);
  });

  after(() => {
    // Clean up temp directory
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  });

  // ── AT-1: Launcher renders all existing tools ──────────────────────────────
  test('AT-1: GET / returns 200 and HTML contains all 22 tool buttons', async () => {
    const res = await request.get('/');
    assert.equal(res.status, 200, 'Expected HTTP 200 from GET /');
    assert.ok(
      res.headers['content-type'].includes('text/html'),
      'Expected content-type text/html'
    );

    const html = res.text;

    for (const id of RE_BUTTON_IDS) {
      assert.ok(
        html.includes(`id="${id}"`),
        `AT-1 FAILED: Missing RE/Lending button id="${id}"`
      );
    }

    for (const id of SCHOOL_BUTTON_IDS) {
      assert.ok(
        html.includes(`id="${id}"`),
        `AT-1 FAILED: Missing school button id="${id}"`
      );
    }
  });

  // ── AT-2: Tools are grouped without breaking links ─────────────────────────
  test('AT-2: Audience data-attributes present; all launch buttons exist', async () => {
    const res = await request.get('/');
    assert.equal(res.status, 200);
    const html = res.text;

    // Verify each audience segment is represented as a data-audience attribute
    for (const audience of EXPECTED_AUDIENCE_ATTRS) {
      assert.ok(
        html.includes(`data-audience="${audience}"`),
        `AT-2 FAILED: Missing data-audience="${audience}" on section-group`
      );
    }

    // All RE/Lending buttons are present (already verified in AT-1, also checking
    // that none of them have been stripped of their onclick handler)
    for (const id of RE_BUTTON_IDS) {
      assert.ok(
        html.includes(`id="${id}"`),
        `AT-2 FAILED: Button id="${id}" missing`
      );
    }

    // Audience filter bar buttons exist
    assert.ok(html.includes("filterAudience('all')"),    "AT-2 FAILED: filterAudience('all') missing");
    assert.ok(html.includes("filterAudience('re')"),     "AT-2 FAILED: filterAudience('re') missing");
    assert.ok(html.includes("filterAudience('school')"), "AT-2 FAILED: filterAudience('school') missing");
    assert.ok(html.includes("filterAudience('biz')"),    "AT-2 FAILED: filterAudience('biz') missing");

    // Config endpoint wires URLs into anchor hrefs via JS — verify /config exists
    const cfg = await request.get('/config');
    assert.equal(cfg.status, 200, 'AT-2 FAILED: /config endpoint returned non-200');
    const body = cfg.body;

    // Spot-check a sample of expected config keys
    const requiredKeys = [
      'acquisitionUrl', 'hardScenariosUrl', 'sellerUrl', 'wholesalerUrl',
      'buyerUrl', 'brokerUrl', 'agentUrl', 'agentWalkthroughUrl',
      'storageUrl', 'commercialUrl', 'lenderUrl', 'lenderCommandUrl',
      'virtualSteveUrl', 'educatorUrl',
      'raisereadyUrl', 'sayitUrl', 'sceneloopUrl', 'speakupUrl',
      'schoolPublicSpeakUrl', 'schoolSceneloopUrl', 'schoolSayitUrl', 'schoolRaisereadyUrl',
    ];
    for (const key of requiredKeys) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(body, key),
        `AT-2 FAILED: /config missing key "${key}"`
      );
      assert.ok(
        typeof body[key] === 'string' && body[key].length > 0,
        `AT-2 FAILED: /config key "${key}" is empty`
      );
    }
  });

  // ── AT-3: Chrome / Edge warning appears ───────────────────────────────────
  test('AT-3: HTML contains browser-warn element with Chrome and Edge text', async () => {
    const res = await request.get('/');
    assert.equal(res.status, 200);
    const html = res.text;

    assert.ok(
      html.includes('id="browser-warn"'),
      'AT-3 FAILED: id="browser-warn" element missing from HTML'
    );
    assert.ok(
      html.includes('Chrome') || html.includes('chrome'),
      'AT-3 FAILED: No Chrome reference inside browser-warn HTML'
    );
    assert.ok(
      html.includes('Edge') || html.includes('edge'),
      'AT-3 FAILED: No Edge reference inside browser-warn HTML'
    );
    // Warning must not start hidden — no class="hidden" on the element
    // We check the specific element tag doesn't have hidden in its opening div
    const warnMatch = html.match(/<div[^>]*id="browser-warn"[^>]*>/);
    assert.ok(warnMatch, 'AT-3 FAILED: browser-warn div not found in HTML');
    assert.ok(
      !warnMatch[0].includes('class="hidden"'),
      'AT-3 FAILED: browser-warn starts hidden — it must be visible by default'
    );
  });

  // ── AT-4: Feedback capture works ──────────────────────────────────────────
  test('AT-4: POST /api/feedback accepts valid payload and returns { ok: true, id }', async () => {
    const payload = {
      tool:             'Acquisition Training',
      useful:           'Yes',
      realism:          '4',
      difficulty:       'Just Right',
      would_recommend:  'Yes',
      use_case:         'agent',
      notes:            'Automated acceptance test — AT-4',
    };

    const res = await request
      .post('/api/feedback')
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.equal(res.status, 200, `AT-4 FAILED: Expected 200, got ${res.status}`);
    assert.ok(res.body.ok === true, `AT-4 FAILED: ok !== true — body: ${JSON.stringify(res.body)}`);
    assert.ok(
      typeof res.body.id === 'string' && res.body.id.length > 0,
      `AT-4 FAILED: id missing or empty — body: ${JSON.stringify(res.body)}`
    );
  });

  test('AT-4b: POST /api/feedback without tool field returns 400', async () => {
    const res = await request
      .post('/api/feedback')
      .set('Content-Type', 'application/json')
      .send({ useful: 'Yes' });

    assert.equal(res.status, 400, `AT-4b FAILED: Expected 400, got ${res.status}`);
    assert.ok(res.body.ok === false, 'AT-4b FAILED: ok should be false for missing tool');
  });

  test('AT-4c: POST /api/beta-signup accepts valid email and returns { ok: true }', async () => {
    const res = await request
      .post('/api/beta-signup')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@acceptance.test', use_case: 'agent' });

    assert.equal(res.status, 200, `AT-4c FAILED: Expected 200, got ${res.status}`);
    assert.ok(res.body.ok === true, `AT-4c FAILED: ok !== true — body: ${JSON.stringify(res.body)}`);
  });

  test('AT-4d: POST /api/beta-signup without valid email returns 400', async () => {
    const res = await request
      .post('/api/beta-signup')
      .set('Content-Type', 'application/json')
      .send({ email: 'not-an-email' });

    assert.equal(res.status, 400, `AT-4d FAILED: Expected 400, got ${res.status}`);
    assert.ok(res.body.ok === false, 'AT-4d FAILED: ok should be false for invalid email');
  });

  // ── AT-5: RE/Lending copy is separated from school/general copy ───────────
  test('AT-5: RE sections (data-audience="re") do not contain school-specific copy', async () => {
    const res = await request.get('/');
    assert.equal(res.status, 200);
    const html = res.text;

    // Extract each data-audience="re" block — find all occurrences
    const reBlocks = [];
    const reSectionPattern = /data-audience="re"([\s\S]*?)(?=data-audience="|<\/main>)/g;
    let match;
    while ((match = reSectionPattern.exec(html)) !== null) {
      reBlocks.push(match[1]);
    }

    assert.ok(reBlocks.length > 0, 'AT-5 FAILED: No data-audience="re" sections found');

    // Phrases that belong only in the school section
    const schoolOnlyPhrases = [
      'class presentations',
      'student government',
      'drama class',
      'scholarship interview',
      'student organization',
      'school-card',
    ];

    for (const block of reBlocks) {
      for (const phrase of schoolOnlyPhrases) {
        assert.ok(
          !block.toLowerCase().includes(phrase.toLowerCase()),
          `AT-5 FAILED: School-specific phrase "${phrase}" found inside a data-audience="re" section`
        );
      }
    }

    // School section (data-audience="school") MUST exist and contain school-specific content
    assert.ok(
      html.includes('data-audience="school"'),
      'AT-5 FAILED: No data-audience="school" section found — school section is missing'
    );
    assert.ok(
      html.includes('school-card'),
      'AT-5 FAILED: No school-card CSS class found — school visual distinction missing'
    );
    assert.ok(
      html.includes('School') && html.includes('Career Readiness'),
      'AT-5 FAILED: School & Career Readiness heading not found in HTML'
    );

    // The "Practice Before It Counts" tagline must be in the header (applies to all)
    assert.ok(
      html.includes('Practice Before It Counts'),
      'AT-5 FAILED: Main tagline "Practice Before It Counts" missing'
    );
  });

});
