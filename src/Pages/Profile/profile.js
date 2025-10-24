async function loadComponent(targetSelector, url) {
  const host = document.querySelector(targetSelector);
  if (!host) return;
  const res = await fetch(url, { cache: 'no-cache' });
  const html = await res.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const frag = document.createDocumentFragment();
  for (const node of Array.from(tmp.childNodes)) {
    if (!(node.tagName && node.tagName.toLowerCase() === 'script')) {
      frag.appendChild(node.cloneNode(true));
    }
  }
  host.innerHTML = '';
  host.appendChild(frag);

  // Chạy script trong component
  for (const old of tmp.querySelectorAll('script')) {
    const s = document.createElement('script');
    for (const { name, value } of Array.from(old.attributes)) s.setAttribute(name, value);
    if (old.src) s.src = old.src; else s.textContent = old.textContent || '';
    document.body.appendChild(s);
  }
}

loadComponent('#app-header', '/src/Components/page-header/header2.html');
loadComponent('#app-footer', '/src/Components/page-footer/footer.html');

// --- Helper localStorage ---
function getUser() {
  try { return JSON.parse(localStorage.getItem('ngogia_user') || 'null'); }
  catch { return null; }
}
function setUser(u) {
  localStorage.setItem('ngogia_user', JSON.stringify(u));
}

// --- Fill dữ liệu ---
document.addEventListener('DOMContentLoaded', () => {
  const u = getUser() || {};


  // Bảo mật
  const userEl = document.getElementById('pf-username');
  const passEl = document.getElementById('pf-password');
  const statusEl = document.getElementById('pf-status');

  if (userEl) userEl.value = u.username || 'ngogia_user';
  if (passEl) passEl.value = '************';
  if (statusEl) statusEl.value = u.verified ? 'Đã xác minh' : 'Chưa xác minh';

  // (Đã loại bỏ tính năng "Hiện/Ẩn mật khẩu" — không còn tạo nút hoặc handler ở đây)


  const btnUpload = document.getElementById('btn-upload');
  const btnRemove = document.getElementById('btn-remove');
  const pfAvatar = document.getElementById('pf-avatar');

  btnUpload?.addEventListener('click', () => {
    alert('Tính năng upload avatar demo.');
  });
  btnRemove?.addEventListener('click', () => {
    if (confirm('Gỡ ảnh đại diện?')) {
      pfAvatar.src = '/public/assets/images/user-default.png';
    }
  });


  document.getElementById('pf-save')?.addEventListener('click', () => {
    const newUser = {
      ...u,
      fullName: nameEl?.value?.trim() || u.fullName,
      email: emailEl?.value?.trim() || u.email
    };
    setUser(newUser);
    alert('Đã lưu hồ sơ (cục bộ).');
  });


  document.getElementById('btn-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('ngogia_user');
    window.location.href = '/login';
  });
});

(function () {
  function setActiveLinkById(id) {
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(a => a.classList.remove('active'));
    const el = document.getElementById(id) || document.querySelector('.sidebar-nav .nav-link');
    if (el) el.classList.add('active');
  }

  function showTabName(tab) {
    const accountContent = document.getElementById('account-content') || document.querySelector('.account-content');
    const accountBlock2 = document.getElementById('account-content2') || document.querySelector('.account-content2');
    if (!accountContent || !accountBlock2) return;

    if (tab === 'security' || tab === 'account-content2') {
      accountContent.style.display = 'none';
      accountBlock2.style.display = 'block';
      setActiveLinkById('link-security');
    } else {
      accountContent.style.display = 'block';
      accountBlock2.style.display = 'none';
      setActiveLinkById('link-profile');
    }
  }

  function currentTabFromLocation() {
    const hash = (location.hash || '').replace('#', '').trim();
    if (hash) return hash;
    const q = new URLSearchParams(location.search).get('tab');
    return q || 'profile';
  }

  function initTabSwitching() {
    try {
      const hasHash = Boolean(location.hash);
      const hasTabParam = Boolean(new URLSearchParams(location.search).get('tab'));
      const onProfilePath = /\/profile\/?$/.test(location.pathname);

      if (onProfilePath && !hasHash && !hasTabParam) {
        showTabName('profile');
        // xóa hash nếu có
        history.replaceState(null, '', location.pathname + location.search);
      } else {
        showTabName(currentTabFromLocation());
      }

      document.querySelector('.account-layout')?.addEventListener('click', (e) => {
        const a = e.target.closest('.sidebar-nav .nav-link');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (a.id === 'link-security' || href.includes('#security')) {
          e.preventDefault();
          location.hash = 'security';
        } else if (a.id === 'link-profile' || href.includes('#profile')) {
          e.preventDefault();
          location.hash = 'profile';
        } else {
        }
      });

      window.addEventListener('hashchange', () => {
        showTabName(currentTabFromLocation());
      });
    } catch (err) {
      console.error('initTabSwitching error', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabSwitching);
  } else {
    initTabSwitching();
  }
})();

(function ensureDefaultProfileActive() {
  const onProfilePath = /\/profile\/?$/.test(location.pathname);
  const hasHash = Boolean(location.hash);
  const hasTab = Boolean(new URLSearchParams(location.search).get('tab'));

  if (!onProfilePath) return;
  if (hasHash || hasTab) return;

  const linkProfile = document.getElementById('link-profile') || document.querySelector('.sidebar-nav .nav-link');
  const linkSecurity = document.getElementById('link-security');
  const accountContent = document.getElementById('account-content') || document.querySelector('.account-content');
  const accountBlock2 = document.getElementById('account-block2') || document.querySelector('.account-block2');

  // set visuals
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(a => a.classList.remove('active'));
  if (linkProfile) linkProfile.classList.add('active');
  if (linkSecurity) linkSecurity.classList.remove('active');

  if (accountContent) accountContent.style.display = 'block';
  if (accountBlock2) accountBlock2.style.display = 'none';

  // remove any stray hash to keep URL clean
  history.replaceState(null, '', location.pathname + location.search);
})();

(function initTabs() {
  const layoutRoot = document.querySelector('.account-layout') || document.body;

  const sections = {
    profile: document.getElementById('account-content') || document.querySelector('.account-content'),
    security: document.getElementById('account-content2') || document.querySelector('#account-content2') || document.querySelector('.account-content2'),
    policy: document.getElementById('account-policy') || document.querySelector('.account-policy')
  };

  function setActiveLink(id) {
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(a => a.classList.remove('active'));
    const el = document.getElementById(id) || document.querySelector('.sidebar-nav .nav-link');
    if (el) el.classList.add('active');
  }

  function hideAll() {
    Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });
  }

  function showTab(tab) {
    hideAll();
    if (tab === 'security' && sections.security) {
      sections.security.style.display = 'block';
      setActiveLink('link-security');
    } else if (tab === 'policy' && sections.policy) {
      sections.policy.style.display = 'block';
      setActiveLink('link-policy');
    } else {
      // default to profile
      if (sections.profile) sections.profile.style.display = 'block';
      setActiveLink('link-profile');
    }
  }

  function tabFromLocation() {
    const hash = (location.hash || '').replace('#', '').trim();
    if (hash) return hash;
    return new URLSearchParams(location.search).get('tab') || 'profile';
  }

  // initial display: if on /profile path and no hash/query => profile
  const onProfilePath = /\/profile\/?$/.test(location.pathname);
  const hasHash = Boolean(location.hash);
  const hasTabParam = Boolean(new URLSearchParams(location.search).get('tab'));
  if (onProfilePath && !hasHash && !hasTabParam) {
    showTab('profile');
    history.replaceState(null, '', location.pathname + location.search);
  } else {
    showTab(tabFromLocation());
  }

  // delegation for sidebar links
  layoutRoot.addEventListener('click', (e) => {
    const a = e.target.closest('.sidebar-nav .nav-link');
    if (!a) return;
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (a.id === 'link-security' || href.includes('#security')) {
      e.preventDefault();
      location.hash = 'security';
    } else if (a.id === 'link-policy' || href.includes('#policy')) {
      e.preventDefault();
      location.hash = 'policy';
    } else if (a.id === 'link-profile' || href.includes('#profile')) {
      e.preventDefault();
      location.hash = 'profile';
    }
    // other links (policy/support external) will follow their default behaviour
  });

  window.addEventListener('hashchange', () => {
    showTab(tabFromLocation());
  });
})();
