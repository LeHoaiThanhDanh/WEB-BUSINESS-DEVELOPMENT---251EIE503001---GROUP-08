// Product detail page (clean UTF-8)

async function loadComponent(targetSelector, url) {
  const host = document.querySelector(targetSelector);
  if (!host) return;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      host.innerHTML = `<div style="padding:16px;color:#b00">Không tải được ${url}</div>`;
      return;
    }
    const html = await res.text();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const frag = document.createDocumentFragment();
    for (const node of Array.from(tmp.childNodes)) {
      const isScript = node.tagName && node.tagName.toLowerCase() === 'script';
      if (!isScript) frag.appendChild(node.cloneNode(true));
    }
    host.innerHTML = '';
    host.appendChild(frag);
    for (const old of Array.from(tmp.querySelectorAll('script'))) {
      const s = document.createElement('script');
      for (const { name, value } of Array.from(old.attributes)) s.setAttribute(name, value);
      if (old.src) s.src = old.src; else s.textContent = old.textContent || '';
      document.body.appendChild(s);
    }
  } catch (err) {
    host.innerHTML = `<div style="padding:16px;color:#b00">Không tải được ${url}</div>`;
    console.error('loadComponent error:', url, err);
  }
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('ngogia_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.username) return parsed;
    return null;
  } catch (e) {
    console.warn('Cannot parse ngogia_user', e);
    return null;
  }
}

const headerUrl = getCurrentUser()
  ? '/src/Components/page-header/header2.html'
  : '/src/Components/page-header/header.html';

loadComponent('#app-header', headerUrl);
loadComponent('#app-footer', '/src/Components/page-footer/footer.html');

function getQuery() {
  const sp = new URLSearchParams(location.search);
  const pid = sp.get('pid');
  const name = sp.get('name');
  return { pid: pid ? Number(pid) : null, name };
}

function formatVND(n) {
  if (typeof n !== 'number') return '';
  try { return n.toLocaleString('vi-VN'); } catch { return String(n); }
}

function escapeAttr(value) {
  return String(value == null ? '' : value).replace(/"/g, '&quot;');
}

async function fetchProducts() {
  const res = await fetch('/public/data/products.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function fetchRandomRecommendations(excludeId) {
  const params = new URLSearchParams({ count: '4' });
  if (excludeId !== undefined && excludeId !== null && excludeId !== '') {
    params.append('exclude', String(excludeId));
  }
  const res = await fetch(`/api/products/random?${params.toString()}`, { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const payload = await res.json();
  if (payload && Array.isArray(payload.items)) return payload.items;
  throw new Error('Invalid payload');
}

function pickRandomItems(source, count) {
  if (!Array.isArray(source) || !source.length) return [];
  const pool = source.slice();
  const limit = Math.min(count, pool.length);
  const result = [];
  for (let i = 0; i < limit; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

function hydrateDetail(container, p) {
  const pageTitle = document.getElementById('page-title');
  const crumb = document.getElementById('breadcrumb-current');
  if (pageTitle) pageTitle.textContent = p.name || '';
  if (crumb) crumb.textContent = p.name || '';

  const basePrice = Number(p.price) || 0;
  const priceM = basePrice;
  const priceL = basePrice ? basePrice + 3000 : 0;
  const priceVipM = basePrice ? Math.max(0, basePrice - 3000) : 0;
  const priceVipL = priceL ? Math.max(0, priceL - 3000) : 0;
  const rating = Number(p.rating) || 5;
  const ratingPct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const reviewCount = 500;

  const mainImg = `/${(p.image || '').replace(/^\//,'')}`;
  const thumbs = [mainImg, mainImg, mainImg, mainImg];

  const infoNameEl = document.getElementById('info-name');
  const infoStorageEl = document.getElementById('info-storage');
  const infoWeightEl = document.getElementById('info-weight');
  const infoOriginEl = document.getElementById('info-origin');
  const infoToppingEl = document.getElementById('info-topping');
  const noteTextEl = document.getElementById('note-text');
  const sizePillM = document.getElementById('size-pill-m');
  const sizePillL = document.getElementById('size-pill-l');
  if (infoNameEl) infoNameEl.textContent = p.name || 'Đang cập nhật';
  if (infoStorageEl) infoStorageEl.textContent = p.storage || '1-2 ngày ở ngăn mát tủ lạnh';
  if (infoWeightEl) infoWeightEl.textContent = p.weight || '700ml (size M) / 1000ml (size L)';
  if (infoOriginEl) infoOriginEl.textContent = p.origin || 'Việt Nam';
  if (infoToppingEl) infoToppingEl.textContent = p.topping || 'Thạch dừa nguyên vị, hạt nổ củ năng';
  if (noteTextEl) noteTextEl.textContent = p.note || 'Chi tiết bổ sung về sản phẩm sẽ được cập nhật tại đây.';
  if (sizePillM) sizePillM.textContent = `${formatVND(priceM)}đ`;
  if (sizePillL) sizePillL.textContent = `${formatVND(priceL)}đ`;

  const catEl = container.querySelector('#prod-cat');
  const nameEl = container.querySelector('#prod-name');
  const starsFill = container.querySelector('.info .stars .fill');
  const ratingText = container.querySelector('#prod-rating-text');
  if (catEl) catEl.textContent = p.category || '';
  if (nameEl) nameEl.textContent = p.name || '';
  if (starsFill) starsFill.style.width = `${ratingPct}%`;
  if (ratingText) ratingText.textContent = `${rating.toFixed(1)} (${reviewCount} lượt đánh giá)`;

  const pm = container.querySelector('#price-m');
  const pl = container.querySelector('#price-l');
  const pvm = container.querySelector('#price-vip-m');
  const pvl = container.querySelector('#price-vip-l');
  if (pm) pm.textContent = `${formatVND(priceM)}₫`;
  if (pl) pl.textContent = `${formatVND(priceL)}₫`;
  if (pvm) pvm.textContent = `${formatVND(priceVipM)}₫`;
  if (pvl) pvl.textContent = `${formatVND(priceVipL)}₫`;

  const mainEl = container.querySelector('.main-img');
  if (mainEl) { mainEl.src = mainImg; mainEl.alt = p.name || 'Sản phẩm'; }
  const thumbEls = Array.from(container.querySelectorAll('.thumb'));
  thumbEls.forEach((t, i) => { t.src = thumbs[i % thumbs.length]; t.alt = `${p.name} ${i+1}`; });

  const scoreVal = container.querySelector('#score-value');
  const scoreStars = container.querySelector('#score-stars');
  const scoreCount = container.querySelector('#score-count');
  if (scoreVal) scoreVal.innerHTML = `${rating.toFixed(1)} <span class="unit">out of 5</span>`;
  if (scoreStars) scoreStars.style.width = `${ratingPct}%`;
  if (scoreCount) scoreCount.textContent = `(${reviewCount} lượt đánh giá)`;

  let active = 0;
  function setActive(i){
    active = (i + thumbEls.length) % thumbEls.length;
    thumbEls.forEach((t, idx) => t.classList.toggle('active', idx === active));
    const src = thumbEls[active].getAttribute('src');
    if (src && mainEl) mainEl.setAttribute('src', src);
  }
  thumbEls.forEach((t, i) => t.addEventListener('click', () => setActive(i)));
  const prevBtn = container.querySelector('.nav-prev');
  const nextBtn = container.querySelector('.nav-next');
  if (prevBtn) prevBtn.addEventListener('click', () => setActive(active - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setActive(active + 1));

  const minus = container.querySelector('#qty-minus');
  const plus = container.querySelector('#qty-plus');
  const qtyInput = container.querySelector('#qty-input');
  function clamp(n){ return Math.max(1, Math.min(99, n|0)); }
  if (minus) minus.addEventListener('click', () => { if (qtyInput) qtyInput.value = clamp((+qtyInput.value||1) - 1); });
  if (plus) plus.addEventListener('click', () => { if (qtyInput) qtyInput.value = clamp((+qtyInput.value||1) + 1); });
  if (qtyInput) qtyInput.addEventListener('input', () => { qtyInput.value = String(qtyInput.value).replace(/[^0-9]/g, ''); });
}


async function renderRelated(baseProduct, products) {
  const list = document.getElementById('related-list');
  if (!list) return;
  let items = [];
  try {
    items = await fetchRandomRecommendations(baseProduct ? baseProduct.id : undefined);
  } catch (err) {
    console.warn('Falling back to client-side random suggestions', err);
    const pool = Array.isArray(products)
      ? products.filter(p => !baseProduct || p.id !== baseProduct.id)
      : [];
    const source = pool.length ? pool : (Array.isArray(products) ? products : []);
    items = pickRandomItems(source, 4);
  }
  if (!Array.isArray(items) || !items.length) {
    list.innerHTML = '';
    return;
  }
  const finalItems = items.slice(0, 4);
  list.innerHTML = finalItems.map(p => {
    const price = Number(p.price) || 0;
    const lPrice = price ? price + 3000 : price + 3000;
    const vipPriceM = Math.max(0, price - 3000);
    const vipPriceL = Math.max(0, lPrice - 3000);
    const rating = typeof p.rating === 'number' ? p.rating : 4.8;
    const reviews = p.reviews || 500;
    const link = `/product/?pid=${encodeURIComponent(p.id || '')}&name=${encodeURIComponent(p.name || '')}`;
    const img = `/${(p.image || '').replace(/^\//,'')}`;
    return `
      <a class="related-card" href="${link}" aria-label="${p.name || ''}" data-id="${escapeAttr(p.id)}" data-name="${escapeAttr(p.name)}" data-price="${price}" data-image="${escapeAttr(img)}">
        <figure><img src="${img}" alt="${p.name || ''}"></figure>
        <div class="card-body">
          <div class="meta"><span class="star">★</span> ${rating.toFixed(1)} <span class="sep">•</span> ${reviews} lượt đánh giá</div>
          <h4 class="card-name">${p.name || ''}</h4>
          <div class="price-area">
            <div class="price-row">
              <div class="price-col">
                <div class="main-line">
                  <span class="lbl">M</span>
                  <span class="val">${formatVND(price)}đ</span>
                </div>
                <div class="vip-line">
                  <span class="lbl vip">VIP</span>
                  <span class="val">${formatVND(vipPriceM)}đ</span>
                </div>
              </div>
              <div class="price-col">
                <div class="main-line">
                  <span class="lbl">L</span>
                  <span class="val">${formatVND(lPrice)}đ</span>
                </div>
                <div class="vip-line">
                  <span class="lbl vip">VIP</span>
                  <span class="val">${formatVND(vipPriceL)}đ</span>
                </div>
              </div>
            </div>
          </div>
          <button class="cart2-btn" type="button" aria-label="Thêm ${p.name || ''} vào giỏ"><img src="/assets/icons/Cart2.png" alt=""></button>
        </div>
      </a>`;
  }).join('');

  list.querySelectorAll('.related-card').forEach((card) => {
    const btn = card.querySelector('.cart2-btn');
    if (!btn) return;
    btn.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (!window.NGCart) return;
      window.NGCart.addItem({
        id: card.dataset.id || '',
        name: card.dataset.name || '',
        price: Number(card.dataset.price) || 0,
        image: card.dataset.image || '',
        size: 'M',
        qty: 1,
      });
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await fetchProducts();
    const { pid, name } = getQuery();
    let product = null;
    if (pid) product = data.find(p => Number(p.id) === pid) || null;
    if (!product && name) {
      const decoded = decodeURIComponent(name || '').toLowerCase();
      product = data.find(p => (p.name || '').toLowerCase() === decoded) || null;
    }
    if (!product) product = data[0];
    const container = document.getElementById('product-detail');
    if (container && product) hydrateDetail(container, product);
    await renderRelated(product, data);

    const tabs = document.querySelectorAll('.tabs .tab');
    const sections = {
      desc: document.getElementById('desc'),
      review: document.getElementById('review'),
      commit: document.getElementById('commit'),
    };

    const activateTab = (target) => {
      if (!sections[target]) return;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.target === target));
      Object.values(sections).forEach(node => {
        if (node) node.classList.toggle('active', node.id === target);
      });
      sections[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab.dataset.target));
    });

    const noteWrapper = document.querySelector('.product-note');
    const noteToggle = noteWrapper ? noteWrapper.querySelector('.note-toggle') : null;
    const noteContent = document.getElementById('product-note');
    if (noteToggle && noteContent && noteWrapper) {
      noteToggle.addEventListener('click', () => {
        const expanded = noteToggle.getAttribute('aria-expanded') === 'true';
        noteToggle.setAttribute('aria-expanded', (!expanded).toString());
        noteContent.classList.toggle('active', !expanded);
        noteWrapper.classList.toggle('open', !expanded);
      });
    }

    document.querySelectorAll('.pill-group').forEach(group => {
      const buttons = group.querySelectorAll('.pill');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(other => other.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });

    document.querySelectorAll('.topping-qty').forEach(wrapper => {
      const minus = wrapper.querySelector('.qty-minus');
      const plus = wrapper.querySelector('.qty-plus');
      const valueEl = wrapper.querySelector('.qty-value');
      let value = parseInt(valueEl.textContent, 10) || 0;
      const update = (delta) => {
        value = Math.max(0, Math.min(9, value + delta));
        valueEl.textContent = String(value);
      };
      if (minus) minus.addEventListener('click', () => update(-1));
      if (plus) plus.addEventListener('click', () => update(1));
    });

    const reviewBtn = document.querySelector('.btn-add-review');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => activateTab('review'));
    }
    activateTab('desc');

    const addBtn = document.getElementById('btn-add-cart');
    if (addBtn && window.NGCart && product) {
      addBtn.addEventListener('click', () => {
        const qtyInput = document.getElementById('qty-input');
        const qty = Math.max(1, Math.min(99, Number(qtyInput ? qtyInput.value : 1) || 1));
        if (qtyInput) qtyInput.value = String(qty);
        const sizeBtn = document.querySelector('.pill-group[aria-label="Chọn kích cỡ"] .pill.active');
        const size = sizeBtn ? (sizeBtn.dataset.size || sizeBtn.textContent.trim()) : '';
        const options = [];
        document.querySelectorAll('.pill-group[data-field]').forEach((group) => {
          const active = group.querySelector('.pill.active');
          if (active) {
            const label = group.dataset.field || group.getAttribute('aria-label') || '';
            options.push(`${label}: ${active.textContent.trim()}`);
          }
        });
        const basePrice = Number(product.price) || 0;
        const price = size === 'L' ? basePrice + 3000 : basePrice;
        window.NGCart.addItem({
          id: product.id,
          name: product.name,
          price,
          image: product.image || '',
          size,
          qty,
          options,
        });
        alert('Đã thêm sản phẩm vào giỏ hàng!');
      });
    }
  } catch (e) {
    console.error(e);
  }
});
