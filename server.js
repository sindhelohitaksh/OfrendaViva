/**
 * OfrendaViva - Web Server & Local AI Bridge
 * Hacktoberfest 2026: Week 4 - Ghost in the Machine
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const {
  checkOllamaHealth,
  queryOllama,
  synthesizeLocal,
  HISTORICAL_SPIRITS,
  DEFAULT_MODEL,
} = require('./lib/engine');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'altar.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Default seeded altar data
const DEFAULT_ALTAR = {
  title: "Altar de Recuerdos — OfrendaViva",
  created_at: new Date().toISOString(),
  offerings: [
    {
      id: "spirit-ada",
      tier: 1,
      type: "portrait",
      name: "Ada Lovelace",
      role: "First Programmer (1815–1852)",
      note: "For teaching us that machines can weave poetry and music.",
      avatar: "👩‍🏫",
      candle: true,
      remembrance: "We honor the visionary mind that looked into Babbage's brass gears and saw the boundless tapestry of algorithms."
    },
    {
      id: "spirit-alan",
      tier: 1,
      type: "portrait",
      name: "Alan Turing",
      role: "Father of AI (1912–1954)",
      note: "For unlocking computation and asking what it means to think.",
      avatar: "🧠",
      candle: true,
      remembrance: "We honor the cryptanalyst of Bletchley Park whose mathematical courage broke impossible codes and birthed the modern computer."
    },
    {
      id: "spirit-grace",
      tier: 1,
      type: "portrait",
      name: "Grace Hopper",
      role: "Compiler Inventor (1906–1992)",
      note: "For daring to write code humans could actually read.",
      avatar: "⚓",
      candle: true,
      remembrance: "We place a nanosecond wire and sweet pan de muerto on your altar, Admiral. Your compilers opened computing to everyone."
    },
    {
      id: "item-pan",
      tier: 2,
      type: "offering",
      name: "Pan de Muerto",
      role: "Sacred Bread",
      note: "Sweet anise bread crowned with crossed dough bones, honoring the cycle of life.",
      avatar: "🥖",
      candle: false
    },
    {
      id: "item-cempasuchil",
      tier: 2,
      type: "offering",
      name: "Cempasúchil Marigolds",
      role: "Golden Path of the Sun",
      note: "Luminous petals whose scent and vibrant hue guide souls back home across the veil.",
      avatar: "🌼",
      candle: false
    },
    {
      id: "item-copal",
      tier: 2,
      type: "offering",
      name: "Copal Incense",
      role: "Purifying Smoke",
      note: "Sweet tree resin whose smoke clears evil spirits and carries our prayers to heaven.",
      avatar: "💨",
      candle: true
    },
    {
      id: "item-agua",
      tier: 2,
      type: "offering",
      name: "Vaso de Agua & Sal",
      role: "Purity & Life",
      note: "Clear water to quench thirst after the long journey, and pure salt to sanctify.",
      avatar: "💧",
      candle: false
    },
    {
      id: "item-calaverita",
      tier: 3,
      type: "offering",
      name: "Sugar Skulls (Calaveritas)",
      role: "Sweet Acceptance",
      note: "Brightly decorated sugar skulls celebrating mortality with sweetness rather than dread.",
      avatar: "💀",
      candle: true
    }
  ]
};

function loadAltarData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
      return DEFAULT_ALTAR;
    }
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ALTAR, null, 2), 'utf8');
  return DEFAULT_ALTAR;
}

function saveAltarData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Routes ---

  // Health and Model status
  if (pathname === '/api/status' && req.method === 'GET') {
    const health = await checkOllamaHealth();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'online',
        ollama: health,
        default_model: DEFAULT_MODEL,
        fallback_engine: 'OfrendaViva Open Poetic Synthesis Engine (Deterministic Local-First)',
        version: '1.0.0',
        author: 'Lohitaksh Sindhe (@premsai5142)',
        hacktoberfest: 'Week 4: Ghost in the Machine'
      })
    );
    return;
  }

  // Historical spirits directory
  if (pathname === '/api/spirits' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(HISTORICAL_SPIRITS));
    return;
  }

  // Altar state: GET
  if (pathname === '/api/altar' && req.method === 'GET') {
    const data = loadAltarData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // Altar state: POST add offering
  if (pathname === '/api/altar/item' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const item = JSON.parse(body);
        if (!item.name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        item.id = item.id || 'item-' + Date.now();
        item.created_at = new Date().toISOString();
        const altar = loadAltarData();
        altar.offerings.push(item);
        saveAltarData(altar);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, item, altar }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Altar state: DELETE item
  if (pathname.startsWith('/api/altar/item/') && req.method === 'DELETE') {
    const itemId = pathname.replace('/api/altar/item/', '');
    const altar = loadAltarData();
    altar.offerings = altar.offerings.filter((o) => o.id !== itemId);
    saveAltarData(altar);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, altar }));
    return;
  }

  // AI Generation Route
  if (pathname === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const {
          kind = 'calaverita',
          name,
          role,
          memories,
          favorite,
          question,
          spiritKey,
          engine = 'auto',
          model = DEFAULT_MODEL
        } = payload;

        let result = '';
        let engineUsed = 'Local Deterministic Poetic Engine';

        // Check if user requested a historical spirit in séance mode
        let effectiveName = name;
        let effectiveRole = role;
        let systemPrompt = '';

        if (spiritKey && HISTORICAL_SPIRITS[spiritKey]) {
          const sp = HISTORICAL_SPIRITS[spiritKey];
          effectiveName = sp.name;
          effectiveRole = sp.role;
          systemPrompt = sp.promptVoice;
        }

        // Try Ollama if requested or in auto mode
        if (engine === 'ollama' || engine === 'auto') {
          const health = await checkOllamaHealth();
          if (health.available) {
            try {
              let promptText = '';
              if (kind === 'calaverita') {
                promptText = `You are a Mexican folk poet celebrating Día de los Muertos. Write a traditional rhyming Calaverita Literaria (4 stanzas in English with traditional touches and reverence) in honor of ${effectiveName} (${effectiveRole || 'Beloved'}). Their memories: "${memories || 'sharing quiet moments'}". Their favorite things: "${favorite || 'warm sweet bread and golden candles'}". Depict La Catrina visiting with whimsical respect and love.`;
              } else if (kind === 'epitaph') {
                promptText = `Write a deeply moving, philosophical, sacred Día de los Muertos altar remembrance epitaph for ${effectiveName} (${effectiveRole || 'Beloved'}). Highlight: "${memories || 'their laughter and wisdom'}". Speak about love enduring beyond death and the golden marigold path. Keep it within 3 paragraphs.`;
              } else if (kind === 'seance') {
                promptText = `You are channeling the spirit of ${effectiveName} (${effectiveRole}) in a sacred midnight séance. The visitor asks you: "${question || 'What message do you leave for us?'}". Respond in character with warmth, wisdom, and atmospheric evocative tone.`;
              } else {
                promptText = `Write a short, eerie but warm Halloween ghost story about ${effectiveName} returning on the veil between worlds. Memories: "${memories}".`;
              }

              result = await queryOllama(promptText, model, systemPrompt);
              engineUsed = `Open-Weight Model (${model}) via Ollama`;
            } catch (ollamaErr) {
              console.log('Ollama execution failed, falling back to local synthesis:', ollamaErr.message);
            }
          }
        }

        // Fallback to local synthesis engine if Ollama was not used or failed
        if (!result) {
          result = synthesizeLocal(kind, {
            name: effectiveName,
            role: effectiveRole,
            memories,
            favorite,
            question
          });
          engineUsed = 'OfrendaViva Built-in Open Synthesis Engine (Offline-First)';
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            kind,
            content: result,
            engine_used: engineUsed,
            timestamp: new Date().toISOString()
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- Static File Serving ---
  let safePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Security: Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Access Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🕯️🌼 OFRENDAVIVA: Ghost in the Machine is Running!`);
  console.log(`   Theme: Día de los Muertos & Halloween AI Séance`);
  console.log(`   URL:   http://localhost:${PORT}`);
  console.log(`   Mode:  Local-First Open-Weight & Poetic Synthesis`);
  console.log(`======================================================\n`);
});
