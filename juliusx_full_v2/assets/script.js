async function loadJSON(path){ const r = await fetch(path); return await r.json(); }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

// ---------- GALLERY ----------
function galleryCard(i){
  // thumb is always an image for perf
  return `
  <article class="card" data-type="${i.type}" data-src="${i.src}" data-title="${i.title}" data-caption="${i.caption||''}">
    <img class="thumb" loading="lazy" src="${i.thumb}" alt="${i.title}">
    <div class="meta">
      <div>${i.title}${i.tags && i.tags.length ? ` · <span class="badge">${i.tags.join(', ')}</span>` : ''}</div>
      ${i.caption ? `<div class="badge">${i.caption}</div>` : ``}
    </div>
  </article>`;
}
function renderGallery(items){
  const wrap = document.querySelector('#gallery');
  wrap.innerHTML = items.map(galleryCard).join('');
  wrap.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const type = card.dataset.type;
      const src = card.dataset.src;
      const title = card.dataset.title;
      const caption = card.dataset.caption;
      openLightbox({type,src,title,caption});
    });
  });
}
function paginate(data, page, per=12){
  const total = Math.ceil(data.length/per) || 1;
  const start = (page-1)*per;
  return {slice:data.slice(start,start+per), total};
}
function renderPager(total, current){
  const p = document.querySelector('.pager');
  if(!p) return;
  p.innerHTML = '';
  const prev = el(`<button ${current<=1?'disabled':''}>prev</button>`);
  const next = el(`<button ${current>=total?'disabled':''}>next</button>`);
  prev.onclick = ()=> { const t = new URL(location); t.searchParams.set('p', String(current-1)); location = t; };
  next.onclick = ()=> { const t = new URL(location); t.searchParams.set('p', String(current+1)); location = t; };
  p.append(prev);
  for(let i=1;i<=total;i++){
    const b=el(`<button ${i===current?'disabled':''}>${i}</button>`);
    b.onclick = ()=> { const t = new URL(location); t.searchParams.set('p', String(i)); location = t; };
    p.append(b);
  }
  p.append(next);
}
async function initHome(){
  const data = await loadJSON('./content/gallery.json');
  const url = new URL(location); const page = Number(url.searchParams.get('p') || 1);
  const {slice,total} = paginate(data.items || [], page, 12);
  renderGallery(slice); renderPager(total, page);
}

// ---------- SHOP ----------
function inventoryPill(state){
  if(state==='low') return `<span class="pill low">low</span>`;
  if(state==='out_of_stock') return `<span class="pill oos">sold out</span>`;
  return `<span class="pill instock">in stock</span>`;
}
async function initShop(){
  const data = await loadJSON('./content/products.json');
  const wrap = document.querySelector('#shop');
  wrap.innerHTML = (data.items||[]).map(p => `
    <article class="card">
      <img class="thumb" loading="lazy" src="${p.thumb}" alt="${p.title}">
      <div class="meta">
        <div>${p.title} — <span class="price">${p.price}</span> ${inventoryPill(p.inventory||'in_stock')}</div>
        <div class="badge">${p.description || ''}</div>
      </div>
      <a class="btn" ${p.inventory==='out_of_stock'?'aria-disabled="true" style="pointer-events:none;opacity:.5"':''}
         href="${p.checkout_url}" target="_blank" rel="noopener">Buy</a>
    </article>`).join('');
}

// ---------- LIGHTBOX ----------
let LB=null;
function ensureLightbox(){
  if(LB) return LB;
  const root = el(`
    <div class="lightbox-backdrop" id="lightbox">
      <div class="lightbox-frame">
        <button class="lightbox-close" aria-label="Close">✕</button>
        <div class="lightbox-caption"></div>
      </div>
    </div>`);
  document.body.appendChild(root);
  const frame = root.querySelector('.lightbox-frame');
  const close = root.querySelector('.lightbox-close');
  const cap = root.querySelector('.lightbox-caption');

  function closeLB(){
    root.classList.remove('open');
    const media = frame.querySelector('img,video,iframe'); if(media){ media.remove(); }
  }
  close.addEventListener('click', closeLB);
  root.addEventListener('click', (e)=>{ if(e.target===root) closeLB(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLB(); });

  LB = {root,frame,cap,closeLB};
  return LB;
}
function openLightbox({type,src,title,caption}){
  const {root,frame,cap} = ensureLightbox();
  const media =
    type==='image' ? el(`<img src="${src}" alt="${title}">`) :
    type==='video' ? el(`<video src="${src}" controls playsinline preload="metadata"></video>`) :
    type==='youtube' ? el(`<iframe width="1280" height="720" src="https://www.youtube.com/embed/${src}" title="${title}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`) :
    type==='vimeo' ? el(`<iframe src="https://player.vimeo.com/video/${src}" width="1280" height="720" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`) :
    el(`<div style="color:#fff;padding:20px">Unsupported type</div>`);
  frame.insertBefore(media, cap);
  cap.textContent = caption || title || '';
  root.classList.add('open');
}
