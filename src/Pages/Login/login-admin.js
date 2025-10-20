// Admin login handler (UTF-8)
(function () {
  function showError(message) {
    const old = document.getElementById('admin-login-error');
    if (old) old.remove();
    const overlay = document.createElement('div');
    overlay.id = 'admin-login-error';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.4)';
    const card = document.createElement('div');
    card.style.cssText = 'width:min(360px,85%);background:#fff;border-radius:16px;border:2px solid #e11d48;box-shadow:0 10px 30px rgba(0,0,0,.2);overflow:hidden;font-family:Inter,system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif';
    card.innerHTML = (
      "<div style=\"padding:18px 20px 10px; text-align:center;\"><div style=\"font-size:22px;font-weight:800;color:#111827\">Lỗi đăng nhập</div></div>" +
      "<div style=\"padding:8px 22px 18px; color:#374151; text-align:center; font-size:16px; line-height:1.6\">" + (message || 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại chính xác.') + "</div>" +
      "<div style=\"border-top:1px solid #e5e7eb; padding:12px; display:flex; justify-content:center;\"><button id=\"admin-login-ok\" style=\"min-width:120px; padding:10px 18px; background:#1d4ed8; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;\">OK</button></div>"
    );
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.getElementById('admin-login-ok').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  const root = document.querySelector('.form-wrap');
  if (!root) return;
  const usernameEl = root.querySelector('input[autocomplete="username"], input[type="text"]');
  const pwdEl = document.getElementById('pwd') || root.querySelector('input[type="password"]');
  const btn = root.querySelector('.btn.btn-primary');

  // Toggle eye
  (function attachEye(){
    const eyeBtn = document.getElementById('btnEye');
    const icOff = document.getElementById('icEyeOff');
    const icOn  = document.getElementById('icEyeOn');
    if (!eyeBtn || !pwdEl) return;
    eyeBtn.addEventListener('click', () => {
      const show = pwdEl.type === 'password';
      pwdEl.type = show ? 'text' : 'password';
      if (icOff && icOn) { icOff.style.display = show ? 'none' : ''; icOn.style.display = show ? '' : 'none'; }
    });
  })();

  async function doLogin() {
    const username = (usernameEl && usernameEl.value || '').trim();
    const password = (pwdEl && pwdEl.value || '').trim();
    if (!username || !password) { showError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'); return; }

    try {
      const API_BASE = localStorage.getItem('API_BASE') || '';
      const res = await fetch(API_BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok || data.ok === false) { showError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại chính xác.'); return; }
      // Success → redirect (có thể đổi sang /admin/ nếu cần)
      location.href = '/home2/';
    } catch (e) {
      showError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại chính xác.');
    }
  }

  if (btn) btn.addEventListener('click', doLogin);
  [usernameEl, pwdEl].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); }));
})();

