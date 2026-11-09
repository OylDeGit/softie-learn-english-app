import { SKILLS_KEY, cleanSkills, mergeSkills } from './skills.js';
import { SESSION_KEY, BACKUP_META_KEY, cleanSession, cleanBackupMeta } from './curriculum.js';
import { MODES, saveKey } from './modes.js';
import { loadSave, STICKERS } from './storage.js';
import { QUEST_MAP } from './quests.js';
import { TROPHIES } from './trophies.js';
import { PLAN_KEY, cleanPlan } from './study.js';
export const PRACTICE_KEY = 'softie-ielts-gt:practice';
const date = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const stamp = x => Number.isSafeInteger(x) && x >= 0 ? Math.min(x, 8640000000000000) : 0;
const num = x => Number.isSafeInteger(x) && x >= 0 ? Math.min(x, 1e12) : 0;
const dates = obj => Object.fromEntries(Object.entries(obj || {}).filter(([k,v])=>date(k)&&v===true).map(([k])=>[k,true]));
export function sanitizeSave(value, mode) {
  if (!value || value.version !== mode.version) throw new Error('备份记录版本不兼容');
  const s = loadSave({getItem:()=>JSON.stringify(value)}, mode);
  s.history = s.history.filter(h=>date(h.day)).map(h=>({ id: typeof h.id === 'string' ? h.id.replace(/[^\w-]/g,'').slice(0,80) : String(num(h.at)), day:h.day,
    ...Object.fromEntries(['at','score','solved','misses','firstTry','combo','total','timeMs'].map(k=>[k,k==='at'?stamp(h[k]):num(h[k])])),
    mode:mode.id,level:[1,2,3].includes(h.level)?h.level:1,kind:['level','daily','review'].includes(h.kind)?h.kind:'level'}));
  s.calendar.nocount=dates(s.calendar.nocount); s.calendar.asked=date(s.calendar.asked)?s.calendar.asked:null;
  s.quests.day=date(s.quests.day)?s.quests.day:'';s.quests.doneDays=dates(s.quests.doneDays);
  s.quests.list=s.quests.list.filter(q=>q&&QUEST_MAP[q.id]).slice(0,3).map(q=>({id:q.id,goal:QUEST_MAP[q.id].goal,prog:Math.min(num(q.prog),QUEST_MAP[q.id].goal),done:num(q.prog)>=QUEST_MAP[q.id].goal}));
  s.stats.flags=Object.fromEntries(Object.entries(s.stats.flags).filter(([k,v])=>['speedy','energy','advanced','firstPlay','weekend','night','hammerUsed'].includes(k)&&v===true));
  s.bonus.last=date(s.bonus.last)?s.bonus.last:null;s.bonus.stickers=Object.fromEntries(Object.entries(s.bonus.stickers).filter(([k,v])=>date(k)&&STICKERS.includes(v)));
  const trophies=new Set(TROPHIES.map(t=>t.id));s.trophies.got=Object.fromEntries(Object.entries(s.trophies.got).filter(([k,v])=>trophies.has(k)&&stamp(v)>0).map(([k,v])=>[k,stamp(v)]));
  return s;
}
export function cleanPractice(value={}) {
  const result={drafts:{},reading:{},checks:{},readingResults:{},language:{}};
  for(const [id,v] of Object.entries(value.drafts||{})) if(/^(letter|opinion)-\d+$/.test(id)&&typeof v==='string')result.drafts[id]=v.slice(0,6000);
  for(const [id,v] of Object.entries(value.reading||{}))if(/^reading-\d+$/.test(id)&&Array.isArray(v))result.reading[id]=v.slice(0,5).map(x=>Number.isInteger(x)&&x>=0&&x<4?x:null);
  for(const [id,v] of Object.entries(value.checks||{}))if(/^(letter|opinion)-\d+$/.test(id)&&Array.isArray(v))result.checks[id]=v.slice(0,4).map(x=>x===true);
  for(const [id,v] of Object.entries(value.readingResults||{}))if(/^reading-\d+$/.test(id)&&v&&typeof v==='object')result.readingResults[id]={correct:Math.min(5,num(v.correct)),total:Math.min(5,num(v.total)),at:stamp(v.at)};
  for(const [id,v]of Object.entries(value.language||{}))if(/^drill-(?:[1-9]|1[0-9]|20)$/.test(id)&&Number.isInteger(v)&&v>=0&&v<3)result.language[id]=v;
  return result;
}
const modeKeys=new Map(Object.values(MODES).map(m=>[saveKey(m),m]));
const settingKeys=['active-mode','topic','strategy'].map(k=>'softie-ielts-gt:'+k);
export function parseBackup(text) {
  if(typeof text!=='string'||text.length>8*1024*1024)throw new Error('备份文件过大（最多 8 MB）');
  let data;try{data=JSON.parse(text);}catch{throw new Error('文件不是有效的 JSON 备份');}
  if(data?.format!=='softie-ielts-gt'||data.version!==1||!data.records||typeof data.records!=='object'||Array.isArray(data.records))throw new Error('不是本应用支持的备份文件');
  const records={};
  for(const [key,v] of Object.entries(data.records)) {
    if(modeKeys.has(key))records[key]=sanitizeSave(v,modeKeys.get(key));
    else if(key===PLAN_KEY)records[key]=cleanPlan(v);
    else if(key===PRACTICE_KEY)records[key]=cleanPractice(v);
    else if(key===SKILLS_KEY)records[key]=cleanSkills(v);
    else if(key===SESSION_KEY){const session=cleanSession(v);if(session)records[key]=session;}
    else if(key===BACKUP_META_KEY)records[key]=cleanBackupMeta(v);
    else if(settingKeys.includes(key)&&typeof v==='string'&&v.length<80&&!/[<>]/.test(v))records[key]=v;
    else throw new Error('备份包含未知记录，未导入');
  }
  if(!Object.keys(records).length)throw new Error('备份中没有学习记录');
  return records;
}
export function exportBackup(storage) {
  if(!storage)throw new Error('浏览器存储不可用');
  const records={};
  for(const key of [...modeKeys.keys(),PLAN_KEY,PRACTICE_KEY,SKILLS_KEY,SESSION_KEY,BACKUP_META_KEY,...settingKeys]) {
    const value=storage?.getItem(key);if(value!==null&&value!==undefined)records[key]=settingKeys.includes(key)?value:JSON.parse(value);
  }
  return JSON.stringify({format:'softie-ielts-gt',version:1,exportedAt:new Date().toISOString(),records},null,2);
}
export function mergeSave(current,incoming) {
  const out=structuredClone(current);
  out.learned=[...new Set([...current.learned,...incoming.learned])];out.review=[...new Set([...current.review,...incoming.review])];
  for(const [id,row]of Object.entries(incoming.wordStats))if(!out.wordStats[id]||row.lastSeen>out.wordStats[id].lastSeen)out.wordStats[id]=row;
  out.history=[...new Map([...incoming.history,...current.history].map(h=>[h.id||`${h.day}:${h.at}`,h])).values()].sort((a,b)=>a.at-b.at).slice(-1000);
  for(const key of ['rounds'])out[key]=Math.max(current[key],incoming[key]);
  for(const key of Object.keys(out.stats))if(key!=='flags')out.stats[key]=Math.max(current.stats[key],incoming.stats[key]);
  out.stats.flags={...incoming.stats.flags,...current.stats.flags};out.trophies.got={...incoming.trophies.got,...current.trophies.got};
  out.calendar.nocount={...incoming.calendar.nocount,...current.calendar.nocount};out.calendar.hammers=Math.max(current.calendar.hammers,incoming.calendar.hammers);
  out.quests.doneDays={...incoming.quests.doneDays,...current.quests.doneDays};
  out.bonus.stickers={...incoming.bonus.stickers,...current.bonus.stickers};out.bonus.total=Math.max(current.bonus.total,incoming.bonus.total);
  if(incoming.bonus.last>current.bonus.last){out.bonus.last=incoming.bonus.last;out.bonus.run=incoming.bonus.run;}
  out.recommended ||= incoming.recommended;
  return out;
}
export function importBackup(storage,records) {
  if(!storage)throw new Error('浏览器存储不可用');
  const old={},writes={};
  for(const [key,value]of Object.entries(records)) {
    old[key]=storage.getItem(key);let merged=value;
    if(modeKeys.has(key))merged=old[key]===null?value:mergeSave(sanitizeSave(JSON.parse(old[key]),modeKeys.get(key)),value);
    else if(key===PLAN_KEY&&old[key]){const a=cleanPlan(JSON.parse(old[key]));merged={...a,newWords:[...new Set([...a.newWords,...value.newWords])]};}
    else if(key===PRACTICE_KEY&&old[key]){const a=cleanPractice(JSON.parse(old[key]));merged={drafts:{...value.drafts,...a.drafts},reading:{...value.reading,...a.reading},checks:{...value.checks,...a.checks},readingResults:{...value.readingResults,...a.readingResults},language:{...value.language,...a.language}};}
    else if(key===SKILLS_KEY&&old[key])merged=mergeSkills(JSON.parse(old[key]),value);
    else if(key===SESSION_KEY&&old[key]){const existing=cleanSession(JSON.parse(old[key]));merged=existing&&existing.updatedAt>=value.updatedAt?existing:value;}
    else if(key===BACKUP_META_KEY&&old[key]){const a=cleanBackupMeta(JSON.parse(old[key]));merged={firstUse:Math.min(a.firstUse||Date.now(),value.firstUse||Date.now()),lastExport:Math.max(a.lastExport,value.lastExport)};}
    else if(settingKeys.includes(key)&&old[key]!==null)merged=old[key];
    writes[key]=settingKeys.includes(key)?merged:JSON.stringify(merged);
  }
  try{for(const [key,v]of Object.entries(writes))storage.setItem(key,v);}
  catch{for(const [key,v]of Object.entries(old)){try{if(v===null)storage.removeItem(key);else storage.setItem(key,v);}catch{/* Browser storage is unavailable. */}}throw new Error('存储空间不足或被禁用，导入失败，请重试');}
}
