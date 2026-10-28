/**
 * Unit & Integration Test for OfrendaViva
 */

const assert = require('assert');
const { synthesizeLocal, checkOllamaHealth, HISTORICAL_SPIRITS } = require('../lib/engine');

console.log('--- Running OfrendaViva Test Suite ---');

// 1. Test Calaverita Generation
console.log('Testing Calaverita Literaria generation...');
const calaverita = synthesizeLocal('calaverita', {
  name: 'Ada Lovelace',
  role: 'Poet of Science',
  memories: 'weaving algebraic patterns',
  favorite: 'brass gears and tea',
});
assert(calaverita.includes('ADA LOVELACE'), 'Calaverita should mention name');
assert(calaverita.includes('Catrina'), 'Calaverita should feature La Catrina');
assert(calaverita.includes('cempasúchil'), 'Calaverita should mention sacred marigolds');
console.log('✔ Calaverita Literaria generated cleanly!');

// 2. Test Epitaph Generation
console.log('Testing Altar Epitaph generation...');
const epitaph = synthesizeLocal('epitaph', {
  name: 'Alan Turing',
  role: 'Father of AI',
  memories: 'breaking the Enigma',
  favorite: 'apples and mathematics',
});
assert(epitaph.includes('ALAN TURING'), 'Epitaph should mention name');
assert(epitaph.includes('ofrenda'), 'Epitaph should mention ofrenda');
console.log('✔ Altar Epitaph generated cleanly!');

// 3. Test Historical Spirits Directory
console.log('Testing Historical Spirits directory...');
assert(HISTORICAL_SPIRITS.ada_lovelace, 'Ada Lovelace spirit must exist');
assert(HISTORICAL_SPIRITS.alan_turing, 'Alan Turing spirit must exist');
assert(HISTORICAL_SPIRITS.grace_hopper, 'Grace Hopper spirit must exist');
assert(HISTORICAL_SPIRITS.margaret_hamilton, 'Margaret Hamilton spirit must exist');
console.log('✔ Historical Spirits verified!');

// 4. Test Ollama Health Fallback
console.log('Testing Ollama health check fallback...');
checkOllamaHealth().then((health) => {
  assert(typeof health.available === 'boolean', 'Health must return boolean available');
  console.log(`✔ Ollama health check returned available=${health.available}`);
  console.log('\n🎉 ALL OFRENDAVIVA TESTS PASSED SUCCESSFULLY! 🎉\n');
});
