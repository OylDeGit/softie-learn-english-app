// Original General Training practice; not an official IELTS word list.
// word | word class | meaning | collocation | collocation meaning | cloze | translation.
// Ten words per level in each topic: foundation, core, extension.
export const TOPICS = ['生活与住房', '工作与职业', '出行与服务', '健康与习惯', '社区与环境', '学习与沟通'];
const groups = [
`rent|n.|租金|pay the rent|支付租金|The monthly ____ includes water charges.|每月租金包括水费。
deposit|n.|押金|a refundable deposit|可退还的押金|Please return my ____ after I move out.|请在我搬走后退还我的押金。
tenant|n.|租客|a new tenant|新租客|Each ____ receives a key to the main entrance.|每位租客都会获得一把大门钥匙。
landlord|n.|房东|contact the landlord|联系房东|Our ____ has agreed to fix the broken heater.|我们的房东已同意修理坏掉的暖气设备。
furniture|n.|家具（不可数）|second-hand furniture|二手家具|The flat comes with basic ____ and kitchen equipment.|这套公寓配有基本家具和厨房设备。
kitchen|n.|厨房|a shared kitchen|共用厨房|Residents must clean the ____ after preparing meals.|住户做完饭后必须清理厨房。
bill|n.|账单|a utility bill|水电等公共事业账单|I am writing to query my latest electricity ____.|我写信是想询问最近一张电费账单。
heating|n.|供暖|central heating|中央供暖|The ____ has not worked since Monday.|供暖从周一起就无法正常运作。
repair|n.|修理|an urgent repair|紧急维修|The leaking roof needs an urgent ____.|漏水的屋顶需要紧急维修。
neighbour|n.|邻居|a considerate neighbour|体贴的邻居|Our ____ kindly collects our post when we travel.|我们出门旅行时，邻居会好心帮忙收信。
accommodation|n.|住宿（不可数）|temporary accommodation|临时住宿|Could you recommend affordable ____ near the station?|你能推荐车站附近价格实惠的住宿吗？
household|n.|家庭；住户|household expenses|家庭开支|Each ____ is responsible for sorting its rubbish.|每户家庭都有责任将垃圾分类。
appliance|n.|家用电器|a faulty appliance|有故障的家电|Please unplug the ____ before cleaning it.|清洁这件家电前，请先拔掉插头。
facility|n.|设施|a laundry facility|洗衣设施|The building has a laundry ____ on the ground floor.|这栋楼在底层设有洗衣设施。
maintenance|n.|维护；保养|routine maintenance|例行维护|The lift is closed for routine ____.|电梯因例行维护暂停使用。
spacious|adj.|宽敞的|a spacious flat|宽敞的公寓|We need a more ____ flat for our growing family.|我们家人口增多，需要一套更宽敞的公寓。
affordable|adj.|负担得起的|affordable housing|负担得起的住房|Young workers often struggle to find ____ housing.|年轻工作者常常难以找到负担得起的住房。
convenient|adj.|便利的|a convenient location|便利的位置|The location is ____ for people who travel by bus.|这个位置对乘公交车出行的人很便利。
reliable|adj.|可靠的|a reliable service|可靠的服务|We are looking for a ____ cleaning service.|我们正在寻找可靠的保洁服务。
temporary|adj.|临时的|a temporary arrangement|临时安排|Staying with friends is only a ____ arrangement.|住在朋友家只是临时安排。
residential|adj.|住宅区的|a residential area|住宅区|The property is in a quiet ____ area.|这处房产位于一个安静的住宅区。
renovate|v.|翻新|renovate a property|翻新房产|The owners plan to ____ the old house next summer.|房主计划明年夏天翻新这栋旧房子。
replace|v.|更换|replace a broken lock|更换坏掉的锁|Could you ____ the broken lock this week?|你能在本周更换坏掉的锁吗？
install|v.|安装|install a smoke alarm|安装烟雾报警器|The owner must ____ a smoke alarm in the hallway.|房主必须在走廊安装烟雾报警器。
inspect|v.|检查；查看|inspect the property|检查房产|We would like to ____ the property before signing.|我们想在签字前查看这处房产。
allocate|v.|分配|allocate a budget|分配预算|We should ____ more of our budget to essential repairs.|我们应将更多预算分配给必要的维修。
negotiate|v.|协商|negotiate the rent|协商租金|Is it possible to ____ the rent before renewing?|续租之前可以协商租金吗？
furnish|v.|为房屋配备家具|furnish a flat|为公寓配备家具|We need to ____ the flat before the tenants arrive.|我们需要在租客到来前为公寓配好家具。
insulate|v.|为……隔热|insulate the roof|为屋顶隔热|Better materials can help ____ the roof in winter.|更好的材料有助于在冬天为屋顶隔热。
relocate|v.|搬迁|relocate for work|因工作搬迁|My family may need to ____ when I change jobs.|我换工作时，全家可能需要搬迁。`,
`salary|n.|薪水|an annual salary|年薪|The advertised ____ is paid in monthly instalments.|招聘广告上的薪水按月分期支付。
shift|n.|轮班；班次|work a night shift|上夜班|Would you be able to cover my evening ____?|你能替我上晚班吗？
deadline|n.|截止日期|meet a deadline|赶上截止日期|Could we extend the ____ by two working days?|我们能把截止日期延长两个工作日吗？
colleague|n.|同事|a supportive colleague|乐于支持的同事|A ____ helped me learn the new booking system.|一位同事帮我学会了新的预订系统。
employer|n.|雇主|a prospective employer|潜在雇主|Your ____ must provide a safe working environment.|你的雇主必须提供安全的工作环境。
employee|n.|雇员|a full-time employee|全职雇员|Each ____ is entitled to a lunch break.|每位雇员都有权享有午餐休息时间。
task|n.|任务|complete a task|完成任务|Please complete this ____ before the office closes.|请在办公室关门前完成这项任务。
meeting|n.|会议|attend a meeting|参加会议|I cannot attend the ____ because of a medical appointment.|因为要去看医生，我无法参加会议。
contract|n.|合同|sign a contract|签订合同|Please read the ____ carefully before accepting the offer.|接受录用前，请仔细阅读合同。
training|n.|培训|on-the-job training|在职培训|New staff receive ____ during their first week.|新员工在第一周接受培训。
vacancy|n.|职位空缺|a job vacancy|职位空缺|I am writing to enquire about the advertised ____.|我写信是想咨询广告中的职位空缺。
recruit|v.|招聘|recruit new staff|招聘新员工|The company plans to ____ more staff before summer.|公司计划在夏季前招聘更多员工。
experience|n.|经验（不可数义）|relevant experience|相关经验|I have three years of ____ in customer service.|我有三年的客户服务经验。
qualification|n.|资格；资历|a professional qualification|专业资格|The role requires a recognised teaching ____.|这个职位要求持有获认可的教学资格。
promotion|n.|晋升|apply for promotion|申请晋升|She received a ____ after leading the project successfully.|她成功带领项目后获得了晋升。
overtime|n.|加班|work overtime|加班|Staff should obtain approval before working ____.|员工在加班前应获得批准。
workload|n.|工作量|manage a heavy workload|应对繁重工作量|My ____ has increased since two team members left.|自两名团队成员离职后，我的工作量增加了。
flexible|adj.|灵活的|flexible working hours|弹性工作时间|Parents may benefit from ____ working hours.|家长可能受益于弹性工作时间。
permanent|adj.|长期的；永久的|a permanent position|长期职位|I am seeking a ____ position rather than seasonal work.|我正在寻找长期职位，而不是季节性工作。
efficient|adj.|高效的|an efficient system|高效的系统|The new system makes processing orders more ____.|新系统使订单处理更加高效。
responsible|adj.|负责的；承担责任的|be responsible for|负责……|I am ____ for organising the weekly staff rota.|我负责安排每周的员工轮值表。
collaborate|v.|合作|collaborate with colleagues|与同事合作|We often ____ with teams in other offices.|我们经常与其他办公室的团队合作。
supervise|v.|监督；指导|supervise a team|管理团队|The successful applicant will ____ a small sales team.|获聘者将管理一个小型销售团队。
evaluate|v.|评估|evaluate performance|评估表现|Managers should ____ performance using clear criteria.|管理者应使用明确的标准评估工作表现。
productivity|n.|生产效率|improve productivity|提高生产效率|Regular breaks may improve staff ____.|定期休息可能提高员工的生产效率。
motivation|n.|积极性；动力|employee motivation|员工积极性|Recognition can increase ____ among team members.|认可可以提升团队成员的积极性。
initiative|n.|主动性|show initiative|表现主动性|The role suits someone who can show ____ without supervision.|这个职位适合能在无人监督时表现主动性的人。
entitlement|n.|应享有的权利|holiday entitlement|休假权益|Please check your annual leave ____ with human resources.|请向人力资源部门确认你的年假权益。
redundancy|n.|裁员；职位被撤销|redundancy pay|裁员补偿金|Workers affected by ____ will receive career advice.|因裁员而受影响的员工将获得职业建议。
occupational|adj.|职业的|occupational health|职业健康|The policy aims to reduce ____ health risks.|这项政策旨在降低职业健康风险。`,
`journey|n.|行程；旅程|a return journey|返程|The return ____ takes about forty minutes.|返程大约需要四十分钟。
ticket|n.|票|a single ticket|单程票|I would like a single ____ to the city centre.|我想买一张到市中心的单程票。
luggage|n.|行李（不可数）|lost luggage|丢失的行李|My ____ did not arrive on the same flight.|我的行李没有随同一航班抵达。
platform|n.|站台|the departure platform|出发站台|The train to Bristol leaves from ____ six.|开往布里斯托尔的列车从六号站台发车。
arrival|n.|抵达|on arrival|抵达时|Please collect your room key on ____.|请在抵达时领取房间钥匙。
departure|n.|出发|the departure time|出发时间|The ____ time has changed to half past nine.|出发时间已改为九点半。
delay|n.|延误|a lengthy delay|长时间延误|We apologise for the ____ caused by the signal failure.|对于信号故障造成的延误，我们深表歉意。
route|n.|路线|an alternative route|替代路线|Drivers should use an alternative ____ during the closure.|封路期间，驾驶员应使用替代路线。
vehicle|n.|车辆|a private vehicle|私人车辆|You must register your ____ before using this car park.|使用此停车场前，你必须登记车辆。
refund|n.|退款|request a refund|申请退款|I would like a full ____ for the cancelled trip.|我想为被取消的行程申请全额退款。
reservation|n.|预订|confirm a reservation|确认预订|Could you confirm my ____ for Friday evening?|你能确认我周五晚上的预订吗？
cancellation|n.|取消|a cancellation fee|取消费用|The hotel charges a fee for late ____.|酒店对临时取消预订收取费用。
passenger|n.|乘客|passenger information|乘客信息|Each ____ may bring one small bag on board.|每位乘客可携带一个小包登乘。
itinerary|n.|行程安排|a detailed itinerary|详细行程安排|Please send me a detailed ____ before the tour begins.|请在旅行开始前发给我详细的行程安排。
destination|n.|目的地|a popular destination|热门目的地|The island is a popular ____ for family holidays.|这座岛是家庭度假的热门目的地。
transfer|n.|接送；转乘|an airport transfer|机场接送|Does the room price include an airport ____?|房价是否包含机场接送？
accessible|adj.|无障碍的；易于到达的|wheelchair accessible|轮椅可通行的|The entrance is ____ to wheelchair users.|这个入口方便轮椅使用者通行。
valid|adj.|有效的|a valid ticket|有效车票|This ticket is only ____ on the date shown.|这张票仅在标注的日期有效。
available|adj.|可获得的；有空的|available seats|可用座位|Are any seats ____ on the earlier train?|较早的那班火车还有座位吗？
frequent|adj.|频繁的|a frequent service|班次频繁的服务|There is a ____ bus service between the two towns.|这两个城镇之间有班次频繁的公交服务。
transport|n.|交通运输|public transport|公共交通|Better public ____ could reduce car use.|改善公共交通可能减少汽车使用。
commute|v.|通勤|commute to work|通勤上班|Many residents ____ to work by train.|许多居民乘火车通勤上班。
confirm|v.|确认|confirm a booking|确认预订|Please ____ the booking by email before tomorrow.|请在明天之前通过电子邮件确认预订。
postpone|v.|推迟|postpone a trip|推迟旅行|We need to ____ the trip because of the storm.|由于暴风雨，我们需要推迟旅行。
reimburse|v.|报销；偿还|reimburse travel expenses|报销差旅费|The company will ____ reasonable travel expenses.|公司将报销合理的差旅费。
navigate|v.|辨路；确定行进方向|navigate unfamiliar streets|在陌生街道辨路|A map can help visitors ____ unfamiliar streets.|地图可以帮助游客在陌生街道辨路。
disruption|n.|中断；扰乱|service disruption|服务中断|Engineering work may cause ____ to weekend services.|工程施工可能导致周末服务中断。
congestion|n.|拥堵|traffic congestion|交通拥堵|More cycle lanes could ease traffic ____.|增加自行车道可能缓解交通拥堵。
sustainable|adj.|可持续的|sustainable travel|可持续出行|Cycling is a more ____ way to travel locally.|骑自行车是在本地出行的一种更可持续的方式。
pedestrian|n.|行人|a pedestrian crossing|人行横道|Every ____ should use the marked crossing.|每位行人都应使用标示的人行横道。`,
`diet|n.|饮食|a balanced diet|均衡饮食|A healthy ____ includes a variety of vegetables.|健康饮食包含多种蔬菜。
exercise|n.|锻炼|regular exercise|定期锻炼|Regular ____ can help people sleep better.|定期锻炼可以帮助人们睡得更好。
symptom|n.|症状|a common symptom|常见症状|A persistent cough can be a ____ of illness.|持续咳嗽可能是疾病的一种症状。
treatment|n.|治疗|medical treatment|医疗治疗|The clinic provides ____ for minor injuries.|这家诊所提供轻伤治疗。
medicine|n.|药物|take medicine|服药|Ask the pharmacist how to take this ____.|请询问药剂师如何服用这种药。
appointment|n.|预约|make an appointment|预约|I would like to make an ____ with the nurse.|我想预约见护士。
patient|n.|病人|a new patient|新病人|Each ____ should complete the registration form.|每位病人都应填写登记表。
clinic|n.|诊所|a local clinic|本地诊所|The local ____ is open until six on weekdays.|本地诊所在工作日营业至六点。
injury|n.|受伤；伤害|a minor injury|轻伤|He returned to work after recovering from a knee ____.|膝盖受伤康复后，他恢复了工作。
recovery|n.|康复|a full recovery|完全康复|We wish you a speedy ____ after your operation.|祝你手术后早日康复。
balanced|adj.|均衡的|balanced meals|均衡的膳食|Schools should provide ____ meals for children.|学校应为儿童提供均衡的膳食。
active|adj.|活跃的；积极活动的|an active lifestyle|积极活动的生活方式|Walking regularly helps older people stay ____.|经常散步有助于老年人保持活力。
regular|adj.|定期的|regular check-ups|定期检查|The dentist recommends ____ check-ups.|牙医建议进行定期检查。
beneficial|adj.|有益的|beneficial to health|有益于健康|Spending time outdoors can be ____ to mental health.|在户外活动可能有益于心理健康。
harmful|adj.|有害的|harmful effects|有害影响|Smoking has ____ effects on people's health.|吸烟对健康有有害影响。
prevent|v.|预防|prevent illness|预防疾病|Good hygiene can help ____ the spread of infection.|良好的卫生习惯有助于预防感染传播。
improve|v.|改善|improve wellbeing|改善身心健康|Small changes to daily habits may ____ wellbeing.|日常习惯的小改变可能改善身心健康。
reduce|v.|减少|reduce stress|减轻压力|Regular breaks may help ____ stress at work.|定期休息可能有助于减轻工作压力。
recover|v.|康复；恢复|recover from an injury|从伤病中恢复|It may take time to ____ from a serious injury.|从严重受伤中恢复可能需要时间。
maintain|v.|维持|maintain good health|保持良好健康状况|Staying physically active can help ____ good health.|保持身体活动有助于维持良好的健康状况。
wellbeing|n.|身心健康|mental wellbeing|心理健康|Supportive friendships can contribute to our ____.|支持性的友谊有助于我们的身心健康。
nutrition|n.|营养|good nutrition|良好营养|The workshop explains the importance of good ____.|这次讲座讲解良好营养的重要性。
obesity|n.|肥胖|childhood obesity|儿童肥胖|The report examines the causes of childhood ____.|这份报告研究儿童肥胖的原因。
anxiety|n.|焦虑|experience anxiety|感到焦虑|Some people experience ____ before a job interview.|有些人在求职面试前会感到焦虑。
fatigue|n.|疲劳|mental fatigue|精神疲劳|Long working hours can lead to ____.|长时间工作可能导致疲劳。
immunity|n.|免疫力|natural immunity|自然免疫力|The session explores how the body develops ____.|这次课程探讨人体如何形成免疫力。
sedentary|adj.|久坐不动的|a sedentary lifestyle|久坐的生活方式|Office workers often have a ____ lifestyle.|办公室工作人员往往过着久坐的生活。
moderate|adj.|适度的|moderate exercise|适度运动|For many people, walking is a form of ____ exercise.|对许多人而言，步行是一种适度运动。
chronic|adj.|慢性的|a chronic condition|慢性病|The service supports people living with a ____ condition.|这项服务支持患有慢性病的人。
rehabilitation|n.|康复训练|a rehabilitation programme|康复训练计划|The centre offers ____ after serious injuries.|该中心提供严重受伤后的康复训练。`,
`rubbish|n.|垃圾（不可数）|collect rubbish|收集垃圾|Please put your ____ in the bins provided.|请把垃圾放进所提供的垃圾桶。
waste|n.|废弃物；浪费|food waste|食物浪费|Planning meals can help cut food ____.|规划膳食有助于减少食物浪费。
recycle|v.|回收利用|recycle paper|回收纸张|Residents can ____ paper at the local collection point.|居民可以在本地收集点回收纸张。
pollution|n.|污染|air pollution|空气污染|Heavy traffic contributes to air ____.|繁忙的交通会造成空气污染。
energy|n.|能源|save energy|节约能源|Turning off unused lights can save ____.|关掉不用的灯可以节约能源。
resource|n.|资源|a natural resource|自然资源|Fresh water is a valuable natural ____.|淡水是一种宝贵的自然资源。
traffic|n.|交通；车流|heavy traffic|繁忙的交通|There is heavy ____ outside the school each morning.|每天早晨学校外的交通都很繁忙。
safety|n.|安全|road safety|道路安全|Better street lighting can improve public ____.|更好的路灯照明可以提高公共安全水平。
charity|n.|慈善机构|a local charity|本地慈善机构|A local ____ provides meals for people in need.|一家本地慈善机构为有需要的人提供餐食。
volunteer|n.|志愿者|a volunteer role|志愿服务岗位|Each ____ gives a few hours of their time each week.|每位志愿者每周贡献几个小时的时间。
community|n.|社区|the local community|本地社区|The new centre will benefit the whole ____.|新中心将使整个社区受益。
resident|n.|居民|a local resident|本地居民|Every ____ can comment on the council's proposal.|每位居民都可以对市政部门的提案发表意见。
council|n.|地方议会；市政部门|the local council|地方议会|The ____ is responsible for maintaining local parks.|市政部门负责维护本地公园。
crime|n.|犯罪|prevent crime|预防犯罪|Improved lighting may help prevent ____ in the area.|改善照明可能有助于预防该地区的犯罪。
public|adj.|公共的|public services|公共服务|The library is an important ____ service.|图书馆是一项重要的公共服务。
local|adj.|本地的|local businesses|本地企业|We should support ____ shops in our neighbourhood.|我们应该支持社区中的本地商店。
social|adj.|社会的；社交的|social interaction|社交互动|Community events encourage ____ interaction.|社区活动促进社交互动。
equal|adj.|平等的|equal opportunities|平等的机会|Everyone should have ____ access to public services.|每个人都应平等地获得公共服务。
rural|adj.|乡村的|rural communities|乡村社区|People in ____ areas may have fewer bus services.|乡村地区的人可能享有较少的公交服务。
urban|adj.|城市的|urban development|城市发展|Rapid ____ growth can put pressure on housing.|快速的城市扩张可能给住房带来压力。
protect|v.|保护|protect the environment|保护环境|We should ____ local wildlife from harmful waste.|我们应保护本地野生动物免受有害废弃物影响。
conserve|v.|节约；保护保存|conserve water|节约用水|Households can ____ water by fixing leaking taps.|住户可以通过修理漏水龙头来节约用水。
campaign|n.|宣传活动|a recycling campaign|回收宣传活动|The school launched a ____ to reduce plastic use.|学校发起了一项减少塑料使用的宣传活动。
enforce|v.|执行；强制实施|enforce regulations|执行法规|The council needs to ____ parking regulations fairly.|市政部门需要公平地执行停车规定。
regulate|v.|监管|regulate an industry|监管行业|Governments should ____ industries that produce harmful waste.|政府应监管产生有害废弃物的行业。
diversity|n.|多样性|cultural diversity|文化多样性|The festival celebrates the cultural ____ of the town.|这个节日庆祝小镇的文化多样性。
inequality|n.|不平等|income inequality|收入不平等|Better access to education may reduce social ____.|更好的教育机会可能减少社会不平等。
infrastructure|n.|基础设施|transport infrastructure|交通基础设施|Growing towns need investment in transport ____.|发展中的城镇需要对交通基础设施进行投资。
responsibility|n.|责任|take responsibility|承担责任|We all have a ____ to keep shared spaces clean.|我们都有责任保持公共空间整洁。
participation|n.|参与|community participation|社区参与|The project encourages ____ in local decision-making.|这个项目鼓励参与本地决策。`,
`course|n.|课程|enrol on a course|报名课程|I would like to enrol on the evening English ____.|我想报名晚间英语课程。
lesson|n.|课；一节课|a private lesson|一对一课程|Could we arrange an extra ____ before the test?|我们能在测试前安排一节额外的课吗？
tutor|n.|辅导教师|a personal tutor|个人辅导教师|My ____ gives me feedback on my writing.|我的辅导教师会对我的写作提供反馈。
subject|n.|学科|a favourite subject|最喜欢的学科|History was my favourite ____ at school.|历史是我在学校时最喜欢的学科。
library|n.|图书馆|a library card|借书证|You need a card to borrow books from the ____.|从图书馆借书需要一张借书证。
advice|n.|建议（不可数）|practical advice|实用建议|I would appreciate your ____ on choosing a course.|对于选课，我希望得到你的建议。
skill|n.|技能|a practical skill|实用技能|Cooking is a useful ____ for people living alone.|烹饪对于独居的人来说是一项有用的技能。
knowledge|n.|知识（不可数）|practical knowledge|实用知识|The course will develop your ____ of basic first aid.|这门课将增进你的基础急救知识。
language|n.|语言|a second language|第二语言|Learning another ____ can improve employment opportunities.|学习另一门语言可以改善就业机会。
feedback|n.|反馈（不可数）|constructive feedback|建设性的反馈|Thank you for your helpful ____ on my application.|感谢你对我的申请提供有益的反馈。
enquiry|n.|询问；咨询|make an enquiry|进行咨询|I am writing to make an ____ about evening classes.|我写信是想咨询晚间课程。
complaint|n.|投诉|make a formal complaint|提出正式投诉|I wish to make a ____ about the service I received.|我想对我所接受的服务提出投诉。
apology|n.|道歉|a sincere apology|诚恳的道歉|Please accept my sincere ____ for missing our meeting.|请接受我因缺席会议而表达的诚恳道歉。
request|n.|请求|a reasonable request|合理的请求|Thank you for considering my ____ for additional leave.|感谢你考虑我增加假期的请求。
application|n.|申请|submit an application|提交申请|Please submit your ____ before the closing date.|请在截止日期前提交申请。
arrangement|n.|安排|a suitable arrangement|合适的安排|I hope we can find a suitable ____ for both parties.|我希望我们能找到对双方都合适的安排。
practical|adj.|实用的；实践的|practical skills|实用技能|The workshop provides ____ tips for writing a CV.|这次讲座提供了写简历的实用建议。
suitable|adj.|合适的|suitable for beginners|适合初学者|Is this course ____ for complete beginners?|这门课程适合完全没有基础的人吗？
relevant|adj.|相关的|relevant information|相关信息|Please include only ____ information in your application.|请在申请中只填写相关信息。
accurate|adj.|准确的|accurate information|准确的信息|It is important to provide ____ contact details.|提供准确的联系信息很重要。
explain|v.|解释|explain a problem|解释问题|Could you ____ why the delivery was late?|你能解释一下为什么送货延误了吗？
describe|v.|描述|describe an experience|描述经历|Please ____ the problem in your own words.|请用你自己的话描述这个问题。
compare|v.|比较|compare different options|比较不同选项|It is useful to ____ several courses before choosing one.|选课前比较几门课程是有用的。
appreciate|v.|感激；感谢|appreciate your help|感谢你的帮助|I would ____ it if you could reply by Friday.|如果你能在周五之前回复，我将不胜感激。
recommend|v.|推荐；建议|recommend a service|推荐服务|Could you ____ a reliable local repair service?|你能推荐一家可靠的本地维修服务吗？
clarify|v.|澄清|clarify the details|澄清细节|I am writing to ____ the details of my request.|我写信是想澄清我的请求细节。
compensate|v.|赔偿；补偿|compensate someone for a loss|赔偿某人的损失|Will the company ____ passengers for the cancelled service?|公司会为取消的服务向乘客提供补偿吗？
inconvenience|n.|不便|cause inconvenience|造成不便|I apologise for any ____ caused by this change.|对于此次变更造成的任何不便，我深表歉意。
correspondence|n.|通信；往来信件|formal correspondence|正式信函|Please include your reference number in all ____.|请在所有往来信件中注明你的参考编号。
interpersonal|adj.|人际交往的|interpersonal skills|人际交往技能|Customer service roles require strong ____ skills.|客户服务岗位要求良好的人际交往技能。`,
];
const uses = ['租房咨询 / 报修投诉', '求职申请 / 工作通知', '预订咨询 / 退款投诉', '预约沟通 / 生活方式讨论', '社区建议信 / 社会议题讨论', '课程咨询 / 日常与正式书信'];
const entries = groups.flatMap((group, topic) => group.split('\n').map((row, index) => {
  const [word, pos, meaning, collocation, collocationMeaning, context, translation] = row.split('|');
  return { id: `word-${word}`, word, pos, meaning, topic: TOPICS[topic], level: Math.floor(index / 10) + 1,
    context, translation, pattern: collocation, collocation, collocationMeaning, useCase: uses[topic] };
}));
export const VOCABULARY = entries.map((entry, index) => {
  // Match word class, preferring the same topic. Chinese cues specify the tested sense.
  const others = entries.filter(v => v.word !== entry.word && v.pos === entry.pos);
  const sameTopic = others.filter(v => v.topic === entry.topic);
  const pool = sameTopic.length >= 3 ? sameTopic : others;
  const distractors = [0, 1, 2].map(offset => pool[(index + offset) % pool.length].word);
  return { ...entry, distractors };
});
