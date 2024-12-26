var H=Object.defineProperty;var A=(d,e,t)=>e in d?H(d,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[e]=t;var r=(d,e,t)=>A(d,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const u={DISPLAY_NAME:"CataOS",VERSION:"0.0.1",AUTHOR:"catanuclei",COPYRIGHT_YEAR:"2024"},O=(()=>{const d=[];for(let e=0;e<10;e++)d.push(e.toString());for(let e=0;e<26;e++)d.push(String.fromCharCode(97+e));for(let e=0;e<26;e++)d.push(String.fromCharCode(65+e));return d})(),b=d=>{const e=document.createElement("span"),t=document.createElement("span");e.innerHTML=`${u.DISPLAY_NAME} ${u.VERSION}`,t.innerHTML=`${u.AUTHOR} &copy; ${u.COPYRIGHT_YEAR}`,d.appendChild(e),d.appendChild(t)},T=d=>{const e=document.createElement("span");return e.classList.add("bi",`bi-${d}`),e},D="window",Y="window__title",$="window__title__icon",B="window__title__text",R="window__title__buttons",k="window__title__button",P=6,w="context-menu",W="context-menu__item";class X{constructor(e,t){r(this,"_managerNode");r(this,"_desktopNode");r(this,"_contextNode");r(this,"_windowMap");r(this,"_isContextOpen");r(this,"_desktopContextItems");r(this,"createWindow",(e,t)=>{let o=this._generateWindowKey();for(;this._windowMap[o];)o=this._generateWindowKey();const n=Object.values(this._windowMap).length?Object.values(this._windowMap).sort((c,s)=>s.order-c.order)[0].order+1:0,i=U({title:e,order:n},{x:(t==null?void 0:t.x)??0,y:(t==null?void 0:t.y)??0},o,this.closeWindow,this.focusWindow,(c,s,a)=>this.openContextMenu([{text:"Close",handler:()=>this.closeWindow(c)}],s,a));return this._managerNode.appendChild(i),this._windowMap[o]={title:e,order:n},this._shiftOutOfBoundsWindow(o),{key:o}});r(this,"closeWindow",e=>{var o;if(!this._windowMap[e])return;(o=this._managerNode.querySelector(`[data-key="${e}"]`))==null||o.remove();const t=this._windowMap[e].order;Object.keys(this._windowMap).forEach(n=>{this._windowMap[n].order>t&&this._windowMap[n].order--}),delete this._windowMap[e]});r(this,"focusWindow",e=>{if(!this._windowMap[e])return;const t=this._windowMap[e].order,o=Object.values(this._windowMap).sort((n,i)=>i.order-n.order)[0].order;Object.keys(this._windowMap).forEach(n=>{this._windowMap[n].order>t&&this._windowMap[n].order--}),this._windowMap[e].order=o,[...this._managerNode.querySelectorAll("[data-key]")].forEach(n=>{const i=n.dataset.key;n.style.zIndex=this._windowMap[i].order.toString()})});r(this,"openContextMenu",(e,t,o)=>{if(this.closeContextMenu(),!e.length)return;e.forEach(c=>{const s=document.createElement("li");s.innerHTML=c.text,s.classList.add(W),this._contextNode.appendChild(s)}),this._isContextOpen=!0,this._contextNode.classList.add(`${w}--shown`);const n=t+this._contextNode.offsetWidth>window.innerWidth?t-this._contextNode.offsetWidth:t,i=o+this._contextNode.offsetHeight>window.innerHeight?o-this._contextNode.offsetHeight:o;[...this._contextNode.children].forEach((c,s)=>{c.onclick=()=>{e[s].handler({menuPosition:{x:n,y:i}}),this.closeContextMenu()}}),this._contextNode.style.left=`${n}px`,this._contextNode.style.top=`${i}px`});r(this,"setDesktopContextMenu",e=>{this._desktopContextItems=e});r(this,"closeContextMenu",()=>{this._isContextOpen&&(this._contextNode.innerHTML="",this._contextNode.classList.remove(`${w}--shown`))});r(this,"_setupContextNode",()=>{this._contextNode.classList.add(w),this._desktopNode.appendChild(this._contextNode)});r(this,"_generateWindowKey",()=>{let e="";for(let t=0;t<P;t++)e+=O[Math.floor(Math.random()*O.length)];return e});r(this,"_shiftOutOfBoundsWindows",()=>{[...this._managerNode.querySelectorAll("[data-key]")].forEach(e=>{e.offsetLeft>window.innerWidth-e.offsetWidth&&(e.style.left=window.innerWidth-e.offsetWidth+"px"),e.offsetTop>window.innerHeight-e.offsetHeight&&(e.style.top=window.innerHeight-e.offsetHeight+"px")})});r(this,"_shiftOutOfBoundsWindow",e=>{if(!this._windowMap[e])return;const t=this._managerNode.querySelector(`[data-key="${e}"]`);t.offsetLeft>window.innerWidth-t.offsetWidth&&(t.style.left=window.innerWidth-t.offsetWidth+"px"),t.offsetTop>window.innerHeight-t.offsetHeight&&(t.style.top=window.innerHeight-t.offsetHeight+"px")});this._managerNode=e,this._desktopNode=t,this._contextNode=document.createElement("ul"),this._windowMap={},this._isContextOpen=!1,this._desktopContextItems=[],this._setupContextNode();let o;window.addEventListener("resize",()=>{clearTimeout(o),o=setTimeout(this._shiftOutOfBoundsWindows,150)}),window.addEventListener("mousedown",n=>{n.target.classList.contains(w)||n.target.classList.contains(W)||this.closeContextMenu()}),this._desktopNode.addEventListener("contextmenu",n=>{n.preventDefault(),this.openContextMenu(this._desktopContextItems,n.clientX,n.clientY)})}}const U=({title:d,order:e},t,o,n,i,c)=>{const s=document.createElement("div"),a=document.createElement("p"),_=document.createElement("span"),f=document.createElement("span"),p=document.createElement("div"),m=document.createElement("button"),E=T("x");return s.classList.add(D),a.classList.add(Y),_.classList.add($),f.classList.add(B),p.classList.add(R),m.classList.add(k),_.appendChild(T("window")),f.innerHTML=d,m.appendChild(E),p.appendChild(m),a.appendChild(_),a.appendChild(f),a.appendChild(p),a.addEventListener("mousedown",l=>{const L=s.offsetWidth,C=s.offsetHeight,x=l.clientX-s.offsetLeft,N=l.clientY-s.offsetTop,g=h=>{const I=h.clientY-N<0?0:h.clientY-N>=window.innerHeight-C?window.innerHeight-C:h.clientY-N,v=h.clientX-x<0?0:h.clientX-x>=window.innerWidth-L?window.innerWidth-L:h.clientX-x;s.style.left=v+"px",s.style.top=I+"px"},M=()=>{document.removeEventListener("mousemove",g),document.removeEventListener("mouseup",M)};document.addEventListener("mousemove",g),document.addEventListener("mouseup",M)}),s.addEventListener("mousedown",()=>i(o)),s.addEventListener("contextmenu",l=>{l.preventDefault(),c(o,l.clientX,l.clientY)}),E.addEventListener("mousedown",()=>n(o)),s.appendChild(a),s.style.left=`${t.x}px`,s.style.top=`${t.y}px`,s.style.zIndex=e.toString(),s.dataset.key=o,s},S=document.getElementById("desktop"),q=document.getElementById("window-manager");b(S.querySelector(".desktop__info"));const y=new X(q,S);y.setDesktopContextMenu([{text:"New Window",handler:({menuPosition:d})=>y.createWindow("Window",d)}]);
