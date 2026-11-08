#!/usr/bin/env python3
"""Build the 3000-word practice bank from a pinned ECDICT CSV and the authored bank.
Usage: python3 scripts/build-vocabulary.py /path/to/ecdict.csv
The CSV is a build input, not a runtime/network dependency.
"""
import csv, hashlib, json, math, re, subprocess, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_REVISION = '39cfb9672c0906b63569e0453c2e6abfb9ab182a'
curated = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {VOCABULARY} from './js/content/curated.js'; console.log(JSON.stringify(VOCABULARY));"], cwd=ROOT, text=True))
existing = {v['word'] for v in curated}
source = Path(sys.argv[1])
EXPECTED_SHA256 = 'd1ecbdf9ee2b920afb6f430ca6b6bb9f559588cf0dff86e04bd255f9390843cc'
assert hashlib.sha256(source.read_bytes()).hexdigest() == EXPECTED_SHA256, 'Source CSV differs from the pinned revision'
POS = {'n':'n.', 'v':'v.', 'vt':'v.', 'vi':'v.', 'a':'adj.', 'adj':'adj.', 'adv':'adv.'}
# Plain dictionary entries are grouped by the primary Chinese sense. Unclassified
# general vocabulary stays explicitly in 通用表达 rather than inventing a GT scenario.
TOPIC_PATTERNS = [
 ('生活与住房', r'住房|住宅|房屋|居住|房间|公寓|租赁|租金|房东|租户|家具|家用|卧室|厨房|浴室|厕所|厨具|餐具|家务|屋顶|地板|墙壁|窗户|窗帘|被子|床铺|楼梯|门口|衣服|衣着|服装|衣领|裤|裙|衬衫|外套|毛衣|鞋子|袜子|洗涤|洗衣|烹饪|烤|食物|食品|食用|食物|蔬菜|水果|饮料|饮食|餐厅|饭店|面包|糕饼|饼干|蛋糕|奶油|牛奶|干酪|肉类|牛肉|猪肉|羊肉|鸡肉|鱼肉|豆|燕麦|稻|咖啡|牛油'),
 ('工作与职业', r'职业|工作|职位|职员|雇|就职|求职|招聘|薪|工资|加班|经理|雇员|商务|商业|营业|生意|业务|企业|公司|工厂|生产|制造|工业|产业|贸易|利润|财务|金融|财政|投资|投资|资产|资金|资本|收入|开支|费用|支出|预算|成本|支付|付款|货币|金钱|银行|贷款|借款|欠款|债|税|保险|合同|协定|协议|谈判|协商|客户|顾客|消费者|消费|购买|销售|出售|商店|商场|商品|货物|货品|货运|办公室|秘书|会计|律师|工程师|技师|董事|助理|人事|管理|经营|经济'),
 ('出行与服务', r'旅行|旅游|游客|旅客|旅馆|旅社|酒店|预订|订票|车票|机票|火车|铁路|地铁|车站|站台|机场|飞机|航空|航班|航行|船|港口|码头|交通|运输|车辆|汽车|自行车|公共汽车|出租车|驾驶|司机|乘客|行程|行李|乘坐|航行|道路|公路|街道|街|小路|车道|步行|行人|目的地|护照|签证|海关|出境|入境|服务|邮|快递|投递|递送|包裹|信箱|退款|偿还|报销|收据|发票|投诉|退货|退还'),
 ('健康与习惯', r'健康|患病|生病|疾病|病人|患者|病症|症状|治疗|疗法|医疗|医药|医师|医生|护士|护理|诊断|诊所|医院|药物|药剂|药品|疼痛|痛苦|受伤|损伤|伤口|康复|营养|肥胖|肥|焦虑|抑郁|压力|疲劳|休息|锻炼|运动|体育|健身|睡眠|睡觉|睡|发烧|发热|感冒|咳嗽|传染|感染|卫生|清洁|消毒|过敏|心理|精神|情绪|感情|情感|愉快|悲伤|恐惧|愤怒|高兴|快乐|饥饿|口渴|饮酒|吸烟|肌肉|心脏|肺|胃|血液|牙齿|肝|呼吸|消化|免疫|身体|体格'),
 ('社区与环境', r'社区|居民|公民|市民|市政|城镇|城市|乡村|农村|都市|人口|社会|文化|民族|种族|宗教|信仰|平等|不平等|公平|正义|公益|慈善|志愿|公共|政府|议会|选举|政治|政策|法律|法规|权利|义务|责任|犯罪|罪犯|警察|惩罚|处罚|安全|环境|生态|气候|天气|污染|废物|垃圾|废料|回收|能源|资源|自然|动物|植物|森林|树木|海洋|河|湖|海水|海岸|沙漠|土地|土壤|山|降雨|雨|洪水|干旱|地震|温度|季节|地球|保护|保存|排放|排出|电力|燃料|燃烧'),
 ('学习与沟通', r'学习|教育|学校|学生|教师|老师|教学|大学|学院|课程|课业|培训|训练|讲座|考试|考核|评估|考察|阅读|读书|读写|书写|写作|图书|图书馆|知识|学科|学术|技能|技术|科学|研究|方法|语言|词汇|单词|词语|语法|词典|字典|词义|拼写|发音|表达|通信|通讯|信件|信函|书信|信封|邮件|电话|对话|会话|说话|交谈|沟通|通知|告知|信息|消息|新闻|媒体|报纸|杂志|杂誌|出版|印刷|询问|咨询|请求|申请|道歉|建议|意见|解释|描述|阐述|说明|讨论|辩论|劝|劝说|说服|同意|否认|承认|宣布|声明|总结|概述|比较|判断|分析|计算|电脑|计算机|电子|网络|互联网|网站|数据|程序|软件|硬件'),
]
COMPILED = [(topic,re.compile(pattern)) for topic,pattern in TOPIC_PATTERNS]
SKIP_WORDS = set('fuck fucking shit piss damn bastard bitch cunt asshole bloody goddamn motherfucker sexy sex sexual sexuality porn pornography rape cock dick tits nipple prostitute prostitution sperm semen ejaculation intercourse erotic piss pissed fucking damned'.split())
SKIP_WORDS.update('david edward george henry james john mary michael paul richard robert peter smith york william thomas elizabeth charles jane jones jack susan andrew anthony joseph daniel ann anne kate tom david louis london paris chicago jesus christ catholic republican democrat nazi sexually sexuality mom mum dad kid guy yeah okay sir lord god heaven hell'.split())
SKIP_WORDS.update('english british american french chinese german italian spanish russian christian christ january february april june july august september october november december monday tuesday wednesday thursday friday saturday sunday africa asia europe australia canada india japan china britain england scotland wales ireland germany france italy spain russia london paris boston chicago washington oxford cambridge'.split())
SKIP_WORDS.update('about above across after ago all along another any around away before behind below beyond both but can could despite down each either else ever every few first how into last less many may might more most much must near next not nothing now off once one only other ought out over own same second several should since some such than that then there these they this those though through throughout till too toward under until upon very was were what when where whether which while who whole whom whose why will with within without would yes yet'.split())
VARIANTS = {
 'color':'colour','favorite':'favourite','center':'centre','neighbor':'neighbour','behavior':'behaviour','labor':'labour','traveling':'travelling','traveler':'traveller','canceled':'cancelled','canceling':'cancelling','organize':'organise','organization':'organisation','recognize':'recognise','realize':'realise','analyze':'analyse','apologize':'apologise','summarize':'summarise','theater':'theatre','meter':'metre','gray':'grey','honor':'honour','humor':'humour','defense':'defence','offense':'offence','license':'licence','enroll':'enrol','enrollment':'enrolment','fulfill':'fulfil','jewelry':'jewellery','catalog':'catalogue','program':'programme','check':'cheque','tire':'tyre',
}

def lines(text):
 return text.replace('\\n','\n').splitlines()
def positive(raw):
 try: return int(raw) if int(raw)>0 else 1000000
 except ValueError: return 1000000

def parse(row):
 word = row['word']
 if not re.fullmatch('[a-z]{3,16}',word) or word in existing or word in SKIP_WORDS: return None
 if re.search(r'(?:^|/)0:', row['exchange']): return None  # inflected headwords do not inflate the count
 senses=[]
 for line in lines(row['translation']):
  match = re.match(r'^(n|vt|vi|v|a|adj|adv)\.\s*(.+)',line.strip())
  if not match: continue
  pos,zh=POS[match[1]],match[2]
  if re.search(r'\[|\]|\(古|\(废|侮辱|粗俗|骂人|贬称|人名|姓氏|地名|缩写|缩写词',zh): continue
  zh=zh.replace('...', '…').replace(',', '，').strip()
  if not re.search('[\u4e00-\u9fff]',zh) or len(zh)>140: continue
  senses.append((pos,zh))
 if not senses: return None
 pos,zh=senses[0]
 meaning='；'.join(re.split('[，；;]',zh)[:4]).strip('； ')
 if len(meaning)<2: return None
 tag=row['tag'].split()
 bnc,frq=positive(row['bnc']),positive(row['frq'])
 frequency=math.sqrt(bnc*frq) if bnc<1000000 and frq<1000000 else min(bnc,frq)*1.3
 if frequency>18000 or (row['oxford']!='1' and 'ielts' not in tag and frequency>8000): return None
 if word in OVERRIDES: pos,meaning,_=OVERRIDES[word]
 definitions=[]
 expected={'n.':['n'],'v.':['v'],'adj.':['a','s'],'adv.':['r']}[pos]
 for line in lines(row['definition']):
  m=re.match(r'^([nvasr])\.?\s+(.+)',line.strip())
  if m and m[1] in expected:
   clean=m[2].replace('`',"'")
   if len(clean)<230: definitions.append(clean)
 topic=next((name for name,pattern in COMPILED if pattern.search(zh)), '通用表达')
 if word in OVERRIDES:
  override=OVERRIDES[word]; pos=override[0]; meaning=override[1]; topic=override[2]
 # Primary-sense topic classification is an editorial aid, not an official taxonomy.
 score=math.log(max(1,frequency)) - (1.15 if row['oxford']=='1' else 0) - (.45 if 'ielts' in tag else 0)
 return dict(word=word,pos=pos,meaning=meaning,definition=definitions[0] if definitions else '',
             phonetic=row['phonetic'],topic=topic,source='ECDICT',score=score,frequency=frequency,
             dictionaryMeanings='\n'.join(f'{p} {z}' for p,z in senses),tags=tag)

OVERRIDES=json.loads((ROOT/'scripts/vocabulary-overrides.json').read_text())
candidates={}
with source.open(newline='',encoding='utf-8-sig') as f:
 for row in csv.DictReader(f):
  item=parse(row)
  if item: candidates[item['word']]=item
# Prefer British variants only when both forms are present; do not conflate different
# senses such as check/cheque, program/programme or tire/tyre.
for american,british in VARIANTS.items():
 if american in {'check','program','tire','license'}: continue
 if british in candidates or british in existing: candidates.pop(american,None)
selected=sorted(candidates.values(),key=lambda v:(v['score'],v['word']))[:3000-len(existing)]
assert len(selected)+len(existing)==3000, 'Not enough eligible words'
# Keep all existing IDs and levels stable; add 940 words to each existing 60-word level.
foundation=set('aunt uncle grandfather grandmother grandparent cousin ceiling roof wall window door floor carpet bed blanket pillow curtain cupboard fridge oven spoon fork knife plate bowl bottle cup glass bread butter cake biscuit apple orange lemon onion potato tomato vegetable carrot rice beef meat fish salt sugar pepper salad soup tea coffee milk water juice bus train bicycle taxi passport suitcase luggage ticket holiday birthday autumn summer winter spring monday tuesday wednesday thursday friday saturday sunday morning afternoon evening midnight zero hundred thousand colour yellow blue red black white green pink purple grey brown dog cat bird horse cow sheep pig chicken mouse animal insect umbrella towel soap shower toilet bath wash clean tidy hungry thirsty sleep wake busy happy sad angry calm polite honest friendly helpful nice short tall fat thin young old loud quiet empty full'.split())
selected.sort(key=lambda v:(v['score'] + len(v['word'])*.12 - (2.5 if v['word'] in foundation else 0),v['word']))
for index,item in enumerate(selected):
 item['id']='word-'+item['word'];item['level']=index//940+1
 for k in ['score','frequency','tags']: item.pop(k)
result=sorted(selected,key=lambda v:v['word'])
out=ROOT/'js/content/extended.js'
out.write_text('// Generated by scripts/build-vocabulary.py; source and licence in VOCABULARY_SOURCES.md.\nexport const EXTENDED_VOCABULARY = '+ '[\n' + ',\n'.join(json.dumps(item,ensure_ascii=False,separators=(',',':')) for item in result) + '\n];\n',encoding='utf-8')
manifest={'source':'skywind3000/ECDICT','revision':SOURCE_REVISION,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'total':3000,'authored':len(existing),'dictionary':len(selected),'levels':{str(l):1000 for l in [1,2,3]},
 'topics':dict(Counter(v['topic'] for v in curated+result))}
(ROOT/'js/content/vocabulary-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(manifest,ensure_ascii=False,indent=2))
