import { cleanPlan, PLAN_KEY, learnedVocabulary, dailySummary, dailyRound } from './study.js';
import { exportBackup, parseBackup, importBackup, cleanPractice, PRACTICE_KEY } from './backup.js';
import { LETTERS, READINGS, draftChecks } from './content/practice.js';
const esc = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initStudyTools({storage,start,onPause=()=>{},onResume=()=>{}}) {
  const $=s=>document.querySelector(s);
  const get=(key,fallback)=>{try{return JSON.parse(storage?.getItem(key))||fallback;}catch{return fallback;}};
  let plan=cleanPlan(get(PLAN_KEY,{})), practice=cleanPractice(get(PRACTICE_KEY,{}));
  const learned=learnedVocabulary(storage);let currentMode,currentSave,currentTopic='',pending=null;
  function store(key,value){try{if(!storage)throw Error();storage.setItem(key,JSON.stringify(value));return true;}catch{$('#study-status').textContent='浏览器未能保存记录，请检查存储权限或空间。';return false;}}
  function refresh(mode=currentMode,save=currentSave,topic=currentTopic) {
    if(!mode)return;currentMode=mode;currentSave=save;currentTopic=topic;plan=cleanPlan(plan);
    const {due,effectiveGoal,remaining}=dailySummary(mode,save,plan,{topic});
    $('#daily-goal').value=String(plan.goal); $('#daily-level').value=String(plan.level);
    $('#daily-summary').textContent=`今日新词 ${plan.newWords.length} / ${effectiveGoal} · 本玩法待复习 ${due.length} 词`;
    $('#daily-progress').max=Math.max(1,effectiveGoal);$('#daily-progress').value=Math.min(plan.newWords.length,effectiveGoal);
    $('#daily-note').textContent=due.length>40?'复习积压较多，今天先不加新词。':due.length>20?'今天先巩固旧词，新词目标暂减至 5 个。':`每轮最多 8 词，先复习再学新词；新词按四种玩法合并计数。当前范围：${topic||'全部话题'}。`;
    $('#start-daily').textContent=due.length||remaining?'开始今日学习 →':'今日目标已完成'; $('#start-daily').disabled=!due.length&&!remaining;
  }
  $('#daily-goal').addEventListener('change',()=>{plan=cleanPlan({...plan,goal:Number($('#daily-goal').value)});store(PLAN_KEY,plan);refresh();});
  $('#daily-level').addEventListener('change',()=>{plan=cleanPlan({...plan,level:Number($('#daily-level').value)});store(PLAN_KEY,plan);refresh();});
  $('#start-daily').addEventListener('click',()=>start('daily',plan.level));
  function record(q) {
    plan=cleanPlan(plan);
    if(!learned.has(q.vocabId)){learned.add(q.vocabId);plan.newWords.push(q.vocabId);store(PLAN_KEY,plan);}
  }
  function round(mode,save,{topic,level}) {
    plan=cleanPlan(plan);const result=dailyRound(mode,save,plan,{topic,level,learned});
    if(!result.length)$('#study-status').textContent='当前范围的今日任务已完成，或没有未学新词。可以切换话题、难度，或用下方自由练习继续。';
    return result;
  }
  const viewport=window.visualViewport;
  const updateKeyboard=()=>{const input=document.activeElement;const typing=input&&['INPUT','TEXTAREA'].includes(input.tagName);document.body.style.setProperty('--keyboard-viewport',`${viewport?.height||window.innerHeight}px`);document.body.classList.toggle('keyboard-open',Boolean(typing&&viewport&&viewport.height<window.innerHeight*.78));};
  viewport?.addEventListener('resize',updateKeyboard);document.addEventListener('focusin',updateKeyboard);document.addEventListener('focusout',()=>setTimeout(updateKeyboard,0));
  const dialog=$('#study-dialog');let opener;
  function open(title){opener=document.activeElement;onPause();$('#study-title').textContent=title;dialog.showModal();$('#close-study').focus();}
  dialog.addEventListener('close',()=>{onResume();opener?.focus?.({preventScroll:true});});
  $('#close-study').addEventListener('click',()=>dialog.close());
  function letters(index=0) {
    const q=LETTERS[index];
    $('#study-body').innerHTML=`<label>书信场景<select id="letter-select">${LETTERS.map((v,i)=>`<option value="${i}"${i===index?' selected':''}>${v.title} · ${v.register}</option>`).join('')}</select></label><p class="practice-tag">${q.register}语气 · 2–3 句片段练习</p><p>${q.prompt}</p><p class="topic-note">完整 Task 1 作答要求至少 150 词；这里先练一个片段，不提供雅思估分。</p><p><b>语气参考</b>：${q.opening} / ${q.closing}</p><label for="letter-draft">用英语写一个片段</label><textarea id="letter-draft" rows="6" maxlength="6000" placeholder="先表达清楚，再检查搭配和语气。"></textarea><p id="draft-count" role="status"></p><fieldset class="letter-checks"><legend>写完后自查</legend>${q.points.map(p=>`<label><input type="checkbox">${p}</label>`).join('')}<label><input type="checkbox">称呼、结尾与收信人的关系一致</label></fieldset><details><summary>查看参考表达与搭配</summary><p lang="en">${esc(q.model)}</p><p>${esc(q.phrases)}</p><p class="topic-note">参考表达用于学习思路，尽量用自己的经历和措辞。</p></details><p id="draft-saved" role="status"></p>`;
    const draft=$('#letter-draft');draft.value=practice.drafts[q.id]||'';
    const update=()=>{const {words,sentences}=draftChecks(draft.value);$('#draft-count').textContent=`${words} 个英文词 · 约 ${sentences} 句（仅做篇幅提醒）`;};update();
    draft.addEventListener('input',()=>{practice.drafts[q.id]=draft.value;$('#draft-saved').textContent=store(PRACTICE_KEY,practice)?'草稿已保存在此浏览器，可随备份导出。':'草稿未能保存，请先复制文本。';update();});
    $('#letter-select').addEventListener('change',()=>letters(Number($('#letter-select').value)));
  }
  $('#open-letters').addEventListener('click',()=>{letters();open('G 类书信 · 12 个场景');});
  function reading(index=0) {
    const q=READINGS[index],selected=practice.reading[q.id]||[];
    $('#study-body').innerHTML=`<label>阅读场景<select id="reading-select">${READINGS.map((v,i)=>`<option value="${i}"${i===index?' selected':''}>${v.title}</option>`).join('')}</select></label><p class="practice-tag">${q.type} · 原创短篇 ${q.text.split(/\s+/).length} 词</p><article class="reading-passage" lang="en">${q.text}</article><p class="topic-note">先独立作答，再定位原文。Not Given 表示文中没有足够信息。</p><form id="reading-form">${q.questions.map((v,i)=>`<fieldset><legend>${i+1}. ${esc(v.prompt)}</legend>${v.options.map((o,j)=>`<label class="reading-option"><input type="radio" name="q${i}" value="${j}"${selected[i]===j?' checked':''}>${esc(o)}</label>`).join('')}<p id="reading-feedback-${i}" class="reading-feedback" role="status"></p></fieldset>`).join('')}<button type="submit" class="primary">核对答案与原文依据</button><p id="reading-result" role="status"></p></form>`;
    $('#reading-select').addEventListener('change',()=>reading(Number($('#reading-select').value)));
    $('#reading-form').addEventListener('change',()=>{practice.reading[q.id]=q.questions.map((_,i)=>{const input=dialog.querySelector(`input[name="q${i}"]:checked`);return input?Number(input.value):null;});store(PRACTICE_KEY,practice);$('#reading-result').textContent='答案已更新，请重新核对。';q.questions.forEach((_,i)=>{$(`#reading-feedback-${i}`).textContent='';});});
    $('#reading-form').addEventListener('submit',event=>{event.preventDefault();const values=practice.reading[q.id]||selected;if(q.questions.some((_,i)=>values[i]===null||values[i]===undefined)){$('#reading-result').textContent='还有题目未作答，请先完成全部 3 题。';return;}let score=0;q.questions.forEach((v,i)=>{const correct=values[i]===v.answer;if(correct)score++;$(`#reading-feedback-${i}`).textContent=`${correct?'✓ 正确':'再看看'} · 答案：${v.options[v.answer]}。${v.explanation}`;});$('#reading-result').textContent=`本篇答对 ${score} / ${q.questions.length}。此练习不换算雅思分数。`;});
  }
  $('#open-reading').addEventListener('click',()=>{reading();open('G 类短文 · 6 篇 / 18 题');});
  $('#open-backup').addEventListener('click',()=>{
    pending=null;$('#study-body').innerHTML='<p>导出四种玩法的词汇记录、复习安排、每日计划、书信草稿和阅读答案。建议每周备份一次，换浏览器或换手机前也备份。</p><button id="export-progress" class="primary">下载进度备份</button><hr><label for="import-file">选择之前导出的 JSON 文件</label><input id="import-file" type="file" accept=".json,application/json"><p id="backup-preview" role="status"></p><button id="confirm-import" class="sub-btn" disabled>合并导入</button><p class="topic-note">导入保留当前记录与设置，合并已学词和历史；同一词的复习安排采用较新的记录。重复导入不会重复累计。请仅导入你自己的备份。</p>';
    $('#export-progress').addEventListener('click',()=>{try{store(PLAN_KEY,plan);const blob=new Blob([exportBackup(storage)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`雅思G类学习进度-${plan.day}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#backup-preview').textContent='备份已交给浏览器下载，请保存好文件。';}catch{$('#backup-preview').textContent='导出失败，请检查浏览器下载和存储设置。';}});
    $('#import-file').addEventListener('change',async()=>{pending=null;$('#confirm-import').disabled=true;const file=$('#import-file').files?.[0];if(!file)return;try{if(file.size>8*1024*1024)throw new Error('备份文件过大（最多 8 MB）');pending=parseBackup(await file.text());const words=Object.values(pending).reduce((n,v)=>n+(v.learned?.length||0),0);$('#backup-preview').textContent=`已检查：${Object.keys(pending).length} 项记录，包含 ${words} 条玩法学习记录。点击下方合并后页面会重新载入。`;$('#confirm-import').disabled=false;}catch(err){$('#backup-preview').textContent=err.message;}});
    $('#confirm-import').addEventListener('click',()=>{if(!pending)return;try{importBackup(storage,pending);location.reload();}catch(err){$('#backup-preview').textContent=err.message;}});open('学习进度备份');
  });
  return {refresh,record,round};
}
