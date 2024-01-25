"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const i=require("vue"),o=()=>{const n=[],t=e=>{n.includes(e)||typeof e!="function"||n.push(e)},u=()=>{n.forEach(e=>e())},r=e=>{const s=n.findIndex(e);s>-1&&n.splice(s,1)};return i.onUnmounted(()=>{n.length=0}),{subscribe:t,publish:u,unsubscribe:r}};exports.useSubscribe=o;
//# sourceMappingURL=index3.cjs.map
