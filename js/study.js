import { MODES, WORD_BANK, saveKey } from './modes.js';
import { dayKey, loadSave } from './storage.js';
import { reviewPool, weightedSample, learningWeight, frequencyWeight } from './learning.js';
export const PLAN_KEY = 'softie-ielts-gt:daily-plan';
const known = new Set(WORD_BANK.map(q => q.id));
export function cleanPlan(value = {}, today = dayKey()) {
  return { day: today, level: [1,2,3].includes(value.level) ? value.level : 2, goal: [5,10,15,20,30].includes(value.goal) ? value.goal : 10,
    newWords: value.day === today && Array.isArray(value.newWords) ? [...new Set(value.newWords.filter(id => known.has(id)))] : [] };
}
export function learnedVocabulary(storage) {
  const ids = new Set();
  for (const mode of Object.values(MODES)) for (const id of loadSave(storage, mode).learned) ids.add(id.slice(mode.id.length + 1));
  return ids;
}
export function dailySummary(mode, save, plan, {topic = '', now = Date.now()} = {}) {
  const due = reviewPool(mode, save, {topic, now,autoOnly:true});
  const effectiveGoal = due.length > 40 ? 0 : due.length > 20 ? Math.min(plan.goal, 5) : plan.goal;
  return {due, effectiveGoal, remaining: Math.max(0, effectiveGoal - plan.newWords.length)};
}
export function dailyRound(mode, save, plan, {topic = '', level = 1, learned = new Set(), now = Date.now(), rng = Math.random} = {}) {
  const {due, remaining} = dailySummary(mode, save, plan, {topic, now});
  const reviews = weightedSample(due, Math.min(8, due.length), q => learningWeight(q, save.wordStats, now), rng);
  const fresh = mode.questions.filter(q => q.level === level && (!topic || q.topic === topic) && !save.learned.includes(q.id));
  const skillPractice=mode.id!=='meaning'?fresh.filter(q=>learned.has(q.vocabId)):[];
  if(skillPractice.length)return [...reviews,...weightedSample(skillPractice,8-reviews.length,frequencyWeight,rng)];
  const count = Math.min(remaining, reviews.length ? Math.max(0, 8 - reviews.length) : 8);
  return [...reviews, ...weightedSample(fresh, count, frequencyWeight, rng)];
}
export function normalizeDictation(value) { return String(value).trim().toLowerCase(); }
const SPELLING_PAIRS = ['colour/color','centre/center','analyse/analyze','organise/organize','organisation/organization','realise/realize','recognise/recognize','behaviour/behavior','labour/labor','neighbour/neighbor','neighbourhood/neighborhood','licence/license','defence/defense','offence/offense','judgement/judgment','favour/favor','humour/humor','honour/honor','metre/meter','litre/liter','grey/gray','catalogue/catalog','jewellery/jewelry','criticise/criticize','apologise/apologize'];
export function dictationMatches(input, target) {
  const a=normalizeDictation(input),b=normalizeDictation(target);
  return a===b || SPELLING_PAIRS.some(pair=>{const forms=pair.split('/');return forms.includes(a)&&forms.includes(b);});
}
// Levenshtein alignment: expose where letters differ without revealing the target.
export function spellingFeedback(input, target) {
  const a = normalizeDictation(input), b = normalizeDictation(target);
  const d = Array.from({length:a.length+1}, (_,i)=>Array.from({length:b.length+1},(_,j)=>i ? (j ? 0 : i) : j));
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  const parts=[]; let i=a.length,j=b.length;
  while(i||j) {
    if(i&&j&&d[i][j]===d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){parts.unshift({text:a[i-1],wrong:a[i-1]!==b[j-1]});i--;j--;}
    else if(i&&d[i][j]===d[i-1][j]+1){parts.unshift({text:a[i-1],wrong:true});i--;}
    else {parts.unshift({text:'□',wrong:true});j--;}
  }
  return parts;
}
