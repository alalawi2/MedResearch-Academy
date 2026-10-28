import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
const digest=x=>createHash('sha256').update(x).digest();
export function allowedVoiceAccess(token, env, now=Date.now()) {
 if(typeof token!=='string'||token.length>128||!env.WARDWISE_BETA_ACCESS_TOKEN)return false;
 if(timingSafeEqual(digest(token),digest(env.WARDWISE_BETA_ACCESS_TOKEN)))return true;
 // QA access is opt-in on the server, signed by the owner, and valid for at most one hour.
 // Cloud test artifacts can never contain the owner's long-lived access code.
 if(env.WARDWISE_QA_ENABLED!=='true')return false;
 const parts=token.match(/^qa\.(\d{13})\.([a-f0-9]{16})\.([A-Za-z0-9_-]{43})$/);
 if(!parts)return false;
 const expiry=Number(parts[1]);if(expiry<=now||expiry-now>3600000)return false;
 const signed=`qa.${parts[1]}.${parts[2]}`;
 const expected=createHmac('sha256',env.WARDWISE_BETA_ACCESS_TOKEN).update(signed).digest('base64url');
 return timingSafeEqual(digest(parts[3]),digest(expected));
}
