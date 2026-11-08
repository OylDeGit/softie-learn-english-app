import test from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../js/content/vocabulary.js';
import { MODES, saveKey } from '../js/modes.js';
import { makeRound } from '../js/idioms.js';
import { freshSave, loadSave, resetAllSaves } from '../js/storage.js';
import { createApp } from './helpers/app-harness.mjs';

test('every GT topic supports unique eight-question rounds at every level and in every mode', () => {
  for (const mode of Object.values(MODES)) for (const topic of TOPICS) for (const level of mode.levels) {
    const round = makeRound(level.id, { mode, topic });
    assert.equal(round.length, 8);
    assert.equal(new Set(round.map(q => q.id)).size, 8);
    assert.ok(round.every(q => q.topic === topic && q.level === level.id));
    const next = makeRound(level.id, { mode, topic, seen: round.map(q => q.id) });
    assert.equal(next.length, 8);
    assert.equal(new Set(next.map(q => q.id)).size, 8);
    assert.equal(next.filter(q => !round.some(previous => previous.id === q.id)).length, 2);
  }
});

test('topic control filters level rounds and progress while placement covers all levels', async () => {
  for (const mode of Object.values(MODES)) {
    const f = createApp({ mode: mode.id });
    f.$('#topic-select').value = TOPICS[1]; f.$('#topic-select').change();
    assert.match(f.$('#home-progress').textContent, /0 \/ 30 词/);
    assert.equal(f.localStorage.getItem('softie-ielts-gt:topic'), TOPICS[1]);
    f.app.start('level', 2);
    assert.ok(f.app.scene.questions.every(q => q.topic === TOPICS[1]));
    await f.round();
    f.app.home();
    assert.match(f.$('#home-progress').textContent, /8 \/ 30 词/);
    f.$('#topic-select').value = TOPICS[0]; f.$('#topic-select').change();
    assert.match(f.$('#home-progress').textContent, /0 \/ 30 词/);
    f.app.start('placement');
    assert.deepEqual(Array.from(f.app.scene.questions, q => q.level), [1, 1, 2, 2, 3, 3]);
  }
});

test('review count and questions respect the selected topic without removing other mistakes', () => {
  const mode = MODES.meaning; const save = freshSave(mode);
  const a = mode.questions.find(q => q.topic === TOPICS[0]);
  const b = mode.questions.find(q => q.topic === TOPICS[1]);
  save.review = [a.id, b.id];
  const f = createApp({ saves: { meaning: save } });
  f.$('#topic-select').value = TOPICS[0]; f.$('#topic-select').change();
  assert.equal(f.$('#review-count').textContent, 1);
  f.app.start('review');
  assert.equal(f.app.scene.questions.length, 1);
  assert.equal(f.app.scene.questions[0].id, a.id);
  assert.deepEqual(f.app.saved.review, [a.id, b.id]);
  f.app.home(); f.$('#topic-select').value = 'unknown'; f.$('#topic-select').change();
  assert.equal(f.$('#review-count').textContent, 2);
});

test('answered cards teach word class, bilingual collocations and General Training use cases', async () => {
  for (const mode of Object.values(MODES)) {
    const f = createApp({ mode: mode.id }); f.app.start('level', 2);
    const q = f.app.scene.questions[0];
    assert.equal(f.$('#explanation').hidden, true);
    await f.answer();
    assert.equal(f.$('#meaning').textContent, `${q.pos} ${q.meaning}`);
    assert.ok(f.$('#collocation').textContent.includes(q.collocation));
    assert.ok(f.$('#collocation').textContent.includes(q.collocationMeaning));
    assert.ok(f.$('#example').textContent.includes(q.context.replace('____', q.word)));
    assert.ok(f.$('#use-case').textContent.includes(q.useCase));
  }
});

test('old beginner progress is neither loaded nor cleared by the GT version', () => {
  const values = new Map([
    ['softie-english:meaning:v1', JSON.stringify({ ...freshSave(), rounds: 99 })],
    ['softie-english:active-mode', 'sentence'],
    ['another-app', 'untouched'],
  ]);
  const store = { getItem: k => values.get(k), removeItem: k => values.delete(k),
    get length() { return values.size; }, key: i => [...values.keys()][i] };
  assert.equal(loadSave(store).rounds, 0);
  values.set(saveKey(MODES.meaning), JSON.stringify(freshSave()));
  values.set('softie-ielts-gt:topic', TOPICS[0]);
  resetAllSaves(store);
  assert.equal(values.has(saveKey(MODES.meaning)), false);
  assert.equal(values.has('softie-ielts-gt:topic'), false);
  assert.equal(values.size, 3);
  assert.equal(JSON.parse(values.get('softie-english:meaning:v1')).rounds, 99);
});
