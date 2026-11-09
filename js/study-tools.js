import { LANGUAGE_DRILLS } from './content/language-drills.js';
import { MODES, WORD_BANK, saveKey } from './modes.js';
import { loadSave, persistSave, dayKey } from './storage.js';
import { cleanPlan, PLAN_KEY } from './study.js';
import { exportBackup, parseBackup, importBackup, cleanPractice, PRACTICE_KEY } from './backup.js';
import { LETTERS, READINGS, OPINIONS, draftChecks } from './content/practice.js';
import { WORD_FAMILIES, PARAPHRASES } from './content/language-support.js';
import { SKILLS_KEY, migrateSkills, recordSkill, skillStatus, skillSummary, DIMENSIONS, DIMENSION_LABELS } from './skills.js';
import { SESSION_KEY, BACKUP_META_KEY, STAGES, cleanSession, createSession, buildStage, sessionToken,
  recordSessionAnswer, applicationFor, dueQuestions, cleanBackupMeta, backupReminder } from './curriculum.js';

const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lookup = new Map(WORD_BANK.map(q=>[q.id,q]));
const questionLookup=new Map(Object.values(MODES).flatMap(m=>m.questions).map(q=>[q.id,q]));
export function initStudyTools({storage,start,launchDaily,goHome,practiceQuestion,onPause=()=>{},onResume=()=>{},document=globalThis.document,window=globalThis.window,now=()=>Date.now(),elapsed=()=>performance.now()}) {
  const $=s=>document.querySelector(s);
  const get=(key,fallback)=>{try{return JSON.parse(storage?.getItem(key))||fallback;}catch{return fallback;}};
  const saves=()=>Object.fromEntries(Object.values(MODES).map(m=>[m.id,loadSave(storage,m)]));
  let plan=cleanPlan(get(PLAN_KEY,{}),dayKey(new Date(now()))), practice=cleanPractice(get(PRACTICE_KEY,{}));
  let profile=migrateSkills(storage,saves()),session=cleanSession(get(SESSION_KEY,null),dayKey(new Date(now())));
  let meta=cleanBackupMeta(get(BACKUP_META_KEY,{}));meta.firstUse ||= now();
  let currentMode,currentSave,currentTopic='',pending=null,opener,applicationStarted=0,applicationRunning=false;
  const failed=new Map();
  function savedStatus() {
    const label=$('#save-status');
    label.textContent=failed.size?'尚未保存 · 点击“我的”重试':'已自动保存在此浏览器';
    label.dataset.state=failed.size?'error':'saved';
    $('#study-status').textContent=failed.size?'浏览器未能保存部分记录，请先不要清理或关闭页面。可在“我的”中重试或导出备份。':'';
  }
  function store(key,value) {
    try {if(!storage)throw Error('unavailable');storage.setItem(key,JSON.stringify(value));failed.delete(key);savedStatus();return true;}
    catch {failed.set(key,structuredClone(value));savedStatus();return false;}
  }
  function retrySaved(){for(const [key,value]of [...failed])store(key,value);return failed.size===0;}
  const saveProfile=()=>store(SKILLS_KEY,profile);
  const saveSession=()=>{if(session){session.updatedAt=now();store(SESSION_KEY,session);}};
  function saveMode(mode,save){return store(saveKey(mode),save);}
  store(SKILLS_KEY,profile);store(BACKUP_META_KEY,meta);
  function rollover() {
    const today=dayKey(new Date(now()));plan=cleanPlan(plan,today);
    if(session&&session.day!==today){session=null;try{storage?.removeItem(SESSION_KEY);}catch{/* No old session is executed. */}}
  }
  function refresh(mode=currentMode,save=currentSave,topic=currentTopic) {
    if(!mode)return;currentMode=mode;currentSave=save;currentTopic=topic;rollover();
    const all=saves();if(save)all[mode.id]=save;
    const due=dueQuestions(all,{topic:session?.topic??topic,now:now()});
    const goal=session?.goal??plan.goal;
    const cap=due.length>40?0:due.length>20?Math.min(goal,5):goal;
    $('#daily-goal').value=String(plan.goal);$('#daily-level').value=String(plan.level);
    $('#daily-goal').disabled=Boolean(session&&session.stage<4);$('#daily-level').disabled=Boolean(session&&session.stage<4);
    $('#daily-summary').textContent=`今日新词 ${plan.newWords.length} / ${cap} · 跨玩法到期 ${due.length} 题`;
    $('#daily-progress').max=Math.max(1,cap);$('#daily-progress').value=Math.min(plan.newWords.length,cap);
    $('#daily-note').textContent=session?.stage===4?'今日计划已完成；目标和难度调整从下次计划起生效。':session&&session.stage<4?'已保存当前位置；调整目标和难度可在本次计划完成后进行。':due.length>40?'复习积压较多，今天先不加新词。':due.length>20?'到期题较多，今日新词上限暂减至 5 个。':'约 30 分钟，四步接续；建议时长不设强制截止。';
    $('#start-daily').textContent=session?.stage===4?'今日四步已完成':session?'继续今天的学习 →':'开始今天的学习 →';
    $('#start-daily').disabled=session?.stage===4;
    $('#daily-stage-list').innerHTML=STAGES.map((s,i)=>`<li class="${session?.stageDone[i]?'done':session?.stage===i?'current':''}"><span>${session?.stageDone[i]?'✓':i+1}</span><div><b>${s.title}</b><small>建议 ${s.minutes} 分钟${session?.stageDone[i]?' · 已完成':''}</small></div></li>`).join('');
    const sum=skillSummary(profile,now());
    $('#learning-summary').textContent=`已接触 ${sum.touched} 词 · 近 7 天首答 ${sum.first} / ${sum.total} · 跨日复习 ${sum.retentionTotal?`${sum.retained} / ${sum.retentionTotal}`:'暂无样本'}`;
    $('#backup-reminder').hidden=!backupReminder(meta,now());
    savedStatus();
  }
  $('#daily-goal').addEventListener('change',()=>{if(session&&session.stage<4)return;plan=cleanPlan({...plan,goal:Number($('#daily-goal').value)});store(PLAN_KEY,plan);refresh();});
  $('#daily-level').addEventListener('change',()=>{if(session&&session.stage<4)return;plan=cleanPlan({...plan,level:Number($('#daily-level').value)});store(PLAN_KEY,plan);refresh();});
  function record(q,{firstTry=false,skipped=false,previousStat,eventId,index=0}={}) {
    rollover();
    if(!profile.words[q.vocabId]){profile.words[q.vocabId]={};if(!skipped&&!plan.newWords.includes(q.vocabId)){plan.newWords.push(q.vocabId);store(PLAN_KEY,plan);}}
    recordSkill(profile,q,{firstTry,skipped,previousStat,eventId,at:now()});saveProfile();
    if(session&&eventId===sessionToken(session,index)) {recordSessionAnswer(session,q,{index,firstTry,skipped,now:now()});saveSession();}
  }
  function checkpoint(state) {
    if(!session||session.stage>=3||session.stageDone[session.stage])return;
    session.checkpoint={index:state.qi,firstTry:state.firstTry,step:state.step,stepMisses:state.stepMisses,misses:state.misses,questionMisses:state.questionMisses,
      typed:$('#dictation-input').value||'',phase:state.phase,playMs:Math.round(state.playMs||0),thinkingMs:Math.round(state.questionThinkingMs||0)};
    saveSession();
  }
  function begin() {
    rollover();if(!session){session=createSession(plan,currentTopic,now());saveSession();}
    if(session.stage===4){refresh();return;}
    if(session.stage===3){openDailyApplication();return;}
    if(session.stageDone[session.stage]){session.stage++;session.checkpoint=null;saveSession();begin();return;}
    const questions=buildStage(session,profile,saves(),plan,{now:now()});
    saveSession();
    if(!questions.length){session.stageDone[session.stage]=true;session.stage++;session.checkpoint=null;saveSession();begin();return;}
    const cursor=Math.min(session.checkpoint?.index||0,questions.length-1);
    launchDaily({questions,index:cursor,checkpoint:session.checkpoint,completed:session.completed.filter(r=>r.stage===session.stage),stage:session.stage,title:STAGES[session.stage].title});
  }
  $('#start-daily').addEventListener('click',begin);
  function finishStage(results,playMs) {
    if(!session||session.stage>=3)return;
    const stage=session.stage;
    if(!session.stageDone[stage]) {
      const groups=Object.groupBy?Object.groupBy(results,r=>r.type):results.reduce((a,r)=>((a[r.type]||=[]).push(r),a),{});
      for(const [id,rows]of Object.entries(groups)) {
        const m=MODES[id];if(!m)continue;const save=loadSave(storage,m),recordId=`${session.id}:${stage}:${id}`;
        if(!save.history.some(h=>h.id===recordId)){
          save.rounds++;save.history.push({id:recordId,day:session.day,at:now(),score:Math.round(100*rows.filter(r=>r.firstTry).length/rows.length),
            solved:rows.filter(r=>r.completed).length,misses:rows.filter(r=>!r.firstTry).length,firstTry:rows.filter(r=>r.firstTry).length,combo:0,
            mode:id,level:session.level,kind:'daily',total:rows.length,timeMs:Math.round(playMs*rows.length/Math.max(1,results.length))});
          save.history=save.history.slice(-1000);save.stats.flags.firstPlay=true;saveMode(m,save);
        }
      }
      session.stageMs[stage]=Math.round(playMs);session.stageDone[stage]=true;saveSession();
    }
    return {stage,title:STAGES[stage].title,first:results.filter(r=>r.firstTry).length,total:results.length};
  }
  function nextStage(){if(!session){begin();return;}session.stage=Math.min(4,session.stage+1);session.checkpoint=null;saveSession();begin();}
  const dialog=$('#study-dialog');
  function open(title){opener=document.activeElement;onPause();$('#study-title').textContent=title;dialog.showModal();$('#close-study').focus();}
  dialog.addEventListener('close',()=>{pauseApplication();onResume();opener?.focus?.({preventScroll:true});});
  $('#close-study').addEventListener('click',()=>dialog.close());
  const viewport=window.visualViewport;
  function updateKeyboard(){const input=document.activeElement,typing=input&&['INPUT','TEXTAREA'].includes(input.tagName);document.body.style.setProperty('--keyboard-viewport',`${viewport?.height||window.innerHeight}px`);document.body.classList.toggle('keyboard-open',Boolean(typing&&viewport&&viewport.height<window.innerHeight*.78));}
  viewport?.addEventListener('resize',updateKeyboard);document.addEventListener('focusin',updateKeyboard);document.addEventListener('focusout',()=>setTimeout(updateKeyboard,0));
  const targetWords=()=>session?session.completed.filter(r=>r.stage===1&&!r.skipped).map(r=>lookup.get(r.qid.replace(/^[^:]+:/,''))).filter(Boolean):[];
  function writing(kind,index=0,daily=false) {
    const bank=kind==='letter'?LETTERS:OPINIONS,q=bank[index],key=q.id;
    const checks=practice.checks[key]||[];
    $('#study-body').innerHTML=`<label>${kind==='letter'?'书信场景':'观点主题'}<select id="writing-select"${daily?' disabled':''}>${bank.map((v,i)=>`<option value="${i}"${i===index?' selected':''}>${esc(v.title)}${v.register?' · '+v.register:''}</option>`).join('')}</select></label>
      <p class="practice-tag">${kind==='letter'?q.register+'语气 · 2–3 句片段':'Task 2 · 观点段落训练'}</p><p lang="${kind==='letter'?'zh-CN':'en'}">${esc(q.prompt)}</p>
      <p class="topic-note">${kind==='letter'?'完整 Task 1 至少 150 词；这里先写一个片段。':'完整 Task 2 至少 250 词；这里建议先写 60–100 词的观点段落。'}仅提供练习与自查，不生成雅思估分。</p>
      ${q.opening?`<p><b>语气参考：</b>${esc(q.opening)} / ${esc(q.closing)}</p>`:''}
      ${daily&&targetWords().length?`<details><summary>今天接触过的词</summary><p>${targetWords().map(v=>esc(v.word)).join(' · ')}</p><p class="topic-note">选择与本题自然相关的词，不必强行全部使用。</p></details>`:''}
      <label for="letter-draft">${kind==='letter'?'用英语写一个片段':'用英语写一个观点段落'}</label><textarea id="letter-draft" rows="7" maxlength="6000" placeholder="观点 → 原因 → 具体例子；写完再检查搭配和语气。"></textarea>
      <p id="draft-count" role="status"></p><fieldset class="letter-checks"><legend>写完后自查</legend>${q.points.map((p,i)=>`<label><input type="checkbox" data-writing-check="${i}"${checks[i]?' checked':''}>${esc(p)}</label>`).join('')}
      <label><input type="checkbox" data-writing-check="3"${checks[3]?' checked':''}>${kind==='letter'?'称呼、结尾与收信人关系一致':'检查搭配、词形、拼写和句子连接'}</label></fieldset>
      <details><summary>查看参考表达与搭配</summary><p lang="en">${esc(q.model)}</p><p>${esc(Array.isArray(q.phrases)?q.phrases.join(' · '):q.phrases)}</p><p class="topic-note">对照你的内容逐项修改，参考段落不是唯一答案。</p></details><p id="draft-saved" role="status"></p>
      ${daily?'<button id="complete-application" class="primary">已自查，完成今天的场景应用</button><p id="application-status" role="status"></p>':''}`;
    const draft=$('#letter-draft');draft.value=practice.drafts[key]||'';
    function update(){const c=draftChecks(draft.value);$('#draft-count').textContent=`${c.words} 个英文词 · 约 ${c.sentences} 句（仅做篇幅提醒）`;}
    update();draft.addEventListener('input',()=>{practice.drafts[key]=draft.value;$('#draft-saved').textContent=store(PRACTICE_KEY,practice)?'草稿已保存在此浏览器，可随备份导出。':'尚未保存，请先复制文本或重试保存。';update();});
    dialog.querySelectorAll('[data-writing-check]').forEach(input=>input.addEventListener('change',()=>{practice.checks[key]=[...dialog.querySelectorAll('[data-writing-check]')].map(e=>e.checked);store(PRACTICE_KEY,practice);}));
    $('#writing-select').addEventListener('change',()=>writing(kind,Number($('#writing-select').value)));
    if(daily)$('#complete-application').addEventListener('click',()=>{if(draftChecks(draft.value).words<20||!(practice.checks[key]?.length===4&&practice.checks[key].every(Boolean))){$('#application-status').textContent='先写至少 20 个英文词，并逐项完成自查。这里检查完成情况，不判断作文分数。';return;}completeApplication();});
  }
  function reading(index=0,daily=false) {
    const q=READINGS[index],selected=practice.reading[q.id]||[];
    $('#study-body').innerHTML=`<label>阅读场景<select id="reading-select"${daily?' disabled':''}>${READINGS.map((v,i)=>`<option value="${i}"${i===index?' selected':''}>${esc(v.title)}</option>`).join('')}</select></label>
      <p class="practice-tag">${esc(q.type)} · 原创 ${q.text.split(/\s+/).length} 词</p><article class="reading-passage" lang="en">${esc(q.text)}</article>
      <p class="topic-note">先独立作答，再定位原文。Not Given 表示信息不足；请勿用常识补足原文。</p>
      <label class="translation-toggle"><input id="reading-help" type="checkbox">显示中文题意辅助</label>
      <form id="reading-form">${q.questions.map((v,i)=>`<fieldset><legend lang="en">${i+1}. ${esc(v.prompt)}</legend><p class="reading-hint" hidden>${esc(v.hintZh||'请依据原文作答。')}</p>
        ${v.options.map((o,j)=>`<label class="reading-option"><input type="radio" name="q${i}" value="${j}"${selected[i]===j?' checked':''}><span lang="en">${esc(o)}</span></label>`).join('')}<p id="reading-feedback-${i}" class="reading-feedback" role="status"></p></fieldset>`).join('')}
      <button type="submit" class="primary">核对答案与原文依据</button><p id="reading-result" role="status"></p></form>${daily?'<button id="complete-application" class="sub-btn" disabled>完成今天的场景应用</button>':''}`;
    $('#reading-select').addEventListener('change',()=>reading(Number($('#reading-select').value)));
    $('#reading-help').addEventListener('change',()=>dialog.querySelectorAll('.reading-hint').forEach(e=>e.hidden=!$('#reading-help').checked));
    $('#reading-form').addEventListener('change',()=>{practice.reading[q.id]=q.questions.map((_,i)=>{const e=dialog.querySelector(`input[name="q${i}"]:checked`);return e?Number(e.value):null;});store(PRACTICE_KEY,practice);$('#reading-result').textContent='答案已保存，请重新核对。';q.questions.forEach((_,i)=>{$(`#reading-feedback-${i}`).textContent='';});if(daily)$('#complete-application').disabled=true;});
    $('#reading-form').addEventListener('submit',event=>{event.preventDefault();const values=practice.reading[q.id]||selected;if(q.questions.some((_,i)=>values[i]===null||values[i]===undefined)){$('#reading-result').textContent=`请先完成全部 ${q.questions.length} 题。`;return;}let score=0;q.questions.forEach((v,i)=>{const correct=values[i]===v.answer;if(correct)score++;$(`#reading-feedback-${i}`).textContent=`${correct?'✓ 正确':'需要复习'} · 答案：${v.options[v.answer]}。${v.explanation}`;});practice.readingResults[q.id]={correct:score,total:q.questions.length,at:now()};store(PRACTICE_KEY,practice);$('#reading-result').textContent=`本次核对 ${score} / ${q.questions.length}。对照原文检查原因，不换算雅思分数。`;if(daily)$('#complete-application').disabled=false;});
    if(daily)$('#complete-application').addEventListener('click',completeApplication);
  }
  function pauseApplication(){if(applicationRunning&&applicationStarted&&session){session.stageMs[3]+=Math.round(Math.max(0,elapsed()-applicationStarted));saveSession();}applicationStarted=0;applicationRunning=false;}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseApplication();else if(session?.stage===3&&dialog.open){applicationRunning=true;applicationStarted=elapsed();}});
  function openDailyApplication(){const task=applicationFor(session);saveSession();goHome?.();applicationStarted=elapsed();applicationRunning=true;if(task.kind==='reading')reading(READINGS.findIndex(q=>q.id===task.id),true);else writing(task.kind,(task.kind==='letter'?LETTERS:OPINIONS).findIndex(q=>q.id===task.id),true);open('今日第 4 步 · 场景应用');}
  function completeApplication(){if(!session||session.day!==dayKey(new Date(now()))){session=null;dialog.close();goHome?.();$('#study-status').textContent='练习已保存。已进入新一天，请从首页开始今天的计划。';return;}pauseApplication();session.stageDone[3]=true;session.stage=4;saveSession();dialog.close();goHome?.();refresh();$('#study-status').textContent='今天四步已完成。完成情况与自查不代表雅思分数，明天继续检验记忆。';}
  $('#open-letters').addEventListener('click',()=>{writing('letter');open('G 类书信 · 12 个场景');});
  $('#open-reading').addEventListener('click',()=>{reading();open('G 类阅读 · 8 篇 / 28 题');});
  $('#open-opinions').addEventListener('click',()=>{writing('opinion');open('Task 2 · 六类观点表达');});
  function mistakes(){const all=saves(),rows=Object.values(MODES).flatMap(m=>(all[m.id].review||[]).map(id=>questionLookup.get(id))).filter(Boolean).sort((a,b)=>(all[b.type].wordStats[b.id]?.lastSeen||0)-(all[a.type].wordStats[a.id]?.lastSeen||0));
    $('#study-body').innerHTML=`<p>共 ${rows.length} 道待巩固题。这里可立即重练；每日计划仍按到期时间安排。</p><div class="mistake-list">${rows.slice(0,60).map(q=>`<button class="mistake-item" data-question="${q.id}"><b>${esc(q.word)}</b><span>${esc(MODES[q.type].label)} · ${esc(q.meaning)}</span></button>`).join('')||'<p>暂时没有错题。完成练习后，会在这里按玩法保留需要巩固的词。</p>'}</div>${rows.length>60?'<p>先显示最近列表中的前 60 道；各玩法“立即重练”可练全部错题。</p>':''}`;
    dialog.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.question;dialog.close();practiceQuestion(id.split(':')[0],id);}));open('错题 · 手动立即重练');
  }
  function languageLab(){const entries=WORD_BANK.filter(q=>q.family?.length||q.paraphrase);$('#study-body').innerHTML=`<label>词族 / 改写<select id="language-select">${entries.map((q,i)=>`<option value="${i}">${q.word}</option>`).join('')}</select></label><div id="language-content"></div><p class="topic-note">近义改写只在说明的语境下成立，词形和句型需要一起调整。</p><hr><h3>词族与改写微练习 · 20 题</h3><div id="language-drill"></div>`;
    const render=()=>{const q=entries[Number($('#language-select').value)||0];$('#language-content').innerHTML=`<h3>${esc(q.word)}</h3><p>${esc(q.meaning)}</p>${q.family?.length?`<h4>词族与词形</h4><p lang="en">${q.family.map(esc).join(' → ')}</p>`:''}${q.paraphrase?`<h4>语境改写</h4><p lang="en">${esc(q.paraphrase.text)}</p><p>${esc(q.paraphrase.scope)}</p>`:''}`;};render();$('#language-select').addEventListener('change',render);
    function drill(index=0){const q=LANGUAGE_DRILLS[index];$('#language-drill').innerHTML=`<p class="practice-tag">${index+1} / ${LANGUAGE_DRILLS.length} · ${q.kind}</p><p lang="en">${esc(q.prompt)}</p><div class="drill-options">${q.options.map((text,i)=>`<button class="sub-btn" data-drill-answer="${i}">${esc(text)}</button>`).join('')}</div><p id="drill-feedback" role="status"></p><button id="next-drill" class="sub-btn" hidden>下一题 →</button>`;
      dialog.querySelectorAll('[data-drill-answer]').forEach(button=>button.addEventListener('click',()=>{const answer=Number(button.dataset.drillAnswer);practice.language[q.id]=answer;store(PRACTICE_KEY,practice);$('#drill-feedback').textContent=`${answer===q.answer?'✓ 正确':'需要巩固'} · ${q.explanation}`;dialog.querySelectorAll('[data-drill-answer]').forEach(e=>e.disabled=true);$('#next-drill').hidden=false;}));
      $('#next-drill').addEventListener('click',()=>drill((index+1)%LANGUAGE_DRILLS.length));}
    const next=LANGUAGE_DRILLS.findIndex(q=>practice.language[q.id]===undefined);drill(next<0?0:next);open('词族与同义改写');
  }
  $('#open-language').addEventListener('click',languageLab);
  function profileView(){const sum=skillSummary(profile,now());$('#study-body').innerHTML=`<p>已接触 <b>${sum.touched}</b> / 3000 词</p><div class="skill-grid">${DIMENSIONS.map(dim=>`<div><b>${sum.stable[dim]}</b><span>${DIMENSION_LABELS[dim]}稳定</span></div>`).join('')}</div><p>近 7 天首答：${sum.first} / ${sum.total}</p><p>跨日到期复习：${sum.retentionTotal?`${sum.retained} / ${sum.retentionTotal}`:'暂无样本，完成隔天复习后再看。'}</p><p class="topic-note">每个维度至少两次跨日、无提示独立答对才标记稳定；这是学习记录，不是雅思分数。2500 个词的搭配维度尚未覆盖。</p><p>${failed.size?'部分记录尚未保存，请重试或先导出备份。':'记录只保存在当前浏览器，换设备前请备份。'}</p><button id="retry-save" class="sub-btn">重试保存</button><div class="profile-actions">${[['open-backup','备份 / 导入进度'],['open-letters','书信片段'],['open-reading','短文与长文'],['open-opinions','观点段落'],['open-language','词族与改写'],['open-settings','游戏设置'],['open-bonus','签到印章'],['open-quests','今日委托'],['open-calendar','学习足迹'],['open-trophy','词汇奖杯']].map(([id,label])=>`<button class="sub-btn" data-open-original="${id}">${label}</button>`).join('')}</div>`;
    $('#retry-save').addEventListener('click',()=>{retrySaved();$('#retry-save').textContent=failed.size?'仍未保存，请导出备份':'已保存';});dialog.querySelectorAll('[data-open-original]').forEach(button=>button.addEventListener('click',()=>{dialog.close();$('#'+button.dataset.openOriginal).click();}));open('我的学习');
  }
  $('#nav-today').addEventListener('click',()=>{goHome?.();$('#daily-title').scrollIntoView?.({block:'start'});});
  $('#nav-wordbook').addEventListener('click',()=>$('#open-wordbook').click());
  $('#nav-mistakes').addEventListener('click',mistakes);$('#nav-my').addEventListener('click',profileView);
  $('#backup-reminder').addEventListener('click',()=>$('#open-backup').click());
  $('#open-backup').addEventListener('click',()=>{
    pending=null;$('#study-body').innerHTML='<p>备份包含各玩法记录、三个技能维度、每日四步断点、草稿、阅读答案与自查。换设备或清理数据前请保存文件。</p><button id="export-progress" class="primary">下载进度备份</button><hr><label for="import-file">选择之前导出的 JSON 文件</label><input id="import-file" type="file" accept=".json,application/json"><details><summary>也可以粘贴备份文本</summary><label for="backup-text">完整 JSON 备份文本</label><textarea id="backup-text" rows="5" maxlength="8388608" spellcheck="false"></textarea><button id="inspect-backup-text" class="sub-btn">检查备份文本</button></details><p id="backup-preview" role="status"></p><button id="confirm-import" class="sub-btn" disabled>合并导入</button><p class="topic-note">先完整检查再写入；保留当前设置，合并学习记录，断点采用较新的同日记录。不会重复累计。</p>';
    function inspect(text){pending=null;$('#confirm-import').disabled=true;try{pending=parseBackup(text);const n=Object.values(pending).reduce((a,v)=>a+(v.learned?.length||0),0);$('#backup-preview').textContent=`已检查 ${Object.keys(pending).length} 项记录，包含 ${n} 条玩法学习记录。合并后重新载入页面。`;$('#confirm-import').disabled=false;}catch(err){$('#backup-preview').textContent=err.message;}}
    $('#export-progress').addEventListener('click',()=>{try{let records;try{records=JSON.parse(exportBackup(storage));}catch{records={format:'softie-ielts-gt',version:1,exportedAt:new Date(now()).toISOString(),records:{}};}for(const [key,value]of failed)records.records[key]=value;records.records[SKILLS_KEY]=profile;records.records[PLAN_KEY]=plan;records.records[PRACTICE_KEY]=practice;if(session)records.records[SESSION_KEY]=session;const blob=new Blob([JSON.stringify(records,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`雅思G类学习进度-${dayKey()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);meta.lastExport=now();store(BACKUP_META_KEY,meta);$('#backup-preview').textContent='已交给浏览器下载。请确认文件已保存；本机未保存的内存记录也已包含在此次备份中。';}catch{$('#backup-preview').textContent='导出失败，请检查下载权限；也可复制草稿防止丢失。';}});
    $('#import-file').addEventListener('change',async()=>{const file=$('#import-file').files?.[0];if(!file)return;pending=null;$('#confirm-import').disabled=true;try{if(file.size>8*1024*1024)throw Error('备份文件过大（最多 8 MB）');inspect(await file.text());}catch(err){$('#backup-preview').textContent=err.message;}});
    $('#inspect-backup-text').addEventListener('click',()=>inspect($('#backup-text').value));
    $('#backup-text').addEventListener('input',()=>{pending=null;$('#confirm-import').disabled=true;});
    $('#confirm-import').addEventListener('click',()=>{if(!pending)return;try{importBackup(storage,pending);location.reload();}catch(err){$('#backup-preview').textContent=err.message;}});open('学习进度备份');
  });
  return {refresh,record,checkpoint,retrySaved,begin,nextStage,finishStage,saveMode,
    token:index=>session?sessionToken(session,index):null,status:q=>DIMENSIONS.map(dim=>`${DIMENSION_LABELS[dim]}：${skillStatus(profile,q,dim)}`).join(' · '),
    ensureToday(){rollover();return Boolean(session);},get profile(){return profile;},get session(){return session;},round:()=>[]};
}
