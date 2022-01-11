(function(o,a){typeof exports=="object"&&typeof module!="undefined"?a(exports):typeof define=="function"&&define.amd?define(["exports"],a):(o=typeof globalThis!="undefined"?globalThis:o||self,a(o.DexcomApi={}))})(this,function(o){"use strict";function a(t){const e=t.match(/\d+/g);return e?parseInt(e[0]):null}function w(t){return+(t/18).toFixed(2)}var c;(function(t){t[t.DoubleUp=0]="DoubleUp",t[t.SingleUp=1]="SingleUp",t[t.FortyFiveUp=2]="FortyFiveUp",t[t.Flat=3]="Flat",t[t.FortyFiveDown=4]="FortyFiveDown",t[t.SingleDown=5]="SingleDown",t[t.DoubleDown=6]="DoubleDown"})(c||(c={}));const d=typeof window!="undefined"?window.fetch:require("isomorphic-fetch");class i{constructor({username:e,password:r,server:s}){if(Object.defineProperty(this,"username",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"password",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"server",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),typeof e=="undefined")throw new Error("Must provide username");if(typeof r=="undefined")throw new Error("Must provide password");if(typeof s=="undefined")throw new Error("Must provide server");if(!i.DEXCOM_SERVERS.includes(s))throw new Error(`Invalid server. Valid servers: ${i.DEXCOM_SERVERS.join(", ")}`);this.username=e,this.password=r,this.server=s}static get APPLICATION_ID(){return"d8665ade-9673-4e27-9ff6-92db4ce13d13"}static get DEXCOM_SERVERS(){return["eu","us"]}async getAccountId(){try{const e=await d(this.apiUrl("General/AuthenticatePublisherAccount"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({applicationId:i.APPLICATION_ID,accountName:this.username,password:this.password})}),r=await e.json();if(e.status!==200)throw new Error(`Dexcom server responded with status: ${e.status}, data: ${JSON.stringify(r)}`);return r}catch(e){throw new Error(`Request failed with error: ${e}`)}}async getSessionId(){try{const e=await this.getAccountId(),r=await d(this.apiUrl("General/LoginPublisherAccountById"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({applicationId:i.APPLICATION_ID,accountId:e,password:this.password})}),s=await r.json();if(r.status!==200)throw new Error(`Dexcom server responded with status: ${r.status}, data: ${JSON.stringify(s)}`);return s}catch(e){throw new Error(`Request failed with error: ${e}`)}}async getEstimatedGlucoseValues({minutes:e,maxCount:r}={minutes:1440,maxCount:1}){try{const s=await this.getSessionId(),l=await d(this.apiUrl("Publisher/ReadPublisherLatestGlucoseValues"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maxCount:r,minutes:e,sessionId:s})}),h=await l.json();if(l.status!==200)throw new Error(`Dexcom server responded with status: ${l.status}, data: ${JSON.stringify(h)}`);return h.map(n=>{let u=n.Trend;return typeof u=="number"&&(u=c[u-1]),{mmol:w(n.Value),mgdl:n.Value,trend:u.toLowerCase(),timestamp:new Date(a(n.WT)).getTime()}})}catch(s){throw new Error(`Request failed with error: ${s}`)}}apiUrl(e){let r;switch(this.server){case"us":r="share2.dexcom.com";break;case"eu":r="shareous1.dexcom.com";break}return`https://${r}/ShareWebServices/Services/${e}`}}o.DexcomClient=i,Object.defineProperty(o,"__esModule",{value:!0}),o[Symbol.toStringTag]="Module"});
