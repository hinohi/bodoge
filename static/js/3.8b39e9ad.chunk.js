(this.webpackJsonpbodoge=this.webpackJsonpbodoge||[]).push([[3],{31:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));var r=n(34);function c(e,t){if(e){if("string"===typeof e)return Object(r.a)(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Object(r.a)(e,t):void 0}}},32:function(e,t,n){"use strict";function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}n.d(t,"a",(function(){return r}))},33:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));var r=n(31);function c(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e)){var n=[],r=!0,c=!1,i=void 0;try{for(var o,a=e[Symbol.iterator]();!(r=(o=a.next()).done)&&(n.push(o.value),!t||n.length!==t);r=!0);}catch(u){c=!0,i=u}finally{try{r||null==a.return||a.return()}finally{if(c)throw i}}return n}}(e,t)||Object(r.a)(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}},34:function(e,t,n){"use strict";function r(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}n.d(t,"a",(function(){return r}))},35:function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var r=n(32);function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){Object(r.a)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}},36:function(e,t,n){"use strict";n.d(t,"d",(function(){return c})),n.d(t,"c",(function(){return i})),n.d(t,"b",(function(){return o})),n.d(t,"a",(function(){return a}));n(0);var r=n(1);function c(e){return Object(r.jsx)("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",width:e.width,height:e.height,children:e.children})}function i(e){var t=e.size/50;return Object(r.jsx)("rect",{x:e.x+t,y:e.y+t,width:e.size-2*t,height:e.size-2*t,rx:3*t,ry:3*t,fill:"rgba(0, 0, 0, 0)",stroke:"#111111",onClick:e.onClick})}function o(e){var t=.9*e.size,n=.1*e.size;return Object(r.jsxs)("g",{fill:"#53B0FF",transform:"rotate(45 ".concat(e.centerX," ").concat(e.centerY,")"),children:[Object(r.jsx)("rect",{x:e.centerX-t/2,y:e.centerY-n/2,rx:n/2,width:t,height:n}),Object(r.jsx)("rect",{x:e.centerX-n/2,y:e.centerY-t/2,ry:n/2,width:n,height:t})]})}function a(e){return Object(r.jsx)("circle",{cx:e.centerX,cy:e.centerY,r:e.size/3.5,fill:"none",stroke:"#FF972D",strokeWidth:e.size/10})}},37:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));n(0);var r=n(1);function c(e){return e.hasWinner?Object(r.jsx)("button",{className:"button is-primary",onClick:e.onClick,children:"Reset"}):Object(r.jsx)("button",{className:"button is-danger",onClick:e.onClick,children:"Reset"})}},38:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));n(0);var r=n(1);function c(e){return Object(r.jsx)("div",{className:"select",children:Object(r.jsx)("select",{onChange:function(t){return e.onChange(parseInt(t.target.value))},value:e.selected,disabled:e.isDisabled,children:e.items.map((function(e,t){return Object(r.jsx)("option",{value:t,children:e},t)}))})})}},39:function(e,t,n){"use strict";n.d(t,"a",(function(){return P}));var r=n(33),c=n(0),i=n(31);var o=n(32);function a(e,t){return(a=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function u(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}function s(e,t,n){return(s=u()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var c=new(Function.bind.apply(e,r));return n&&a(c,n.prototype),c}).apply(null,arguments)}var l=n(34);function f(e){return function(e){if(Array.isArray(e))return Object(l.a)(e)}(e)||function(e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||Object(i.a)(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var d=Symbol("Comlink.proxy"),b=Symbol("Comlink.endpoint"),p=Symbol("Comlink.releaseProxy"),h=Symbol("Comlink.thrown"),y=function(e){return"object"===typeof e&&null!==e||"function"===typeof e},j=new Map([["proxy",{canHandle:function(e){return y(e)&&e[d]},serialize:function(e){var t=new MessageChannel,n=t.port1,r=t.port2;return v(e,n),[r,[r]]},deserialize:function(e){return e.start(),O(e)}}],["throw",{canHandle:function(e){return y(e)&&h in e},serialize:function(e){var t=e.value;return[t instanceof Error?{isError:!0,value:{message:t.message,name:t.name,stack:t.stack}}:{isError:!1,value:t},[]]},deserialize:function(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:self;t.addEventListener("message",(function n(c){if(c&&c.data){var i,a=Object.assign({path:[]},c.data),u=a.id,l=a.type,d=a.path,b=(c.data.argumentList||[]).map(C);try{var p=d.slice(0,-1).reduce((function(e,t){return e[t]}),e),y=d.reduce((function(e,t){return e[t]}),e);switch(l){case"GET":i=y;break;case"SET":p[d.slice(-1)[0]]=C(c.data.value),i=!0;break;case"APPLY":i=y.apply(p,b);break;case"CONSTRUCT":var j;i=S(s(y,f(b)));break;case"ENDPOINT":var O=new MessageChannel,g=O.port1,x=O.port2;v(e,x),i=E(g,[g]);break;case"RELEASE":i=void 0;break;default:return}}catch(j){i=Object(o.a)({value:j},h,0)}Promise.resolve(i).catch((function(e){return Object(o.a)({value:e},h,0)})).then((function(e){var c=A(e),i=Object(r.a)(c,2),o=i[0],a=i[1];t.postMessage(Object.assign(Object.assign({},o),{id:u}),a),"RELEASE"===l&&(t.removeEventListener("message",n),m(t))}))}})),t.start&&t.start()}function m(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function O(e,t){return x(e,[],t)}function g(e){if(e)throw new Error("Proxy has been released and is not useable")}function x(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){},c=!1,i=new Proxy(n,{get:function(n,r){if(g(c),r===p)return function(){return z(e,{type:"RELEASE",path:t.map((function(e){return e.toString()}))}).then((function(){m(e),c=!0}))};if("then"===r){if(0===t.length)return{then:function(){return i}};var o=z(e,{type:"GET",path:t.map((function(e){return e.toString()}))}).then(C);return o.then.bind(o)}return x(e,[].concat(f(t),[r]))},set:function(n,i,o){g(c);var a=A(o),u=Object(r.a)(a,2),s=u[0],l=u[1];return z(e,{type:"SET",path:[].concat(f(t),[i]).map((function(e){return e.toString()})),value:s},l).then(C)},apply:function(n,i,o){g(c);var a=t[t.length-1];if(a===b)return z(e,{type:"ENDPOINT"}).then(C);if("bind"===a)return x(e,t.slice(0,-1));var u=w(o),s=Object(r.a)(u,2),l=s[0],f=s[1];return z(e,{type:"APPLY",path:t.map((function(e){return e.toString()})),argumentList:l},f).then(C)},construct:function(n,i){g(c);var o=w(i),a=Object(r.a)(o,2),u=a[0],s=a[1];return z(e,{type:"CONSTRUCT",path:t.map((function(e){return e.toString()})),argumentList:u},s).then(C)}});return i}function w(e){var t,n=e.map(A);return[n.map((function(e){return e[0]})),(t=n.map((function(e){return e[1]})),Array.prototype.concat.apply([],t))]}var k=new WeakMap;function E(e,t){return k.set(e,t),e}function S(e){return Object.assign(e,Object(o.a)({},d,!0))}function A(e){var t,n=function(e,t){var n;if("undefined"===typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=Object(i.a)(e))||t&&e&&"number"===typeof e.length){n&&(e=n);var r=0,c=function(){};return{s:c,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:c}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw o}}}}(j);try{for(n.s();!(t=n.n()).done;){var c=Object(r.a)(t.value,2),o=c[0],a=c[1];if(a.canHandle(e)){var u=a.serialize(e),s=Object(r.a)(u,2);return[{type:"HANDLER",name:o,value:s[0]},s[1]]}}}catch(l){n.e(l)}finally{n.f()}return[{type:"RAW",value:e},k.get(e)||[]]}function C(e){switch(e.type){case"HANDLER":return j.get(e.name).deserialize(e.value);case"RAW":return e.value}}function z(e,t,n){return new Promise((function(r){var c=new Array(4).fill(0).map((function(){return Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)})).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===c&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:c},t),n)}))}function P(e){var t=Object(c.useState)(e),n=Object(r.a)(t,2),i=n[0],o=n[1],a=Object(c.useMemo)((function(){return O(i)}),[i]),u=Object(c.useState)(!1),s=Object(r.a)(u,2),l=s[0],f=s[1],d=Object(c.useState)(!0),b=Object(r.a)(d,2),p=b[0],h=b[1];return Object(c.useEffect)((function(){l||a.initialize().then((function(){f(!0),h(!1)}))}),[l,p,a]),[p,h,a,function(){i.terminate(),h(!0),o(e()),f(!1)}]}},41:function(e,t,n){e.exports=n.p+"connect-four.e2eb4747a4cd2d662e75.worker.js"},44:function(e,t,n){"use strict";n.r(t),function(e){var r=n(33),c=n(32),i=n(35),o=n(0),a=n.n(o),u=n(36),s=n(37),l=n(38),f=n(39),d=n(1);function b(){return new Worker(e,{name:"connect-four",type:void 0})}function p(e){for(var t=[],n=e.x+e.size/2,r=0;r<6;r++){var c=(5-r)*e.size,i=c+e.size/2;switch(t.push(Object(d.jsx)(u.c,{x:e.x,y:c,size:e.size,onClick:e.onClick},2*r)),e.col[r]){case"A":t.push(Object(d.jsx)(u.b,{centerX:n,centerY:i,size:e.size},2*r+1));break;case"B":t.push(Object(d.jsx)(u.a,{centerX:n,centerY:i,size:e.size},2*r+1))}}return Object(d.jsx)(a.a.Fragment,{children:t})}function h(e){var t=100;return Object(d.jsx)(u.d,{width:700,height:600,children:e.cols.map((function(n,r){var c=t*r;return Object(d.jsx)(p,{col:n,size:t,x:c,onClick:function(){return e.onClick(r)}},r)}))})}function y(e){return{board:{cols:[[],[],[],[],[],[],[]],next:"A",history:[]},key:Math.random(),winner:null,judged:!0,player:e}}function j(e,t){switch(t.type){case"reset":return y(e.player);case"change_player":return e.player[t.side]===t.id?e:y(Object(i.a)(Object(i.a)({},e.player),{},Object(c.a)({},t.side,t.id)));case"put":return t.key!==e.key||(e.board.next!==t.side||e.winner)?e:e.judged?e.board.cols[t.position].length>=6?e:Object(i.a)(Object(i.a)({},e),{},{board:(n=e.board,r=t.position,o=t.score,{cols:n.cols.map((function(e,t){if(r===t){var c=e.slice();return c.push(n.next),c}return e})),next:"A"===n.next?"B":"A",history:n.history.concat([{position:r,score:o}])}),judged:!1}):e;case"judge":return t.key!==e.key?e:Object(i.a)(Object(i.a)({},e),{},{winner:t.winner,judged:!0})}var n,r,o}t.default=function(){var e,t=Object(o.useMemo)((function(){return[{type:"Human",name:"Human"},{type:"MCTree",name:"MCTree (200ms)",limit:200,expansion_threshold:2,c:2},{type:"MCTree",name:"MCTree (3s)",limit:3e3,expansion_threshold:2,c:2}]}),[]),n=Object(f.a)(b),c=Object(r.a)(n,4),i=c[0],a=c[1],u=c[2],p=c[3],v=Object(o.useReducer)(j,y({A:0,B:0})),m=Object(r.a)(v,2),O=m[0],g=m[1];function x(e,t){O.player[e]!==t&&(p(),g({type:"change_player",side:e,id:t}))}Object(o.useEffect)((function(){if(!i&&!O.winner)if(O.judged){var e=O.board.next,n=t[O.player[e]];switch(n.type){case"Human":break;case"MCTree":var r=O.key;a(!0),u.mctree({cols:O.board.cols},n.limit,n.expansion_threshold,n.c).then((function(t){"number"===typeof t.position?g({type:"put",key:r,side:e,position:t.position,score:t.score}):console.error(t),a(!1)})).catch((function(e){return console.error(e)}))}}else{a(!0);var c=O.key;u.calculateWinner({cols:O.board.cols}).then((function(e){g({type:"judge",key:c,winner:e}),a(!1)})).catch((function(e){return console.error(e)}))}}),[i,t,O,a,u]),e=null===O.winner?"next player: ".concat(O.board.next):"F"===O.winner?"draw":"winner: ".concat(O.winner);var w=O.board.history.map((function(e,t){var n="(".concat(t+1,")");return null!=e.score?Object(d.jsxs)("li",{children:[n," ","AB"[t%2],": pos=",e.position," score=",e.score]},t):Object(d.jsxs)("li",{children:[n," ","AB"[t%2],": pos=",e.position]},t)})).reverse();return Object(d.jsxs)("div",{className:"container",children:[Object(d.jsxs)("div",{className:"content is-flex-direction-row",children:["X",Object(d.jsx)(l.a,{items:t.map((function(e){return e.name})),selected:O.player.A,isDisabled:!1,onChange:function(e){return x("A",e)}}),"vs",Object(d.jsx)(l.a,{items:t.map((function(e){return e.name})),selected:O.player.B,isDisabled:!1,onChange:function(e){return x("B",e)}}),"O"]}),Object(d.jsx)("div",{className:"content",children:Object(d.jsx)(h,{onClick:function(e){if(!(O.board.cols[e].length>=6)){var n=O.board.next;"Human"===t[O.player[n]].type&&g({type:"put",key:O.key,side:n,position:e})}},cols:O.board.cols})}),Object(d.jsx)("div",{className:"content",children:Object(d.jsx)("p",{children:e})}),Object(d.jsx)("div",{className:"content",children:Object(d.jsx)(s.a,{hasWinner:null!==O.winner,onClick:function(){p(),g({type:"reset"})}})}),Object(d.jsx)("div",{className:"content",children:Object(d.jsx)("ul",{children:w})})]})}}.call(this,n(41))}}]);
//# sourceMappingURL=3.8b39e9ad.chunk.js.map