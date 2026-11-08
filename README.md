# 雅思泡泡 · General Training

面向目标 6–7 分的雅思 **G 类**备考者，在泡泡游戏里练习生活、职场、书信与通用核心词汇。现有 3000 个不重复单词。

这是基于 [yuanyang749/softie-learn-english-app](https://github.com/yuanyang749/softie-learn-english-app) 的个人非官方改编，保留 Softie 角色、音乐、动画、签到和奖杯，以及原作者署名和 [许可证](LICENSE-SOFTIE)。与 IELTS 官方无关联。

## 在线访问

[打开雅思 G 类词汇练习](https://oyldegit.github.io/softie-learn-english-app/)

## 内容与玩法

- **词义辨析 / 听音拼写各 3000 词**：原有 180 词加上 2820 个词典扩展词。基础、核心、进阶各 1000 词。
- **语境精练 180 词**：使用有原创例句和搭配的词条，保留六类 G 类生活、工作与书信场景。扩展词目前不生成语境题，页面分别显示数量。
- **可搜索词表**：支持英文、中文和搭配查询，按话题与难度筛选，每页 20 词、共 150 页，支持逐词朗读。
- 原创词有搭配和中英例句；词典扩展词有词性、中文释义及源数据提供的音标、英文释义。话题数量随实际收录量显示，另设“通用表达”。
- 每轮 8 题，学习过后优先混合新词与旧词。拼写为补一至两个字母，不是完整听写；语境题有中文提示，不是雅思阅读模拟。
- 基础 40 秒、核心 35 秒、进阶 30 秒；朗读和解析期间暂停计时。误答、提示和超时的词进入复习。
- 原有 180 个词的 ID、层级及进度保留。六题起点小测只建议练习层级，不预测雅思分数。

重点情境包括租房咨询与报修、求职和请假、预订和退款、课程咨询与正式书信。题库中如 `a refundable deposit`、`reimburse travel expenses`、`a sincere apology` 等搭配可继续用于自己造句。

这是一个词汇练习工具，不是官方词表或完整备考课程。词典部分源于 ECDICT（MIT），详情与固定版本见 [词库来源](VOCABULARY_SOURCES.md) 和 [LICENSE-ECDICT](LICENSE-ECDICT)。选题方向参考 [G 类阅读格式](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading) 和 [G 类写作格式](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing)，例句为独立编写。原创语境词条见 [VOCABULARY.md](VOCABULARY.md)，完整 3000 词可在网站搜索词表中浏览。

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

- `js/content/vocabulary.js`：合并原创词库与生成的扩展词库、按词性组织干扰项。
- `js/content/curated.js`：180 个原创语境词条。
- `scripts/build-vocabulary.py`：从固定 ECDICT CSV 生成扩展词库。
- `js/wordbook.js`：搜索、筛选和分页。
- `js/modes.js`：玩法、分层、计时和数据键。
- `js/idioms.js`：按难度和话题组卷、选项及复习逻辑。
- `js/main.js`：游戏、话题筛选、搭配解析。
- `tests/ielts-gt.test.mjs` / `tests/wordbook.test.mjs`：组卷、复习、存储隔离、扩展进度兼容、词表搜索和分页。

原版演出与字节基线测试保留；`DEV_TASKS.md` 和 `QA.md` 中原有条目是启蒙版历史记录，不代表本版词库。G 类新增验证见 `QA.md` 顶部。
