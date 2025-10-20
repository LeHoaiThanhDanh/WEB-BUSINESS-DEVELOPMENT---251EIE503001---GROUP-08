function initHeader2() {
  const navLinks = document.querySelectorAll('.nav-bar a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Load user from localStorage set by login
  const userBox = document.getElementById('user-box');
  const userBtn = document.getElementById('user-btn');
  const nameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  const menu = document.getElementById('user-menu');
  const btnLogout = document.getElementById('btn-logout');
  const totalEl = document.getElementById('cart-total');

  try {
    const u = JSON.parse(localStorage.getItem('ngogia_user') || 'null');
    if (u && nameEl) nameEl.textContent = u.fullName || u.username || 'Tài khoản';
  } catch {}

  // Placeholder cart total from localStorage
  try {
    const t = localStorage.getItem('cart_total');
    if (t && totalEl) totalEl.textContent = t;
  } catch {}

  function openMenu(){ if (menu){ menu.removeAttribute('hidden'); userBox?.classList.add('open'); userBtn?.setAttribute('aria-expanded','true'); } }
  function closeMenu(){ if (menu){ menu.setAttribute('hidden',''); userBox?.classList.remove('open'); userBtn?.setAttribute('aria-expanded','false'); } }

  if (userBtn) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = menu?.hasAttribute('hidden');
      if (isHidden) openMenu(); else closeMenu();
    });
    userBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const isHidden = menu?.hasAttribute('hidden'); if (isHidden) openMenu(); else closeMenu(); }
      if (e.key === 'Escape') { closeMenu(); userBtn.blur(); }
    });
  }
    document.addEventListener('click', (e) => {
      if (!menu) return;
      if (!userBox.contains(e.target)) closeMenu();
    });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });

  if (btnLogout) btnLogout.addEventListener('click', () => {
    localStorage.removeItem('ngogia_user');
    // Redirect to Django route for customer login
    location.href = '/login-customer/';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader2);
} else {
  // Script có thể được chèn động sau khi DOM đã sẵn sàng
  initHeader2();
}
