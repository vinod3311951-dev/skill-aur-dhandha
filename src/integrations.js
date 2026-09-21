export const ANALYTICS_EVENTS=new Set(["cd_shot","cd_match","cd_drop","cd_combo","cd_objective_progress","cd_star_result","cd_world_claim","cd_booster_offer","cd_booster_use","cd_daily_start","cd_daily_complete"]);
const SAFE_KEYS=new Set(["level","seed","configVersion","objectiveType","activeColorCount","result","stars","shotCount","performanceTier","combo","count","score"]);
export class AnalyticsAdapter{
  constructor(sender=null){this.sender=typeof sender==="function"?sender:null;this.buffer=[]}
  track(name,properties={}){if(!ANALYTICS_EVENTS.has(name))return false;const safe={};for(const[k,v]of Object.entries(properties))if(SAFE_KEYS.has(k)&&["string","number","boolean"].includes(typeof v))safe[k]=v;const event={name,properties:safe};this.buffer.push(event);if(this.sender)try{this.sender(event)}catch{}return true}
}
export class AdPolicyAdapter{
  constructor(provider=null){this.provider=provider}
  canShowInterstitial(context={}){return Boolean(this.provider&&context.policyApproved&&context.naturalBreak&&!context.firstSession)}
  async rewarded(context={}){if(!this.provider||!context.policyApproved)return{shown:false,rewarded:false,reason:"unavailable"};try{return await this.provider.rewarded(context)}catch{return{shown:false,rewarded:false,reason:"provider-error"}}}
}
export class CrossPromoAdapter{
  constructor(catalog=[]){this.catalog=Array.isArray(catalog)?catalog:[]}
  choices(currentProductId){return this.catalog.filter(x=>x&&x.id&&x.id!==currentProductId)}
}
