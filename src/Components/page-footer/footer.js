// Footer subscribe modal logic
(function(){
  // ✅ Đợi DOM load xong
  function init() {
    const modal = document.getElementById('sub-modal'); // ✅ Đúng ID
    const form = document.getElementById('subForm');
    const email = document.getElementById('subEmail');
    
    if (!modal || !form || !email) {
      console.warn('Sub-modal elements not found');
      return;
    }

    console.log('Sub-modal initialized:', modal); // ✅ Debug

    // ✅ Open modal
    function openModal(){
      modal.removeAttribute('aria-hidden'); 
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      console.log('Sub-modal opened'); // ✅ Debug
    }
    
    // ✅ Close modal
    function closeModal(){
      modal.setAttribute('aria-hidden','true'); 
      modal.classList.remove('show');
      document.body.style.overflow = '';
      console.log('Sub-modal closed'); // ✅ Debug
    }

    // ✅ Nút close (X)
    const closeBtn = modal.querySelector('.sub-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
        console.log('Close button clicked'); // ✅ Debug
      });
    } else {
      console.warn('.sub-close not found');
    }

    // ✅ Click backdrop
    const backdrop = modal.querySelector('.sub-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
        console.log('Backdrop clicked'); // ✅ Debug
      });
    } else {
      console.warn('.sub-backdrop not found');
    }

    // ✅ ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
        console.log('ESC pressed'); // ✅ Debug
      }
    });

    // ✅ Submit form
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
      
      // Hiển thị modal
      openModal();
      
      // Tự động đóng sau 2.5s
      setTimeout(closeModal, 2500);
      
      // Reset form
      form.reset();
    });
  }

  // ✅ Init khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ✅ Retry init (phòng trường hợp footer load sau)
  setTimeout(init, 100);
  setTimeout(init, 500);
})();

