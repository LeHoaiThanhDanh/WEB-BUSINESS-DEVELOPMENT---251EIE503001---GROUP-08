// Footer subscribe modal logic
(function(){
  const root = document.currentScript && document.currentScript.closest('footer') || document.querySelector('footer.site-footer');
  const form = root && root.querySelector('#subForm');
  const email = root && root.querySelector('#subEmail');
  const modal = root && root.querySelector('#sub-modal');
  if (!form || !email || !modal) return;

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  modal.addEventListener('click', (e)=>{
    if (e.target.matches('[data-close]')) closeModal();
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const v = (email.value||'').trim();
    const ok = /.+@.+\..+/.test(v);
    if (!ok){
      email.focus();
      email.setAttribute('aria-invalid','true');
      return;
    }
    email.setAttribute('aria-invalid','false');
    openModal();
    setTimeout(closeModal, 2500);
    form.reset();
  });
})();

