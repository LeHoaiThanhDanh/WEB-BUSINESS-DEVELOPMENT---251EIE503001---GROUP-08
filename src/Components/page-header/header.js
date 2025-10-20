function initHeader() {
  const root = document.querySelector('header.shop-header');
  const cartBtn = root && root.querySelector('.cart-btn');
  const badge = root && root.querySelector('.badge');
  const loginBtn = root && root.querySelector('.login-btn');
  const signupBtn = root && root.querySelector('.signup-btn');

  let count = 0;
  if (cartBtn && badge && cartBtn.tagName !== 'A') {
    cartBtn.addEventListener('click', () => { count++; badge.textContent = count; });
  }

  // Ensure login/signup links never show underline
  if (loginBtn) loginBtn.style.textDecoration = 'none';
  if (signupBtn) signupBtn.style.textDecoration = 'none';

  const go = (p) => { try { window.location.href = p; } catch(e) { location.assign(p); } };
  if (loginBtn) loginBtn.addEventListener('click', () => go('/login-customer/'));
  if (signupBtn) signupBtn.addEventListener('click', () => go('/register/'));

  const navLinks = root ? root.querySelectorAll('.nav-bar a') : [];
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  initHeader();
}
