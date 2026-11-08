// Pure gameplay logic shared by audience modes; content and copy live in modes.js.
import { DEFAULT_MODE } from './modes.js';
import { DAY, REVIEW_INTERVALS, frequencyWeight, weightedSample, isDue, learningWeight } from './learning.js';
export { reviewPool, selectReviewRound, frequencyLabel, normalizeStrategy } from './learning.js';

export const partsFor = q => q.parts || [...q.word];
export const answerAt = (q, step) => partsFor(q)[q.blanks[step]];
const LETTERS = [...'abcdefghijklmnopqrstuvwxyz'];
const SIMILAR = { a: 'eoi', e: 'aio', i: 'ely', o: 'auc', u: 'voa', b: 'dpq', d: 'bpq', p: 'bqd', q: 'pgb', m: 'nwr', n: 'mhr' };
const wordSets = new WeakMap();

export function shuffle(items, rng = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function optionsFor(q, step, rng = Math.random, mode = DEFAULT_MODE) {
  const answer = answerAt(q, step);
  let candidates;
  if (q.type === 'spelling') {
    const index = q.blanks[step];
    candidates = [...new Set([...(SIMILAR[answer] || ''), ...shuffle(LETTERS, rng)])].filter(c => c !== answer);
    // Avoid an alternative valid bank word for the same visible spelling.
    let words = wordSets.get(mode.questions);
    if (!words) { words = new Set(mode.questions.map(other => other.word)); wordSets.set(mode.questions, words); }
    candidates = candidates.filter(c => !words.has(q.word.slice(0, index) + c + q.word.slice(index + 1)));
  } else candidates = [...new Set(q.distractors)].filter(word => word !== answer);
  return shuffle([answer, ...candidates.slice(0, 3)], rng);
}

export function makeRound(level, { mode = DEFAULT_MODE, count = mode.rules.roundSize, seen = [], topic = '', strategy = 'uniform', stats = {}, now = Date.now(), rng = Math.random } = {}) {
  const pool = mode.questions.filter(q => q.level === level && (!topic || q.topic === topic));
  count = Math.max(0, Math.min(pool.length, Math.trunc(count) || 0));
  if (!count) return [];
  const known = new Set(seen);
  if (strategy === 'smart') {
    const fresh = pool.filter(q => !known.has(q.id));
    const due = pool.filter(q => known.has(q.id) && isDue(stats[q.id], now));
    const reviewCount = Math.min(due.length, count - Math.min(3, fresh.length, count));
    const selected = [
      ...weightedSample(due, reviewCount, q => learningWeight(q, stats, now), rng),
      ...weightedSample(fresh, count - reviewCount, frequencyWeight, rng),
    ];
    if (selected.length < count) {
      const ids = new Set(selected.map(q => q.id));
      selected.push(...weightedSample(pool.filter(q => !ids.has(q.id)), count - selected.length, q => learningWeight(q, stats, now), rng));
    }
    return shuffle(selected, rng);
  }
  if (strategy === 'frequency') {
    const fresh = pool.filter(q => !known.has(q.id));
    const review = pool.filter(q => known.has(q.id));
    const newCount = Math.min(fresh.length, Math.max(Math.min(3, count), count - review.length));
    return shuffle([...weightedSample(fresh, newCount, frequencyWeight, rng), ...weightedSample(review, count - newCount, frequencyWeight, rng)], rng);
  }
  const fresh = shuffle(pool.filter(q => !known.has(q.id)), rng);
  const review = shuffle(pool.filter(q => known.has(q.id)), rng);
  const newCount = Math.min(fresh.length, Math.max(3, count - review.length));
  return shuffle([...fresh.slice(0, newCount), ...review.slice(0, count - newCount)], rng).slice(0, count);
}

export function placementRound(rng = Math.random, mode = DEFAULT_MODE) {
  return mode.levels.flatMap((l) => makeRound(l.id, { count: mode.rules.placementPerLevel, rng, mode }));
}

export function recommendedLevel(results, mode = DEFAULT_MODE) {
  // A small, non-diagnostic check: pass each earlier level before moving up.
  let recommended = mode.levels[0].id;
  for (let i = 0; i < mode.levels.length - 1; i++) {
    if (results.filter((r) => r.level === mode.levels[i].id && r.firstTry).length < mode.rules.placementPerLevel) break;
    recommended = mode.levels[i + 1].id;
  }
  return recommended;
}

export function recordAnswer(save, q, firstTry, { demo = false, placement = false, now = Date.now() } = {}) {
  if (demo || placement) return;
  if (!save.learned.includes(q.id)) save.learned.push(q.id);
  if (firstTry) save.review = save.review.filter((id) => id !== q.id);
  else if (!save.review.includes(q.id)) save.review.push(q.id);
  save.wordStats ||= {};
  const previous = save.wordStats[q.id] || { attempts: 0, correct: 0, lapses: 0, streak: 0, dueAt: 0 };
  const early = firstTry && previous.attempts > 0 && previous.dueAt > now;
  const streak = firstTry ? (early ? previous.streak : Math.min(REVIEW_INTERVALS.length, previous.streak + 1)) : 0;
  const intervalDays = streak ? REVIEW_INTERVALS[streak - 1] : 0;
  const stat = { attempts: previous.attempts + 1, correct: previous.correct + (firstTry ? 1 : 0),
    lapses: previous.lapses + (firstTry ? 0 : 1), streak, intervalDays, lastSeen: now,
    dueAt: early ? previous.dueAt : now + (intervalDays ? intervalDays * DAY : 10 * 60000) };
  save.wordStats[q.id] = stat;
  return stat;
}

