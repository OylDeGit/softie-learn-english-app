import { MODES, WORD_BANK } from './modes.js';
import { dayKey } from './storage.js';

export const SKILLS_KEY = 'softie-ielts-gt:skills:v2';
export const DIMENSIONS = ['recognition', 'dictation', 'collocation'];
export const DIMENSION_LABELS = { recognition: '识义', dictation: '听写', collocation: '搭配' };
export const dimensionFor = mode => ({ meaning: 'recognition', sentence: 'recognition', dictation: 'dictation', collocation: 'collocation' })[mode] || null;
const known = new Set(WORD_BANK.map(q => q.id));
const integer = x => Number.isSafeInteger(x) && x >= 0 ? Math.min(x, 8640000000000000) : 0;
const validDay = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const safeId = x => typeof x === 'string' && /^[\w:.-]{1,160}$/.test(x);
export const freshSkills = () => ({ version: 2, words: {}, events: [] });
export function cleanSkills(value) {
  const result = freshSkills();
  if (!value || value.version !== 2) return result;
  for (const [id, row] of Object.entries(value.words || {})) {
    if (!known.has(id) || !row || typeof row !== 'object') continue;
    const next = {};
    for (const dim of DIMENSIONS) {
      const s = row[dim];
      if (!s || typeof s !== 'object') continue;
      next[dim] = { touched: true, attempts: integer(s.attempts), correct: Math.min(integer(s.correct), integer(s.attempts)),
        successDays: [...new Set((Array.isArray(s.successDays) ? s.successDays : []).filter(validDay))].sort().slice(-30),
        lastCorrect: s.lastCorrect === true, updatedAt: integer(s.updatedAt) };
    }
    result.words[id] = next;
  }
  result.events = (Array.isArray(value.events) ? value.events : []).filter(e => e && safeId(e.id) && known.has(e.vocabId) && DIMENSIONS.includes(e.dimension) && integer(e.at) > 0 && validDay(e.day))
    .map(e => ({ id: e.id, vocabId: e.vocabId, dimension: e.dimension, at: integer(e.at), day: e.day,
      correct: e.correct === true, retention: e.retention === true, skipped: e.skipped === true })).slice(-2500);
  result.events = [...new Map(result.events.map(e => [e.id, e])).values()];
  return result;
}
export function migrateSkills(storage, saves) {
  let raw;
  try { raw = JSON.parse(storage?.getItem(SKILLS_KEY)); } catch { /* Keep legacy records untouched. */ }
  const result = cleanSkills(raw);
  for (const mode of Object.values(MODES)) {
    const dim = dimensionFor(mode.id);
    const questions=new Map(mode.questions.map(q=>[q.id,q]));
    for (const qid of saves[mode.id]?.learned || []) {
      const q = questions.get(qid);
      if (!q) continue;
      result.words[q.vocabId] ||= {};
      if (dim) result.words[q.vocabId][dim] ||= { touched: true, attempts: 0, correct: 0, successDays: [], lastCorrect: false, updatedAt: 0 };
    }
  }
  return result;
}
export function recordSkill(profile, q, { firstTry, skipped = false, previousStat, at = Date.now(), eventId } = {}) {
  const dim = dimensionFor(q.type);
  profile.words[q.vocabId] ||= {};
  if (!dim || !safeId(eventId) || profile.events.some(e => e.id === eventId)) return false;
  const row = profile.words[q.vocabId][dim] || { touched: true, attempts: 0, correct: 0, successDays: [], updatedAt: 0 };
  const day = dayKey(new Date(at));
  const correct = firstTry === true && !skipped;
  const due = !previousStat?.dueAt || previousStat.dueAt <= at;
  const retention = Boolean(previousStat?.lastSeen && dayKey(new Date(previousStat.lastSeen)) !== day && due);
  const days = correct ? [...row.successDays] : [];
  if (correct && due && !days.includes(day)) days.push(day);
  profile.words[q.vocabId][dim] = { touched: true, attempts: row.attempts + 1, correct: row.correct + Number(correct),
    successDays: days.sort().slice(-30), lastCorrect: correct, updatedAt: at };
  profile.events.push({ id: eventId, vocabId: q.vocabId, dimension: dim, at, day, correct, retention, skipped });
  profile.events = profile.events.slice(-2500);
  return true;
}
export function skillStatus(profile, word, dim) {
  if (dim === 'collocation' && !word.collocation) return '尚未覆盖';
  const row = profile.words[word.vocabId || word.id]?.[dim];
  if (!row?.touched) return '未练';
  if (row.lastCorrect && row.successDays.length >= 2) return '稳定';
  return row.attempts ? '需巩固' : '已接触';
}
export function skillSummary(profile, now = Date.now()) {
  const days = new Set(Array.from({ length: 7 }, (_, i) => dayKey(new Date(now - i * 86400000))));
  const events = profile.events.filter(e => days.has(e.day));
  const retention = events.filter(e => e.retention);
  return { touched: Object.keys(profile.words).length, first: events.filter(e => e.correct).length, total: events.length,
    retained: retention.filter(e => e.correct).length, retentionTotal: retention.length,
    stable: Object.fromEntries(DIMENSIONS.map(dim => [dim, WORD_BANK.filter(q => skillStatus(profile, q, dim) === '稳定').length])) };
}
export function mergeSkills(current, incoming) {
  const a = cleanSkills(current), b = cleanSkills(incoming);
  for (const [id, row] of Object.entries(b.words)) {
    a.words[id] ||= {};
    for (const [dim, state] of Object.entries(row)) if (!a.words[id][dim] || state.updatedAt > a.words[id][dim].updatedAt) a.words[id][dim] = state;
  }
  a.events = [...new Map([...b.events, ...a.events].map(e => [e.id, e])).values()].sort((x, y) => x.at - y.at).slice(-2500);
  return a;
}
