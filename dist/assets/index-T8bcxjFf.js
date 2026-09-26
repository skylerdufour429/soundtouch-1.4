(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function r(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(s){if(s.ep)return;s.ep=!0;const n=r(s);fetch(s.href,n)}})();const p=document.querySelector("#app"),i={archive:null,selectedPath:null,query:""};function l(e,t){if(!e)return null;if(t===e.path)return e;if(Array.isArray(e.children))for(const r of e.children){const a=l(r,t);if(a)return a}return null}function o(e,t=[]){if(t.push(e),Array.isArray(e.children))for(const r of e.children)o(r,t);return t}function f(e){const t=o(e),r=i.query.trim().toLowerCase();return r?t.filter(a=>`${a.name} ${a.type} ${a.path}`.toLowerCase().includes(r)):t}function m(e,t=0){const r=document.createElement("button");r.type="button",r.className="tree-node",r.dataset.path=e.path,r.style.setProperty("--depth",t),i.selectedPath===e.path&&r.classList.add("selected");const s=e.type==="directory"?"📁":"📄",n=document.createElement("span");return n.textContent=`${s} ${e.name}`,r.appendChild(n),r.addEventListener("click",()=>{i.selectedPath=e.path,h()}),r}function d(e){const t=document.querySelector("#tree");t.innerHTML="",f(e).forEach(a=>{const s=m(a,u(e,a.path,0));t.appendChild(s)})}function u(e,t,r=0){if(e.path===t)return r;if(Array.isArray(e.children))for(const a of e.children){const s=u(a,t,r+1);if(s!==-1)return s}return-1}function y(e){const t=o(e),r=t.filter(n=>n.type!=="directory").length,a=t.filter(n=>n.type==="directory").length,s=document.querySelector("#summary");s.innerHTML=`
    <div class="stat-card"><strong>${t.length}</strong><span>items</span></div>
    <div class="stat-card"><strong>${a}</strong><span>folders</span></div>
    <div class="stat-card"><strong>${r}</strong><span>files</span></div>
  `}function v(e){if(!e){document.querySelector("#details").innerHTML="<p>Select an item to inspect metadata.</p>";return}const t=document.querySelector("#details"),r=e.metadata??{},s=Object.entries({Name:e.name,Path:e.path,Type:e.type,Size:e.size??"n/a",SHA256:e.hash??"n/a","Bundle ID":r.bundleId??"n/a",CFBundleName:r.bundleName??"n/a","Short Version":r.shortVersion??"n/a",Version:r.version??"n/a",Source:r.source??"example-ipa-archive"}).map(([n,c])=>`
        <div class="meta-row">
          <dt>${n}</dt>
          <dd>${c}</dd>
        </div>
      `).join("");t.innerHTML=`
    <div class="details-header">
      <div class="badge">${e.type==="directory"?"Directory":"File"}</div>
      <h2>${e.name}</h2>
    </div>
    <dl class="meta-list">${s}</dl>
  `}function h(){const e=i.archive.root;y(e),d(e);let t=i.archive.root;i.selectedPath&&(t=l(e,i.selectedPath)??e),i.selectedPath=t.path,v(t)}async function b(){const t=await(await fetch("/data/archive.json")).json();i.archive=t,i.selectedPath=t.root.path,h(),document.querySelector("#search").addEventListener("input",a=>{i.query=a.target.value,d(i.archive.root)})}p.innerHTML=`
  <div class="app-shell">
    <aside class="sidebar">
      <div class="header-block">
        <p class="eyebrow">IPA archive</p>
        <h1>SoundTouch</h1>
      </div>

      <label class="search-box" for="search">
        <span>Search</span>
        <input id="search" type="search" placeholder="Filter archive items" />
      </label>

      <div id="summary" class="summary"></div>
      <div id="tree" class="tree" aria-label="Archive tree"></div>
    </aside>

    <main class="content-panel">
      <div id="details" class="details"></div>
    </main>
  </div>
`;b();
