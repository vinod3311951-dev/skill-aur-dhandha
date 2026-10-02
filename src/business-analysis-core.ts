export type BusinessSignal={key:string;label:string;options:string[]};
export type Gap={area:string;signal:string;next:string};
export const businessTypes=['Shop / Retail','Service / Skill','Farmer / Agriculture','Home-based','Manufacturing','Digital / Online','Other'] as const;
export const businessSignals:BusinessSignal[]=[
{key:'sales',label:'Sales / income trend',options:['Growing','Stable','Falling','Too irregular to tell']},
{key:'customers',label:'Customer / enquiry trend',options:['Growing','Stable','Falling','Not tracked']},
{key:'margin',label:'Margin after direct costs',options:['Healthy','Tight','Negative / loss','Not calculated']},
{key:'repeat',label:'Repeat customers',options:['Strong','Some','Low','Not tracked']},
{key:'competition',label:'Competition pressure',options:['Low','Moderate','High','Not sure']},
{key:'marketing',label:'Marketing effectiveness',options:['Working well','Some response','Weak response','Not measured']},
{key:'stock',label:'Inventory / capacity',options:['Healthy','Too much unused stock/capacity','Too little capacity / shortages','Not applicable / not tracked']},
{key:'cash',label:'Cash-flow pressure',options:['Low','Manageable','High','Not tracked']},
{key:'digital',label:'Digital presence',options:['Strong','Basic','Weak / none','Not relevant']},
{key:'operations',label:'Operational consistency',options:['Reliable','Some delays/rework','Frequent problems','Not tracked']},
{key:'pricing',label:'Pricing confidence',options:['Validated with customers/costs','Mostly guesswork','Frequent discounting','Not reviewed recently']},
{key:'supplier',label:'Supplier / input reliability',options:['Reliable','Some disruption','Frequent disruption','Not tracked']},
{key:'staff',label:'Staff / owner workload',options:['Balanced','Overloaded','Idle capacity','Not tracked / solo business']},
{key:'complaints',label:'Complaints / returns / rework',options:['Low','Moderate','High','Not tracked']},
{key:'measurement',label:'Business measurement discipline',options:['Track key numbers weekly','Track some numbers','Mostly memory / intuition','No regular tracking']}
];
export function analyseBusiness(state:Record<string,string>):Gap[]{
 const g:Gap[]=[];const add=(area:string,signal:string,next:string)=>g.push({area,signal,next});
 if(/Falling|irregular/i.test(state.sales))add('Sales','Sales are falling or irregular','Separate demand, price, customer count and average order value before changing the offer.');
 if(/Falling|Not tracked/i.test(state.customers))add('Customer flow','Customer flow is weak or unmeasured','Track enquiries, conversion and repeat business by channel for 2–4 weeks.');
 if(/Tight|Negative|Not calculated/i.test(state.margin))add('Margin','Margin is tight, negative or unknown','Separate selling price, direct cost, packaging/platform costs and fixed expenses in Paisa Check.');
 if(/Low|Not tracked/i.test(state.repeat))add('Retention','Repeat business is low or unknown','Track repeat rate, complaints, service quality and follow-up.');
 if(/High|Not sure/i.test(state.competition))add('Competition','Competition pressure is high or unclear','Compare price, quality, convenience, trust, speed, assortment and digital discovery.');
 if(/Weak response|Not measured/i.test(state.marketing))add('Marketing','Marketing response is weak or unmeasured','Track genuine enquiries and conversions by channel; do not use follower count as the main business metric.');
 if(/Too much|Too little|Not applicable/i.test(state.stock))add('Inventory / capacity','Stock or capacity may be mismatched','Measure stock turns, utilisation, shortages, wastage and working capital.');
 if(/High|Not tracked/i.test(state.cash))add('Cash flow','Cash-flow pressure is high or unmeasured','Map cash-in/cash-out timing, receivables, stock lock-up and fixed commitments.');
 if(/Weak|Basic/i.test(state.digital))add('Digital discovery','Digital discoverability may be limiting demand','Improve accurate listings, catalogue/portfolio, contact clarity, proof and local search/social presence.');
 if(/delays|Frequent|Not tracked/i.test(state.operations))add('Operations','Execution reliability is weak or unmeasured','Track delays, rework, complaints, wastage and bottlenecks.');
 if(/guesswork|discounting|Not reviewed/i.test(state.pricing))add('Pricing','Pricing may not reflect cost and customer value','Check contribution, competitor alternatives, willingness-to-pay and discount leakage before repricing.');
 if(/disruption|Not tracked/i.test(state.supplier))add('Supply','Input reliability is weak or unknown','Track lead times, alternates, minimum orders, quality failures and supplier concentration.');
 if(/Overloaded|Idle capacity/i.test(state.staff))add('Capacity','Workload and capacity may be imbalanced','Measure owner/staff hours, throughput, idle time, overtime and bottleneck tasks.');
 if(/Moderate|High|Not tracked/i.test(state.complaints))add('Quality','Complaints/returns/rework may be eroding profit','Track root causes, rework cost, refunds and repeat defects.');
 if(/memory|No regular/i.test(state.measurement))add('Measurement','Decisions rely too much on memory or intuition','Create a weekly dashboard for sales, margin, customers, repeat rate, cash, stock/capacity and complaints.');
 return g;
}
