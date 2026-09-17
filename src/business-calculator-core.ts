export type BusinessInputs={price:number;units:number;raw:number;rent:number;setup:number;marketing:number;branding:number;packaging:number;distribution:number;transport:number;employees:number;salary:number;utilities:number;otherStartup:number};
export type BusinessResult={sales:number;staff:number;fixedMonthly:number;monthly:number;surplus:number;margin:number|null;startup:number;variablePerUnit:number|null;unitContribution:number|null;breakEvenUnits:number|null;recoveryMonths:number|null;edgeNotes:string[]};

export function calculateBusiness(x:BusinessInputs):BusinessResult{
  const sales=x.price*x.units;
  const staff=x.employees*x.salary;
  const fixedMonthly=x.rent+x.marketing+x.branding+x.distribution+x.transport+staff+x.utilities;
  const monthly=x.raw+x.packaging+fixedMonthly;
  const surplus=sales-monthly;
  const margin=sales>0?surplus/sales*100:null;
  const startup=x.setup+x.otherStartup;
  const variablePerUnit=x.units>0?(x.raw+x.packaging)/x.units:null;
  const unitContribution=variablePerUnit===null?null:x.price-variablePerUnit;
  const breakEvenUnits=unitContribution!==null&&unitContribution>0?Math.ceil(fixedMonthly/unitContribution):null;
  const recoveryMonths=surplus>0?startup/surplus:null;
  const edgeNotes:string[]=[];
  if(x.units===0)edgeNotes.push('Units/orders are 0, so sales and per-unit break-even interpretation are not meaningful yet.');
  if(x.price===0&&x.units>0)edgeNotes.push('Selling price is 0; enter a realistic price before using margin or recovery outputs.');
  if(sales>0&&monthly>sales)edgeNotes.push('Modeled monthly cost is above modeled sales, so this scenario shows an operating shortfall.');
  if(variablePerUnit!==null&&x.price>0&&variablePerUnit>=x.price)edgeNotes.push('Raw-material/stock plus packaging cost per unit is at or above selling price, so contribution is not positive.');
  if(startup>0&&surplus<=0)edgeNotes.push('Startup-cost recovery is not shown because modeled operating surplus is not positive.');
  return{sales,staff,fixedMonthly,monthly,surplus,margin,startup,variablePerUnit,unitContribution,breakEvenUnits,recoveryMonths,edgeNotes};
}
