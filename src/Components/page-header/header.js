
function initHeaderGuest() {
  const root = document.querySelector('header.shop-header');
  if (!root) return;


  const navLinks = root.querySelectorAll('.nav-bar a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Nút giỏ (demo tăng số lượng nếu là button)
  const cartBtn = root.querySelector('.cart-btn');
  const badge = root.querySelector('.badge');
  if (cartBtn && badge && cartBtn.tagName !== 'A') {
    let count = Number(badge.textContent || 0);
    cartBtn.addEventListener('click', () => {
      count += 1;
      badge.textContent = String(count);
    });
  }

  
  const go = (p) => { try { window.location.href = p; } catch(e) { location.assign(p); } };
  root.querySelector('.login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/login/');   
  });
  root.querySelector('.signup-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/register/');       
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderGuest);
} else {
  initHeaderGuest();
}
