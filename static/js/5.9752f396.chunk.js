(this.webpackJsonpbodoge=this.webpackJsonpbodoge||[]).push([[5],{29:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));var r=n(32);function c(e,t){if(e){if("string"===typeof e)return Object(r.a)(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Object(r.a)(e,t):void 0}}},30:function(e,t,n){"use strict";function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}n.d(t,"a",(function(){return r}))},31:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));var r=n(29);function c(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e)){var n=[],r=!0,c=!1,i=void 0;try{for(var a,o=e[Symbol.iterator]();!(r=(a=o.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(u){c=!0,i=u}finally{try{r||null==o.return||o.return()}finally{if(c)throw i}}return n}}(e,t)||Object(r.a)(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}},32:function(e,t,n){"use strict";function r(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}n.d(t,"a",(function(){return r}))},33:function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var r=n(30);function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){Object(r.a)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}},34:function(e,t,n){"use strict";n.d(t,"d",(function(){return c})),n.d(t,"c",(function(){return i})),n.d(t,"b",(function(){return a})),n.d(t,"a",(function(){return o}));n(0);var r=n(1);function c(e){return Object(r.jsx)("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",width:e.width,height:e.height,children:e.children})}function i(e){var t=e.size/50;return Object(r.jsx)("rect",{x:e.x+t,y:e.y+t,width:e.size-2*t,height:e.size-2*t,rx:3*t,ry:3*t,fill:"rgba(0, 0, 0, 0)",stroke:"#111111",onClick:e.onClick})}function a(e){var t=.9*e.size,n=.1*e.size;return Object(r.jsxs)("g",{fill:"#53B0FF",transform:"rotate(45 ".concat(e.centerX," ").concat(e.centerY,")"),children:[Object(r.jsx)("rect",{x:e.centerX-t/2,y:e.centerY-n/2,rx:n/2,width:t,height:n}),Object(r.jsx)("rect",{x:e.centerX-n/2,y:e.centerY-t/2,ry:n/2,width:n,height:t})]})}function o(e){return Object(r.jsx)("circle",{cx:e.centerX,cy:e.centerY,r:e.size/3.5,fill:"none",stroke:"#FF972D",strokeWidth:e.size/10})}},35:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));n(0);var r=n(1);function c(e){return e.hasWinner?Object(r.jsx)("button",{className:"button is-primary",onClick:e.onClick,children:"Reset"}):Object(r.jsx)("button",{className:"button is-danger",onClick:e.onClick,children:"Reset"})}},36:function(e,t,n){"use strict";n.d(t,"a",(function(){return c}));n(0);var r=n(1);function c(e){return Object(r.jsx)("div",{className:"select",children:Object(r.jsx)("select",{onChange:function(t){return e.onChange(parseInt(t.target.value))},value:e.selected,disabled:e.isDisabled,children:e.items.map((function(e,t){return Object(r.jsx)("option",{value:t,children:e},t)}))})})}},37:function(e,t,n){"use strict";n.d(t,"a",(function(){return P}));var r=n(31),c=n(0),i=n(29);var a=n(30);function o(e,t){return(o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function u(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}function s(e,t,n){return(s=u()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var c=new(Function.bind.apply(e,r));return n&&o(c,n.prototype),c}).apply(null,arguments)}var l=n(32);function f(e){return function(e){if(Array.isArray(e))return Object(l.a)(e)}(e)||function(e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||Object(i.a)(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var b=Symbol("Comlink.proxy"),d=Symbol("Comlink.endpoint"),p=Symbol("Comlink.releaseProxy"),y=Symbol("Comlink.thrown"),j=function(e){return"object"===typeof e&&null!==e||"function"===typeof e},h=new Map([["proxy",{canHandle:function(e){return j(e)&&e[b]},serialize:function(e){var t=new MessageChannel,n=t.port1,r=t.port2;return v(e,n),[r,[r]]},deserialize:function(e){return e.start(),m(e)}}],["throw",{canHandle:function(e){return j(e)&&y in e},serialize:function(e){var t=e.value;return[t instanceof Error?{isError:!0,value:{message:t.message,name:t.name,stack:t.stack}}:{isError:!1,value:t},[]]},deserialize:function(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:self;t.addEventListener("message",(function n(c){if(c&&c.data){var i,o=Object.assign({path:[]},c.data),u=o.id,l=o.type,b=o.path,d=(c.data.argumentList||[]).map(A);try{var p=b.slice(0,-1).reduce((function(e,t){return e[t]}),e),j=b.reduce((function(e,t){return e[t]}),e);switch(l){case 0:i=j;break;case 1:p[b.slice(-1)[0]]=A(c.data.value),i=!0;break;case 2:i=j.apply(p,d);break;case 3:var h;i=E(s(j,f(d)));break;case 4:var m=new MessageChannel,g=m.port1,w=m.port2;v(e,w),i=S(g,[g]);break;case 5:i=void 0}}catch(h){i=Object(a.a)({value:h},y,0)}Promise.resolve(i).catch((function(e){return Object(a.a)({value:e},y,0)})).then((function(e){var c=C(e),i=Object(r.a)(c,2),a=i[0],o=i[1];t.postMessage(Object.assign(Object.assign({},a),{id:u}),o),5===l&&(t.removeEventListener("message",n),O(t))}))}})),t.start&&t.start()}function O(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function m(e,t){return w(e,[],t)}function g(e){if(e)throw new Error("Proxy has been released and is not useable")}function w(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){},c=!1,i=new Proxy(n,{get:function(n,r){if(g(c),r===p)return function(){return z(e,{type:5,path:t.map((function(e){return e.toString()}))}).then((function(){O(e),c=!0}))};if("then"===r){if(0===t.length)return{then:function(){return i}};var a=z(e,{type:0,path:t.map((function(e){return e.toString()}))}).then(A);return a.then.bind(a)}return w(e,[].concat(f(t),[r]))},set:function(n,i,a){g(c);var o=C(a),u=Object(r.a)(o,2),s=u[0],l=u[1];return z(e,{type:1,path:[].concat(f(t),[i]).map((function(e){return e.toString()})),value:s},l).then(A)},apply:function(n,i,a){g(c);var o=t[t.length-1];if(o===d)return z(e,{type:4}).then(A);if("bind"===o)return w(e,t.slice(0,-1));var u=x(a),s=Object(r.a)(u,2),l=s[0],f=s[1];return z(e,{type:2,path:t.map((function(e){return e.toString()})),argumentList:l},f).then(A)},construct:function(n,i){g(c);var a=x(i),o=Object(r.a)(a,2),u=o[0],s=o[1];return z(e,{type:3,path:t.map((function(e){return e.toString()})),argumentList:u},s).then(A)}});return i}function x(e){var t,n=e.map(C);return[n.map((function(e){return e[0]})),(t=n.map((function(e){return e[1]})),Array.prototype.concat.apply([],t))]}var k=new WeakMap;function S(e,t){return k.set(e,t),e}function E(e){return Object.assign(e,Object(a.a)({},b,!0))}function C(e){var t,n=function(e,t){var n;if("undefined"===typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=Object(i.a)(e))||t&&e&&"number"===typeof e.length){n&&(e=n);var r=0,c=function(){};return{s:c,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:c}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,o=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return o=e.done,e},e:function(e){u=!0,a=e},f:function(){try{o||null==n.return||n.return()}finally{if(u)throw a}}}}(h);try{for(n.s();!(t=n.n()).done;){var c=Object(r.a)(t.value,2),a=c[0],o=c[1];if(o.canHandle(e)){var u=o.serialize(e),s=Object(r.a)(u,2);return[{type:3,name:a,value:s[0]},s[1]]}}}catch(l){n.e(l)}finally{n.f()}return[{type:0,value:e},k.get(e)||[]]}function A(e){switch(e.type){case 3:return h.get(e.name).deserialize(e.value);case 0:return e.value}}function z(e,t,n){return new Promise((function(r){var c=new Array(4).fill(0).map((function(){return Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)})).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===c&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:c},t),n)}))}function P(e){var t=Object(c.useState)(e),n=Object(r.a)(t,2),i=n[0],a=n[1],o=Object(c.useMemo)((function(){return m(i)}),[i]),u=Object(c.useState)(!1),s=Object(r.a)(u,2),l=s[0],f=s[1],b=Object(c.useState)(!0),d=Object(r.a)(b,2),p=d[0],y=d[1];return Object(c.useEffect)((function(){l||o.initialize().then((function(){f(!0),y(!1)}))}),[l,p,o]),[p,y,o,function(){i.terminate(),y(!0),a(e()),f(!1)}]}},38:function(e,t,n){e.exports=n.p+"tic-tac-toe.f3c087e6331da8e2a54a.worker.js"},41:function(e,t,n){"use strict";n.r(t),function(e){var r=n(31),c=n(30),i=n(33),a=n(0),o=n.n(a),u=n(34),s=n(35),l=n(36),f=n(37),b=n(1);function d(){return new Worker(e,{name:"tic-tac-toe",type:void 0})}function p(e){return Object(b.jsx)(u.d,{width:400,height:400,children:e.squares.map((function(t,n){var r,c=400/3,i=n%3*c,a=Math.floor(n/3)*c,s=i+c/2,l=a+c/2,f=Object(b.jsx)(u.c,{x:i,y:a,size:c,onClick:function(){return e.onClick(n)}});switch(t){case"X":r=Object(b.jsx)(u.b,{centerX:s,centerY:l,size:c});break;case"O":r=Object(b.jsx)(u.a,{centerX:s,centerY:l,size:c})}return Object(b.jsxs)(o.a.Fragment,{children:[r,f]},n)}))})}function y(e,t,n){var r=e.squares.slice();return r[t]=e.next,{squares:r,next:"X"===e.next?"O":"X",history:e.history.concat([{position:t,score:n}])}}function j(e){return{board:{squares:Array(9).fill("E"),next:"X",history:[]},key:Math.random(),winner:null,judged:!0,player:e}}function h(e,t){switch(t.type){case"reset":return j(e.player);case"change_player":return e.player[t.side]===t.id?e:j(Object(i.a)(Object(i.a)({},e.player),{},Object(c.a)({},t.side,t.id)));case"put":return t.key!==e.key||(e.board.next!==t.side||e.winner)?e:e.judged?"E"!==e.board.squares[t.position]?e:Object(i.a)(Object(i.a)({},e),{},{board:y(e.board,t.position,t.score),judged:!1}):e;case"judge":return t.key!==e.key?e:Object(i.a)(Object(i.a)({},e),{},{winner:t.winner,judged:!0})}}t.default=function(){var e,t=Object(a.useMemo)((function(){return["Human","AI (Full Exploration)"]}),[]),n=Object(f.a)(d),c=Object(r.a)(n,4),i=c[0],o=c[1],u=c[2],y=c[3],v=Object(a.useReducer)(h,j({X:0,O:0})),O=Object(r.a)(v,2),m=O[0],g=O[1];function w(e,t){m.player[e]!==t&&(y(),g({type:"change_player",side:e,id:t}))}Object(a.useEffect)((function(){if(!i&&!m.winner)if(m.judged){var e=m.board.next;switch(t[m.player[e]]){case"Human":break;case"AI (Full Exploration)":var n=m.key;o(!0),u.search(m.board.squares,m.board.next).then((function(t){"number"===typeof t.position?g({type:"put",key:n,side:e,position:t.position,score:t.score}):console.error(t),o(!1)})).catch((function(e){return console.error(e)}))}}else{o(!0);var r=m.key;u.calculateWinner(m.board.squares).then((function(e){g({type:"judge",key:r,winner:e}),o(!1)})).catch((function(e){return console.error(e)}))}}),[i,t,m,o,u]),e=null===m.winner?"next player: ".concat(m.board.next):"E"===m.winner?"draw":"winner: ".concat(m.winner);var x=m.board.history.map((function(e,t){return null!=e.score?Object(b.jsxs)("li",{children:["OX"[t%2],": pos=",e.position," score=",e.score]},t):Object(b.jsxs)("li",{children:["OX"[t%2],": pos=",e.position]},t)}));return Object(b.jsxs)("div",{className:"container",children:[Object(b.jsxs)("div",{className:"content is-flex-direction-row",children:["X",Object(b.jsx)(l.a,{items:t,selected:m.player.X,isDisabled:!1,onChange:function(e){return w("X",e)}}),"vs",Object(b.jsx)(l.a,{items:t,selected:m.player.O,isDisabled:!1,onChange:function(e){return w("O",e)}}),"O"]}),Object(b.jsx)("div",{className:"content",children:Object(b.jsx)(p,{squares:m.board.squares,onClick:function(e){var t=m.board.next;0===m.player[t]&&g({type:"put",key:m.key,side:t,position:e})}})}),Object(b.jsx)("div",{className:"content",children:Object(b.jsx)("p",{children:e})}),Object(b.jsx)("div",{className:"content",children:Object(b.jsx)(s.a,{hasWinner:null!==m.winner,onClick:function(){y(),g({type:"reset"})}})}),Object(b.jsx)("div",{className:"content",children:Object(b.jsx)("ol",{children:x})})]})}}.call(this,n(38))}}]);
//# sourceMappingURL=5.9752f396.chunk.js.map