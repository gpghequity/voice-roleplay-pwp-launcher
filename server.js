require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/config', (req, res) => {
  res.json({
    // REI Tools
    sellerUrl:       process.env.SELLER_URL       || 'https://voice-roleplay-rei-practice-production.up.railway.app',
    buyerUrl:        process.env.BUYER_URL         || 'https://buyer-practice-production.up.railway.app',
    lenderUrl:       process.env.LENDER_URL        || 'https://lender-practice-production.up.railway.app',
    brokerUrl:       process.env.BROKER_URL        || 'https://broker-practice-production.up.railway.app',
    storageUrl:      process.env.STORAGE_URL       || 'https://storage-practice-production.up.railway.app',
    commercialUrl:   process.env.COMMERCIAL_URL    || 'https://commercial-practice-production.up.railway.app',
    agentUrl:        process.env.AGENT_URL         || 'https://agent-practice-production.up.railway.app',
    wholesalerUrl:   process.env.WHOLESALER_URL    || 'https://wholesaler-practice-production.up.railway.app',
    virtualSteveUrl: 'https://virtual-steve-production.up.railway.app',
    educatorUrl:     process.env.EDUCATOR_URL      || 'https://voice-roleplay-rei-training-production.up.railway.app',
    // Presentation & Language Tools
    raisereadyUrl:   process.env.RAISEREADY_URL    || 'https://raiseready-practice-production.up.railway.app',
    sayitUrl:        process.env.SAYIT_URL         || 'https://sayit-practice-production.up.railway.app',
    scenelloopUrl:   process.env.SCENELOOP_URL     || 'https://sceneloop-practice-production.up.railway.app',
    speakupUrl:      process.env.SPEAKUP_URL       || 'https://speakup-practice-production.up.railway.app'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PwP Full Launcher running on http://localhost:${PORT}`);
});
