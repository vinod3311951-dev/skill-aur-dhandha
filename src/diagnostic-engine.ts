export type Issue='sales'|'customers'|'profit'|'growth'|'unknown'|'machine-select'|'machine-breakdown';
export type BizType='home'|'manufacturing'|'retail'|'service'|'online'|'other';
export type AnswerMap=Record<string,string>;
export type Dimension='sales'|'customers'|'margin'|'cash'|'operations'|'measurement'|'machine';

export type DimensionResult={key:Dimension;label:string;pressure:number};
export type DiagnosticResult={
  scoreLabel:string;
  signalScore:number;
  shortfall:number;
  dimensions:DimensionResult[];
  faults:string[];
  actions:string[];
  metric:string;
  formula:string;
};

const LABELS:Record<Dimension,string>={
  sales:'Sales',
  customers:'Customers',
  margin:'Margin & pricing',
  cash:'Cash',
  operations:'Operations & capacity',
  measurement:'Measurement',
  machine:'Machine decision'
};

const severity:Record<string,{dimension:Dimension;values:Record<string,number>}>={
  trend:{dimension:'sales',values:{'Improving':0,'Mostly stable':1,'Declining':3,'Too irregular to tell':2}},
  tracking:{dimension:'measurement',values:{'Weekly':0,'Monthly':1,'Sometimes':2,'Not tracked':3}},
  sales:{dimension:'sales',values:{'Growing':0,'Stable':1,'Falling':3,'Very irregular':2,'Not tracked':2}},
  customers:{dimension:'customers',values:{'Growing':0,'Stable':1,'Falling':3,'Too dependent on a few customers':2,'Not tracked':2}},
  repeat:{dimension:'customers',values:{'Strong':0,'Some repeat':1,'Low repeat':3,'Not tracked':2}},
  margin:{dimension:'margin',values:{'Healthy':0,'Tight':2,'Negative':3,'Not calculated':2}},
  cash:{dimension:'cash',values:{'Rarely':0,'Sometimes':1,'Often':2,'Almost always':3,'Not sure':2}},
  pricing:{dimension:'margin',values:{'Within 3 months':0,'3–12 months ago':1,'More than a year ago':2,'Never / not sure':3}},
  marketing:{dimension:'customers',values:{'Predictable':0,'Mixed':1,'Weak':2,'Almost none':3,'Not tracked':2}},
  operations:{dimension:'operations',values:{'Rarely':0,'Sometimes':1,'Often':2,'Very often':3}},
  capacity:{dimension:'operations',values:{'Yes comfortably':0,'With small changes':1,'No, capacity is tight':3,'Not sure':2}},
  'machine-category':{dimension:'machine',values:{'Other / not sure':1}},
  'machine-capacity':{dimension:'machine',values:{}},
  'machine-budget':{dimension:'machine',values:{'Not sure yet':3}},
  'machine-automation':{dimension:'machine',values:{'Not sure':1}},
  'machine-power':{dimension:'machine',values:{'Not sure':2}},
  'machine-condition':{dimension:'machine',values:{'Not sure':1}},
  'machine-impact':{dimension:'machine',values:{'Low':0,'Moderate':1,'High':2,'Production is stopped':3}},
  'machine-downtime':{dimension:'machine',values:{'Less than a day':0,'1–3 days':1,'4–7 days':2,'More than a week':3}},
  'machine-service':{dimension:'machine',values:{'Yes locally':0,'Yes but slow':1,'Unclear':2,'No known support':3}},
  'machine-warranty':{dimension:'machine',values:{'Under warranty':0,'Service contract only':1,'Out of warranty':2,'Not sure':2}},
  'machine-economics':{dimension:'machine',values:{'Below 20%':0,'20–40%':1,'Above 40%':3,'Unknown':2}}
};

const weights:Record<Issue,Partial<Record<Dimension,number>>>={
  sales:{sales:3,customers:2,margin:1.5,operations:1.5,cash:1,measurement:1},
  customers:{customers:4,sales:1.5,measurement:1.5,operations:1,cash:.5,margin:.5},
  profit:{margin:4,cash:3,sales:1.5,operations:1.5,measurement:1},
  growth:{operations:3,sales:2,customers:2,margin:2,cash:2,measurement:1.5},
  unknown:{sales:2,customers:2,margin:2,cash:2,operations:2,measurement:1.5},
  'machine-select':{machine:1},
  'machine-breakdown':{machine:1}
};

function segment(bizType:BizType){
  if(bizType==='retail')return 'top-selling items';
  if(bizType==='service')return 'top services';
  if(bizType==='manufacturing')return 'top product lines or batches';
  if(bizType==='online')return 'top offers or channels';
  if(bizType==='home')return 'top home-business products or services';
  return 'top products or services';
}

function calculateDimensions(issue:Issue,answers:AnswerMap){
  const totals=new Map<Dimension,{risk:number;max:number}>();
  for(const [key,value] of Object.entries(answers)){
    const rule=severity[key];
    if(!rule)continue;
    if(!(key in severity))continue;
    const mapped=rule.values[value];
    const risk=typeof mapped==='number'?mapped:0;
    const current=totals.get(rule.dimension)||{risk:0,max:0};
    current.risk+=risk;
    current.max+=3;
    totals.set(rule.dimension,current);
  }

  const available=[...totals.entries()].map(([key,total])=>({
    key,
    label:LABELS[key],
    pressure:total.max?Math.round(total.risk/total.max*100):0
  }));

  const issueWeights=weights[issue];
  let weighted=0,totalWeight=0;
  for(const d of available){
    const w=issueWeights[d.key]||0;
    if(w>0){weighted+=d.pressure*w;totalWeight+=w;}
  }
  const shortfall=totalWeight?Math.round(weighted/totalWeight):0;
  return {dimensions:available.sort((a,b)=>b.pressure-a.pressure),shortfall};
}

function faultFor(d:Dimension,a:AnswerMap,issue:Issue){
  if(d==='sales'){
    if(a.sales==='Falling'&&a.trend==='Declining')return 'Sales are falling now and the broader 6–12 month trend is also declining.';
    if(a.sales==='Very irregular')return 'Sales are too irregular to plan confidently; volatility itself is the main sales signal.';
    if(a.sales==='Not tracked')return 'Current sales are not being tracked closely enough to identify where the drop begins.';
    if(a.trend==='Declining')return 'The 6–12 month sales trend is declining even if the latest period looks less severe.';
    return 'Sales momentum needs attention before more spending or expansion.';
  }
  if(d==='customers'){
    if(a.marketing==='Almost none')return 'New enquiries are almost absent, so the customer pipeline is the clearest constraint.';
    if(a.customers==='Falling')return 'Customer flow is falling, so the problem is not only revenue—it starts earlier in the funnel.';
    if(a.repeat==='Low repeat')return 'Repeat business is low, increasing dependence on constantly finding new customers.';
    if(a.customers==='Too dependent on a few customers')return 'The business depends too heavily on a small customer base.';
    return 'Customer acquisition or retention is weaker than the other signals.';
  }
  if(d==='margin'){
    if(a.margin==='Negative')return 'Direct costs are exceeding selling value on at least part of the business.';
    if(a.margin==='Tight'&&a.pricing==='More than a year ago')return 'Margins are tight and pricing has not been reviewed for more than a year.';
    if(a.margin==='Not calculated')return 'Margin is not calculated, so sales growth could still hide weak or negative contribution.';
    if(a.pricing==='Never / not sure')return 'Prices have not been checked against current direct costs.';
    return 'Margin or pricing pressure is limiting the benefit of current sales.';
  }
  if(d==='cash'){
    if(a.cash==='Almost always')return 'Cash feels short almost all the time, indicating a serious cash-timing or collection problem.';
    if(a.cash==='Often')return 'Cash is frequently short even when sales happen, so profit and liquidity may be diverging.';
    return 'Cash timing needs closer control.';
  }
  if(d==='operations'){
    if(a.capacity==='No, capacity is tight'&&['Often','Very often'].includes(a.operations))return 'Capacity is tight while operating problems are already frequent; adding volume could worsen delivery.';
    if(a.operations==='Very often')return 'Delays, stock, quality or process problems are affecting delivery very often.';
    if(a.capacity==='No, capacity is tight')return 'Current capacity is the main growth constraint.';
    if(a.capacity==='Not sure')return 'Capacity is not measured well enough to know whether growth can be absorbed safely.';
    return 'Operational friction is consuming capacity or margin.';
  }
  if(d==='measurement'){
    if(a.tracking==='Not tracked')return 'Sales and major costs are not tracked regularly, reducing confidence in every other diagnosis.';
    if(a.tracking==='Sometimes')return 'Irregular tracking makes it harder to separate a temporary dip from a structural problem.';
    return 'Measurement discipline is weaker than the business needs.';
  }
  if(d==='machine'){
    if(issue==='machine-select'){
      const gaps=['machine-category','machine-capacity','machine-budget','machine-automation','machine-power','machine-condition'].filter(k=>!a[k]||/not sure/i.test(a[k]));
      return gaps.length?('The machine decision still has '+gaps.length+' unresolved requirement'+(gaps.length===1?'':'s')+'.'):'The main machine requirements are defined; vendor/service verification is now the priority.';
    }
    if(a['machine-impact']==='Production is stopped')return 'Production is stopped, so downtime cost must be included in the repair-versus-replace decision.';
    if(a['machine-economics']==='Above 40%')return 'Expected repair cost is above 40% of replacement cost, making replacement comparison essential.';
    if(a['machine-service']==='No known support')return 'No known service/spares support materially increases future downtime risk.';
    return 'Machine downtime, serviceability and repair economics should be considered together.';
  }
  return 'A material business signal needs attention.';
}

function actionFor(d:Dimension,a:AnswerMap,bizType:BizType){
  const group=segment(bizType);
  if(d==='sales')return 'Compare weekly sales for the last 8 weeks across your '+group+'. Mark the exact line and week where the decline began.';
  if(d==='customers'){
    if(a.repeat==='Low repeat')return 'Review the last 20 customers and record the top three reasons they did or did not return. Test one retention change for 2 weeks.';
    return 'For 7 days track enquiries → purchases → repeat customers. Improve the weakest conversion stage instead of increasing promotion everywhere.';
  }
  if(d==='margin')return 'For your '+group+', calculate contribution per sale: selling price minus direct cost. Reprice, redesign or pause any weak/negative line before chasing more volume.';
  if(d==='cash')return 'Make a 4-week cash view: opening cash + expected collections − unavoidable weekly outflows. Fix the biggest timing gap first.';
  if(d==='operations')return 'Log every delay, stockout, rework or quality problem for 7 days and rank them by lost productive time. Remove the largest recurring bottleneck first.';
  if(d==='measurement')return 'Use one weekly scorecard only: sales, contribution margin, cash due/received, enquiries and one operating-loss measure.';
  if(d==='machine'){
    if(a['machine-economics']==='Above 40%'||a['machine-service']==='No known support')return 'Get one written repair quote and one replacement quote. Compare purchase/repair cost + expected downtime + service/spares support before deciding.';
    return 'Lock the required output, power, space, service response, spares and total operating cost before choosing a model or vendor.';
  }
  return 'Change one measurable business lever at a time and compare the next period with the previous one.';
}

function fallbackActions(issue:Issue,bizType:BizType){
  const group=segment(bizType);
  if(issue==='sales')return [
    'Separate price, volume and product-mix changes for your '+group+' so the sales drop has one identified cause.',
    'Speak to or review feedback from 10 recent customers to check whether demand, competition or service changed.',
    'Track weekly sales by line for 4 weeks after the first change before making a second major change.'
  ];
  if(issue==='customers')return [
    'Count qualified enquiries by source for 7 days.',
    'Measure enquiry-to-sale conversion instead of only follower, footfall or message counts.',
    'Track repeat customers separately so acquisition and retention are not mixed together.'
  ];
  if(issue==='profit')return [
    'Calculate contribution per sale for the '+group+'.',
    'Separate variable costs from fixed monthly costs and identify the largest controllable leak.',
    'Compare margin and cash weekly for 4 weeks before increasing sales spend.'
  ];
  if(issue==='growth')return [
    'Measure the current bottleneck before adding people, stock or machines.',
    'Test one small increase in demand or capacity and record the operational impact.',
    'Expand only after margin, cash and delivery quality remain stable through the test.'
  ];
  if(issue==='machine-breakdown')return [
    'Record downtime hours and the business output lost each day.',
    'Obtain one qualified repair quote with parts/service timing.',
    'Compare that against a replacement quote including installation, warranty and spares.'
  ];
  if(issue==='machine-select')return [
    'Write the minimum usable output/capacity and available power/space.',
    'Shortlist only models with verifiable service and spare-part support.',
    'Compare total operating cost and warranty before purchase price.'
  ];
  return [
    'Start one weekly business scorecard before changing several things at once.',
    'Identify the single weakest signal and run one 2-week corrective test.',
    'Re-run this check using the new evidence and compare the signal score.'
  ];
}

function metricFor(d:Dimension|undefined,issue:Issue){
  if(issue==='machine-select')return 'Machine decision gaps remaining';
  if(issue==='machine-breakdown')return 'Downtime hours + repair/replacement total cost';
  if(d==='sales')return 'Weekly sales by product/service line';
  if(d==='customers')return 'Enquiries → conversion → repeat rate';
  if(d==='margin')return 'Contribution margin on top lines';
  if(d==='cash')return '4-week closing cash position';
  if(d==='operations')return 'Lost productive hours / rework incidents';
  if(d==='measurement')return 'Weekly scorecard completion';
  return 'Weekly sales + contribution margin';
}

export function calculateDiagnostic(issue:Issue,bizType:BizType,answers:AnswerMap):DiagnosticResult{
  const {dimensions,shortfall}=calculateDimensions(issue,answers);
  const active=dimensions.filter(d=>d.pressure>0);
  const chosen=(active.length?active:dimensions).slice(0,3);

  const faults=chosen.map(d=>faultFor(d.key,answers,issue));
  if(!faults.length){
    faults.push(issue==='machine-select'
      ?'The machine requirements are sufficiently defined to move into vendor/service verification.'
      :'No severe pressure signal is obvious from the answers. The next value comes from tighter measurement and one controlled improvement test.');
  }

  const actions:string[]=[];
  for(const d of chosen){
    const action=actionFor(d.key,answers,bizType);
    if(!actions.includes(action))actions.push(action);
  }
  for(const action of fallbackActions(issue,bizType)){
    if(actions.length>=3)break;
    if(!actions.includes(action))actions.push(action);
  }

  return {
    scoreLabel:issue==='machine-select'?'Decision readiness':'Business signal score',
    signalScore:Math.max(0,100-shortfall),
    shortfall,
    dimensions,
    faults:faults.slice(0,3),
    actions:actions.slice(0,3),
    metric:metricFor(chosen[0]?.key,issue),
    formula:issue==='machine-select'
      ?'Readiness uses only unresolved machine requirements. Business profile fields are not scored.'
      :'Shortfall is the issue-weighted average of 0–3 pressure levels from the answers. Business profile fields are not scored.'
  };
}
