#!/usr/bin/env node

/**
 * OfrendaViva - GhostShell CLI
 * Hacktoberfest 2026: Ghost in the Machine
 * Author: Lohitaksh Sindhe (@premsai5142)
 */

const readline = require('readline');
const { execSync } = require('child_process');
const { checkOllamaHealth, synthesizeLocal, HISTORICAL_SPIRITS } = require('../lib/engine');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function printBanner() {
  console.log(`
\x1b[35m       .---.
      /     \\      \x1b[33m🕯️  OFRENDAVIVA : GHOST IN THE MACHINE  🕯️\x1b[35m
     | () () |     \x1b[36mTerminal Séance & Local Open-Weight Spirit Shell\x1b[35m
      \\  -  /      \x1b[32mHacktoberfest 2026 - Week 4 Final Challenge\x1b[35m
       \`---\`
\x1b[0m`);
}

async function menu() {
  printBanner();

  console.log('\x1b[33mChoose your communion with the machine:\x1b[0m');
  console.log('  1. 💀 Conjure a Calaverita Literaria (Día de los Muertos rhyming verse)');
  console.log('  2. 🕯️ Channel a Computing Pioneer (Ada Lovelace, Alan Turing, Grace Hopper)');
  console.log('  3. 👻 Inspect Ghost Commits (Séance on your Git history)');
  console.log('  4. ⚡ Check Local Open-Weight Model Status (Ollama/Gemma)');
  console.log('  5. 🚪 Exit the Séance\n');

  rl.question('\x1b[36mEnter choice (1-5): \x1b[0m', async (choice) => {
    switch (choice.trim()) {
      case '1':
        handleCalaverita();
        break;
      case '2':
        handlePioneerCommunion();
        break;
      case '3':
        handleGhostCommits();
        break;
      case '4':
        await handleModelCheck();
        break;
      case '5':
      default:
        console.log('\n\x1b[33mThe candle flickers out. May the ancestors guide your code.\x1b[0m\n');
        rl.close();
        break;
    }
  });
}

function handleCalaverita() {
  rl.question('\nName of person / ancestor / code entity: ', (name) => {
    rl.question('Role or legacy (e.g. Lead Architect, Beloved Grandma): ', (role) => {
      rl.question('Memories to preserve: ', (memories) => {
        rl.question('Favorite food, drink, or item: ', (favorite) => {
          console.log('\n\x1b[33m[Summoning verses through the local open engine...]\x1b[0m\n');
          const poem = synthesizeLocal('calaverita', { name, role, memories, favorite });
          console.log('\x1b[32m' + poem + '\x1b[0m\n');
          promptRestart();
        });
      });
    });
  });
}

function handlePioneerCommunion() {
  console.log('\nSelect a historical pioneer spirit:');
  console.log('  1. Ada Lovelace (First Programmer)');
  console.log('  2. Alan Turing (Father of AI)');
  console.log('  3. Grace Hopper (Inventor of Compilers)');
  console.log('  4. Margaret Hamilton (Apollo 11 Flight Director)');

  rl.question('\nChoice (1-4): ', (pChoice) => {
    const keys = ['ada_lovelace', 'alan_turing', 'grace_hopper', 'margaret_hamilton'];
    const key = keys[parseInt(pChoice, 10) - 1] || 'ada_lovelace';
    const spirit = HISTORICAL_SPIRITS[key];

    rl.question(`\nAsk ${spirit.name} a question across the veil: `, (question) => {
      console.log('\n\x1b[36m[The terminal cursor flickers. Incense smoke rises...]\x1b[0m\n');
      const response = synthesizeLocal('seance', {
        name: spirit.name,
        role: spirit.role,
        question,
      });
      console.log('\x1b[35m' + response + '\x1b[0m\n');
      promptRestart();
    });
  });
}

function handleGhostCommits() {
  console.log('\n\x1b[33m[Scanning git logs for echoes of past commits...]\x1b[0m');
  try {
    const log = execSync('git log -n 5 --oneline', { encoding: 'utf8' });
    console.log('\nRecent traces left in this machine:\n' + log);
    console.log('\x1b[36m"Every commit is an echo of a human intention, frozen in the repository tree."\x1b[0m\n');
  } catch {
    console.log('\x1b[31mNo git repository detected here. Initialize git to summon commit ghosts!\x1b[0m\n');
  }
  promptRestart();
}

async function handleModelCheck() {
  console.log('\n\x1b[33m[Checking local open-weight inference runtime...]\x1b[0m');
  const health = await checkOllamaHealth();
  if (health.available) {
    console.log('\x1b[32m✔ Ollama is running locally!\x1b[0m');
    console.log(`Available models: ${health.models.join(', ') || 'none'}`);
    console.log(`Recommended: ${health.recommended}`);
  } else {
    console.log('\x1b[33m⚠ Ollama is offline.\x1b[0m');
    console.log('OfrendaViva is operating in 100% Offline Standalone Heuristic Synthesis Mode.');
    console.log('To run open-weight Gemma 2 locally:');
    console.log('  1. Install Ollama: https://ollama.ai');
    console.log('  2. Run: ollama run gemma2:2b\n');
  }
  promptRestart();
}

function promptRestart() {
  rl.question('\n\x1b[36mReturn to main séance menu? (y/n): \x1b[0m', (ans) => {
    if (ans.toLowerCase().startsWith('y')) {
      console.clear();
      menu();
    } else {
      console.log('\n\x1b[33mFarewell into the twilight.\x1b[0m\n');
      rl.close();
    }
  });
}

menu();
