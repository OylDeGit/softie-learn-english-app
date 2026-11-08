# 雅思泡泡 · General Training

面向目标 6–7 分的雅思 **G 类**备考者，在泡泡游戏里练习生活、职场、书信与通用核心词汇。现有 3000 个不重复单词。

这是基于 [yuanyang749/softie-learn-english-app](https://github.com/yuanyang749/softie-learn-english-app) 的个人非官方改编，保留 Softie 角色、音乐、动画、签到和奖杯，以及原作者署名和 [许可证](LICENSE-SOFTIE)。与 IELTS 官方无关联。

## 在线访问

[打开雅思 G 类词汇练习](https://oyldegit.github.io/softie-learn-english-app/)

## 内容与玩法

- **词义辨析 / 听音拼写各 3000 词**：原有 180 词加上 2820 个词典扩展词。基础、核心、进阶各 1000 词。
- **语境精练 500 词**：使用有原创例句和搭配的词条，保留六类 G 类生活、工作与书信场景。为其中 320 个词典词补充原创情境，共 500 词支持语境题。
- **完整听写 3000 词**：听读后输入整个单词，忽略大小写和首尾空格，接受常见英美拼写变体；错误字母与缺失位置分别标出。保留原来的补字母玩法与记录。
- **每日计划**：默认 10 个核心新词，可选 5/10/15/20/30 个与三档难度；到期及待巩固超过 20 词时暂降到 5 个，超过 40 词时先复习。自由练习不受额度限制。
- **书信片段 12 场景 / 短文 6 篇 18 题**：书信支持草稿、自查与参考表达；阅读提供答案和原文依据。是原创小练习，不是官方试题，不换算分数。
- **进度备份**：下载 JSON 文件，换设备后选择文件、检查预览并合并。重复导入不会重复累计，保留本机设置。
- **可搜索词表**：支持英文、中文和搭配查询，按话题与难度筛选，每页 20 词、共 150 页，支持逐词朗读。
- 原创词有搭配和中英例句；词典扩展词有词性、中文释义及源数据提供的音标、英文释义。话题数量随实际收录量显示，另设“通用表达”。
- 每轮 8 题，默认“智能优先”：高频新词适度优先，到期和易错词优先复习；近期独立答对的词先间隔学习。也可切换“高频优先”或“均匀随机”。拼写为补一至两个字母；语境题提供中文提示。
- 完整听写每题 60 秒，其他玩法基础 40 秒、核心 35 秒、进阶 30 秒；朗读和解析期间暂停计时。误答、提示和超时的词进入复习。
- 复习间隔依次为 1、3、7、14、30 天；错答、提示题和超时题约 10 分钟后进入到期复习。提前重复答对不会延长原日程；演示与起点小测不写入日程。
- 词频分档参考通用语料，高频、常用、拓展的初始抽样权重为 3:2:1；这是相对权重，实际概率受当前候选池影响。
- 全部 3000 词的 ID、层级及进度保留。六题起点小测只建议练习层级，不预测雅思分数。

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

学习数据保存在当前浏览器，四个玩法分别记录复习安排；每日新词按词汇合并计数。G 类使用 `softie-ielts-gt:` 命名空间，旧启蒙版 `softie-english:` 和成语版数据保留；新版重置仅清除 G 类数据。

使用浏览器 Web Speech API，默认优先本地声音，实际声音取决于系统安装情况。每题、选项和答后例句可点击朗读；设置中可调整速度与自动朗读。选择题答前不会自动读出目标英文；拼写题可朗读目标词。

## 代码与验证

- `js/content/vocabulary.js`：合并原创词库与生成的扩展词库、按词性组织干扰项。
- `js/content/curated.js`：原有 180 个原创语境词条。
- `js/content/scenario-expansion.js`：另外 320 个现有词的原创例句、搭配及必要词性修正。
- `scripts/build-vocabulary.py`：从固定 ECDICT CSV 生成扩展词库。
- `js/wordbook.js`：搜索、筛选和分页。
- `js/learning.js`：词频权重、加权抽样、到期复习与策略。
- `tests/learning.test.mjs`：概率分布、复习间隔、提前重练、存储迁移和提示题处理。
- `js/modes.js`：玩法、分层、计时和数据键。
- `js/idioms.js`：按难度和话题组卷、选项及复习逻辑。
- `js/main.js`：游戏、话题筛选、搭配解析。
- `tests/ielts-gt.test.mjs` / `tests/wordbook.test.mjs`：组卷、复习、存储隔离、扩展进度兼容、词表搜索和分页。

原版演出与字节基线测试保留；`DEV_TASKS.md` 和 `QA.md` 中原有条目是启蒙版历史记录，不代表本版词库。G 类新增验证见 `QA.md` 顶部。
