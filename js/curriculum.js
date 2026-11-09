import { MODES, WORD_BANK } from './modes.js';
import { dayKey } from './storage.js';
import { frequencyWeight, weightedSample, reviewPool } from './learning.js';
import { dimensionFor, skillStatus } from './skills.js';

export const SESSION_KEY = 'softie-ielts-gt:daily-session:v1';
export const BACKUP_META_KEY = 'softie-ielts-gt:backup-meta';
export const STAGES = [
  { id: 'review', title: '到期复习', minutes: 8 }, { id: 'new', title: '新词学习', minutes: 8 },
  { id: 'retrieval', title: '提取训练', minutes: 6 }, { id: 'application', title: '场景应用', minutes: 8 },
];
const lookup = new Map(Object.values(MODES).flatMap(m => m.questions).map(q => [q.id, q]));
const safeDay = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const safeToken = x => typeof x === 'string' && /^[\w:.-]{1,160}$/.test(x);
const integer = (x, max = 10000000000000) => Number.isSafeInteger(x) && x >= 0 ? Math.min(x, max) : 0;
export function cleanSession(value, today = dayKey()) {
  if (!value || value.version !== 1 || value.day !== today || !safeToken(value.id)) return null;
  const stage = [0,1,2,3,4].includes(value.stage) ? value.stage : 0;
  const queues = Array.from({ length: 3 }, (_, i) => Array.isArray(value.queues?.[i]) ? value.queues[i].filter(id => lookup.has(id)).slice(0,30) : null);
  const completed = Array.isArray(value.completed) ? value.completed.filter(r => r && lookup.has(r.qid) && [0,1,2].includes(r.stage) && safeToken(r.token))
    .map(r => ({ token:r.token,qid:r.qid,stage:r.stage,firstTry:r.firstTry===true,skipped:r.skipped===true,at:integer(r.at) })).slice(0,90) : [];
  const checkpoint = value.checkpoint && typeof value.checkpoint === 'object' ? {
    index: integer(value.checkpoint.index, 30), firstTry: value.checkpoint.firstTry !== false,
    step:integer(value.checkpoint.step,2),stepMisses:integer(value.checkpoint.stepMisses,10000),misses:integer(value.checkpoint.misses,10000),questionMisses:integer(value.checkpoint.questionMisses,10000),
    typed: typeof value.checkpoint.typed === 'string' ? value.checkpoint.typed.slice(0,40) : '',
    thinkingMs:integer(value.checkpoint.thinkingMs),
    phase: value.checkpoint.phase === 'explain' ? 'explain' : 'answer', playMs:integer(value.checkpoint.playMs),
  } : null;
  const topic = [...new Set(WORD_BANK.map(q => q.topic))].includes(value.topic) ? value.topic : '';
  return { version:1,id:value.id,day:today,stage,queues,completed:[...new Map(completed.map(r=>[r.token,r])).values()],checkpoint,
    topic,level:[1,2,3].includes(value.level)?value.level:2,goal:[5,10,15,20,30].includes(value.goal)?value.goal:10,
    stageDone:Array.from({length:4},(_,i)=>value.stageDone?.[i]===true),
    stageMs:Array.from({length:4},(_,i)=>integer(value.stageMs?.[i])),
    application: cleanApplication(value.application), startedAt:integer(value.startedAt), updatedAt:integer(value.updatedAt) };
}
function cleanApplication(value) {
  if (!value || !['reading','letter','opinion'].includes(value.kind)) return null;
  const max = value.kind==='reading'?8:value.kind==='letter'?12:6;
  const prefix = value.kind === 'letter' ? 'letter' : value.kind;
  return typeof value.id==='string' && Array.from({length:max},(_,i)=>`${prefix}-${i+1}`).includes(value.id) ? {kind:value.kind,id:value.id} : null;
}
export function createSession(plan, topic = '', now = Date.now()) {
  return { version:1,id:`daily-${now}-${Math.random().toString(36).slice(2,8)}`,day:dayKey(new Date(now)),stage:0,
    queues:[null,null,null],completed:[],checkpoint:null,topic,level:plan.level,goal:plan.goal,stageDone:[false,false,false,false],stageMs:[0,0,0,0],application:null,startedAt:now,updatedAt:now };
}
export const sessionToken = (s, index) => `${s.id}:${s.stage}:${index}`;
export const questionById = id => lookup.get(id);
export function dueQuestions(saves, {topic='',now=Date.now()} = {}) {
  return Object.values(MODES).flatMap(m => reviewPool(m, saves[m.id] || {}, {topic,now,autoOnly:true}));
}
function weakness(q, profile, saves) {
  const stat=saves[q.type]?.wordStats?.[q.id];
  const dim=dimensionFor(q.type),row=profile.words[q.vocabId]?.[dim];
  return 1 + Math.min(4,stat?.lapses||0)*2 + (row?.attempts && !row.lastCorrect ? 3 : 0) + frequencyWeight(q)*.2;
}
export function buildStage(session, profile, saves, plan, {now=Date.now(),rng=Math.random} = {}) {
  if (session.stage >= 3) return [];
  if (session.queues[session.stage]) return session.queues[session.stage].map(questionById);
  const due = dueQuestions(saves,{topic:session.topic,now});
  let selected=[];
  if (session.stage===0) selected=weightedSample(due,16,q=>weakness(q,profile,saves),rng);
  if (session.stage===1) {
    const cap=due.length>40?0:due.length>20?Math.min(session.goal,5):session.goal;
    const remaining=Math.max(0,cap-plan.newWords.length);
    const eligible=MODES.meaning.questions.filter(q=>q.level===session.level&&(!session.topic||q.topic===session.topic)&&!profile.words[q.vocabId]);
    const contexts=eligible.filter(q=>q.context);
    selected=weightedSample(contexts,remaining,frequencyWeight,rng);
    if(selected.length<remaining)selected.push(...weightedSample(eligible.filter(q=>!q.context),remaining-selected.length,frequencyWeight,rng));
  }
  if (session.stage===2) {
    const candidates=['meaning','dictation','collocation'].flatMap(id=>MODES[id].questions.filter(q=>{
      if (session.topic&&q.topic!==session.topic) return false;
      if (!profile.words[q.vocabId]) return false;
      if(id==='meaning'&&profile.words[q.vocabId].recognition?.attempts>0)return false;
      const stat=saves[id]?.wordStats?.[q.id];
      return (!stat?.dueAt || stat.dueAt<=now) && skillStatus(profile,q,dimensionFor(id))!=='稳定';
    }));
    const dictation=weightedSample(candidates.filter(q=>q.type==='dictation'),6,q=>weakness(q,profile,saves),rng);
    const collocations=weightedSample(candidates.filter(q=>q.type==='collocation'),6,q=>weakness(q,profile,saves),rng);
    selected=weightedSample(candidates.filter(q=>q.type==='meaning'),4,q=>weakness(q,profile,saves),rng);
    while(selected.length<12&&(dictation.length||collocations.length)){if(dictation.length)selected.push(dictation.shift());if(selected.length<12&&collocations.length)selected.push(collocations.shift());}
  }
  session.queues[session.stage]=selected.map(q=>q.id);session.updatedAt=now;
  return selected;
}
export function recordSessionAnswer(session, q, {index,firstTry,skipped=false,now=Date.now()}) {
  const token=sessionToken(session,index);
  if (session.completed.some(r=>r.token===token)) return false;
  session.completed.push({token,qid:q.id,stage:session.stage,firstTry:firstTry&&!skipped,skipped,at:now});
  session.updatedAt=now;return true;
}
export function applicationFor(session) {
  if (session.application) return session.application;
  const serial=Math.floor(Date.parse(`${session.day}T12:00:00Z`)/86400000);
  const kind=['reading','letter','opinion'][serial%3];
  const index=Math.floor(serial/3)%(kind==='reading'?8:kind==='letter'?12:6)+1;
  session.application={kind,id:`${kind}-${index}`};return session.application;
}
export function cleanBackupMeta(value) {
  return { firstUse:integer(value?.firstUse), lastExport:integer(value?.lastExport) };
}
export function backupReminder(meta, now=Date.now()) {
  const start=meta.lastExport||meta.firstUse;
  return Boolean(start && now-start>=7*86400000);
}
