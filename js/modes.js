import { VOCABULARY } from './content/vocabulary.js';
export const WORD_BANK = VOCABULARY;

const copy = {
  titleLead: '雅思', titleAccent: '泡泡', tagline: '雅思 G 类词汇练习', eyebrow: 'GENERAL TRAINING · 目标 6–7 分',
  stationSuffix: '小站', stationStart: '从「{name}」出发', stageReady: '泡泡小队，准备好啦',
  intro: `${VOCABULARY.length} 词备考词库 · G 类生活、职场与通用表达`, placement: '测测词汇起点',
  levelHeading: '选一种玩法，再选一站', footer: '答错也没关系，一起读一读。',
  ready: '选一个答案，让软乎乎送过去吧。', wrong: '差一点点，再看看中文提示吧。',
  correct: '气泡命中！选对啦。', finished: '单词收集成功！一起读一读。',
  resultTitle: '每一点进步\n都值得庆祝。', learned: '今天又练了一个单词', unlearned: '先来认识这个新单词',
  home: '回到词汇练习', disclaimer: '雅思 G 类备考词库：识义与拼写各 3000 词，语境精练 180 词。含原创词条及 ECDICT 通用词典释义，不是官方 G 类词表。练习分层参考词频，不对应雅思分数。',
  logoBits: ['听', '说'],
};

function makeMode(id, label, details) {
  return {
    id, label, theme: 'children', version: 1,
    questions: VOCABULARY.filter(v => id !== 'sentence' || (v.context && v.translation && v.collocation)).map(v => {
      const spelling = id === 'spelling';
      const first = Math.min(v.word.length - 1, Math.floor(v.word.length / 2));
      const blanks = spelling ? (v.level === 3 ? [0, first] : [first]) : [0];
      return { ...v, id: `${id}:${v.id}`, vocabId: v.id, type: id, parts: spelling ? [...v.word] : [v.word], blanks };
    }),
    levels: [
      { id: 1, name: '基础', label: `${details[0]} · 每题 40 秒`, color: 'mint', seconds: 40 },
      { id: 2, name: '核心', label: `${details[1]} · 每题 35 秒`, color: 'blue', seconds: 35 },
      { id: 3, name: '进阶', label: `${details[2]} · 每题 30 秒`, color: 'violet', seconds: 30 },
    ],
    rules: { roundSize: 8, placementPerLevel: 2, demoPerLevel: 2 },
    copy: { ...copy },
  };
}

export const MODES = {
  meaning: makeMode('meaning', '词义辨析', ['生活常用词', 'G 类核心词', '表达拓展词']),
  spelling: makeMode('spelling', '听音拼写', ['听音补字母', '核心词拼写', '长词双空练习']),
  sentence: makeMode('sentence', '语境精练', ['日常场景', '职场与书信', '搭配与表达']),
};
export const DEFAULT_MODE = MODES.meaning;
export function getMode(id) { return MODES[id] || DEFAULT_MODE; }
export function saveKey(mode) { return `softie-ielts-gt:${mode.id}:v${mode.version}`; }
