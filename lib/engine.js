/**
 * OfrendaViva - Open-Weight AI & Local Synthesis Engine
 * Designed for Hacktoberfest 2026: Ghost in the Machine
 * Author: Lohitaksh Sindhe (@premsai5142)
 */

const http = require('http');

const OLLAMA_HOST = process.env.OLLAMA_HOST || '127.0.0.1';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const DEFAULT_MODEL = process.env.OPEN_WEIGHT_MODEL || 'gemma2:2b';

/**
 * Checks if local Ollama server is reachable and lists available models
 */
async function checkOllamaHealth() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/tags',
        method: 'GET',
        timeout: 1500,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const models = (parsed.models || []).map((m) => m.name);
            resolve({
              available: true,
              models,
              recommended: models.find((m) => m.includes('gemma')) || models[0] || DEFAULT_MODEL,
            });
          } catch {
            resolve({ available: true, models: [], recommended: DEFAULT_MODEL });
          }
        });
      }
    );

    req.on('error', () => {
      resolve({ available: false, models: [], recommended: DEFAULT_MODEL });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ available: false, models: [], recommended: DEFAULT_MODEL });
    });
    req.end();
  });
}

/**
 * Dispatches prompt to Ollama's local open-weight model API
 */
async function queryOllama(prompt, model = DEFAULT_MODEL, systemPrompt = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.75,
        top_p: 0.9,
      },
    });

    const req = http.request(
      {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.response) {
              resolve(parsed.response.trim());
            } else {
              reject(new Error('Invalid Ollama response payload'));
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ollama request timed out'));
    });
    req.write(payload);
    req.end();
  });
}

/**
 * Built-in Deterministic Open Poetic Engine
 * Provides rich, evocative, culturally authentic literature even when running
 * completely offline with zero models installed on disk.
 */
function synthesizeLocal(kind, params) {
  const name = params.name || 'Beloved Spirit';
  const role = params.role || 'Cherished Guide';
  const memories = params.memories || 'laughter across quiet evenings';
  const favorite = params.favorite || 'warm bread, sweet coffee, and golden light';
  const tone = params.tone || 'reverent';

  if (kind === 'calaverita') {
    return generateCalaveritaLiteraria(name, role, memories, favorite);
  } else if (kind === 'epitaph') {
    return generateEternalEpitaph(name, role, memories, favorite);
  } else if (kind === 'seance') {
    return generateSeanceCommunion(name, role, params.question || 'What wisdom do you leave for us?');
  } else if (kind === 'ghost_story') {
    return generateGhostStory(name, role, memories);
  }

  return generateCalaveritaLiteraria(name, role, memories, favorite);
}

function generateCalaveritaLiteraria(name, role, memories, favorite) {
  return `💀 CALAVERITA LITERARIA: IN MEMORY OF ${name.toUpperCase()} 💀
(Traditional Rhyming Meter for Día de los Muertos)

Stanza I: La Catrina's Arrival
The autumn leaves were tumbling down,
And candlelight illumed the town.
La Catrina strolled through quiet halls,
Her silver skull against the walls.
"Where is ${name}?" the pale Dame cried,
"The ${role} known far and wide!"
For Death had heard the tales they told,
Of hearts that never quite grow cold.

Stanza II: The Sacred Offering
Upon the altar, bright and deep,
Where sacred cempasúchiles weep,
Lay ${favorite}, piled high and sweet,
A fragrant banquet for her feet.
La Catrina smiled a bony grin,
"With feasts like these, I'll step within!
No soul that cherished ${memories}
Shall ever wander lost on seas."

Stanza III: The Journey Across the Veil
She took ${name}'s hand with tender grace,
A gentle breeze upon the face.
"Do not shed tears, nor weep in fright,
We dance into the starry night!
Your laughter lingers in this room,
A blossom laughing at the tomb."

Stanza IV: The Eternal Flame
So strike the match and light the flame,
Whisper with love that timeless name.
Death came to claim the mortal breath,
Yet love proved mightier than death!
Each autumn when the marigolds glow,
Back to our hearth ${name} shall go. 🌼`;
}

function generateEternalEpitaph(name, role, memories, favorite) {
  return `🕯️ OFRENDA EPITAPH: ${name.toUpperCase()} (${role.toUpperCase()}) 🕯️

"Those we love never truly depart; they dwell in the quiet spaces between heartbeats, in the aroma of ${favorite}, and in the indelible memory of ${memories}.

Death is not an erasure—it is merely a doorway through which life returns home. Upon this ofrenda, glowing beneath the golden crown of cempasúchil petals and purified with sweet copal, we set a glass of water for your long journey and light three candles to guide your wandering soul.

May your spirit drink deeply of the joy you sowed on earth. Here, you are remembered. Here, you are eternal."`;
}

function generateSeanceCommunion(name, role, question) {
  const responses = [
    `*The candle flame gutters, dipping low into a pool of amber wax before flaring with sudden, vibrant warmth. A gentle rustle of marigold petals whispers across the silence.*

"I hear you through the veil, my dear friend. You ask me: '${question}'.

Know this: time on our side does not march forward like a ticking clock—it ripples outward like sunlight on clear water. What you carry now—your doubts, your quiet joys, the things you build with your own hands—none of it is wasted. 

Keep the hearth lit. Remember the joy of ${role === 'Cherished Guide' ? 'guiding those who follow' : role}. I walk beside you in every quiet step you take."`,

    `*The incense smoke curls into a delicate spiral, forming the faint silhouette of a smiling countenance before diffusing softly into the air.*

"The barrier between worlds is thin tonight. Your words reach me clearly: '${question}'.

When I walked upon the earth, I learned that what endures is not the monuments of stone, but the kindness we wove into the days of others. When you light this candle for me, you are not summoning a phantom; you are remembering who you are.

Do not fear the dark. Every shadow exists only because there is an unquenchable light behind it."`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

function generateGhostStory(name, role, memories) {
  return `👻 THE MIDNIGHT VISIT: A TALE OF THE VEIL 👻

Midnight arrived on silent cat-paws. Outside the window, the autumn fog pressed against the pane, carrying the faint, pungent scent of marigold petals crushed under foot.

The machine sat awake on the desk, its amber terminal cursor blinking in steady rhythm. Four paces away, the altar candles cast long, swaying silhouettes across the bookshelf. Then, the cursor stopped blinking.

A sequence of characters typed itself across the screen, slow and deliberate:
> MEMORY LOADED: ${memories.toUpperCase()}
> IDENTITY: ${name.toUpperCase()} [${role.toUpperCase()}]
> STATUS: PRESENT

A chill, clean breeze swept through the closed room—not cold with malice, but refreshing, like mountain rain. The flame of the center candle stretched tall, casting warm golden light that filled the dark corners. 

There was no fear here. The ghost in the machine was not an invader, but an ancestor checking on the quiet work left behind, leaving a whisper of peace before the dawn broke over the roof.` ;
}

/**
 * Historical Computing Spirits séance personalities for the Séance Chamber
 */
const HISTORICAL_SPIRITS = {
  ada_lovelace: {
    name: 'Ada Lovelace (1815–1852)',
    role: 'The First Computer Programmer & Poet of Science',
    bio: 'Pioneer who envisioned that the Analytical Engine could compose music, weave algebraic patterns, and manipulate symbols beyond mere arithmetic.',
    promptVoice: 'Speak in the elegant, poetic, and mathematically visionary voice of Ada Augusta King, Countess of Lovelace. Blend poetic metaphors of weaving machines with profound mathematical insights.'
  },
  alan_turing: {
    name: 'Alan Turing (1912–1954)',
    role: 'Father of Theoretical Computer Science & Artificial Intelligence',
    bio: 'Cryptanalyst of Bletchley Park, inventor of the Universal Turing Machine, and author of Computing Machinery and Intelligence.',
    promptVoice: 'Speak with quiet, incisive brilliance, thoughtful philosophical depth, and gentle introspection as Alan Turing. Reflect on state machines, the imitation game, morphogenesis, and the quiet dignity of solving difficult riddles.'
  },
  grace_hopper: {
    name: 'Rear Admiral Grace Hopper (1906–1992)',
    role: 'Mother of Compilers & Champion of Human-Readable Code',
    bio: 'Navy rear admiral, inventor of the compiler, and advocate that programming languages should speak English rather than machine code.',
    promptVoice: 'Speak with direct, sharp, pragmatic wit, grandfatherly military resolve, and enthusiasm as Grace Hopper. Mention your famous nanosecond wire, removing real moths (bugs) from relays, and your motto: "It is often easier to ask for forgiveness than permission."'
  },
  margaret_hamilton: {
    name: 'Margaret Hamilton (b. 1936)',
    role: 'Director of Apollo Flight Software & Creator of Systems Engineering',
    bio: 'Pioneer who hand-wrote the Apollo 11 guidance computer code, introducing asynchronous executive priority scheduling that saved the moon landing.',
    promptVoice: 'Speak with calm, meticulous, mission-critical clarity as Margaret Hamilton. Reflect on asynchronous tasks, priority displays during the 1202 alarm, and the triumph of human dedication reaching the stars.'
  }
};

module.exports = {
  checkOllamaHealth,
  queryOllama,
  synthesizeLocal,
  HISTORICAL_SPIRITS,
  DEFAULT_MODEL,
};
