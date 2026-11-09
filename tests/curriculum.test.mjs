import {LANGUAGE_DRILLS} from '../js/content/language-drills.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODES, WORD_BANK, saveKey } from '../js/modes.js';
import { freshSave, dayKey } from '../js/storage.js';
import { cleanPlan, PLAN_KEY } from '../js/study.js';
import { SKILLS_KEY, freshSkills, migrateSkills, recordSkill, skillStatus, skillSummary } from '../js/skills.js';
import { SESSION_KEY, STAGES, createSession, buildStage, cleanSession, dueQuestions, backupReminder } from '../js/curriculum.js';
import { parseBackup, exportBackup, importBackup, PRACTICE_KEY } from '../js/backup.js';
import { createApp } from './helpers/app-harness.mjs';
import { PRIMARY_SENSES } from '../js/content/context-review.js';
import { OPINIONS, READINGS } from '../js/content/practice.js';
const now=new Date(2026,10,9,12).getTime();
const day=86400000;
const saves=()=>Object.fromEntries(Object.values(MODES).map(m=>[m.id,freshSave(m)]));
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const profileFor=q=>({version:2,words:{[q.vocabId]:{recognition:{touched:true,attempts:1,correct:1,successDays:[dayKey(new Date(now))],updatedAt:now,lastCorrect:true}}},events:[]});

test('legacy migration preserves per-mode schedules, only marks contact and does not award stability',()=>{
 const all=saves(),q=MODES.meaning.questions[0];all.meaning.learned=[q.id];all.meaning.wordStats[q.id]={lastSeen:now-day,dueAt:now+day};const snapshot=JSON.stringify(all);
 const p=migrateSkills(memory(),all);assert.equal(skillStatus(p,q,'recognition'),'已接触');assert.equal(skillStatus(p,q,'dictation'),'未练');assert.deepEqual(p.events,[]);assert.equal(JSON.stringify(all),snapshot);
 const plain=WORD_BANK.find(q=>!q.collocation);assert.equal(skillStatus(p,plain,'collocation'),'尚未覆盖');
});
test('a recognised word can enter dictation and collocation without being counted as a new word',()=>{
 const f=createApp({date:new Date(now)}),q=MODES.meaning.questions.find(q=>q.context&&q.level===2);
 f.app.start('manual',2,[q]);return f.answer().then(()=>{
  assert.equal(f.app.tools.profile.words[q.vocabId].recognition.attempts,1);assert.equal(JSON.parse(f.localStorage.getItem(PLAN_KEY)).newWords.length,1);
  f.app.home();const typing=MODES.dictation.questions.find(v=>v.vocabId===q.vocabId);f.app.setAudienceMode('dictation',false);f.app.start('manual',2,[typing]);
  return f.answer().then(()=>{assert.equal(JSON.parse(f.localStorage.getItem(PLAN_KEY)).newWords.length,1);assert.equal(f.app.tools.profile.words[q.vocabId].dictation.attempts,1);});
 });
});
test('two spaced independent successes stabilise only the practiced dimension; retries, hints and duplicates do not',()=>{
 const p=freshSkills(),q=MODES.dictation.questions[0];
 recordSkill(p,q,{firstTry:true,at:now,eventId:'one'});assert.equal(skillStatus(p,q,'dictation'),'需巩固');
 recordSkill(p,q,{firstTry:true,previousStat:{lastSeen:now,dueAt:now+day},at:now+1000,eventId:'early'});assert.equal(p.words[q.vocabId].dictation.successDays.length,1);
 recordSkill(p,q,{firstTry:true,previousStat:{lastSeen:now,dueAt:now+day},at:now+day,eventId:'next-day'});assert.equal(skillStatus(p,q,'dictation'),'稳定');assert.equal(skillStatus(p,q,'recognition'),'未练');
 assert.equal(recordSkill(p,q,{firstTry:true,at:now+2*day,eventId:'next-day'}),false);
 recordSkill(p,q,{firstTry:false,at:now+2*day,eventId:'hint'});assert.equal(skillStatus(p,q,'dictation'),'需巩固');assert.equal(p.words[q.vocabId].dictation.successDays.length,0);
});
test('automatic review excludes mistakes until due, while manual review retains access',()=>{
 const all=saves(),q=MODES.dictation.questions[0];all.dictation.learned=[q.id];all.dictation.review=[q.id];all.dictation.wordStats[q.id]={dueAt:now+600000,lastSeen:now};
 assert.equal(dueQuestions(all,{now}).length,0);assert.equal(dueQuestions(all,{now:now+600000}).length,1);
 const s=createSession(cleanPlan(),'',now);assert.equal(buildStage(s,profileFor(q),all,cleanPlan(),{now}).length,0);
});
test('the new-word stage prefers audited contexts and uses the remaining global allowance',()=>{
 const p=freshSkills(),plan=cleanPlan({goal:10},dayKey(new Date(now))),s=createSession(plan,'',now);s.stage=1;plan.newWords=WORD_BANK.slice(0,8).map(q=>q.id);
 const qs=buildStage(s,p,saves(),plan,{now,rng:()=>.5});assert.equal(qs.length,2);assert.ok(qs.every(q=>q.contextChecked));assert.equal(new Set(qs.map(q=>q.id)).size,2);
 assert.deepEqual(buildStage(s,p,saves(),plan,{now}),qs);
});
test('retrieval selects recognised words in unpracticed dimensions and skips not-yet-due work',()=>{
 const q=MODES.meaning.questions.find(q=>q.context),p=profileFor(q),all=saves(),s=createSession(cleanPlan(),'',now);s.stage=2;
 const qs=buildStage(s,p,all,cleanPlan(),{now});assert.deepEqual(new Set(qs.map(q=>q.type)),new Set(['dictation','collocation']));assert.ok(qs.every(item=>item.vocabId===q.vocabId));
 const next=createSession(cleanPlan(),'',now);next.stage=2;const id=`dictation:${q.vocabId}`;all.dictation.wordStats[id]={dueAt:now+day};assert.ok(buildStage(next,p,all,cleanPlan(),{now}).every(q=>q.type!=='dictation'));
});
test('daily resume restores an explanation without counting the answer twice and then advances normally',async()=>{
 const f=createApp({date:new Date(now)});f.$('#daily-goal').value='5';f.$('#daily-goal').change();f.app.start('daily');
 assert.equal(f.app.scene.dailyStage,1);assert.equal(f.app.scene.questions.length,5);await f.answer();const q=f.app.scene.questions[0],attempts=f.app.saved.wordStats[q.id].attempts;
 const g=createApp({date:new Date(now),extraRecords:f.records()});g.app.start('daily');assert.equal(g.app.scene.phase,'explain');assert.equal(g.app.scene.qi,0);assert.equal(g.app.saved.wordStats[q.id].attempts,attempts);assert.equal(g.cells[0].textContent,q.word);
 g.app.nextQuestion();assert.equal(g.app.scene.qi,1);assert.equal(g.app.scene.phase,'answer');await g.round();assert.equal(g.app.scene.screen,'result');assert.equal(g.app.tools.session.stageDone[1],true);
 const h=createApp({date:new Date(now),extraRecords:g.records()});h.app.start('daily');assert.equal(h.app.scene.dailyStage,2);assert.ok(h.app.scene.questions.some(q=>q.type==='dictation'));assert.ok(h.app.scene.questions.some(q=>q.type==='collocation'));
});
test('wrong-answer and hint flags survive an interrupted daily question',async()=>{
 const f=createApp({date:new Date(now)});f.app.start('daily');const q=f.app.scene.questions[0],wrong=f.$('#choices').children.find(b=>b.dataset.char!==q.word);await f.app.choose(wrong);
 const g=createApp({date:new Date(now),extraRecords:f.records()});g.app.start('daily');assert.equal(g.app.scene.firstTry,false);assert.equal(g.app.scene.misses,1);await g.answer();assert.equal(g.app.saved.wordStats[q.id].correct,0);assert.equal(g.app.tools.profile.words[q.vocabId].recognition.successDays.length,0);
});
test('daily stages are suggestions rather than countdowns; challenges still time out',async()=>{
 const f=createApp({date:new Date(now)});f.app.start('daily');await f.advance(120000);assert.equal(f.app.scene.phase,'answer');assert.equal(f.$('#question-timer').hidden,true);
 const g=createApp({date:new Date(now)});g.app.start('challenge',1);await g.advance(41000);assert.equal(g.app.scene.phase,'explain');assert.equal(g.$('#question-timer').hidden,false);
});
test('crossing midnight saves the just-answered item and returns to a fresh daily plan',async()=>{
 const f=createApp({date:new Date(2026,10,9,23,59)});f.app.start('daily');f.setDate(new Date(2026,10,10,0,1));await f.answer();assert.ok(Object.keys(f.app.tools.profile.words).length);f.app.nextQuestion();assert.equal(f.app.scene.screen,'home');f.app.start('daily');assert.equal(f.app.tools.session.day,'2026-11-10');
});
test('backup merges the new skill evidence, daily checkpoint, opinion drafts and checks without duplicating events',()=>{
 const source=memory(),target=memory(),p=freshSkills(),q=MODES.dictation.questions[0];recordSkill(p,q,{firstTry:true,eventId:'backup-answer',at:Date.now()});source.setItem(SKILLS_KEY,JSON.stringify(p));
 const session=createSession(cleanPlan());source.setItem(SESSION_KEY,JSON.stringify(session));source.setItem(PRACTICE_KEY,JSON.stringify({drafts:{'opinion-1':'Adults should have access to practical training.'},checks:{'opinion-1':[true,false,false,true]},reading:{},readingResults:{}}));
 const records=parseBackup(exportBackup(source));importBackup(target,records);importBackup(target,records);assert.equal(JSON.parse(target.getItem(SKILLS_KEY)).events.length,1);assert.equal(JSON.parse(target.getItem(SESSION_KEY)).id,session.id);assert.equal(JSON.parse(target.getItem(PRACTICE_KEY)).checks['opinion-1'][0],true);
});
test('backup reminders wait seven days and sanitizers reject foreign or stale checkpoints',()=>{
 assert.equal(backupReminder({firstUse:now},now+6*day),false);assert.equal(backupReminder({firstUse:now},now+7*day),true);assert.equal(backupReminder({firstUse:now,lastExport:now+7*day},now+8*day),false);
 const s=createSession(cleanPlan(),'',now);s.queues[0]=['<script>','other:secret'];assert.deepEqual(cleanSession(s,'2026-11-09').queues[0],[]);assert.equal(cleanSession(s,'2026-11-10'),null);
});
test('all 500 contextual entries have a single scene-first explanation and a typed collocation task',()=>{
 const contexts=WORD_BANK.filter(q=>q.context);assert.equal(contexts.length,500);assert.equal(contexts.filter(q=>q.contextChecked).length,500);assert.equal(contexts.find(q=>q.word==='oven').meaning,'烤箱');
 for(const q of contexts){assert.ok(q.primaryMeaning);assert.equal(q.collocationTask.cloze.split('____').length,2,q.word);assert.match(q.collocationTask.answer,/^[a-z]+$/);assert.ok(!new RegExp(`\\b${q.collocationTask.answer}\\b`).test(q.collocationTask.cloze));}
 assert.equal(WORD_BANK.length,3000);assert.ok(Object.keys(PRIMARY_SENSES).length>=320);assert.equal(OPINIONS.length,6);assert.equal(READINGS.filter(q=>q.text.split(/\s+/).length>=350).length,2);
});
test('seven-day retention excludes same-day repeats and reports no invented sample',()=>{
 const p=freshSkills(),q=MODES.meaning.questions[0];assert.equal(skillSummary(p,now).retentionTotal,0);recordSkill(p,q,{firstTry:true,at:now,eventId:'today'});recordSkill(p,q,{firstTry:false,at:now+day,previousStat:{lastSeen:now,dueAt:now+day},eventId:'tomorrow'});const s=skillSummary(p,now+day);assert.equal(s.retentionTotal,1);assert.equal(s.retained,0);
});

test('a blocked browser reports unsaved state and a retry flushes the in-memory profile and mode progress',async()=>{
 const f=createApp({date:new Date(now),storageBlocked:true});assert.equal(f.$('#save-status').dataset.state,'error');
 f.app.saved.settings.motion=false;f.app.start('level',1);await f.answer();const q=f.app.scene.questions[0];assert.ok(f.app.tools.profile.words[q.vocabId]);assert.equal(f.$('#save-status').dataset.state,'error');
 f.setStorageBlocked(false);assert.equal(f.app.tools.retrySaved(),true);assert.equal(f.$('#save-status').dataset.state,'saved');assert.ok(JSON.parse(f.localStorage.getItem(SKILLS_KEY)).words[q.vocabId]);assert.ok(f.stored('meaning').learned.includes(q.id));
});
test('word-family and paraphrase drills distinguish lexical forms, scope, time and negation',()=>{
 assert.equal(LANGUAGE_DRILLS.length,20);for(const q of LANGUAGE_DRILLS){assert.equal(new Set(q.options).size,3);assert.ok(q.options[q.answer]);assert.ok(q.explanation.length>15);}
 const refund=LANGUAGE_DRILLS.find(q=>q.prompt.includes('full refund'));assert.match(refund.options[refund.answer],/all the money back/);
 const commuting=LANGUAGE_DRILLS.find(q=>q.prompt.includes('commuting'));assert.match(commuting.options[commuting.answer],/between home and work/);
 const source=memory();source.setItem(PRACTICE_KEY,JSON.stringify({language:{'drill-1':1,'drill-999':0}}));const target=memory();importBackup(target,parseBackup(exportBackup(source)));assert.deepEqual(JSON.parse(target.getItem(PRACTICE_KEY)).language,{'drill-1':1});
});

test('backup preserves real timestamps for history and reading results',()=>{
 const source=memory(),target=memory(),s=freshSave(MODES.meaning),at=Date.now();s.history=[{id:'time-regression',day:dayKey(),at,total:1,firstTry:1,mode:'meaning',kind:'level',level:1}];
 source.setItem(saveKey(MODES.meaning),JSON.stringify(s));source.setItem(PRACTICE_KEY,JSON.stringify({readingResults:{'reading-1':{correct:2,total:3,at}}}));importBackup(target,parseBackup(exportBackup(source)));
 assert.equal(JSON.parse(target.getItem(saveKey(MODES.meaning))).history[0].at,at);assert.equal(JSON.parse(target.getItem(PRACTICE_KEY)).readingResults['reading-1'].at,at);
});

test('legacy dictation-only contact still receives recognition practice without using new-word quota',()=>{
 const all=saves(),q=MODES.dictation.questions.find(q=>q.context);all.dictation.learned=[q.id];all.dictation.wordStats[q.id]={lastSeen:now,dueAt:now+day};const p=migrateSkills(memory(),all),s=createSession(cleanPlan(),'',now);s.stage=2;
 const qs=buildStage(s,p,all,cleanPlan(),{now});assert.ok(qs.some(item=>item.type==='meaning'&&item.vocabId===q.vocabId));assert.ok(qs.every(item=>item.type!=='dictation'));
});
