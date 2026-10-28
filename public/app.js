/**
 * OfrendaViva - Client Application Logic
 * Interactive Altar, Ambient Web Audio Synth, Floating Canvas, and Open AI Bridge
 */

// Application State
const state = {
  mode: 'ofrenda', // 'ofrenda' or 'seance'
  altar: null,
  spirits: {},
  audioPlaying: false,
  audioCtx: null,
  audioNodes: {},
  lastGeneratedVerse: null,
};

// DOM References
const particleCanvas = document.getElementById('particleCanvas');
const ctx = particleCanvas.getContext('2d');
const modeToggleBtn = document.getElementById('modeToggleBtn');
const modeIcon = document.getElementById('modeIcon');
const modeName = document.getElementById('modeName');
const ambientAudioBtn = document.getElementById('ambientAudioBtn');
const audioIcon = document.getElementById('audioIcon');
const audioStatus = document.getElementById('audioStatus');
const exportVaultBtn = document.getElementById('exportVaultBtn');
const engineBadge = document.getElementById('engineBadge');

const tier1Container = document.getElementById('tier1Container');
const tier2Container = document.getElementById('tier2Container');
const tier3Container = document.getElementById('tier3Container');

const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addModal = document.getElementById('addModal');
const addOfferingForm = document.getElementById('addOfferingForm');

const spiritPills = document.querySelectorAll('.spirit-pill');
const spiritNameInput = document.getElementById('spiritNameInput');
const spiritRoleInput = document.getElementById('spiritRoleInput');
const spiritMemoriesInput = document.getElementById('spiritMemoriesInput');
const spiritFavoriteInput = document.getElementById('spiritFavoriteInput');
const seanceQuestionInput = document.getElementById('seanceQuestionInput');
const synthesisKindSelect = document.getElementById('synthesisKindSelect');
const aiEngineSelect = document.getElementById('aiEngineSelect');
const aiGenerationForm = document.getElementById('aiGenerationForm');
const generateBtn = document.getElementById('generateBtn');

const aiResultContainer = document.getElementById('aiResultContainer');
const resultContent = document.getElementById('resultContent');
const resultKindTag = document.getElementById('resultKindTag');
const resultEngineTag = document.getElementById('resultEngineTag');
const copyResultBtn = document.getElementById('copyResultBtn');
const addToAltarBtn = document.getElementById('addToAltarBtn');

const favoriteRow = document.getElementById('favoriteRow');
const questionRow = document.getElementById('questionRow');
const chamberHeading = document.getElementById('chamberHeading');
const chamberSubheading = document.getElementById('chamberSubheading');

// ==========================================
// 1. Particle Canvas Engine (Marigold & Wisps)
// ==========================================
let particles = [];
const PARTICLE_COUNT = 45;

function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * particleCanvas.width;
    this.y = state.mode === 'ofrenda' ? -20 : particleCanvas.height + 20;
    this.size = Math.random() * 8 + 6;
    this.speedY = state.mode === 'ofrenda' ? Math.random() * 1.5 + 0.8 : -(Math.random() * 1.2 + 0.6);
    this.speedX = Math.random() * 1 - 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = Math.random() * 0.04 - 0.02;
    this.opacity = Math.random() * 0.6 + 0.3;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.angle) * 0.5;
    this.angle += this.spin;

    if (state.mode === 'ofrenda' && this.y > particleCanvas.height + 20) {
      this.reset();
    } else if (state.mode === 'seance' && this.y < -20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;

    if (state.mode === 'ofrenda') {
      // Golden Marigold Petal
      ctx.fillStyle = '#ff9d00';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.6, this.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Spectral Cyan Particle Wisp
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ==========================================
// 2. Synthesized Web Audio Ambient Atmosphere
// ==========================================
function initWebAudio() {
  if (state.audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  state.audioCtx = new AudioContext();

  const masterGain = state.audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.08, state.audioCtx.currentTime);
  masterGain.connect(state.audioCtx.destination);
  state.audioNodes.masterGain = masterGain;

  // Ambient Drone (Harmonic Octaves)
  const notes = [110, 164.81, 220, 329.63]; // A major 7th ethereal drone
  state.audioNodes.oscillators = notes.map((freq) => {
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);

    // Subtle LFO vibrato
    const lfo = state.audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, state.audioCtx.currentTime);
    const lfoGain = state.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(1.5, state.audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    gain.gain.setValueAtTime(0.2, state.audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    return { osc, gain, lfo };
  });

  // Soft Wind / Cemetery Breeze Generator (Pink Noise approximation)
  const bufferSize = state.audioCtx.sampleRate * 2;
  const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    output[i] = (b0 + b1 + b2 + white * 0.1) * 0.11;
  }

  const whiteNoise = state.audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = state.audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, state.audioCtx.currentTime);

  const noiseGain = state.audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.12, state.audioCtx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(masterGain);
  whiteNoise.start();

  state.audioNodes.whiteNoise = whiteNoise;
  state.audioNodes.filter = filter;
}

function toggleAudio() {
  if (!state.audioCtx) {
    initWebAudio();
  }

  if (state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }

  if (state.audioPlaying) {
    state.audioNodes.masterGain.gain.setTargetAtTime(0, state.audioCtx.currentTime, 0.2);
    state.audioPlaying = false;
    audioIcon.textContent = '🔇';
    audioStatus.textContent = 'Muted';
  } else {
    state.audioNodes.masterGain.gain.setTargetAtTime(0.12, state.audioCtx.currentTime, 0.3);
    state.audioPlaying = true;
    audioIcon.textContent = '🎶';
    audioStatus.textContent = 'Playing';
  }
}
ambientAudioBtn.addEventListener('click', toggleAudio);

// ==========================================
// 3. Mode Toggling (Ofrenda vs Séance)
// ==========================================
function toggleMode() {
  if (state.mode === 'ofrenda') {
    state.mode = 'seance';
    document.body.classList.remove('mode-ofrenda');
    document.body.classList.add('mode-seance');
    modeIcon.textContent = '🌼';
    modeName.textContent = 'Día de los Muertos';
    chamberHeading.textContent = '👻 The Midnight Séance Chamber';
    chamberSubheading.textContent = 'Communing with the spirit world and the historical ghosts in the machine.';
    synthesisKindSelect.value = 'seance';
    onKindSelectChange();
  } else {
    state.mode = 'ofrenda';
    document.body.classList.remove('mode-seance');
    document.body.classList.add('mode-ofrenda');
    modeIcon.textContent = '👻';
    modeName.textContent = 'Midnight Séance';
    chamberHeading.textContent = '💀 The Literary Calaverita & Altar Chamber';
    chamberSubheading.textContent = 'Synthesize traditional rhyming verse and sacred epitaphs with local open-weight AI.';
    synthesisKindSelect.value = 'calaverita';
    onKindSelectChange();
  }
  // Re-orient particles
  particles.forEach((p) => p.reset());
}
modeToggleBtn.addEventListener('click', toggleMode);

// ==========================================
// 4. Altar Offerings Rendering & Candles
// ==========================================
async function loadAltar() {
  try {
    const res = await fetch('/api/altar');
    state.altar = await res.json();
    renderAltar();
  } catch (err) {
    console.error('Failed to load altar:', err);
  }
}

function renderAltar() {
  if (!state.altar || !state.altar.offerings) return;

  tier1Container.innerHTML = '';
  tier2Container.innerHTML = '';
  tier3Container.innerHTML = '';

  state.altar.offerings.forEach((item) => {
    const card = createOfferingCard(item);
    if (item.tier === 1) tier1Container.appendChild(card);
    else if (item.tier === 2) tier2Container.appendChild(card);
    else tier3Container.appendChild(card);
  });
}

function createOfferingCard(item) {
  const card = document.createElement('div');
  card.className = 'altar-card';
  card.dataset.id = item.id;

  const candleHtml = item.candle
    ? `
    <div class="candle-container" title="Click to toggle candle flame">
      <div class="candle-flame"></div>
      <div class="candle-base"></div>
    </div>
  `
    : '';

  card.innerHTML = `
    <div class="card-avatar">${item.avatar || '🕯️'}</div>
    <div class="card-name">${escapeHtml(item.name)}</div>
    <div class="card-role">${escapeHtml(item.role || '')}</div>
    <div class="card-note">${escapeHtml(item.note || item.remembrance || '')}</div>
    ${candleHtml}
  `;

  // Toggle candle flame on click
  if (item.candle) {
    const candleEl = card.querySelector('.candle-container');
    candleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      candleEl.classList.toggle('extinguished');
    });
  }

  // Clicking card loads person into the AI generator
  card.addEventListener('click', () => {
    spiritNameInput.value = item.name;
    spiritRoleInput.value = item.role || '';
    spiritMemoriesInput.value = item.remembrance || item.note || '';
    spiritPills.forEach((p) => p.classList.remove('active'));
    document.querySelector('.spirit-pill[data-spirit="custom"]').classList.add('active');
    spiritNameInput.scrollIntoView({ behavior: 'smooth' });
  });

  return card;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==========================================
// 5. Spirit Selector & Form Behavior
// ==========================================
async function loadSpirits() {
  try {
    const res = await fetch('/api/spirits');
    state.spirits = await res.json();
  } catch (err) {
    console.error('Failed to load spirits:', err);
  }
}

spiritPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    spiritPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');

    const key = pill.dataset.spirit;
    if (key === 'custom') {
      spiritNameInput.value = '';
      spiritRoleInput.value = '';
      spiritMemoriesInput.value = '';
      spiritFavoriteInput.value = '';
      spiritNameInput.focus();
    } else if (state.spirits[key]) {
      const sp = state.spirits[key];
      spiritNameInput.value = sp.name;
      spiritRoleInput.value = sp.role;
      spiritMemoriesInput.value = sp.bio;
      spiritFavoriteInput.value = 'Chalk, punchcards, algebraic proofs, and tea';
    }
  });
});

function onKindSelectChange() {
  const val = synthesisKindSelect.value;
  if (val === 'seance') {
    questionRow.style.display = 'block';
    favoriteRow.style.display = 'none';
  } else {
    questionRow.style.display = 'none';
    favoriteRow.style.display = 'flex';
  }
}
synthesisKindSelect.addEventListener('change', onKindSelectChange);

// ==========================================
// 6. AI Generation & Ollama Bridge
// ==========================================
async function checkEngineStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.ollama && data.ollama.available) {
      engineBadge.textContent = `🟢 Ollama Connected: ${data.ollama.recommended}`;
      engineBadge.style.borderColor = '#4caf50';
      engineBadge.style.color = '#81c784';
    } else {
      engineBadge.textContent = `⚡ Standalone Open-Weight Heuristic Mode`;
      engineBadge.style.borderColor = 'var(--cempasuchil)';
      engineBadge.style.color = 'var(--cempasuchil)';
    }
  } catch {
    engineBadge.textContent = `⚡ Offline Local Engine`;
  }
}

aiGenerationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = spiritNameInput.value.trim();
  const role = spiritRoleInput.value.trim();
  const memories = spiritMemoriesInput.value.trim();
  const favorite = spiritFavoriteInput.value.trim();
  const question = seanceQuestionInput.value.trim();
  const kind = synthesisKindSelect.value;
  const engine = aiEngineSelect.value;

  generateBtn.disabled = true;
  generateBtn.textContent = '✨ Conjuring through the Veil...';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        role,
        memories,
        favorite,
        question,
        kind,
        engine,
      }),
    });

    const data = await res.json();
    if (data.success) {
      state.lastGeneratedVerse = {
        name,
        role,
        content: data.content,
        kind,
      };

      resultContent.textContent = data.content;
      resultKindTag.textContent = kind.toUpperCase();
      resultEngineTag.textContent = `Engine: ${data.engine_used}`;
      aiResultContainer.style.display = 'block';
      aiResultContainer.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    alert('Generation error: ' + err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = '✨ Conjure Verse Across the Veil ✨';
  }
});

copyResultBtn.addEventListener('click', () => {
  if (resultContent.textContent) {
    navigator.clipboard.writeText(resultContent.textContent);
    copyResultBtn.textContent = '✅ Copied!';
    setTimeout(() => (copyResultBtn.textContent = '📋 Copy'), 2000);
  }
});

addToAltarBtn.addEventListener('click', async () => {
  if (!state.lastGeneratedVerse) return;

  const newItem = {
    tier: 1,
    type: 'portrait',
    name: state.lastGeneratedVerse.name,
    role: state.lastGeneratedVerse.role || 'Honored Soul',
    avatar: state.mode === 'ofrenda' ? '🕯️' : '👻',
    remembrance: state.lastGeneratedVerse.content.slice(0, 160) + '...',
    candle: true,
  };

  try {
    const res = await fetch('/api/altar/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    if (data.success) {
      state.altar = data.altar;
      renderAltar();
      addToAltarBtn.textContent = '✅ Placed on Altar!';
      setTimeout(() => (addToAltarBtn.textContent = '🕯️ Place on Altar'), 2500);
    }
  } catch (err) {
    alert('Failed to place on altar: ' + err.message);
  }
});

// ==========================================
// 7. Modal Handlers
// ==========================================
openAddModalBtn.addEventListener('click', () => {
  addModal.classList.add('open');
});
closeModalBtn.addEventListener('click', () => addModal.classList.remove('open'));
cancelModalBtn.addEventListener('click', () => addModal.classList.remove('open'));

addOfferingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const item = {
    tier: parseInt(document.getElementById('offeringTierSelect').value, 10),
    name: document.getElementById('offeringNameInput').value.trim(),
    role: document.getElementById('offeringRoleInput').value.trim(),
    avatar: document.getElementById('offeringAvatarInput').value.trim() || '🕯️',
    note: document.getElementById('offeringNoteInput').value.trim(),
    candle: document.getElementById('offeringCandleCheck').checked,
  };

  try {
    const res = await fetch('/api/altar/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (data.success) {
      state.altar = data.altar;
      renderAltar();
      addModal.classList.remove('open');
      addOfferingForm.reset();
    }
  } catch (err) {
    alert('Error saving offering: ' + err.message);
  }
});

// ==========================================
// 8. Export Eternal Standalone Vault
// ==========================================
exportVaultBtn.addEventListener('click', () => {
  const currentAltarJson = JSON.stringify(state.altar || {}, null, 2);
  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Eternal Vault — OfrendaViva (Offline Memorial Altar)</title>
  <style>
    body { background: #0e0914; color: #f5f0eb; font-family: serif; padding: 40px 20px; text-align: center; }
    h1 { color: #ff9d00; font-size: 2.8rem; margin-bottom: 8px; }
    .arch { color: #ff9d00; font-style: italic; margin-bottom: 24px; font-size: 1.2rem; }
    .altar-tier { background: rgba(30,20,44,0.9); border: 1px solid #4a2d6e; border-radius: 12px; margin: 20px auto; max-width: 900px; padding: 20px; }
    .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
    .card { background: #181122; border: 1px solid #ff9d00; border-radius: 8px; padding: 16px; width: 180px; text-align: center; }
    .avatar { font-size: 40px; margin-bottom: 8px; }
    .name { font-weight: bold; font-size: 1.1rem; color: #ff9d00; }
    .role { font-size: 0.85rem; font-style: italic; color: #bdaec6; margin-bottom: 8px; }
    .note { font-size: 0.85rem; line-height: 1.4; }
    footer { margin-top: 40px; font-size: 0.9rem; color: #888; }
  </style>
</head>
<body>
  <h1>OFRENDA VIVA — ETERNAL VAULT</h1>
  <div class="arch">✨ Donde el Recuerdo Vive Para Siempre ✨</div>
  <p><em>Archived offline memorial. Preserved forever with zero cloud dependency.</em></p>
  
  <div class="altar-tier">
    <h2>Nivel I: El Cielo (Pioneers & Loved Ones)</h2>
    <div class="grid" id="t1"></div>
  </div>
  <div class="altar-tier">
    <h2>Nivel II: La Tierra (Sacred Offerings)</h2>
    <div class="grid" id="t2"></div>
  </div>
  <div class="altar-tier">
    <h2>Nivel III: El Inframundo (Sugar Skulls & Tokens)</h2>
    <div class="grid" id="t3"></div>
  </div>

  <footer>
    <p>Saved on ${new Date().toLocaleDateString()} via OfrendaViva (Hacktoberfest 2026: Ghost in the Machine)</p>
  </footer>

  <script>
    const data = ${currentAltarJson};
    function render() {
      (data.offerings || []).forEach(item => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = '<div class="avatar">' + (item.avatar || '🕯️') + '</div><div class="name">' + item.name + '</div><div class="role">' + (item.role || '') + '</div><div class="note">' + (item.note || item.remembrance || '') + '</div>';
        if (item.tier === 1) document.getElementById('t1').appendChild(c);
        else if (item.tier === 2) document.getElementById('t2').appendChild(c);
        else document.getElementById('t3').appendChild(c);
      });
    }
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([standaloneHtml], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ofrendaviva-eternal-vault-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
});

// Initialization
loadAltar();
loadSpirits();
checkEngineStatus();
