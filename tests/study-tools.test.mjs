import test from 'node:test';
import assert from 'node:assert/strict';
import {MODES,WORD_BANK,saveKey} from '../js/modes.js';
import {freshSave,dayKey} from '../js/storage.js';
import {cleanPlan,dailySummary,dailyRound,normalizeDictation,spellingFeedback,dictationMatches,learnedVocabulary,PLAN_KEY} from '../js/study.js';
import {exportBackup,parseBackup,importBackup,sanitizeSave,PRACTICE_KEY} from '../js/backup.js';
import {LETTERS,READINGS,draftChecks} from '../js/content/practice.js';
import {SCENARIO_EXPANSION} from '../js/content/scenario-expansion.js';
import {createApp} from './helpers/app-harness.mjs';
const memory=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};
const mode=MODES.meaning,now=Date.now();
test('daily plan prioritises due reviews, throttles new words, and stops exactly at the budget',()=>{
 const save=freshSave(mode),plan=cleanPlan();plan.newWords=WORD_BANK.slice(0,8).map(q=>q.id);
 let round=dailyRound(mode,save,plan,{level:2,learned:new Set(plan.newWords),now});assert.equal(round.length,2);assert.ok(round.every(q=>!plan.newWords.includes(q.vocabId)));
 plan.newWords.push(...round.map(q=>q.vocabId));assert.equal(dailyRound(mode,save,plan,{now}).length,0);
 save.learned=mode.questions.slice(0,41).map(q=>q.id);assert.equal(dailySummary(mode,save,cleanPlan(),{now}).effectiveGoal,0);
 round=dailyRound(mode,save,cleanPlan(),{now});assert.equal(round.length,8);assert.ok(round.every(q=>save.learned.includes(q.id)));
 save.learned=save.learned.slice(0,21);assert.equal(dailySummary(mode,save,cleanPlan(),{now}).effectiveGoal,5);
});
test('daily plan rolls over at local midnight and vocabulary recognition is shared across modes',()=>{
 const plan=cleanPlan({day:'2000-01-01',newWords:['word-home'],goal:20,level:3});assert.equal(plan.newWords.length,0);assert.equal(plan.goal,20);assert.equal(plan.level,3);
 const storage=memory();const a=freshSave(mode);a.learned=[mode.questions[0].id];storage.setItem(saveKey(mode),JSON.stringify(a));assert.ok(learnedVocabulary(storage).has(mode.questions[0].vocabId));
 const bad=cleanPlan({day:dayKey(),newWords:['evil','word-'+mode.questions[0].word,'word-'+mode.questions[0].word],goal:999});assert.equal(bad.goal,10);assert.equal(bad.newWords.length,1);
});
test('dictation compares full words and aligns inserted, missing and substituted letters without revealing the answer',()=>{
 assert.equal(normalizeDictation('  ReFuNd  '),'refund');
 assert.equal(dictationMatches('COLOR','colour'),true);assert.equal(dictationMatches('license','licence'),true);assert.equal(dictationMatches('advice','advise'),false);assert.equal(dictationMatches('centre','central'),false);
 assert.ok(spellingFeedback('reciept','receipt').some(v=>v.wrong));assert.ok(spellingFeedback('recipt','receipt').some(v=>v.text==='□'));
 assert.ok(spellingFeedback('refunnd','refund').some(v=>v.wrong));assert.ok(spellingFeedback('refund','refund').every(v=>!v.wrong));
 const missing=spellingFeedback('accomodation','accommodation');assert.equal(missing.filter(v=>v.text==='□').length,1);
});
test('dictation rejects wrong attempts, permits correction, preserves its own schedule and masks choices',async()=>{
 const f=createApp({mode:'dictation'});f.app.start('level',2);const q=f.app.scene.questions[0];assert.equal(f.$('#choices').hidden,true);assert.equal(f.$('#dictation-input').value,'');
 const b=f.$('#dictation-submit');b.dataset.char=q.word+'x';f.$('#dictation-input').value=b.dataset.char;await f.app.choose(b);assert.equal(f.app.scene.firstTry,false);assert.equal(b.disabled,false);assert.equal(f.app.scene.phase,'answer');assert.ok(f.$('#dictation-diff').children.length);
 b.dataset.char=q.word;await f.app.choose(b);assert.equal(f.app.scene.phase,'explain');assert.equal(f.app.saved.wordStats[q.id].lapses,1);assert.equal(f.app.saved.wordStats[q.id].dueAt-f.app.saved.wordStats[q.id].lastSeen,600000);
});
test('backup round-trips all modes and practice, merges idempotently, and retains unrelated data',()=>{
 const source=memory(),target=memory();for(const m of Object.values(MODES)){const s=freshSave(m);s.learned=[m.questions[0].id];s.history=[{id:'round1',day:dayKey(),at:now,mode:m.id,kind:'daily',level:2,total:1}];source.setItem(saveKey(m),JSON.stringify(s));}
 source.setItem(PRACTICE_KEY,JSON.stringify({drafts:{'letter-1':'Could you arrange a repair?'},reading:{'reading-1':[1,0,2]}}));source.setItem(PLAN_KEY,JSON.stringify(cleanPlan()));target.setItem('unrelated','keep');
 const records=parseBackup(exportBackup(source));importBackup(target,records);const once=exportBackup(target);importBackup(target,records);assert.equal(exportBackup(target).replace(/"exportedAt": "[^"]+"/,'"exportedAt": ""'),once.replace(/"exportedAt": "[^"]+"/,'"exportedAt": ""'));
 assert.equal(target.getItem('unrelated'),'keep');assert.equal(JSON.parse(target.getItem(PRACTICE_KEY)).drafts['letter-1'],'Could you arrange a repair?');
 for(const m of Object.values(MODES))assert.equal(JSON.parse(target.getItem(saveKey(m))).learned.length,1);
});
test('backup validates the entire envelope and strips fields that can reach HTML templates',()=>{
 assert.throws(()=>parseBackup('bad'));assert.throws(()=>parseBackup(JSON.stringify({format:'softie-ielts-gt',version:1,records:{'other-service':'secret'}})));assert.throws(()=>parseBackup('x'.repeat(8*1024*1024+1)));
 const s=sanitizeSave({...freshSave(mode),history:[{day:'<img src=x onerror=alert(1)>'},{day:dayKey(),id:'<svg onload=alert(1)>',kind:'<b>',level:'<b>'}],calendar:{nocount:{'<b>':true}},quests:{list:[{id:'<img>'}],doneDays:{'<b>':true}},bonus:{stickers:{[dayKey()]:'<svg>'}},trophies:{got:{'<script>':1}}},mode);
 assert.equal(s.history.length,1);assert.ok(!JSON.stringify(s).includes('<'));assert.equal(s.quests.list.length,0);
});
test('failed backup writes roll back all records and keep the existing progress',()=>{
 const target=memory();target.setItem(saveKey(mode),JSON.stringify(freshSave(mode)));const old=target.getItem(saveKey(mode)),originalSet=target.setItem;let fail=true;target.setItem=(k,v)=>{if(k===PRACTICE_KEY&&fail){fail=false;throw Error('quota');}originalSet(k,v);};
 const source=memory(),s=freshSave(mode);s.learned=[mode.questions[0].id];source.setItem(saveKey(mode),JSON.stringify(s));source.setItem(PRACTICE_KEY,JSON.stringify({drafts:{},reading:{}}));assert.throws(()=>importBackup(target,parseBackup(exportBackup(source))));assert.equal(target.getItem(saveKey(mode)),old);assert.equal(target.getItem(PRACTICE_KEY),null);
});
test('500 authored contexts retain the 3000-word catalogue and cover each practical domain',()=>{
 assert.equal(SCENARIO_EXPANSION.length,320);assert.equal(new Set(SCENARIO_EXPANSION.map(v=>v.word)).size,320);assert.equal(WORD_BANK.length,3000);assert.equal(MODES.sentence.questions.length,500);
 for(const q of SCENARIO_EXPANSION){assert.ok(WORD_BANK.some(v=>v.word===q.word));assert.equal(q.context.split('____').length,2);assert.ok(q.translation&&q.collocationMeaning);assert.ok(q.collocation.includes(q.word));}
 for(const topic of new Set(SCENARIO_EXPANSION.map(v=>v.topic)))assert.ok(SCENARIO_EXPANSION.filter(v=>v.topic===topic).length>=35);
});
test('mini practice has complete answer evidence and no invented IELTS score',()=>{
 assert.equal(LETTERS.length,12);assert.equal(READINGS.length,6);assert.equal(new Set(LETTERS.map(v=>v.register)).size,3);
 for(const q of LETTERS)assert.equal(q.points.length,3);
 for(const p of READINGS){assert.ok(p.text.split(/\s+/).length>=70);assert.equal(p.questions.length,3);for(const q of p.questions){assert.ok(q.options[q.answer]);assert.ok(q.explanation.length>10);}}
 assert.deepEqual(draftChecks('I am writing to request a refund. Could you help me?'),{words:11,sentences:2});
});

test('dictation form protects IME composition, rejects nonletters, and normalises a complete answer',async()=>{
 const f=createApp({mode:'dictation'});f.app.start('level',1);const input=f.$('#dictation-input'),form=f.$('#dictation-form'),q=f.app.scene.questions[0],event={preventDefault(){}};
 input.value=q.word;input.compositionstart();await form.submit(event);assert.equal(f.app.scene.phase,'answer');input.compositionend();input.value='123';await form.submit(event);assert.equal(f.app.scene.firstTry,true);assert.match(f.$('#feedback').textContent,/英文单词/);
 input.value='  '+q.word.toUpperCase()+'  ';await form.submit(event);assert.equal(f.app.scene.phase,'explain');assert.equal(f.app.saved.wordStats[q.id].correct,1);
});
test('backup keeps the newer review schedule and local settings, restoring settings on a new device',()=>{
 const storage=memory(),a=freshSave(mode),b=freshSave(mode),id=mode.questions[0].id;
 a.learned=b.learned=[id];a.wordStats[id]={attempts:1,correct:1,lapses:0,streak:1,intervalDays:1,lastSeen:now,dueAt:now+86400000};b.wordStats[id]={...a.wordStats[id],lastSeen:now-1000,dueAt:now+86400000-1000};b.settings.sound=false;b.stats.flags.hammerUsed=true;
 storage.setItem(saveKey(mode),JSON.stringify(a));const records=parseBackup(JSON.stringify({format:'softie-ielts-gt',version:1,records:{[saveKey(mode)]:b}}));importBackup(storage,records);const merged=JSON.parse(storage.getItem(saveKey(mode)));assert.equal(merged.wordStats[id].lastSeen,now);assert.equal(merged.settings.sound,true);assert.equal(merged.stats.flags.hammerUsed,true);
 const newDevice=memory();importBackup(newDevice,records);assert.equal(JSON.parse(newDevice.getItem(saveKey(mode))).settings.sound,false);
});
