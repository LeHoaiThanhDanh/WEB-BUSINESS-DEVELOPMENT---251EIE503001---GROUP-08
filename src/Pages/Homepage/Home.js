﻿/*******************************
 * HOME PAGE ONLY (works with app.js)
 * - Không load header/footer (đã do app.js xử lý)
 * - Chỉ khởi tạo Swiper, modal danh mục đồ uống, Top Hot, Hot Menu
 *******************************/

let ALL_PRODUCTS = [];
let drinksSwiper = null;

// Map “slug” ←→ tên hiển thị (giống trước đây)
const CAT_MAP = {
  "thuan-tra": "Lo\u1ea1i Thu\u1ea7n Tr\u00e0",
  "tra-latte": "Lo\u1ea1i Tr\u00e0 Latte",
  "tra-sua": "Lo\u1ea1i Tr\u00e0 S\u1eefa",
  "mon-moi": "Th\u1ee9c U\u1ed1ng M\u1edbi",
  "mon-hot": "Th\u1ee9c U\u1ed0ng Hot",
  "tra-trai-cay": "Lo\u1ea1i Tr\u00e0 Tr\u00e1i C\u00e2y",
};

// Fallback: khi category ít dữ liệu thì lọc theo tag
const FALLBACK_TAGS = {
  "mon-moi": "moi",
  "mon-hot": "hot",
};

// Tiện ích chuẩn hoá chuỗi (bỏ dấu, lowercase…)
function normalize(str = "") {
  return String(str || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const NAME_TO_SLUG = Object.fromEntries(
  Object.entries(CAT_MAP).map(([slug, name]) => [normalize(name), slug])
);

function toSlug(input = "") {
  const raw = String(input || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (CAT_MAP[lower]) return lower;
  const normalized = normalize(raw);
  if (NAME_TO_SLUG[normalized]) return NAME_TO_SLUG[normalized];
  if (CAT_MAP[normalized]) return normalized;
  return lower.replace(/\s+/g, "-");
}

// Hiện chiếc cốc to tương ứng category (bên trái modal)
function showBigCupByCategory(slug) {
  const normalized = toSlug(slug);
  const cupImgs = document.querySelectorAll(".drinks-left img[data-cat]");
  let matched = false;
  cupImgs.forEach(img => {
    const isMatch = img.dataset.cat === normalized;
    img.hidden = !isMatch;
    if (isMatch) matched = true;
  });
  if (!matched && cupImgs.length) {
    cupImgs.forEach((img, idx) => { img.hidden = idx !== 0; });
  }
}

function pickProductsBySlug(slug) {
  const normalizedSlug = toSlug(slug);
  const categoryName = CAT_MAP[normalizedSlug] || slug;
  const targetNorm = normalize(categoryName);

  let items = ALL_PRODUCTS.filter(p => normalize(p.category || "") === targetNorm);

  if (!items.length && FALLBACK_TAGS[normalizedSlug]) {
    const tagNorm = normalize(FALLBACK_TAGS[normalizedSlug]);
    items = ALL_PRODUCTS.filter(p => normalize(p.tag || "").includes(tagNorm));
  }

  if (!items.length && normalizedSlug) {
    items = ALL_PRODUCTS.filter(p => normalize(p.category || "").includes(normalizedSlug));
  }

  if (!items.length) items = ALL_PRODUCTS.slice(0, 12);

  return {
    slug: normalizedSlug,
    categoryName,
    items: items.slice(0, 12),
  };
}

async function loadProducts() {
  if (ALL_PRODUCTS.length) return;
  try {
    const res = await fetch("/public/data/products.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.statusText);
    ALL_PRODUCTS = await res.json();
  } catch (err) {
    console.error("Cannot load products.json", err);
    ALL_PRODUCTS = [];
  }
}

async function ensureProducts() {
  if (!ALL_PRODUCTS.length) await loadProducts();
}

function buildProductUrl(p) {
  const qs = new URLSearchParams({ pid: String(p.id ?? ""), name: p.name ?? "" });
  return `/product/?${qs.toString()}`;
}

function priceVN(n) {
  if (typeof n !== "number") return "";
  try { return n.toLocaleString("vi-VN"); } catch { return String(n); }
}
function normSrc(path) {
  if (!path) return "";
  return "/" + String(path).replace(/^\/+/, "");
}

// Thêm icon giỏ hàng tròn ở các thẻ (nếu cần)
function installCartIcons(){
  const cards = document.querySelectorAll(".product-card");
  cards.forEach(card => {
    if (!card.closest('#top-hot-grid')) return;        // chỉ Top Hot
    if (card.querySelector('.cart2-icon')) return;     // tránh nhân đôi
    card.style.position = card.style.position || "relative";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cart2-icon";
    btn.style.cssText = "position:absolute;right:12px;bottom:12px;border:none;background:transparent;padding:0;cursor:pointer";
    const icon = document.createElement("img");
    icon.src = "/assets/icons/Cart2.png";
    icon.alt = "Giỏ hàng";
    icon.style.width = "36px";
    icon.style.height = "36px";
    btn.appendChild(icon);
    (card.querySelector('.card-body') || card).appendChild(btn);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      location.href = "/src/Pages/Cart/cart.html";
    });
  });
}

// TOP HOT (9 món)
async function renderTopHot() {
  const grid = document.getElementById("top-hot-grid");
  if (!grid) return;
  await ensureProducts();

  const items = [...ALL_PRODUCTS]
    .sort((a,b)=> (b.rating||0)-(a.rating||0) || (a.id||0)-(b.id||0))
    .slice(0,9);

  grid.innerHTML = items.map(p => {
    const m = Number(p.price)||0;
    const l = m ? m + 3000 : 0;
    const rating = typeof p.rating === "number" ? p.rating : 4.8;
    const reviews = p.reviews || 500;
    return `
      <a class="product-card" href="${buildProductUrl(p)}" aria-label="${p.name}">
        <figure><img src="${normSrc(p.image)}" alt="${p.name}"></figure>
        <div class="card-body">
          <h3 class="product-name">${p.name}</h3>
          <div class="meta"><span class="star">★</span> ${rating.toFixed(1)} <span class="sep">•</span> ${reviews} đánh giá</div>
          <div class="price-row">
            <span><span class="lbl">M</span> <span class="val">${priceVN(m)}₫</span></span>
            <span><span class="lbl">L</span> <span class="val">${priceVN(l)}₫</span></span>
          </div>
          <div class="vip-row">
            <span><span class="vip">VIP</span> ${priceVN(Math.max(0, m-3000))}₫</span>
            <span><span class="vip">VIP</span> ${priceVN(Math.max(0, l-3000))}₫</span>
          </div>
        </div>
      </a>`;
  }).join("");

  installCartIcons();
}

// HOT MENU (4 món ngẫu nhiên từ “Món mới”)
async function renderHotMenu(){
  const grid = document.querySelector(".hot-menu .product-grid");
  if (!grid) return;
  await ensureProducts();

  const { items } = pickProductsBySlug('mon-moi');
  const selection = items.sort(() => Math.random() - 0.5).slice(0, 4);

  grid.innerHTML = selection.map(p => `
    <a class="product-card" href="${buildProductUrl(p)}" aria-label="${p.name}">
      <figure><img src="${normSrc(p.image)}" alt="${p.name}"></figure>
      <h3 class="product-name">${p.name}</h3>
    </a>`).join("");

  installCartIcons();
}

// Modal danh mục đồ uống
function closeDrinksModal(){
  const modal = document.getElementById("drinks-modal");
  if (modal) modal.classList.remove("show");
  document.body.style.overflow = "";
}

async function openDrinksModal(slug){
  await ensureProducts();

  const wrapper = document.getElementById("drinks-swiper-wrapper");
  const modalEl = document.getElementById("drinks-modal");
  if (!wrapper || !modalEl) return;

  const { items, slug: normalizedSlug } = pickProductsBySlug(slug);
  showBigCupByCategory(normalizedSlug);

  wrapper.innerHTML = items.map(p => `
    <div class="swiper-slide">
      <a class="drink-card" href="${buildProductUrl(p)}" aria-label="${p.name}" title="${p.name}">
        <div class="drink-thumb">
          <img src="${normSrc(p.image)}" alt="${p.name}" loading="lazy">
        </div>
        <p>${p.name}</p>
      </a>
    </div>`).join("");

  // Re-init swiper bên trong modal
  if (drinksSwiper) { drinksSwiper.destroy(true,true); drinksSwiper=null; }
  if (document.querySelector(".drinks-swiper") && window.Swiper){
    drinksSwiper = new Swiper(".drinks-swiper", {
      slidesPerView: 3,
      spaceBetween: 32,
      loop: true,
      navigation: {
        nextEl: ".drinks-right .swiper-button-next",
        prevEl: ".drinks-right .swiper-button-prev"
      },
      breakpoints: {
        1024:{slidesPerView:3},
        768:{slidesPerView:3},
        480:{slidesPerView:2},
        0:{slidesPerView:1}
      }
    });
  }

  modalEl.classList.add("show");
  document.body.style.overflow = "hidden";
}

/* ===================================================
   KHỞI TẠO TRANG HOME QUA HOOK (được app.js gọi)
   ===================================================*/
window.NGPageInit = function () {
  // Swiper hero (ngoài modal)
  const swiperEl = document.querySelector(".mySwiper");
  if (swiperEl && window.Swiper){
    new Swiper(".mySwiper", {
      loop: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      autoplay: { delay: 3000 },
      slidesPerView: 1
    });
  }

  // Nút mở modal danh mục
  document.querySelectorAll(".js-open-drinks").forEach(el => {
    el.addEventListener("click", () => openDrinksModal(el.dataset.cat));
  });

  // Nút đóng modal
  const closeBtn = document.getElementById("drinks-close");
  const backdrop = document.getElementById("drinks-backdrop");
  if (closeBtn) closeBtn.addEventListener("click", closeDrinksModal);
  if (backdrop) backdrop.addEventListener("click", closeDrinksModal);

  // Render block dữ liệu
  renderTopHot();
  renderHotMenu();
};
