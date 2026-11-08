import { VOCABULARY as AUTHORED, TOPICS as AUTHORED_TOPICS } from './curated.js';
import { EXTENDED_VOCABULARY } from './extended.js';

// All 3000 words support meaning/spelling; only authored examples enter sentence practice.
export const CURATED_VOCABULARY = AUTHORED.map(v => ({ ...v, source: '原创精练' }));
const entries = [...CURATED_VOCABULARY, ...EXTENDED_VOCABULARY];
export const TOPICS = [...AUTHORED_TOPICS, '通用表达'];
const buckets = new Map();
for (const entry of entries) {
  for (const key of [entry.pos, `${entry.pos}:${entry.topic}`]) {
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }
}
function senses(text) { return text.split(/[；，,;、]/).map(s => s.trim()).filter(s => s.length >= 2); }
export const VOCABULARY = entries.map((entry, index) => {
  const own = senses(entry.meaning);
  const local = buckets.get(`${entry.pos}:${entry.topic}`) || [];
  const pool = local.length >= 12 ? local : buckets.get(entry.pos);
  const distractors = [];
  for (let offset = 1; offset <= pool.length && distractors.length < 3; offset++) {
    const other = pool[(index + offset) % pool.length];
    if (other.word === entry.word || other.meaning === entry.meaning) continue;
    if (senses(other.meaning).some(sense => own.some(answer => sense.includes(answer) || answer.includes(sense)))) continue;
    distractors.push(other.word);
  }
  if (distractors.length !== 3) throw new Error(`Insufficient distinct distractors for ${entry.word}`);
  return { ...entry, distractors };
});
