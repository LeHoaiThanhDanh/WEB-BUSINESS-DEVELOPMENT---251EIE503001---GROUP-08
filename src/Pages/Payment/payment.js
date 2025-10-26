'use strict';

(function(){
  function loadFooter(){
    const host = document.getElementById('footer-placeholder');
    if (!host) return;
    const url = host.getAttribute('data-footer-url') || '/src/Components/page-footer/footer.html';
    fetch(url)
      .then(r => r.text())
      .then(html => { host.innerHTML = html; })
      .catch(err => console.error('Không thể tải footer:', err));
  }

  function getMethod(){
    const q = new URLSearchParams(location.search);
    const raw = (q.get('method') || '').toLowerCase().trim();
    if (!raw) return 'momo';
    if (raw.startsWith('zalo')) return 'zalopay';
    if (['momo','payoo','zalopay'].includes(raw)) return raw;
    return 'momo';
  }

  const CONFIG = {
    momo: {
      title: 'Cổng thanh toán MoMo',
      headerClass: 'momo-header',
      containerClass: 'momo-container',
      boxClass: 'qr-box-momo',
      imgClass: 'qr-image-momo',
      descClass: 'qr-desc-momo',
      logo: '/assets/images/momo.png',
      qr: '/assets/images/qrcode.png',
      desc: 'Sử dụng App MoMo hoặc ứng dụng camera hỗ trợ quét mã để thanh toán',
      showBanks: false,
      titleClassSuffix: 'momo',
      logoClassSuffix: 'momo'
    },
    payoo: {
      title: 'Cổng thanh toán Payoo',
      headerClass: 'payoo-header',
      containerClass: 'payoo-container',
      boxClass: 'qr-box-payoo',
      imgClass: 'qr-image-payoo',
      descClass: 'qr-desc-payoo',
      logo: '/assets/images/payoo.png',
      qr: '/assets/images/qrbanking.png',
      desc: 'Sử dụng App Ngân hàng hoặc ứng dụng camera hỗ trợ quét mã để thanh toán',
      showBanks: true,
      titleClassSuffix: 'payoo',
      logoClassSuffix: 'payoo'
    },
    zalopay: {
      title: 'Cổng thanh toán Zalo Pay',
      headerClass: 'zalo-header',
      containerClass: 'zalo-container',
      boxClass: 'qr-box-zalo',
      imgClass: 'qr-image-zalo',
      descClass: 'qr-desc-zalo',
      logo: '/assets/images/zalo.png',
      qr: '/assets/images/qrzalo.png',
      desc: 'Sử dụng App Zalo Pay hoặc ứng dụng camera hỗ trợ quét mã để thanh toán',
      showBanks: false,
      titleClassSuffix: 'zalo',
      logoClassSuffix: 'zalo'
    }
  };

  function applyConfig(){
    const key = getMethod();
    const cfg = CONFIG[key] || CONFIG.momo;
    document.title = cfg.title;

    const header = document.getElementById('brandHeader');
    const logo = document.getElementById('brandLogo');
    const title = document.getElementById('brandTitle');
    const main = document.getElementById('brandContainer');
    const box = document.getElementById('qrBox');
    const qr = document.getElementById('qrImage');
    const desc = document.getElementById('qrDesc');
    const banks = document.getElementById('banks');

    if (header) header.className = cfg.headerClass;
    if (title) {
      title.textContent = cfg.title;
      title.className = 'header-title-' + cfg.titleClassSuffix;
    }
    if (logo) {
      logo.src = cfg.logo;
      logo.alt = cfg.title.replace('Cổng thanh toán ', '') + ' Logo';
      logo.className = cfg.logoClassSuffix + '-logo';
    }

    if (main) main.className = cfg.containerClass;
    if (box) box.className = cfg.boxClass;
    if (qr) {
      qr.src = cfg.qr;
      qr.alt = 'QR ' + cfg.title.replace('Cổng thanh toán ', '');
      qr.className = cfg.imgClass;
    }
    if (desc) {
      desc.textContent = cfg.desc;
      desc.className = cfg.descClass;
    }

    if (banks) {
      if (cfg.showBanks) banks.removeAttribute('hidden');
      else banks.setAttribute('hidden','');
    }

    document.body.classList.add('ready');
  }

  function boot(){
    loadFooter();
    applyConfig();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
