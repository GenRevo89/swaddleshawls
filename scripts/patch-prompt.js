const fs = require('fs');
const https = require('https');

// Load env
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

const agentId = process.env.ELEVENLABS_AGENT_ID;
const apiKey = process.env.ELEVENLABS_API_KEY;

// Read prompt from provision script
const scriptContent = fs.readFileSync('scripts/provision-agent.js', 'utf8');
const match = scriptContent.match(/const SYSTEM_PROMPT = \`([\s\S]*?)\`\.trim\(\);/);
if (!match) {
  console.error("Could not extract SYSTEM_PROMPT");
  process.exit(1);
}

const SYSTEM_PROMPT = match[1].trim();

const data = JSON.stringify({
  conversation_config: { agent: { prompt: { prompt: SYSTEM_PROMPT } } }
});

const options = {
  hostname: 'api.elevenlabs.io',
  path: '/v1/convai/agents/' + agentId,
  method: 'PATCH',
  headers: {
    'xi-api-key': apiKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('✅ Prompt updated successfully. Response:', body));
});

req.on('error', (e) => console.error("Request error:", e));
req.write(data);
req.end();
