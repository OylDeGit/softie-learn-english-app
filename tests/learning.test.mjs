import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY, frequencyWeight, frequencyLabel, weightedSample, learningWeight, reviewPool } from '../js/learning.js';
import { MODES, saveKey, WORD_BANK } from '../js/modes.js';
import { makeRound, recordAnswer } from '../js/idioms.js';
import { freshSave, loadSave, persistSave } from '../js/storage.js';
import { createApp } from './helpers/app-harness.mjs';

function seeded(seed = 42) { return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; }
const now = Date.UTC(2026, 10, 8, 8);
const word = (id, rank = 100) => ({ id, level: 1, word: id, frequencyRank: rank, topic: 'test' });

test('frequency sampling favours high-frequency words while keeping low-frequency words reachable', () => {
  const high = word('high', 100), low = word('low', 12000);
  assert.equal(frequencyWeight(high), 3); assert.equal(frequencyWeight(low), 1);
  const rng = seeded(); const counts = { high: 0, low: 0 };
  for (let i = 0; i < 20000; i++) counts[weightedSample([high, low], 1, frequencyWeight, rng)[0].id]++;
  const ratio = counts.high / counts.low;
  assert.ok(ratio > 2.6 && ratio < 3.4, JSON.stringify(counts));
  assert.ok(counts.low > 0);
  assert.equal(frequencyLabel({}), '词频未知');
  assert.ok(WORD_BANK.every(q => Number.isFinite(q.frequencyRank) && q.frequencyRank >= 0));
});

test('smart rounds reserve fresh words and prioritise due words over recently learned words', () => {
  const fresh = Array.from({ length: 10 }, (_, i) => word('new' + i));
  const due = Array.from({ length: 5 }, (_, i) => word('due' + i));
  const future = Array.from({ length: 5 }, (_, i) => word('later' + i));
  const mode = { questions: [...fresh, ...due, ...future], rules: { roundSize: 8 } };
  const seen = [...due, ...future].map(q => q.id);
  const stats = Object.fromEntries([...due, ...future].map(q => [q.id, { dueAt: q.id.startsWith('due') ? now - 1 : now + DAY, streak: 1 }]));
  const round = makeRound(1, { mode, seen, stats, now, strategy: 'smart', rng: seeded() });
  assert.equal(round.length, 8); assert.equal(new Set(round.map(q => q.id)).size, 8);
  assert.equal(round.filter(q => q.id.startsWith('due')).length, 5);
  assert.equal(round.filter(q => q.id.startsWith('new')).length, 3);
  assert.ok(!round.some(q => q.id.startsWith('later')));
  for (const q of due) stats[q.id].dueAt = now + DAY;
  assert.ok(makeRound(1, { mode, seen, stats, now, strategy: 'smart' }).every(q => q.id.startsWith('new')));
  for (const strategy of ['smart', 'frequency', 'uniform']) {
    assert.equal(makeRound(1, { mode, count: 2, strategy }).length, 2);
    assert.equal(makeRound(1, { mode, count: 0, strategy }).length, 0);
  }
});

test('mistakes raise review weight and review pool includes due, legacy and still-pending mistakes once', () => {
  const weak = word('weak'), stable = word('stable');
  const stats = { weak: { lapses: 3, streak: 0, dueAt: now - DAY }, stable: { lapses: 0, streak: 5, dueAt: now - DAY } };
  assert.ok(learningWeight(weak, stats, now) > learningWeight(stable, stats, now));
  const mode = { questions: [weak, stable, word('legacy'), word('early'), word('fresh')] };
  const save = { learned: ['weak', 'stable', 'legacy', 'early'], review: ['weak', 'early'],
    wordStats: { ...stats, early: { dueAt: now + DAY } } };
  assert.deepEqual(reviewPool(mode, save, { now }).map(q => q.id), ['weak', 'stable', 'legacy', 'early']);
});

test('independent success expands intervals and early repeats cannot inflate the schedule', () => {
  const save = freshSave(); const q = MODES.meaning.questions[0];
  let stat = recordAnswer(save, q, true, { now });
  assert.equal(stat.streak, 1); assert.equal(stat.dueAt, now + DAY);
  const early = recordAnswer(save, q, true, { now: now + 60000 });
  assert.equal(early.streak, 1); assert.equal(early.dueAt, stat.dueAt);
  for (const days of [3, 7, 14, 30, 30]) {
    const at = stat.dueAt + 1;
    stat = recordAnswer(save, q, true, { now: at });
    assert.equal(stat.intervalDays, days); assert.equal(stat.dueAt, at + days * DAY);
  }
  const wrong = recordAnswer(save, q, false, { now: stat.dueAt + 1 });
  assert.equal(wrong.streak, 0); assert.equal(wrong.lapses, 1);
  assert.equal(wrong.dueAt - wrong.lastSeen, 600000); assert.ok(save.review.includes(q.id));
  const earlyRecovery = recordAnswer(save, q, true, { now: wrong.lastSeen + 1000 });
  assert.equal(earlyRecovery.streak, 0); assert.equal(earlyRecovery.dueAt, wrong.dueAt);
  const recovered = recordAnswer(save, q, true, { now: wrong.dueAt + 1 });
  assert.equal(recovered.streak, 1); assert.equal(recovered.dueAt, wrong.dueAt + 1 + DAY);
  const before = structuredClone(save);
  recordAnswer(save, q, true, { now, demo: true }); recordAnswer(save, q, false, { now, placement: true });
  assert.deepEqual(save, before);
});

test('word schedules round-trip, migrate old saves and reject malformed or foreign IDs', () => {
  const values = new Map();
  const store = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const save = freshSave(); const q = MODES.meaning.questions[0];
  recordAnswer(save, q, true, { now }); persistSave(store, save);
  assert.deepEqual(loadSave(store).wordStats, save.wordStats);
  values.set(saveKey(MODES.meaning), JSON.stringify({ version: 1, learned: [q.id], rounds: 5 }));
  const legacy = loadSave(store); assert.deepEqual(legacy.wordStats, {}); assert.equal(legacy.rounds, 5);
  values.set(saveKey(MODES.meaning), JSON.stringify({ version: 1, learned: [q.id], wordStats: {
    [q.id]: { attempts: 10, correct: 99, lapses: -2, streak: 99, intervalDays: 999, lastSeen: now, dueAt: 'tomorrow' },
    missing: { attempts: 1 },
  } }));
  const loaded = loadSave(store).wordStats;
  assert.equal(Object.keys(loaded).length, 1); assert.equal(loaded[q.id].correct, 10);
  assert.equal(loaded[q.id].streak, 5); assert.equal(loaded[q.id].dueAt, 0);
});

test('application defaults to smart practice, stores strategy and avoids repeating fresh successes immediately', async () => {
  const f = createApp(); assert.equal(f.$('#strategy-select').value, 'smart');
  f.app.start('level', 1); const first = new Set(f.app.scene.questions.map(q => q.id));
  await f.round();
  const stored = f.stored('meaning'); assert.equal(Object.keys(stored.wordStats).length, 8);
  f.app.home(); f.app.start('level', 1);
  assert.ok(f.app.scene.questions.every(q => !first.has(q.id)));
  f.app.home(); f.$('#strategy-select').value = 'frequency'; f.$('#strategy-select').change();
  assert.equal(f.localStorage.getItem('softie-ielts-gt:strategy'), 'frequency');
  assert.match(f.$('#strategy-note').textContent, /词频加权/);
});

test('a hinted answer is scheduled as a mistake and does not earn a longer interval', async () => {
  const f = createApp(); f.app.start('level', 1); const q = f.app.scene.questions[0];
  f.$('#show-hint').click(); await f.answer();
  const stat = f.app.saved.wordStats[q.id];
  assert.equal(stat.streak, 0); assert.equal(stat.lapses, 1);
  assert.equal(stat.dueAt - stat.lastSeen, 600000);
  assert.match(f.$('#schedule-note').textContent, /10 分钟/);
});

test('returning to the page refreshes newly due vocabulary without losing schedules', async () => {
  const f = createApp(); f.app.start('level', 1); await f.round(); f.app.home();
  assert.equal(f.$('#review-count').textContent, 0);
  const due = Math.max(...Object.values(f.app.saved.wordStats).map(row => row.dueAt));
  f.setDate(new Date(due + 1)); f.documentEvents.visibilitychange();
  assert.equal(f.$('#review-count').textContent, 8);
  assert.equal(Object.keys(f.app.saved.wordStats).length, 8);
});
