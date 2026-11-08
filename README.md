# 雅思泡泡 · General Training

面向目标 6–7 分的雅思 **G 类**备考者，在泡泡游戏里练习生活、职场和书信词汇。

这是基于 [yuanyang749/softie-learn-english-app](https://github.com/yuanyang749/softie-learn-english-app) 的个人非官方改编，保留 Softie 角色、音乐、动画、签到和奖杯，以及原作者署名和 [许可证](LICENSE-SOFTIE)。与 IELTS 官方无关联。

## 在线访问

[打开雅思 G 类词汇练习](https://oyldegit.github.io/softie-learn-english-app/)

## 内容与玩法

- 180 个精选词，六个话题各 30 词：生活与住房、工作与职业、出行与服务、健康与习惯、社区与环境、学习与沟通。
- 每词含当前义项的词性与中文释义、常用搭配及译义、原创例句与中文翻译、G 类使用场景。
- 三种玩法共 540 道题：词义辨析、听音补字母、语境填词。拼写为补一至两个字母，不是完整听写；语境题提供中文提示，不是雅思阅读模拟。
- 基础、核心、进阶各 60 词；可按话题练，每话题每层 10 词。每轮 8 题，学习过后优先混合新词与旧词。
- 基础 40 秒、核心 35 秒、进阶 30 秒。朗读和解析期间暂停计时；误答、提示和超时的词进入复习。
- 起点小测覆盖全部话题，每层抽两题，只用于建议练习层级，不预测雅思分数。

重点情境包括租房咨询与报修、求职和请假、预订和退款、课程咨询与正式书信。题库中如 `a refundable deposit`、`reimburse travel expenses`、`a sincere apology` 等搭配可继续用于自己造句。

这是一个小规模词汇练习集，不是官方完整词表或完整备考课程。选题方向参考 [G 类阅读格式](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading) 和 [G 类写作格式](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing)，例句为独立编写。完整词条见 [VOCABULARY.md](VOCABULARY.md)。

## 本地运行与测试

零 npm 依赖、无构建、无后端。需要 Node.js 20+ 与 Python 3。

```bash
npm run dev
npm test
```

打开 `http://127.0.0.1:8016`，不要直接双击 HTML。GitHub Pages 从 `master` 分支根目录发布，保留 `.nojekyll`。

## 数据与朗读

学习数据保存在当前浏览器，三个玩法互相独立。G 类使用 `softie-ielts-gt:` 命名空间，旧启蒙版 `softie-english:` 和成语版数据保留；新版重置仅清除 G 类数据。

使用浏览器 Web Speech API，默认优先本地声音，实际声音取决于系统安装情况。每题、选项和答后例句可点击朗读；设置中可调整速度与自动朗读。选择题答前不会自动读出目标英文；拼写题可朗读目标词。

## 代码与验证

- `js/content/vocabulary.js`：G 类唯一词汇来源。
- `js/modes.js`：玩法、分层、计时和数据键。
- `js/idioms.js`：按难度和话题组卷、选项及复习逻辑。
- `js/main.js`：游戏、话题筛选、搭配解析。
- `tests/ielts-gt.test.mjs`：话题组卷、复习筛选、解析、旧版数据隔离。

原版演出与字节基线测试保留；`DEV_TASKS.md` 和 `QA.md` 中原有条目是启蒙版历史记录，不代表本版词库。G 类新增验证见 `QA.md` 顶部。
