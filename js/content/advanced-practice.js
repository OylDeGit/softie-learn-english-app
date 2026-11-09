// Original general-interest reading. These texts are not official IELTS papers.
export const LONG_READINGS = [
  {id:'reading-7',title:'借用物品的新习惯',type:'一般兴趣 · 长文',text:`On a Saturday morning in Millbrook, a queue forms outside a shop that sells nothing. Visitors have come to borrow objects from the town's Library of Things: a carpet cleaner, a tent or perhaps a machine for making pasta. The idea is straightforward. People pay a small annual membership fee, then reserve an item for a few days. Supporters argue that buying an object makes little sense if it will spend most of its life in a cupboard.

The library began when a group of neighbours compared the tools they owned. Almost every household had a drill, yet most people used it for only a few minutes each year. Sharing seemed an obvious solution. However, the organisers soon discovered that a collection of donated objects was not enough. Each item had to be checked, cleaned and stored. Users needed clear instructions, and someone had to manage reservations. The greatest challenge in the first year was finding volunteers who could maintain a regular schedule, rather than finding things to lend.

The service now employs a part-time coordinator. High-demand objects have modest borrowing charges, while many simpler tools remain free for members. These charges help cover repairs and insurance. Members pay for any materials they use, such as carpet-cleaning liquid. The library does not claim that sharing is always cheaper: someone who uses a tool every week may still benefit from owning one. Its strongest financial case concerns expensive equipment needed only occasionally.

Convenience is another limitation. An object may be unavailable when a member wants it, and collection requires a journey to the shop. To address this, the library has extended its Thursday opening hours and introduced a waiting list. It has not started home deliveries, because the cost would place pressure on its small budget. Members are encouraged to reserve early, particularly before holiday weekends.

There are benefits beyond saving money. Workshops bring experienced repairers together with beginners, and informal conversations often lead to further help between neighbours. The organisers believe that this social connection matters as much as the objects themselves. They also expect shared ownership to reduce unnecessary purchases, although they have not yet measured the project's overall environmental impact. Their next step is to collect information about what members would otherwise have bought, rather than assume that every loan prevents a purchase.`,questions:[
 {prompt:'What was the main difficulty during the first year?',hintZh:'第一年的主要困难是什么？',options:['Obtaining donated equipment','Maintaining a reliable volunteer schedule','Persuading shops to sell tools'],answer:1,explanation:'原文第二段：the greatest challenge ... finding volunteers who could maintain a regular schedule；并不是物品不足。'},
 {prompt:'The library suggests that frequent users may be better off owning a tool.',hintZh:'频繁使用工具的人可能更适合自己购买。',options:['True','False','Not Given'],answer:0,explanation:'第三段说明 someone who uses a tool every week may still benefit from owning one。'},
 {prompt:'Why has the library not introduced home delivery?',hintZh:'为什么没有推出送货到家？',options:['Residents prefer to collect items','It would put pressure on the budget','No members have asked for it'],answer:1,explanation:'第四段明确写到 the cost would place pressure on its small budget；没有说无人提出需求。'},
 {prompt:'The project has already measured its total environmental impact.',hintZh:'项目已经测量了总体环境影响。',options:['True','False','Not Given'],answer:1,explanation:'末段 although they have not yet measured ... 明确否定已经测量。'},
 {prompt:'Members are charged the same annual fee in every town.',hintZh:'每个城镇的会员年费都一样。',options:['True','False','Not Given'],answer:2,explanation:'文章只介绍 Millbrook 的项目，未比较其他城镇年费，不能用常识推断。'},
 ]},
 {id:'reading-8',title:'重新设计工作日',type:'一般兴趣 · 长文',text:`When a small design company in Northbridge introduced meeting-free mornings, some employees expected an immediate improvement in productivity. Others worried that useful discussions would disappear. The policy did not reduce working hours. Instead, it asked staff to avoid scheduling internal meetings before noon on three days each week. Client emergencies were exempt, and teams could still communicate through written messages.

The change followed a staff survey in which many designers described difficulty completing work that required sustained attention. A meeting lasting twenty minutes could interrupt a much longer period of concentration, particularly when preparation and the time needed to return to a task were included. Managers had previously counted meeting hours but had paid less attention to how those hours were distributed across the week. The new policy aimed to create predictable blocks of time, rather than declare all meetings unnecessary.

During the trial, employees were asked to record two things: whether they had completed their planned tasks, and how manageable their workload felt. The company deliberately avoided using the number of messages sent as a measure of productivity. A high volume of messages might indicate effective cooperation, but it could also mean that instructions were unclear. After six weeks, a majority of survey respondents reported finding it easier to finish complex tasks. However, this was a report of their experience, not independent evidence that the company was producing more work.

The trial also revealed difficulties. New employees sometimes waited too long to ask simple questions because they did not want to disturb anyone. In response, each team introduced a short, optional help session just before lunch. Managers reminded staff that the policy protected concentration, not silence at any cost. The company also retained a weekly face-to-face planning meeting, where disagreements could be discussed more easily than in a long chain of messages.

Researchers who study workplace organisation caution against assuming that one timetable will suit every organisation. A customer-service team may need frequent immediate communication, while a design team may benefit from longer uninterrupted periods. Individual circumstances matter too: an employee working across time zones may have limited opportunities to speak with colleagues. The Northbridge company therefore intends to review the arrangement every three months and allow teams to request changes. Its experience suggests that a useful policy needs a clear purpose, feedback from staff and room for adjustment, rather than a rule that becomes impossible to question.`,questions:[
 {prompt:'What did the new policy change?',hintZh:'新政策改变了什么？',options:['The total number of working hours','The timing of most internal meetings on certain days','The requirement to attend client meetings'],answer:1,explanation:'第一段：did not reduce working hours；限制的是每周三天中午之前的内部会议安排，并允许客户紧急情况例外。'},
 {prompt:'Managers had always considered the distribution of meetings carefully.',hintZh:'经理一直仔细考虑会议在一周中的分布。',options:['True','False','Not Given'],answer:1,explanation:'第二段 had paid less attention to how those hours were distributed，与题目 always ... carefully 相矛盾。'},
 {prompt:'Why was message volume not used to measure productivity?',hintZh:'为何不用消息数量衡量生产率？',options:['Messages were impossible to count','More messages could reflect unclear instructions','Staff refused to use written communication'],answer:1,explanation:'第三段说明消息多可能是合作顺利，也可能说明 instructions were unclear，不能简单等同效率。'},
 {prompt:'An independent assessment proved that the company produced more work.',hintZh:'独立评估证明公司产出更多。',options:['True','False','Not Given'],answer:1,explanation:'第三段明确说员工感受 not independent evidence that the company was producing more work。'},
 {prompt:'What is the main conclusion of the final paragraph?',hintZh:'末段的主要结论是什么？',options:['The same schedule should be compulsory everywhere','Workplace policies should allow feedback and adjustment','Customer-service teams do not need planning'],answer:1,explanation:'末段总结 clear purpose, feedback from staff and room for adjustment；不主张所有组织使用同一时间表。'},
 ]},
];
const rows = [
 ['教育','Some people think adults should receive financial support to learn new skills. What benefits could this bring?',
  ['明确表达你对成人培训支持的观点','解释一个具体好处及其原因','给出一个与观点相关的例子'],
  'Adult training can improve access to employment. This is because practical courses help workers develop skills that local employers need. For example, an affordable evening course in bookkeeping may allow a shop assistant to apply for an administrative role. Support should be targeted at people who would otherwise struggle to pay the fees, so that limited public resources are used effectively.',
  ['access to employment','develop practical skills','course fees'],['employment','skill','affordable','course']],
 ['工作','Employers sometimes offer flexible working hours. Explain one advantage and one difficulty.',
  ['提出弹性工作的一项优势','解释一个实施困难','说明怎样应对这一困难'],
  'Flexible working hours can help employees balance their responsibilities at home and at work. A parent, for instance, may start earlier so that they can collect a child from school. However, teams still need time to communicate. An employer could address this by agreeing on a few shared hours each day, while allowing staff to choose when they complete the rest of their work.',
  ['flexible working hours','balance responsibilities','shared hours'],['flexible','employee','responsibility','employer']],
 ['交通','A town wants to reduce traffic congestion. Explain whether better public transport would help.',
  ['明确回应公共交通是否有帮助','解释出行选择与拥堵的关系','提出一个实施条件或限制'],
  'Improving public transport could reduce congestion if services are frequent and reliable. People are more likely to leave their cars at home when a bus offers a convenient alternative. Lower fares alone may not be enough, however, if the route does not connect residential areas with workplaces. A town should therefore review both service coverage and the timetable before expecting a major change in travel habits.',
  ['reduce congestion','a convenient alternative','service coverage'],['congestion','reliable','convenient','route']],
 ['环境','What could encourage households to reduce waste? Explain one practical measure.',
  ['提出一个明确可行的措施','说明措施如何减少浪费','举例并避免夸大效果'],
  'Local councils could make it easier for households to separate recyclable materials. Clear labels and a regular collection service would reduce confusion about where different items belong. For example, a simple picture guide could show which plastic containers are accepted. This would not remove all waste, but it could improve participation in recycling when combined with accessible collection points.',
  ['separate recyclable materials','collection service','improve participation'],['council','household','waste','participation']],
 ['健康','Some communities provide free exercise activities. Explain a possible benefit and a limitation.',
  ['指出免费活动可能带来的益处','解释参与门槛或持续性问题','提出一个针对性的改进办法'],
  'Free community exercise sessions can make an active lifestyle more accessible. Removing the fee may encourage residents who cannot afford a gym membership to take part. Yet cost is not the only barrier: an evening session may be unsuitable for someone who works at night. Offering activities at different times could therefore help a wider range of people participate regularly.',
  ['an active lifestyle','a barrier to participation','a wider range of people'],['active','resident','afford','regular']],
 ['社区','Should local residents have a say in how community spaces are used? Explain your view.',
  ['清楚表达是否支持居民参与','解释参与可能改善哪些决策','用一个具体社区空间举例'],
  'Residents should have opportunities to influence decisions about shared spaces because they understand many local needs. A community centre, for example, might be used for adult classes during the day and youth activities in the evening. Consulting different groups could reveal this demand before money is spent. The council would still need to consider safety and its budget, rather than assume that every suggestion can be adopted.',
  ['influence decisions','shared spaces','consider local needs'],['resident','community','opportunity','budget']],
];
export const OPINIONS = rows.map(([topic,prompt,points,model,phrases,words],i)=>({id:`opinion-${i+1}`,title:`${topic} · 观点段落`,topic,prompt,points,model,phrases,words}));
export const ENGLISH_READING_PROMPTS = [
 ['What time does the library open on Wednesdays during the repairs?','Books may be returned through the outdoor box in the evening.','Computer use is free during the repairs.'],
 ['Which cost is NOT included in the rent?','How much is the deposit?','Visitors may view the room without arranging a time.'],
 ['Within how many days must a travel expense claim be submitted?','A first-class ticket can be approved after the journey.','Ordinary commuting costs can be claimed.'],
 ['Where is the safety induction held?','The online introduction can replace the face-to-face session.','Lunch is provided during the training.'],
 ['When can an off-peak member enter the centre?','If cancellation notice is received on 15 June, when will membership end?','Instructor-led classes are included in the monthly fee.'],
 ['How should visitors take part in repairs?','Who must pay for replacement parts?','Every item is guaranteed to be repaired.'],
];
export const ENGLISH_READING_OPTIONS = [
 [['9 a.m.','10 a.m.','4 p.m.'],null,null],
 [['Water','Internet','Electricity'],['£310','£620','£1,240'],null],
 [['7 days','30 days','6 months'],null,null],
 [['On the warehouse floor','Training Room B','The Human Resources office'],null,null],
 [['Saturday morning','10 a.m. on a weekday','6 p.m. on a weekday'],['15 June','30 June','31 July'],null],
 [['Leave the item and go home','Work alongside the volunteers','Watch an online demonstration'],['The item’s owner','The volunteers','The venue'],null],
];
