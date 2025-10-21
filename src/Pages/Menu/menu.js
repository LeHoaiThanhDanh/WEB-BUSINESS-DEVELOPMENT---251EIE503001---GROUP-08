// Menu page script

async function loadComponent(targetSelector, url) {
  const host = document.querySelector(targetSelector);
  if (!host) return;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) {
      host.innerHTML = `<div style="padding:16px;color:#b00">Không thể tải ${url}</div>`;
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
    if (window.NGCart) {
      const totals = window.NGCart.totals(window.NGCart.getItems());
      const totalEl = document.getElementById('cart-total');
      if (totalEl) totalEl.textContent = window.NGCart.price(totals.grand) + 'đ';
    }
  } catch (err) {
    host.innerHTML = `<div style="padding:16px;color:#b00">Không thể tải ${url}</div>`;
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

let lastRenderedItems = [];

function markMenuNavActive() {
  const nav = document.querySelector('.nav-bar');
  if (!nav) return false;
  const target = nav.querySelector('a[href="/menu/"]');
  if (!target) return false;
  nav.querySelectorAll('a').forEach((link) => {
    if (link === target) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
  return true;
}

const headerObserver = new MutationObserver((_, observer) => {
  if (markMenuNavActive()) observer.disconnect();
});

if (document.body) {
  headerObserver.observe(document.body, { childList: true, subtree: true });
}

function formatVND(value) {
  const n = Number(value) || 0;
  try {
    return n.toLocaleString('vi-VN');
  } catch {
    return String(n);
  }
}

async function fetchProducts() {
  const res = await fetch('/public/data/products.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function createCategoryButtons(categories, onClick) {
  const host = document.getElementById('category-filters');
  if (!host) return;
  host.innerHTML = '';
  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.type = 'button';
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => onClick(cat));
    host.appendChild(btn);
  });
}

function normalize(str) {
  if (str == null) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function escapeAttr(value) {
  return String(value == null ? '' : value).replace(/"/g, '&quot;');
}

function buildCard(product) {
  const price = Number(product.price) || 0;
  const priceL = price ? price + 3000 : price + 3000;
  const vipPriceM = price ? Math.max(0, price - 3000) : Math.max(0, price - 3000);
  const vipPriceL = priceL ? Math.max(0, priceL - 3000) : Math.max(0, priceL - 3000);
  const rating = typeof product.rating === 'number' ? product.rating : 4.8;
  const reviews = product.reviews || 500;
  const link = `/product/?pid=${encodeURIComponent(product.id || '')}&name=${encodeURIComponent(product.name || '')}`;
  const img = `/${(product.image || '').replace(/^\//, '')}`;
  const nameText = product.name || '';
  const safeName = escapeAttr(nameText);

  return `
    <article class="menu-card" data-link="${link}" tabindex="0" role="link" aria-label="Xem chi tiết ${safeName}">
      <figure>
        <img src="${img}" alt="${nameText}">
      </figure>
      <div class="card-body">
        <div class="card-meta">
          <span class="star">★</span>
          <span>${rating.toFixed(1)}</span>
          <span>•</span>
          <span>${reviews} lượt đánh giá</span>
        </div>
        <h3>${nameText}</h3>
        <div class="price-row">
          <div class="price-col">
            <div class="line size-line">
              <span class="label">M</span>
              <span class="value">${formatVND(price)}đ</span>
            </div>
            <div class="line vip-line">
              <span class="label vip">VIP</span>
              <span class="value">${formatVND(vipPriceM)}đ</span>
            </div>
          </div>
          <div class="price-col">
            <div class="line size-line">
              <span class="label">L</span>
              <span class="value">${formatVND(priceL)}đ</span>
            </div>
            <div class="line vip-line">
              <span class="label vip">VIP</span>
              <span class="value">${formatVND(vipPriceL)}đ</span>
            </div>
          </div>
          <button class="price-cart" type="button" aria-label="Mở sản phẩm ${safeName}">
            <img src="/assets/icons/Cart2.png" alt="" aria-hidden="true">
          </button>
        </div>
      </div>
    </article>
  `;
}

function updateSectionHeading(state) {
  const titleEl = document.getElementById('section-title');
  const subtitleEl = document.getElementById('section-subtitle');
  const parts = [];
  if (titleEl && subtitleEl) {
    if (state.search) {
      parts.push(`Từ khóa "${state.search}"`);
    }
    if (state.category && state.category !== 'all') {
      parts.push(state.category);
    }
    if (!parts.length) {
      titleEl.textContent = 'Tất cả thức uống';
      subtitleEl.textContent = 'Danh sách đầy đủ các món tại Hồng Trà Ngô Gia.';
    } else {
      titleEl.textContent = parts.join(' · ');
      subtitleEl.textContent = 'Những món phù hợp với lựa chọn của bạn.';
    }
  }
}

function applyActiveStates(state) {
  const allFilter = document.querySelector('.filter-chip[data-cat="all"]');
  const filterButtons = document.querySelectorAll('#category-filters .filter-chip');
  if (allFilter) {
    allFilter.classList.toggle('active', state.category === 'all');
  }
  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', state.category === btn.dataset.cat);
  });
}

function renderProducts(products, state) {
  const grid = document.getElementById('menu-grid');
  const emptyState = document.getElementById('empty-state');
  const resultCount = document.getElementById('result-count');
  if (!grid || !emptyState || !resultCount) return;
  if (!products.length) {
    grid.innerHTML = '';
    emptyState.classList.add('show');
    resultCount.textContent = '0';
    lastRenderedItems = [];
  } else {
    grid.innerHTML = products.map(buildCard).join('');
    emptyState.classList.remove('show');
    resultCount.textContent = String(products.length);
    lastRenderedItems = products.slice();
  }
  updateSectionHeading(state);
}

function filterProducts(data, state) {
  return data.filter((item) => {
    if (state.category && state.category !== 'all') {
      if (normalize(item.category) !== normalize(state.category)) return false;
    }
    if (state.search) {
      const query = normalize(state.search);
      const haystack = [item.name, item.category].map(normalize).join(' ');
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function sortProducts(products, mode) {
  const items = products.slice();
  switch (mode) {
    case 'name-asc':
      items.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)));
      break;
    case 'name-desc':
      items.sort((a, b) => normalize(b.name).localeCompare(normalize(a.name)));
      break;
    case 'price-asc':
      items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
    case 'price-desc':
      items.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    default:
      break;
  }
  return items;
}

function prepareProducts(data, state) {
  const filtered = filterProducts(data, state);
  return sortProducts(filtered, state.sort || 'featured');
}

let cardNavBound = false;

function setupCardNavigation() {
  if (cardNavBound) return;
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  const go = (url) => {
    if (!url) return;
    try { window.location.href = url; } catch (err) { location.assign(url); }
  };
  grid.addEventListener('click', (evt) => {
    const cartBtn = evt.target.closest('.price-cart');
    if (cartBtn) {
      if (!window.NGCart) return;
      const card = evt.target.closest('.menu-card');
      if (!card) return;
      const cards = Array.from(grid.querySelectorAll('.menu-card'));
      const index = cards.indexOf(card);
      if (index === -1) return;
      const data = lastRenderedItems[index];
      if (!data) return;
      evt.preventDefault();
      evt.stopPropagation();
      window.NGCart.addItem({
        id: data.id,
        name: data.name,
        price: Number(data.price) || 0,
        image: data.image || '',
        size: 'M',
        qty: 1,
      });
      alert(`Đã thêm ${data.name || 'sản phẩm'} vào giỏ hàng!`);
      return;
    }
    const card = evt.target.closest('.menu-card');
    if (!card) return;
    const url = card.getAttribute('data-link');
    if (!url) return;
    evt.preventDefault();
    go(url);
  });
  grid.addEventListener('keydown', (evt) => {
    if (evt.key !== 'Enter' && evt.key !== ' ') return;
    const cartBtn = evt.target.closest('.price-cart');
    if (cartBtn) {
      if (!window.NGCart) return;
      const card = evt.target.closest('.menu-card');
      if (!card) return;
      const cards = Array.from(grid.querySelectorAll('.menu-card'));
      const index = cards.indexOf(card);
      if (index === -1) return;
      const data = lastRenderedItems[index];
      if (!data) return;
      evt.preventDefault();
      window.NGCart.addItem({
        id: data.id,
        name: data.name,
        price: Number(data.price) || 0,
        image: data.image || '',
        size: 'M',
        qty: 1,
      });
      alert(`Đã thêm ${data.name || 'sản phẩm'} vào giỏ hàng!`);
      return;
    }
    const card = evt.target.closest('.menu-card');
    if (!card) return;
    const url = card.getAttribute('data-link');
    if (!url) return;
    evt.preventDefault();
    go(url);
  });
  cardNavBound = true;
}

document.addEventListener('DOMContentLoaded', async () => {
  markMenuNavActive();
  try {
    const data = await fetchProducts();
    const categories = Array.from(
      new Set(
        data
          .map((item) => (item.category || '').trim())
          .filter(Boolean)
      )
    );

    const state = {
      category: 'all',
      search: '',
      sort: 'featured',
    };

    const updateProducts = () => {
      applyActiveStates(state);
      const prepared = prepareProducts(data, state);
      renderProducts(prepared, state);
    };

    setupCardNavigation();

    createCategoryButtons(categories, (cat) => {
      state.category = cat;
      updateProducts();
    });

    const allButton = document.querySelector('.filter-chip[data-cat="all"]');
    if (allButton) {
      allButton.addEventListener('click', () => {
        state.category = 'all';
        updateProducts();
      });
    }

    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
      searchInput.addEventListener('input', (evt) => {
        state.search = evt.target.value.trim();
        updateProducts();
      });
    }

    const sortSelect = document.getElementById('menu-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        updateProducts();
      });
    }

    updateProducts();
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('menu-grid');
    if (grid) {
      grid.innerHTML = '<div style="padding:24px;color:#b91c1c">Không thể tải menu lúc này, xin vui lòng thử lại sau.</div>';
    }
  }
});
