require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/config', (req, res) => {
  res.json({
    // REI Acquisition
    acquisitionUrl:  process.env.ACQUISITION_URL    || 'https://voice-roleplay-production.up.railway.app',
    hardScenariosUrl: process.env.HARD_SCENARIOS_URL || 'https://voice-roleplay-adult-production.up.railway.app',
    sellerUrl:       process.env.SELLER_URL         || 'https://voice-roleplay-rei-practice-production.up.railway.app',
    wholesalerUrl:   process.env.WHOLESALER_URL     || 'https://wholesaler-practice-production.up.railway.app',
    // REI Representation
    buyerUrl:        process.env.BUYER_URL          || 'https://buyer-practice-production.up.railway.app',
    brokerUrl:       process.env.BROKER_URL         || 'https://broker-practice-production.up.railway.app',
    agentUrl:        process.env.AGENT_URL          || 'https://agent-practice-production.up.railway.app',
    agentWalkthroughUrl: process.env.AGENT_WALKTHROUGH_URL || 'https://voice-roleplay-agent-walkthrough-production.up.railway.app',
    // Specialty Assets
    storageUrl:      process.env.STORAGE_URL        || 'https://storage-practice-production.up.railway.app',
    commercialUrl:   process.env.COMMERCIAL_URL     || 'https://commercial-practice-production.up.railway.app',
    // Finance & Advisory
    lenderUrl:       process.env.LENDER_URL         || 'https://lender-practice-production.up.railway.app',
    lenderCommandUrl: process.env.LENDER_COMMAND_URL || 'https://lender-command-production.up.railway.app',
    virtualSteveUrl: process.env.VIRTUAL_STEVE_URL  || 'https://virtual-steve-production.up.railway.app',
    educatorUrl:     process.env.EDUCATOR_URL       || 'https://voice-roleplay-rei-training-production.up.railway.app',
    // Presentation & Language
    raisereadyUrl:   process.env.RAISEREADY_URL     || 'https://raiseready-practice-production.up.railway.app',
    sayitUrl:        process.env.SAYIT_URL          || 'https://sayit-practice-production.up.railway.app',
    sceneloopUrl:    process.env.SCENELOOP_URL      || 'https://sceneloop-practice-production.up.railway.app',
    speakupUrl:      process.env.SPEAKUP_URL        || 'https://speakup-practice-production.up.railway.app'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PwP Full Launcher running on http://localhost:${PORT}`);
});
