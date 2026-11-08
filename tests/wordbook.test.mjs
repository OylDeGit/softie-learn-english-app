import test from 'node:test';
import assert from 'node:assert/strict';
import { WORD_BANK, MODES } from '../js/modes.js';
import { VOCABULARY as ORIGINAL } from '../js/content/curated.js';
import { searchWordbook } from '../js/wordbook.js';
import { optionsFor } from '../js/idioms.js';
import { createApp } from './helpers/app-harness.mjs';

test('wordbook pagination exposes all 3000 unique headwords, with safe page bounds', () => {
  const first = searchWordbook('');
  assert.equal(first.total, 3000); assert.equal(first.pages, 150); assert.equal(first.items.length, 20);
  const ids = new Set();
  for (let page = 1; page <= first.pages; page++) for (const q of searchWordbook('', { page }).items) ids.add(q.id);
  assert.equal(ids.size, 3000);
  assert.equal(searchWordbook('', { page: -50 }).page, 1);
  assert.equal(searchWordbook('', { page: 100000 }).page, 150);
});

test('search accepts English, Chinese and collocations and combines topic/level filters', () => {
  assert.ok(searchWordbook('  REFUND ').items.some(q => q.word === 'refund'));
  assert.ok(searchWordbook('押金').items.some(q => q.word === 'deposit'));
  assert.ok(searchWordbook('a refundable deposit').items.some(q => q.word === 'deposit'));
  const filtered = searchWordbook('', { topic: '工作与职业', level: 3 });
  assert.ok(filtered.total > 0); assert.ok(filtered.items.every(q => q.topic === '工作与职业' && q.level === 3));
  const missing = searchWordbook('zzzzzzzzzzzzzzzz');
  assert.equal(missing.total, 0); assert.equal(missing.page, 1); assert.deepEqual(missing.items, []);
});

test('wordbook UI searches, resets pagination, handles empty results and closes cleanly', () => {
  const f = createApp(); f.$('#open-wordbook').click();
  assert.equal(f.$('#wordbook-dialog').open, true);
  assert.match(f.$('#wordbook-count').textContent, /3000 词.*1 \/ 150/);
  f.$('#wordbook-next').click(); assert.match(f.$('#wordbook-count').textContent, /2 \/ 150/);
  f.$('#wordbook-search').value = 'refund'; f.$('#wordbook-search').input();
  assert.match(f.$('#wordbook-list').innerHTML, /refund/);
  assert.match(f.$('#wordbook-count').textContent, /1 \/ 1/);
  f.$('#wordbook-search').value = 'zzzzzzzzzzzzzz'; f.$('#wordbook-search').input();
  assert.match(f.$('#wordbook-list').innerHTML, /没有匹配词汇/);
  assert.equal(f.$('#wordbook-prev').disabled, true); assert.equal(f.$('#wordbook-next').disabled, true);
  f.$('#close-wordbook').click(); assert.equal(f.$('#wordbook-dialog').open, false);
});

test('all original progress IDs and levels survive the 3000-word expansion', () => {
  const previous = ORIGINAL.slice(0, 10).map(q => `meaning:${q.id}`);
  const f = createApp({ saves: { meaning: { version: 1, learned: previous, review: previous.slice(0, 2), rounds: 3 } } });
  assert.deepEqual(f.app.saved.learned, previous); assert.deepEqual(f.app.saved.review, previous.slice(0, 2));
  assert.equal(f.app.saved.rounds, 3);
  for (const q of ORIGINAL) {
    const expanded = WORD_BANK.find(word => word.id === q.id);
    assert.equal(expanded.level, q.level); assert.equal(expanded.word, q.word);
  }
});

test('switching from general vocabulary to sentence practice resets an unsupported topic', () => {
  const f = createApp(); f.$('#topic-select').value = '通用表达'; f.$('#topic-select').change();
  assert.match(f.$('#home-progress').textContent, /通用表达/);
  f.app.setAudienceMode('sentence', false);
  assert.equal(f.$('#topic-select').value, '');
  assert.match(f.$('#mode-coverage').textContent, /500 词/);
  assert.ok(!f.$('#topic-select').innerHTML.includes('通用表达'));
  f.app.start('level', 1); assert.equal(f.app.scene.questions.length, 8);
});

test('expanded dictionary cards have readable explanations and never fabricate missing collocations', async () => {
  const q = MODES.meaning.questions.find(q => q.source === 'ECDICT' && !q.context);
  const f = createApp({ saves: { meaning: { version: 1, review: [q.id] } } });
  f.app.start('review'); await f.answer();
  assert.equal(f.$('#usage-card').hidden, true);
  assert.ok(f.$('#example').textContent.length > 0);
  assert.ok(!f.$('#example').textContent.includes('undefined'));
  assert.match(f.$('#word-source').textContent, /ECDICT/);
  assert.equal(f.app.scene.phase, 'explain');
});

test('spelling distractors exclude another valid word with the same visible letters', () => {
  const q = { word: 'cat', type: 'spelling', parts: [...'cat'], blanks: [0] };
  const mode = { questions: [q, { word: 'bat' }, { word: 'hat' }, { word: 'mat' }] };
  for (let i = 0; i < 20; i++) {
    const opts = optionsFor(q, 0, Math.random, mode);
    assert.ok(opts.includes('c')); assert.equal(opts.length, 4);
    assert.ok(!opts.some(letter => ['b', 'h', 'm'].includes(letter)));
  }
});
