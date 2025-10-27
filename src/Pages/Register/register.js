// Frontend Register script (UTF-8, standardized)
(function () {
  function showModal(title, message, color = '#e11d48') {
    const old = document.getElementById('register-modal');
    if (old) old.remove();
    const overlay = document.createElement('div');
    overlay.id = 'register-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.4)';
    const card = document.createElement('div');
    card.style.cssText = 'width:min(360px,85%);background:#fff;border-radius:16px;border:2px solid ' + color + ';box-shadow:0 10px 30px rgba(0,0,0,.2);overflow:hidden;font-family:Inter,system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif';
    card.innerHTML = (
      "<div style=\"padding:18px 20px 10px; text-align:center;\">" +
      "<div style=\"font-size:22px;font-weight:800;color:#111827\">" + title + "</div>" +
      "</div>" +
      "<div style=\"padding:8px 22px 18px; color:#374151; text-align:center; font-size:16px; line-height:1.6\">" + message + "</div>" +
      "<div style=\"border-top:1px solid #e5e7eb; padding:12px; display:flex; justify-content:center;\">" +
      "<button id=\"register-ok\" style=\"min-width:120px; padding:10px 18px; background:#1d4ed8; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;\">OK</button>" +
      "</div>"
    );
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.getElementById('register-ok').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  const root = document.querySelector('.form-wrap');
  if (!root) return;
  const btn = root.querySelector('#reg-submit, .btn.btn-primary');

  // Inputs
  const elUser = document.getElementById('reg-username') || root.querySelector('input[autocomplete="username"], input[type="text"]');
  const pwFields = Array.from(root.querySelectorAll('input[type="password"]'));
  const elPass = document.getElementById('reg-password') || pwFields[0];
  const elConfirm = document.getElementById('reg-confirm') || pwFields[1];
  const elEmail = document.getElementById('reg-email') || root.querySelector('input[type="email"]');
  const elFull = document.getElementById('reg-fullname');

  const valueOf = (el) => (el && el.value || '').trim();

  async function submit() {
    const username = valueOf(elUser);
    const password = valueOf(elPass);
    const confirm = valueOf(elConfirm);
    const email = valueOf(elEmail);
    const fullName = valueOf(elFull);

    if (!username || !password) { showModal('Lỗi đăng ký', 'Vui lòng nhập tên đăng nhập và mật khẩu.'); return; }
    if (elConfirm && password !== confirm) { showModal('Lỗi đăng ký', 'Mật khẩu nhập lại không khớp.'); return; }
    if (elEmail && email && !/.+@.+\..+/.test(email)) { showModal('Lỗi đăng ký', 'Email không hợp lệ.'); return; }

    try {
      const API_BASE = localStorage.getItem('API_BASE') || '';
      const payload = { username, password };
      if (email) payload.email = email;
      if (fullName) payload.fullName = fullName;

      const res = await fetch(API_BASE + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok || data.ok === false) { showModal('Lỗi đăng ký', (data && data.message) || 'Đăng ký thất bại. Vui lòng thử lại.'); return; }
      // Redirect to login page when success
      location.href = '/login/';
    } catch (e) {
      showModal('Lỗi đăng ký', 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  if (btn) btn.addEventListener('click', submit);
  [elUser, elPass, elConfirm, elEmail].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));
})();

