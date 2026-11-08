# 3000 词词库来源与范围

本项目面向目标 6–7 分的雅思 General Training 备考，收录 **3000 个不重复的英文单词**。这是日常、职场和通用英语的备考辅助词库，不是 IELTS 官方 G 类词表，也不代表背完即可达到某个分数。

## 收录组成

| 内容 | 数量 | 支持玩法 |
|---|---:|---|
| 原创 G 类情境词条 | 180 | 词义辨析、听音拼写、语境精练 |
| ECDICT 扩展词条 | 2820 | 词义辨析、听音拼写 |
| 合计 | 3000 | 6180 道派生练习题 |

原创情境词条保留独立编写的例句、译文、常用搭配与 G 类用途。扩展词条提供词典释义与音标（以源数据实际收录为准），不会为缺少原创例句的条目自动拼凑例句或搭配。

## 词典数据

- 来源：[skywind3000/ECDICT](https://github.com/skywind3000/ECDICT)。
- 固定版本：[`39cfb9672c0906b63569e0453c2e6abfb9ab182a`](https://github.com/skywind3000/ECDICT/tree/39cfb9672c0906b63569e0453c2e6abfb9ab182a)。
- 使用文件：`ecdict.csv`，按该版本校验原始文件哈希。
- 许可证：MIT；完整文本保存在 [LICENSE-ECDICT](LICENSE-ECDICT)。
- 原始 CSV SHA-256：`d1ecbdf9ee2b920afb6f430ca6b6bb9f559588cf0dff86e04bd255f9390843cc`。

筛选参考 ECDICT 的通用核心标记、IELTS 标记和词频，排除明显专名、许多单纯的词形变化、缺少可用中文释义的条目及部分不适合本练习的内容；对部分英美拼写变体去重，对常见词义人工修正。词库保留实用基础词与常见进阶词，并非全部属于 G 类专用词。

话题根据词义辅助分类，无法明确归入生活、工作等场景的词放入“通用表达”。分类可能有交叉，不是官方分类。新增层级参考词频、词长及常用基础词调整；原有 180 词的 ID 和层级保持稳定。全部条目尚未逐一经过外部教师审校，遇到一词多义时应结合具体语境理解。

## 可重复生成

仅生成词库时需要下载固定版本 CSV，网页运行时不访问第三方词典服务：

```bash
python3 scripts/build-vocabulary.py /path/to/ecdict.csv
npm test
```

脚本会检查源文件哈希并生成 `js/content/extended.js` 和 `js/content/vocabulary-manifest.json`。人工修正记录在 `scripts/vocabulary-overrides.json`。网站的搜索词表支持英文、中文、搭配搜索，以及话题、难度和分页筛选。
