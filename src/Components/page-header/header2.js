
function initHeaderUser() {
  const root = document.querySelector('header.shop-header');
  if (!root) return;

  // Nav active (an toàn: không ảnh hưởng markActiveNav của app.js)
  const navLinks = root.querySelectorAll('.nav-bar a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Dropdown user menu (mở/đóng)
  const userBox  = root.querySelector('#user-box');     
  const userBtn  = root.querySelector('#user-btn');     
  const menu     = root.querySelector('#user-menu');    
  const totalEl  = root.querySelector('#cart-total');   

  // (Tuỳ chọn) hiển thị tổng giỏ nếu bạn có lưu trong localStorage
  try {
    const t = localStorage.getItem('cart_total');
    if (t && totalEl) totalEl.textContent = t;
  } catch {}

  function openMenu(){
    if (!menu) return;
    menu.removeAttribute('hidden');
    userBox?.classList.add('open');
    userBtn?.setAttribute('aria-expanded','true');
  }
  function closeMenu(){
    if (!menu) return;
    menu.setAttribute('hidden','');
    userBox?.classList.remove('open');
    userBtn?.setAttribute('aria-expanded','false');
  }

  if (userBtn) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = menu?.hasAttribute('hidden');
      if (isHidden) openMenu(); else closeMenu();
    });
    userBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isHidden = menu?.hasAttribute('hidden');
        if (isHidden) openMenu(); else closeMenu();
      }
      if (e.key === 'Escape') { closeMenu(); userBtn.blur(); }
    });
  }

  document.addEventListener('click', (e) => {
    if (!menu) return;
    if (!userBox?.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderUser);
} else {
  initHeaderUser();
}
