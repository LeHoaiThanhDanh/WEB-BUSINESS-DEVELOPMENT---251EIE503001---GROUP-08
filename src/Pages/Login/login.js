
// Frontend login script: handles UI + login
(function(){
  // Simple error modal
  function showErrorModal(message){
    const old = document.getElementById('login-error-modal');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'login-error-modal';
    wrap.setAttribute('role','dialog');
    wrap.setAttribute('aria-modal','true');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.4)';
    const card = document.createElement('div');
    card.style.cssText = 'width:min(360px,85%);background:#fff;border-radius:16px;border:2px solid #e11d48;box-shadow:0 10px 30px rgba(0,0,0,.2);overflow:hidden;font-family:Inter,system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif';
    card.innerHTML = "<div style=\"padding:18px 20px 10px; text-align:center;\"><div style=\"font-size:22px;font-weight:800;letter-spacing:.5px;color:#111827\">LỖI ĐĂNG NHẬP</div></div>"
      + "<div style=\"padding:8px 22px 18px; color:#374151; text-align:center; font-size:18px; line-height:1.6\">" + (message||'Có lỗi xảy ra. Vui lòng thử lại.') + "</div>"
      + "<div style=\"border-top:1px solid #e5e7eb; padding:12px; display:flex; justify-content:center;\"><button id=\"login-error-ok\" style=\"min-width:120px; padding:10px 18px; background:#1d4ed8; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;\">OK</button></div>";
    wrap.appendChild(card);
    document.body.appendChild(wrap);
    const ok = document.getElementById('login-error-ok');
    if (ok) ok.addEventListener('click', ()=> wrap.remove());
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) wrap.remove();});
  }

  const formWrap = document.querySelector('.form-wrap');
  if (!formWrap) return;
  const usernameEl = formWrap.querySelector('input[autocomplete="username"], input[type="text"]');
  const pwdEl = document.getElementById('pwd') || formWrap.querySelector('input[type="password"]');
  const btn = formWrap.querySelector('.btn.btn-primary');
  const btnEye = document.getElementById('btnEye');
  const icOff = document.getElementById('icEyeOff');
  const icOn  = document.getElementById('icEyeOn');

  if (btnEye && pwdEl){
    btnEye.addEventListener('click', ()=>{
      const isPw = pwdEl.type === 'password';
      pwdEl.type = isPw ? 'text' : 'password';
      if (icOff && icOn){ icOff.style.display = isPw ? 'none' : ''; icOn.style.display = isPw ? '' : 'none'; }
    });
  }

  async function login(){
    const username = (usernameEl?.value||'').trim();
    const password = (pwdEl?.value||'').trim();
    if (!username || !password) {
      showErrorModal('Ô thông tin không được để trống. Vui lòng nhập đầy đủ');
      return;
    }
    try{
      const API_BASE = localStorage.getItem('API_BASE') || '';
      const res = await fetch(API_BASE + '/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok || data.ok === false) {
        showErrorModal('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại chính xác.');
        return;
      }
      localStorage.setItem('ngogia_user', JSON.stringify(data.user||{username}));
      location.href = '/home2/';
    }catch(e){
      showErrorModal('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại chính xác.');
    }
  }

  if (btn) btn.addEventListener('click', login);
})();

// Login UI + flow (UTF-8, standardized)
(function () {
  // Small error modal
  function showError(message) {
    const existing = document.getElementById('login-error-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'login-error-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.4)';

    const card = document.createElement('div');
    card.style.cssText = 'width:min(360px,85%);background:#fff;border-radius:16px;border:2px solid #e11d48;box-shadow:0 10px 30px rgba(0,0,0,.2);overflow:hidden;font-family:Inter,system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif';
    card.innerHTML = (
      "<div style=\"padding:18px 20px 10px; text-align:center;\">" +
      "<div style=\"font-size:22px;font-weight:800;letter-spacing:.5px;color:#111827\">LỖI ĐĂNG NHẬP</div>" +
      "</div>" +
      "<div style=\"padding:8px 22px 18px; color:#374151; text-align:center; font-size:18px; line-height:1.6\">" +
      (message || 'Có lỗi xảy ra. Vui lòng thử lại.') +
      "</div>" +
      "<div style=\"border-top:1px solid #e5e7eb; padding:12px; display:flex; justify-content:center;\">" +
      "<button id=\"login-error-ok\" style=\"min-width:120px; padding:10px 18px; background:#1d4ed8; color:#fff; border:none; border-radius:10px; font-weight:700; cursor:pointer;\">OK</button>" +
      "</div>"
    );

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.getElementById('login-error-ok').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  const root = document.querySelector('.form-wrap');
  if (!root) return;

  const usernameEl = root.querySelector('input[autocomplete="username"], input[type="text"]');
  const pwdEl = document.getElementById('pwd') || root.querySelector('input[type="password"]');
  const btn = root.querySelector('.btn.btn-primary');

  // Toggle password visibility
  (function attachEye() {
    const eyeBtn = document.getElementById('btnEye');
    const icOff = document.getElementById('icEyeOff');
    const icOn = document.getElementById('icEyeOn');
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

      localStorage.setItem('ngogia_user', JSON.stringify(data.user || { username }));
      location.href = '/home2/';
    } catch (err) {
      showError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại chính xác.');
    }
  }

  if (btn) btn.addEventListener('click', doLogin);
  // Submit on Enter inside inputs
  [usernameEl, pwdEl].forEach(el => el && el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); }));
})();
