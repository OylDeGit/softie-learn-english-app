// Fixed-answer micro practice. Feedback is specific to the displayed context.
const rows=[
 ['词族','Choose the noun: Full-time ____ is available at the new store.',['employ','employment','employed'],1,'employment 是“就业/工作”的名词，full-time employment 表示全职工作。employ 是动词。'],
 ['词族','每位新员工都收到工牌：Every new ____ receives an ID badge.',['employment','employ','employee'],2,'employee 指雇员；employment 指就业，不能用来指领取工牌的人。'],
 ['词族','Please submit your ____ before Friday.',['apply','application','applicable'],1,'submit 后需要名词作宾语；submit an application 表示提交申请。'],
 ['词族','I am ____ for checking the equipment.',['responsibility','responsible','responsibly'],1,'be responsible for 后接职责；responsibility 是名词，responsibly 是副词。'],
 ['词族','Regular ____ is essential for this machine.',['maintain','maintenance','maintained'],1,'maintenance 是维护的名词，regular maintenance 表示定期维护。'],
 ['词族','Staff ____ in the workshop has increased.',['participate','participatory','participation'],2,'这里需要名词 participation 表示参与，participate 是动词。'],
 ['词族','A clear ____ will be provided at the start.',['explanation','explain','explanatory'],0,'a clear 后需要名词；explanation 表示解释，explanatory 是形容词。'],
 ['词族','You must receive written ____ before booking.',['approve','approving','approval'],2,'written approval 表示书面批准；approve 是批准的动词。'],
 ['词族','Choose the adjective: We offer ____ courses for adults.',['education','educational','educate'],1,'educational 是形容词，可修饰 courses；education 是名词。'],
 ['词族','Her ____ from the injury took several weeks.',['recover','recovered','recovery'],2,'recovery 是康复的名词；recovery from an injury 表示伤后康复。'],
 ['改写','The price excludes electricity. Which meaning is preserved?',['Electricity is included in the price.','Electricity must be paid for separately.','Electricity cannot be used.'],1,'excludes 表示不包含。另付费用不等于不能使用，也不等于已含在价格里。'],
 ['改写','Cancelling a room booking requires at least 48 hours’ notice before arrival. Which is equivalent?',['Cancel no later than two days before arrival.','Cancel within two days after arrival.','Any cancellation is free.'],0,'at least 48 hours’ notice 要求至少提前 48 小时；原文没有说明是否免费。'],
 ['改写','First-class travel requires prior written approval. What does prior mean here?',['After the journey','Before the journey','At any time'],1,'prior 表示事先，不能把出发前批准改成事后批准。'],
 ['改写','Attendance at the workshop is optional. Which statement agrees?',['Everyone must attend.','Attendance is not required.','The workshop has been cancelled.'],1,'optional 表示可自愿选择；不强制出席，不等于活动取消。'],
 ['改写','Employees are entitled to 20 days of annual leave. This means they…',['must work for only 20 days','have a right to receive 20 days of yearly leave','must take leave every 20 days'],1,'be entitled to 表示有权享有；annual 表示每年，不表示每隔 20 天。'],
 ['改写','The shop offered a full refund. Which meaning fits?',['The customer could get all the money back.','The customer had to buy another item.','The shop offered only a repair.'],0,'a full refund 指全额退款。更换、维修和退款是不同处理方式。'],
 ['改写','The meeting has been postponed until next week. It has been…',['cancelled permanently','brought forward to today','moved to a later date'],2,'postpone 表示推迟，保留稍后举行的安排；不是永久取消，也不是提前。'],
 ['改写','Membership costs £60 annually. How often is the fee charged?',['Every month','Once a year','Once every two years'],1,'annually 表示每年，与 monthly、every two years 的时间范围不同。'],
 ['改写','Ordinary commuting costs are not covered. Which agrees?',['All business travel claims are refused.','Regular travel between home and work cannot be reimbursed.','Staff must not travel to work.'],1,'ordinary commuting 特指日常通勤；不能扩大为所有差旅，也不是禁止出行。'],
 ['改写','The service operates on weekdays only. Which day is outside this schedule?',['Tuesday','Thursday','Sunday'],2,'weekdays 通常指周一至周五。这里的 only 排除了星期日。'],
];
export const LANGUAGE_DRILLS=rows.map(([kind,prompt,options,answer,explanation],i)=>({id:`drill-${i+1}`,kind,prompt,options,answer,explanation}));
