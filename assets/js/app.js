(function () {
  const PATHS = {
    headerGuest: '/src/Components/page-header/header.html', 
    headerUser:  '/src/Components/page-header/header2.html',
    footer:      '/src/Components/page-footer/footer.html'
  };

  // ====== TIỆN ÍCH ======
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return res.text();
  }
  async function loadComponent(selector, url) {
    const host = qs(selector);
    if (!host) return;
    try { host.innerHTML = await fetchText(url); }
    catch(e){ console.error('Không nạp được', url, e); }
  }

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
  function isLoggedIn(){ return !!getAuthUser(); }

  // ====== HEADER/FOOTER ======
  async function renderHeader() {
    const file = isLoggedIn() ? PATHS.headerUser : PATHS.headerGuest;
    await loadComponent('#app-header', file);

    const u = getAuthUser();
    const meta = document.getElementById('auth-flag');
    const metaName = meta?.dataset?.name;
    const displayName = (u?.fullName || u?.name || u?.username || u?.email || metaName || 'Tài khoản');

    const nameNode =
      qs('[data-user-chip]') ||
      qs('#userName') ||
      qs('#userChip') ||
      qs('#user-name'); 
    if (nameNode) nameNode.textContent = displayName;

    const btnLogout = qs('#btnLogout') || qs('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (ev) => {
        ev.preventDefault?.();
        localStorage.removeItem('ngogia_user');
        localStorage.removeItem('authUser');
        location.reload();
      });
    }
        // --- Toggle menu tài khoản (dropdown) ---
    const userBox  = qs('#user-box');
    const userBtn  = qs('#user-btn');
    const userMenu = qs('#user-menu');

    // đảm bảo trạng thái ban đầu
    if (userMenu && !userMenu.hasAttribute('hidden')) {
      userMenu.setAttribute('hidden', '');
    }

    function openMenu(){
      if (!userMenu) return;
      userMenu.removeAttribute('hidden');
      userBox?.classList.add('open');
      userBtn?.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
      if (!userMenu) return;
      userMenu.setAttribute('hidden','');
      userBox?.classList.remove('open');
      userBtn?.setAttribute('aria-expanded','false');
    }

    if (userBtn) {
      userBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isHidden = userMenu?.hasAttribute('hidden');
        if (isHidden) openMenu(); else closeMenu();
      });
      userBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isHidden = userMenu?.hasAttribute('hidden');
          if (isHidden) openMenu(); else closeMenu();
        }
        if (e.key === 'Escape') { closeMenu(); userBtn.blur(); }
      });
    }

    // click ra ngoài thì đóng
    document.addEventListener('click', (e) => {
      if (!userMenu || !userBox) return;
      if (!userBox.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    markActiveNav();
  }

  async function renderFooter(){ await loadComponent('#app-footer', PATHS.footer); }

  // ====== NAV ACTIVE ======
  function markActiveNav() {
    const path = location.pathname.replace(/\/+$/, '');
    qsa('nav a, .nav a, .navbar a').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/\/+$/, '');
      const active = href && href !== '#' && href === path;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
  }

  // ====== BOOT ======
  async function boot() {
    await renderHeader();
    await renderFooter();
    if (typeof window.NGPageInit === 'function') {
      try { window.NGPageInit(); } catch(e){ console.error(e); }
    }
  }

  // Expose nếu cần
  window.NGApp = { isLoggedIn, getAuthUser, renderHeader, renderFooter, markActiveNav, loadComponent, paths: PATHS };
  document.addEventListener('DOMContentLoaded', boot);
})();
