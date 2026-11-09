// Transparent practice heuristics; corpus rank is not IELTS exam frequency.
export const DAY = 86400000;
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
export const normalizeStrategy = value => ['smart', 'frequency', 'uniform'].includes(value) ? value : 'smart';
export function frequencyWeight(q) {
  const rank = Number(q.frequencyRank);
  if (!Number.isFinite(rank) || rank <= 0) return 1.5;
  return rank <= 1500 ? 3 : rank <= 5000 ? 2 : 1;
}
export function frequencyLabel(q) {
  const rank = Number(q.frequencyRank);
  return !Number.isFinite(rank) || rank <= 0 ? '词频未知' : rank <= 1500 ? '语料高频' : rank <= 5000 ? '语料常用' : '语料拓展';
}
export function weightedSample(items, count, weight = () => 1, rng = Math.random) {
  return items.map(item => {
    const u = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, Number(rng()) || 0));
    const w = Math.max(.01, Math.min(20, Number(weight(item)) || 1));
    return { item, key: -Math.log(u) / w };
  }).sort((a, b) => a.key - b.key).slice(0, Math.max(0, Math.trunc(count))).map(row => row.item);
}
export function isDue(stat, now) { return !stat || !stat.dueAt || stat.dueAt <= now; }
export function learningWeight(q, stats = {}, now = Date.now()) {
  const stat = stats[q.id];
  if (!stat) return frequencyWeight(q);
  const overdue = Math.min(3, Math.max(0, (now - (stat.dueAt || now)) / DAY));
  return (1 + Math.min(4, stat.lapses || 0) * 2 + overdue + frequencyWeight(q) * .2) / (1 + (stat.streak || 0) * .5);
}
export function reviewPool(mode, save, { topic = '', now = Date.now(), autoOnly = false } = {}) {
  const mistakes = new Set(save.review || []);
  const learned = new Set(save.learned || []);
  return mode.questions.filter(q => (!topic || q.topic === topic) &&
    ((!autoOnly && mistakes.has(q.id)) || ((learned.has(q.id)||mistakes.has(q.id)) && isDue(save.wordStats?.[q.id], now))));
}
export function selectReviewRound(mode, save, { topic = '', strategy = 'smart', count = mode.rules.roundSize, now = Date.now(), rng = Math.random } = {}) {
  const pool = reviewPool(mode, save, { topic, now });
  const mistakes = new Set(save.review || []);
  const weight = strategy === 'uniform' ? () => 1 : strategy === 'frequency' ? frequencyWeight
    : q => learningWeight(q, save.wordStats, now) * (mistakes.has(q.id) ? 1.5 : 1);
  return weightedSample(pool, count, weight, rng);
}
