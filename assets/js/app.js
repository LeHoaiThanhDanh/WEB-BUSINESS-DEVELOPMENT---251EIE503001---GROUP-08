(function () {
  if (window.__APP_BOOTED__) {
    console.warn('App.js already initialized');
    return;
  }
  window.__APP_BOOTED__ = true;

  // ===== PATHS =====
  const PATHS = {
    headerGuest: '/src/Components/page-header/header.html',
    headerUser:  '/src/Components/page-header/header2.html',
    footer:      '/src/Components/page-footer/footer.html'
  };

  // ===== Utils =====
  const qs  = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return res.text();
  }
  async function loadHTML(targetSelector, url) {
    const host = qs(targetSelector);
    if (!host) return;
    try { host.innerHTML = await fetchText(url); }
    catch (e) { console.error('Không nạp được', url, e); }
  }

  // ===== Auth helpers =====
  function getAuthUser() {
    try {
      const raw = localStorage.getItem('ngogia_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && (u.fullName || u.name || u.username || u.email)) return u;
      }
    } catch {}
    try {
      const raw2 = localStorage.getItem('authUser');
      if (raw2) {
        const u2 = JSON.parse(raw2);
        if (u2 && (u2.fullName || u2.name || u2.username || u2.email)) return u2;
      }
    } catch {}
    const meta = document.getElementById('auth-flag');
    if (meta?.dataset?.auth === '1') {
      const nm = meta.dataset.name;
      return nm ? { name: nm } : { name: 'User' };
    }
    return null;
  }
  const isLoggedIn = () => !!getAuthUser();

  // ===== Header/Footer =====
  async function renderHeader() {
    const file = isLoggedIn() ? PATHS.headerUser : PATHS.headerGuest;
    await loadHTML('#app-header', file);

    // set tên
    const u = getAuthUser();
    const meta = document.getElementById('auth-flag');
    const displayName = (u?.fullName || u?.name || u?.username || u?.email || meta?.dataset?.name || 'Tài khoản');
    const nameNode = qs('[data-user-chip]') || qs('#userName') || qs('#userChip') || qs('#user-name');
    if (nameNode) nameNode.textContent = displayName;

    // logout
    const btnLogout = qs('#btnLogout') || qs('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (ev) => {
        ev.preventDefault?.();
        localStorage.removeItem('ngogia_user');
        localStorage.removeItem('authUser');
        location.reload();
      });
    }

    // dropdown tài khoản (nếu có)
    const userBox  = qs('#user-box');
    const userBtn  = qs('#user-btn');
    const userMenu = qs('#user-menu');
    if (userMenu && !userMenu.hasAttribute('hidden')) userMenu.setAttribute('hidden', '');

    function openMenu(){ if (userMenu){ userMenu.removeAttribute('hidden'); userBox?.classList.add('open'); userBtn?.setAttribute('aria-expanded','true'); } }
    function closeMenu(){ if (userMenu){ userMenu.setAttribute('hidden',''); userBox?.classList.remove('open'); userBtn?.setAttribute('aria-expanded','false'); } }

    if (userBtn) {
      userBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); userMenu?.hasAttribute('hidden') ? openMenu() : closeMenu(); });
      userBtn.addEventListener('keydown', (e)=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); userMenu?.hasAttribute('hidden') ? openMenu() : closeMenu(); } if (e.key==='Escape'){ closeMenu(); userBtn.blur(); }});
      document.addEventListener('click', (e)=>{ if (userMenu && userBox && !userBox.contains(e.target)) closeMenu(); });
      document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') closeMenu(); });
    }

    markActiveNav();
  }

  async function renderFooter(){ 
    await loadHTML('#app-footer', PATHS.footer); 
    attachFooterEvents(); // 
  }

  function attachFooterEvents() {
    // Tìm nút đăng ký ở footer
    const registerBtns = qsa('#footer-register-btn, .footer-register-btn, [data-footer-register]');
    
    registerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // ✅ Tìm modal đăng ký TÀI KHOẢN (không phải sub-modal)
        const modal = qs('#sub-modal, [data-modal="register"]');
        
        if (modal) {
          // Hiển thị modal
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
          } 
          else {
            openRegisterModal(modal); // ✅ Đổi tên hàm
          }
        } else {
          console.error('Modal #sub-modal không tìm thấy trong footer.html');
          alert('Chức năng đăng ký đang được bảo trì. Vui lòng thử lại sau!');
        }
      });
    });
  }

  // ✅ Đổi tên hàm từ openModal() → openRegisterModal()
  function openRegisterModal(modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
    modal.removeAttribute('aria-hidden'); 
    document.body.classList.add('modal-open');
    
    const closeModal = () => {
      modal.style.display = 'none';
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true'); 
      document.body.classList.remove('modal-open');
    };
    
    // ✅ Nút đóng
    const closeBtn = modal.querySelector('.modal-close, [data-dismiss="modal"]');
    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }
    
    // ✅ Click backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.onclick = closeModal;
    }
    
    // ✅ Click outside modal-dialog
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
    
    // ✅ ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  function markActiveNav() {
    const path = location.pathname.replace(/\/+$/, '');
    qsa('nav a, .nav a, .navbar a').forEach(a=>{
      const href = (a.getAttribute('href')||'').replace(/\/+$/, '');
      const active = href && href !== '#' && href === path;
      a.classList.toggle('active', active);
      active ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current');
    });
  }

  // ===== Cart badge (count & total) =====
  // Hỗ trợ nhiều schema lưu giỏ hàng để tương thích các trang cũ/mới
  const CART_KEYS = ['cart_items', 'ng_cart', 'cart', 'shopping_cart', 'ngogia_cart', 'NG_CART'];
  function readCart(){
    for (const k of CART_KEYS) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && (Array.isArray(parsed) || typeof parsed === 'object')) return parsed;
      } catch {}
    }
    return [];
  }
  function normItem(it) {
    if (typeof it === 'number') return { qty: it, price: 0 };
    if (Array.isArray(it)) return { qty: +it[0]||0, price: +it[1]||0 };
    // Chuẩn hóa theo cart.js: qty/quantity, price/unitPrice/priceVND
    const qty = +((it && (it.qty ?? it.quantity)) ?? 0) || 0;
    const price = +((it && (it.price ?? it.unitPrice ?? it.priceVND)) ?? 0) || 0;
    return { qty, price };
  }
  function getCartSummary(){
    const cart = readCart();
    let count = 0, total = 0;
    if (Array.isArray(cart)) {
      for (const it of cart) {
        const { qty, price } = normItem(it);
        count += qty; total += qty * price;
      }
    } else if (cart && typeof cart === 'object') {
      for (const id in cart) {
        const { qty, price } = normItem(cart[id]);
        count += qty; total += qty * price;
      }
    }
    return { count, total };
  }
  function fmtVND(n){ try{ return n.toLocaleString('vi-VN') + 'đ'; } catch { return String(Math.round(n)) + 'đ'; } }
  function renderCartBadge(){
    const { count, total } = getCartSummary();
    qsa('[data-cart-count], #headerCartCount, .header-cart-count').forEach(el=>{ el.textContent = count; el.style.display = ''; });
    qsa('[data-cart-total], #headerCartTotal, .header-cart-total, #cart-total').forEach(el=>{ el.textContent = fmtVND(total); el.style.display = ''; });
  }

  // expose để trang khác gọi khi thêm/xoá giỏ
  window.NGApp = window.NGApp || {};
  window.NGApp.renderHeader = renderHeader;
  window.NGApp.updateCartBadge = renderCartBadge;

  // khi header thay đổi DOM (component vừa nạp), cập nhật badge
  function attachHeaderObserver(){
    const host = qs('#app-header');
    if (!host) return;
    const mo = new MutationObserver(() => scheduleCartBadgeUpdate());
    mo.observe(host, { childList: true });
    setTimeout(() => mo.disconnect(), 5000); // auto stop sau 5s
  }

  let cartUpdateScheduled = false;
  function scheduleCartBadgeUpdate() {
    if (cartUpdateScheduled) return;
    cartUpdateScheduled = true;
    requestAnimationFrame(() => {
      cartUpdateScheduled = false;
      renderCartBadge();
    });
  }

  // storage change (tab khác sửa giỏ)
  window.addEventListener('storage', (e) => {
    if (CART_KEYS.includes(e.key) && e.storageArea === localStorage) {
      scheduleCartBadgeUpdate();
    }
  });
  // sự kiện nội bộ từ cart.js
  window.addEventListener('cart:updated', (e) => {
    if (e.detail?.silent) return; // chặn phản ứng lặp
    scheduleCartBadgeUpdate();
  });

  // ===== BOOT =====
  async function boot(){
    await renderHeader();
    await renderFooter();
    renderCartBadge();
    attachHeaderObserver();

    if (typeof window.NGPageInit === 'function') {
      try { window.NGPageInit(); } catch(err){ console.error(err); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
