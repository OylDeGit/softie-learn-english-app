import { VOCABULARY } from './content/vocabulary.js';

const ordered = [...VOCABULARY].sort((a, b) => a.word.localeCompare(b.word, 'en'));
export function searchWordbook(query = '', { topic = '', level = 0, page = 1 } = {}) {
  const text = String(query).trim().toLowerCase();
  const matches = ordered.filter(q => (!topic || q.topic === topic) && (!level || q.level === Number(level)) &&
    (!text || [q.word, q.meaning, q.dictionaryMeanings, q.collocation, q.collocationMeaning].filter(Boolean).some(value => value.toLowerCase().includes(text))));
  const pages = Math.max(1, Math.ceil(matches.length / 20));
  const current = Math.max(1, Math.min(pages, Math.trunc(Number(page)) || 1));
  return { items: matches.slice((current - 1) * 20, current * 20), total: matches.length, page: current, pages };
}
