'use strict';
(() => {
  const gallery = window.LENSERASE_GALLERY;
  if (!gallery) return;
  const byId = new Map([...(gallery.featured || []), ...Object.values(gallery.groups).flat()].map(c => [c.id, c]));
  const state = { showcase: {filter:'All',shown:12}, commercial:{filter:'All',shown:6}, open:{filter:'All',shown:6,baseline:'all'} };
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroCase = byId.get(gallery.heroCases[0]), heroPaused = reducedMotion.matches, heroIndex = 0;
  const motionElements = new Set();
  const visibleElements = new Set();

  function modelsFor(c, filtered=false) {
    if(c.id.startsWith('showcase')) return ['Overview','Input','Selection','Mask','LensErase'];
    if(c.id.startsWith('commercial')) return ['Input','Mask','GPT-Image2.5-Sunburst','Flux2-Erase','LensErase'];
    if(filtered && state.open.baseline!=='all') return ['Input','Mask',state.open.baseline,'LensErase'];
    return ['Input','Mask','OSOR','OmniPaint','ObjectClear','GeoRemover','RORem-mixed','LensErase'];
  }
  function imageTag(view,alt,eager=false) {
    const srcset=view.srcWidth===view.largeWidth?`${view.large} ${view.largeWidth}w`:`${view.src} ${view.srcWidth}w, ${view.large} ${view.largeWidth}w`;
    return `<img src="${view.src}" srcset="${srcset}" sizes="${eager?'(max-width:760px) 90vw, 55vw':'(max-width:600px) 90vw, 40vw'}" width="${view.width}" height="${view.height}" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" decoding="async">`;
  }
  function animationMarkup(c,hero=false) {
    const ratio=c.views.Input.width/c.views.Input.height, contour=c.contours;
    const outlines=contour.paths.map(path=>`<path d="${path}" pathLength="1"/>`).join('');
    return `<button class="erasure-demo${hero?' hero-demo':''}" type="button" style="--ratio:${ratio};--mask:url('${(c.displayMask || c.views.Mask).large}')" data-animation="${c.id}" data-open="${c.id}" data-model="Overview" aria-label="View static original, mask and result for ${esc(c.title)}">
      <span class="motion-result">${imageTag(c.views.LensErase,`${c.title}: LensErase result`,hero)}</span>
      <span class="motion-source">${imageTag(c.views.Input,`${c.title}: original image`,hero)}</span>
      <span class="mask-tint" aria-hidden="true"></span>
      <svg class="mask-contour" viewBox="0 0 ${contour.width} ${contour.height}" preserveAspectRatio="none" aria-hidden="true"><g class="contour-underlay">${outlines}</g><g class="contour-red">${outlines}</g></svg>
      <span class="demo-state state-source">Original</span><span class="demo-state state-select"><i></i>Selection</span><span class="demo-state state-result">LensErase</span>
      <span class="demo-open" aria-hidden="true">View images ↗</span><span class="motion-progress" aria-hidden="true"></span>
    </button>`;
  }
  function updateMotion(el) {
    const paused = !el.classList.contains('images-ready') || !visibleElements.has(el) || document.hidden || document.body.classList.contains('dialog-open') || (el.classList.contains('hero-demo') ? heroPaused : reducedMotion.matches);
    el.classList.toggle('is-playing',!paused);
    el.classList.toggle('reduced-motion',reducedMotion.matches && (el.classList.contains('hero-demo')?heroPaused:true));
  }
  const motionObserver = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting) visibleElements.add(entry.target);else visibleElements.delete(entry.target);
    updateMotion(entry.target);
  }),{threshold:.2});
  function bindAnimations(root) {
    for(const el of [...motionElements]) if(!el.isConnected){motionElements.delete(el);visibleElements.delete(el);motionObserver.unobserve(el);}
    root.querySelectorAll('[data-animation]').forEach(el=>{
      motionElements.add(el);motionObserver.observe(el);
      const ready=[...el.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}));
      Promise.all(ready).then(()=>{if(el.isConnected){el.classList.add('images-ready');updateMotion(el);}});
    });
  }
  function updateAllMotion(){motionElements.forEach(updateMotion);}
  document.addEventListener('visibilitychange',updateAllMotion);
  reducedMotion.addEventListener('change',()=>{heroPaused=reducedMotion.matches;setPauseLabel();updateAllMotion();});
  function bindOpen(root){root.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>openCase(byId.get(button.dataset.open),button.dataset.model)));}
  const heroTabs=document.querySelector('#hero-tabs');
  gallery.heroCases.forEach((id,index)=>{
    const c=byId.get(id),button=document.createElement('button');button.type='button';button.role='tab';
    button.innerHTML=`<img src="${c.views.Input.src}" alt="" loading="lazy"><span>${esc(gallery.heroLabels[index])}</span>`;
    button.addEventListener('click',()=>setHero(index));heroTabs.append(button);
  });
  heroTabs.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
    const next=e.key==='Home'?0:e.key==='End'?gallery.heroCases.length-1:(heroIndex+(e.key==='ArrowRight'?1:-1)+gallery.heroCases.length)%gallery.heroCases.length;
    setHero(next);heroTabs.children[next].focus();
  });
  function setHero(index){
    heroIndex=index;heroCase=byId.get(gallery.heroCases[index]);
    [...heroTabs.children].forEach((b,i)=>{b.setAttribute('aria-selected',i===index?'true':'false');b.tabIndex=i===index?0:-1;});
    document.querySelector('#hero-category').textContent=gallery.heroLabels[index];
    document.querySelector('#hero-case-title').innerHTML=(heroCase.headline || heroCase.title).split('\n').map(esc).join('<br> ');
    document.querySelector('#hero-description').textContent=heroCase.description;
    const root=document.querySelector('#hero-view');root.innerHTML=animationMarkup(heroCase,true);bindOpen(root);bindAnimations(root);setPauseLabel();
  }
  function setPauseLabel(){
    const b=document.querySelector('#hero-pause');b.innerHTML=heroPaused?'<span aria-hidden="true">▷</span> Play':'<span aria-hidden="true">Ⅱ</span> Pause';b.setAttribute('aria-pressed',heroPaused?'true':'false');b.setAttribute('aria-label',heroPaused?'Play animation':'Pause animation');
    document.querySelector('.featured-stage').classList.toggle('animation-paused',heroPaused);
  }
  document.querySelector('#hero-pause').addEventListener('click',()=>{heroPaused=!heroPaused;setPauseLabel();updateAllMotion();});
  document.querySelector('#hero-replay').addEventListener('click',()=>{heroPaused=false;setHero(heroIndex);});
  document.querySelector('#hero-expand').addEventListener('click',()=>openCase(heroCase,'Overview'));
  setHero(0);

  function filteredCases(section){return gallery.groups[section].filter(c=>state[section].filter==='All'||c.category===state[section].filter);}
  function buildFilters(section){
    const root=document.querySelector(`#${section}-filters`),present=new Set(gallery.groups[section].map(c=>c.category));
    const categories=['All',...(section==='showcase'?gallery.showcaseCategoryOrder:['General','Poster','Watermark','Text']).filter(x=>present.has(x))];
    categories.forEach(category=>{const b=document.createElement('button');b.type='button';b.textContent=category;b.setAttribute('aria-pressed',category==='All'?'true':'false');b.addEventListener('click',()=>{state[section].filter=category;state[section].shown=section==='showcase'?12:6;[...root.children].forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));renderSection(section);});root.append(b);});
    document.querySelector(`#${section}-more`).addEventListener('click',()=>{state[section].shown=gallery.groups[section].length;renderSection(section);});
  }
  function showcaseCard(c){return `<article class="showcase-card" data-case-id="${c.id}"><div class="showcase-visual">${animationMarkup(c)}</div></article>`;}
  function comparisonCard(c,section){
    const models=modelsFor(c,true),ratio=c.views.Input.width/c.views.Input.height;
    return `<article class="comparison-card${section==='open'?' open-comparison':''}" data-case-id="${c.id}"><div class="comparison-card-header"><span class="case-tag"><span class="case-number">${c.id.split('-').at(-1)}</span>${esc(c.category)}</span><button class="text-button" type="button" data-open="${c.id}" data-model="LensErase">Inspect case ↗</button></div><div class="comparison-views" style="--columns:${models.length};--view-ratio:${ratio}">${models.map(model=>`<figure class="comparison-view${model==='LensErase'?' is-ours':''}${model==='GPT-Image2.5-Sunburst'?' is-sunburst':''}"><figcaption>${esc(model)}</figcaption><button class="image-button" type="button" data-open="${c.id}" data-model="${esc(model)}" aria-label="Inspect ${esc(model)} for ${esc(c.category)} case ${c.id.split('-').at(-1)}">${imageTag(c.views[model],`${model} — ${c.category} removal`)}</button></figure>`).join('')}</div></article>`;
  }
  function renderSection(section){
    const cases=filteredCases(section),shown=Math.min(state[section].shown,cases.length),grid=document.querySelector(`#${section}-grid`);
    grid.innerHTML=cases.slice(0,shown).map(c=>section==='showcase'?showcaseCard(c):comparisonCard(c,section)).join('');
    document.querySelector(`#${section}-count`).textContent=`${shown} / ${cases.length} cases`;
    const more=document.querySelector(`#${section}-more`);more.hidden=shown===cases.length;more.textContent=`Show all ${cases.length} cases ↓`;
    bindOpen(grid);bindAnimations(grid);
  }
  ['showcase','commercial','open'].forEach(section=>{buildFilters(section);renderSection(section);});
  document.querySelector('#baseline-select').addEventListener('change',e=>{state.open.baseline=e.target.value;renderSection('open');});

  const dialog=document.querySelector('#case-dialog'),detailView=document.querySelector('#detail-view'),detailImage=document.querySelector('#detail-image'),staticOverview=document.querySelector('#static-case-overview');
  function creditLink(label,url){
    const link=document.createElement('a');link.textContent=label;link.href=url;
    if(!url.startsWith('#')){link.target='_blank';link.rel='noopener noreferrer';}
    else {link.addEventListener('click',()=>{if(dialog.open)dialog.close();});}
    return link;
  }
  function creditContent(credit,includeTitle=false){
    const content=document.createDocumentFragment();
    if(includeTitle){content.append(creditLink(credit.title,credit.url),document.createTextNode(' — '));}
    if(credit.author){content.append(document.createTextNode(`${credit.author} / `));}
    if(!includeTitle){content.append(creditLink(credit.label,credit.url));}
    else {content.append(document.createTextNode(credit.label));}
    if(credit.license){
      content.append(document.createTextNode(' · '));
      content.append(credit.licenseUrl?creditLink(credit.license,credit.licenseUrl):document.createTextNode(credit.license));
    }
    return content;
  }
  function showCredit(c){
    const line=document.querySelector('#dialog-credit'),credit=gallery.imageCredits[c.creditId];
    line.replaceChildren();line.hidden=!credit;
    if(!credit)return;
    line.replaceChildren(document.createTextNode('Source: '),creditContent(credit));
    if(credit.note){line.append(document.createTextNode(`. ${credit.note}`));}
  }
  const commonsList=document.querySelector('#commons-credits-list');
  Object.values(gallery.imageCredits).filter(c=>c.kind==='commons').forEach(credit=>{
    const item=document.createElement('li');item.append(creditContent(credit,true));commonsList.append(item);
  });
  let activeCase,activeModel,detailGroup,lastFocused,zoom=1,panX=0,panY=0,dragStart,moved=false;
  function updateTransform(){detailImage.style.setProperty('--zoom',zoom);detailImage.style.setProperty('--pan-x',`${panX}px`);detailImage.style.setProperty('--pan-y',`${panY}px`);}
  function resetZoom(){zoom=1;panX=panY=0;dragStart=undefined;detailView.classList.remove('zoomed','dragging');updateTransform();}
  function showModel(model){
    activeModel=model;resetZoom();const overview=model==='Overview';staticOverview.hidden=!overview;detailView.hidden=overview;
    document.querySelector('.dialog-bottom>p').textContent=overview?'Choose an image to inspect it closely.':'Click to zoom. Drag to pan.';
    if(overview){staticOverview.innerHTML=['Input','Mask','LensErase'].map(label=>`<figure class="${label==='LensErase'?'is-ours':''}"><figcaption>${label==='Input'?'Original':label}</figcaption><button type="button" class="image-button" data-static-model="${label}">${imageTag(activeCase.views[label],`${activeCase.title}: ${label}`,true)}</button></figure>`).join('');staticOverview.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>showModel(b.dataset.staticModel)));}
    else {detailImage.src=model==='Selection'?activeCase.selection.src:activeCase.views[model].large;detailImage.alt=`${model} — ${activeCase.title}`;}
    document.querySelectorAll('#dialog-tabs button').forEach(b=>{const on=b.dataset.model===model;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
  }
  function openCase(c,model='LensErase'){
    activeCase=c;const section=c.id.split('-')[0],filtered=filteredCases(section);detailGroup=gallery.heroCases.includes(c.id)?gallery.featured:(filtered.some(x=>x.id===c.id)?filtered:gallery.groups[section]);const index=detailGroup.findIndex(x=>x.id===c.id);
    document.querySelector('#dialog-category').textContent=section==='showcase'?'LENSERASE · STATIC VIEWS':'QUALITATIVE COMPARISON';
    document.querySelector('#dialog-title').textContent=section==='showcase'?c.title:`${c.category} removal · Case ${c.id.split('-').at(-1)}`;
    const tabs=document.querySelector('#dialog-tabs');tabs.replaceChildren();modelsFor(c).forEach(label=>{const b=document.createElement('button');b.type='button';b.role='tab';b.textContent=label==='Input'?'Original':label;b.dataset.model=label;b.className=label==='LensErase'?'ours-tab':'';b.addEventListener('click',()=>showModel(label));tabs.append(b);});
    document.querySelector('#dialog-prev').disabled=index<=0;document.querySelector('#dialog-next').disabled=index>=detailGroup.length-1;document.querySelector('#dialog-position').textContent=`${index+1} / ${detailGroup.length}`;
    showModel(model);showCredit(c);
    if(!dialog.open){lastFocused=document.activeElement;dialog.showModal();document.body.classList.add('dialog-open');updateAllMotion();}
  }
  document.querySelector('#dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{resetZoom();document.body.classList.remove('dialog-open');updateAllMotion();lastFocused?.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  function adjacentCase(delta){const c=detailGroup[detailGroup.findIndex(x=>x.id===activeCase.id)+delta];if(c)openCase(c,modelsFor(c).includes(activeModel)?activeModel:'LensErase');}
  document.querySelector('#dialog-prev').addEventListener('click',()=>adjacentCase(-1));document.querySelector('#dialog-next').addEventListener('click',()=>adjacentCase(1));
  document.querySelector('#dialog-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const models=modelsFor(activeCase);let i=models.indexOf(activeModel);i=e.key==='Home'?0:e.key==='End'?models.length-1:(i+(e.key==='ArrowRight'?1:-1)+models.length)%models.length;showModel(models[i]);document.querySelector('#dialog-tabs button[aria-selected=true]').focus();});
  detailView.addEventListener('pointerdown',e=>{moved=false;if(zoom===1)return;dragStart={x:e.clientX,y:e.clientY,px:panX,py:panY};detailView.setPointerCapture(e.pointerId);detailView.classList.add('dragging');});
  detailView.addEventListener('pointermove',e=>{if(!dragStart||zoom===1)return;const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;const r=detailView.getBoundingClientRect();panX=Math.max(-r.width*(zoom-1)/2,Math.min(r.width*(zoom-1)/2,dragStart.px+dx));panY=Math.max(-r.height*(zoom-1)/2,Math.min(r.height*(zoom-1)/2,dragStart.py+dy));updateTransform();});
  ['pointerup','pointercancel'].forEach(type=>detailView.addEventListener(type,()=>{dragStart=undefined;detailView.classList.remove('dragging');}));
  detailView.addEventListener('click',()=>{if(moved)return;zoom=zoom===1?2.2:1;panX=panY=0;detailView.classList.toggle('zoomed',zoom>1);updateTransform();});
  const navLinks=document.querySelectorAll('.site-header nav a'),navSections=['showcase','data','benchmark','commercial'].map(id=>document.getElementById(id));let navFrame=0;
  function updateActiveNav(){let active='';const threshold=document.querySelector('.site-header').offsetHeight+100;navSections.forEach(s=>{if(s.getBoundingClientRect().top<=threshold)active=`#${s.id}`;});navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===active));navFrame=0;}
  window.addEventListener('scroll',()=>{if(!navFrame)navFrame=requestAnimationFrame(updateActiveNav);},{passive:true});window.addEventListener('resize',updateActiveNav);updateActiveNav();
})();
