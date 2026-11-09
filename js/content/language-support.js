const familyRows = [
 ['employ','employment','employee','employer'], ['apply','application','applicant'], ['qualify','qualification','qualified'],
 ['promote','promotion'], ['motivate','motivation','motivated'], ['responsible','responsibility'], ['participate','participation','participant'],
 ['conserve','conservation'], ['protect','protection','protective'], ['pollute','pollution'], ['recover','recovery'],
 ['injure','injury','injured'], ['educate','education','educational'], ['analyse','analysis'], ['arrange','arrangement'],
 ['announce','announcement'], ['approve','approval'], ['admit','admission'], ['assess','assessment'], ['assist','assistant','assistance'],
 ['cancel','cancellation'], ['describe','description'], ['explain','explanation'], ['express','expression'], ['reserve','reservation'],
 ['retire','retirement'], ['inform','information'], ['respond','response'], ['suit','suitable'], ['rely','reliable'],
 ['benefit','beneficial'], ['harm','harmful'], ['prevent','prevention'], ['maintain','maintenance'], ['insure','insurance'],
 ['compensate','compensation'], ['apologise','apology'], ['negotiate','negotiation'], ['produce','production','productivity'],
 ['organise','organisation'], ['occupy','occupation'], ['secure','security'], ['regular','regularly'], ['attend','attendance'],
 ['communicate','communication'], ['compare','comparison'], ['invite','invitation'], ['advise','advice'], ['refer','reference'],
 ['permit','permission'], ['decide','decision'], ['select','selection'], ['register','registration'], ['translate','translation'],
];
export const WORD_FAMILIES = Object.fromEntries(familyRows.flatMap(group => group.map(word => [word,group])));
const paraphraseRows = [
 ['refund','money back','退款','购物退款场景：get a refund / get your money back；句型需要跟着调整。'],
 ['mandatory','compulsory','强制的','规则要求场景中可表达“必须遵守”，不用于“自愿参加”。'],
 ['compulsory','mandatory','强制的','参加或遵守规定时；两者都不等于 optional。'],
 ['optional','not required','可选择的','活动或课程是否必须参加；否定范围应保持一致。'],
 ['purchase','buy','购买','动词义时 purchase 较正式；proof of purchase 中 purchase 是名词。'],
 ['postpone','put off','推迟','推迟已经安排的活动；不是彻底取消。'],
 ['cancel','call off','取消','活动被取消时；预订更常直接用 cancel。'],
 ['commute','travel regularly between home and work','通勤','特指家与工作地点之间的规律往返。'],
 ['vacancy','unfilled job','职位空缺','招聘场景；hotel vacancy 表示空房，应结合语境。'],
 ['deadline','latest time for submission','提交截止时间','报告或申请场景；注意 before/by 的时间边界。'],
 ['annual','yearly','每年的','费用、收入或活动每年发生一次；不是一次性费用。'],
 ['monthly','every month','每月','monthly payment / pay every month，名词短语与动词结构不同。'],
 ['available','able to be used or obtained','可用的','座位、资源场景；人有空时用法不同。'],
 ['prohibit','not allow','禁止','规则场景；禁止某活动可用 prohibit + 名词/-ing。'],
 ['permit','allow','允许','permit 较正式；两者常接宾语再接 to do。'],
 ['reduce','cut down on','减少','费用、使用量等场景；reduce 后直接接宾语。'],
 ['assist','help','帮助','assist 较正式；留意 assist someone with something。'],
 ['require','need','需要','场景一致时表达需要；be required to 表示被要求做某事。'],
 ['resident','person living in an area','居民','居住地场景，不等于拥有房产的 owner。'],
 ['tenant','person renting a property','租客','租赁关系；不是 landlord（房东）。'],
 ['landlord','property owner who rents it out','出租房产的房东','特指出租关系，不是所有 owner 都是 landlord。'],
 ['colleague','person you work with','同事','工作关系，不等于雇主或主管。'],
 ['temporary','for a limited time','临时的','安排或工作会在某个时间结束。'],
 ['permanent','intended to last','长期的','职位或安排没有预设短期结束点；不代表绝不会改变。'],
 ['affordable','reasonably priced','负担得起的','需结合购买者预算，不保证对所有人都便宜。'],
 ['in advance','beforehand','提前','不是 after the event；需核对提前多久。'],
 ['additional','extra','额外的','additional charge / extra charge，均表示另加的费用。'],
 ['fee','charge for a service','服务收费','fee 常用于课程、入场或专业服务。'],
 ['entitlement','right to receive something','应享有的权益','holiday entitlement 指可享有的假期额度。'],
 ['congestion','heavy traffic causing delays','拥堵','交通场景；heavy traffic 未必已经堵塞。'],
 ['reimburse','pay someone back for expenses','报销','通常针对已经发生的费用，不等于预付。'],
 ['enquiry','request for information','咨询','询问信息；不等于投诉 complaint。'],
 ['maintain','keep in good condition','维护','设备场景；maintain a level 侧重维持水平。'],
 ['reliable','dependable','可靠的','服务或人能够被信赖，不等于“便宜”。'],
 ['prompt','without delay','及时的','回复场景；prompt 也有其他词性，不能机械替换。'],
 ['absence','not being present','缺席','工作或课堂场景；不是迟到。'],
 ['admission','entry','准许进入','入场场景；admission requirements 特指入学要求。'],
 ['appointment','arranged meeting','预约','看诊或正式会面；不等于随时到访。'],
 ['opportunity','chance','机会','能做某事的有利时机；chance 也可指概率。'],
 ['beneficial','helpful','有益的','对某事有益常用 beneficial to。'],
];
export const PARAPHRASES = Object.fromEntries(paraphraseRows.map(([word,text,meaning,scope])=>[word,{text,meaning,scope}]));
export function languageSupport(word) {
  return { family:WORD_FAMILIES[word]||[], paraphrase:PARAPHRASES[word]||null };
}
export function collocationTask(entry) {
  const tokens=entry.collocation.split(/\s+/);
  const prep=tokens.find(token=>['for','with','to','from','about','on','in','at','of','by','into','after','under','between','as'].includes(token));
  const answer=prep||entry.word;
  const expression=new RegExp(`\\b${answer}\\b`,'i');
  return {answer,cloze:entry.collocation.replace(expression,'____'),focus:prep?'介词搭配':'词汇搭配',meaning:entry.collocationMeaning};
}
