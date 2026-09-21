import{createHash,timingSafeEqual}from"node:crypto";

export function verifyPreviewPassword(input,expected){
  if(typeof input!=="string"||typeof expected!=="string"||expected.length===0)return false;
  const a=createHash("sha256").update(input,"utf8").digest();
  const b=createHash("sha256").update(expected,"utf8").digest();
  return timingSafeEqual(a,b);
}
