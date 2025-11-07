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
    setupOrderTracking();
  }

  function setupOrderTracking() {
    // Kiểm tra xem đã có orderId trong sessionStorage chưa (từ lần vào payment này)
    let orderId = sessionStorage.getItem('current_payment_order_id');
    
    if (orderId) {
      // Đã có order rồi, chỉ cần set link
      console.log('📌 Using existing order:', orderId);
      const link = document.getElementById('checkOrderLink');
      if (link) {
        link.href = '/order-tracking/?orderId=' + orderId;
      }
      return;
    }

    // Lấy thông tin từ giỏ hàng - thử cả NGCart và localStorage
    let items = [];
    
    // Thử lấy từ NGCart nếu có
    if (window.NGCart && typeof window.NGCart.getItems === 'function') {
      items = window.NGCart.getItems();
      console.log('🛒 Items from NGCart:', items.length);
    }
    
    // Nếu NGCart không có, thử lấy trực tiếp từ localStorage
    if (!items.length) {
      try {
        const cartJSON = localStorage.getItem('cart_items');
        if (cartJSON) {
          items = JSON.parse(cartJSON);
          console.log('🛒 Items from localStorage:', items.length);
        }
      } catch (err) {
        console.error('Error parsing cart_items:', err);
      }
    }
    
    if (!items.length) {
      // Nếu không có items, link về cart để thêm sản phẩm
      console.warn('⚠️ Giỏ hàng trống, không thể tạo order mới');
      const link = document.getElementById('checkOrderLink');
      if (link) {
        link.href = '/cart/';
        link.textContent = 'Quay về giỏ hàng';
      }
      return;
    }

    // Lấy user hiện tại
    function getCurrentUser() {
      try {
        const raw = localStorage.getItem('ngogia_user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.username) return parsed;
      } catch (err) {
        console.warn('Cannot parse ngogia_user', err);
      }
      return null;
    }

    // Lấy thông tin shipping
    function getShippingInfo() {
      try {
        const raw = localStorage.getItem('ngogia_shipping');
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }

    const user = getCurrentUser();
    const shipping = getShippingInfo() || {
      receiver: user ? user.username : 'Khách hàng',
      phone: '0123456789',
      address: '76C Luy 198C 3B, khu pho 3, Thu Duc, TP. Ho Chi Minh',
      deliveryDate: '',
      deliveryTime: '',
      note: ''
    };

    // Tính tổng tiền
    const subtotal = window.NGCart ? window.NGCart.subtotal(items) : 0;
    const coupon = window.NGCart ? window.NGCart.coupon.resolve(subtotal) : { code: '', amount: 0 };
    const totals = window.NGCart ? window.NGCart.totals(items, coupon.amount) : { subtotal: 0, shipping: 0, discount: 0, grand: 0 };

    // Tạo order ID duy nhất
    orderId = 'HTNGTD' + Date.now().toString().slice(-6);

    // Xác định phương thức thanh toán
    const method = getMethod();
    console.log('🔍 URL method:', method);
    console.log('🌐 Full URL:', window.location.href);
    
    const paymentMethodMap = {
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      payoo: 'Ví điện tử'
    };
    const paymentMethod = paymentMethodMap[method] || 'MoMo';
    console.log('💳 Mapped payment method:', paymentMethod);

    // Tạo đối tượng đơn hàng
    const order = {
      id: orderId,
      orderId: orderId,
      date: new Date().toISOString(),
      customerName: shipping.receiver || (user ? user.username : 'Khách hàng'),
      customerPhone: shipping.phone || '0123456789',
      customerAddress: shipping.address || '',
      paymentMethod: paymentMethod,
      status: 'pending',
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.grand,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        size: item.size || '',
        image: item.image || '',
        options: item.options || [],
      })),
      deliveryDate: shipping.deliveryDate || '',
      deliveryTime: shipping.deliveryTime || '',
      note: shipping.note || '',
      couponCode: coupon.code || '',
    };

    // Lưu đơn hàng vào localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      console.log('✅ Order saved:', orderId, 'Payment:', order.paymentMethod);
      
      // Lưu orderId vào sessionStorage để lần sau không tạo lại
      sessionStorage.setItem('current_payment_order_id', orderId);
    } catch (err) {
      console.error('Error saving order:', err);
    }

    // Set link kiểm tra đơn hàng
    const link = document.getElementById('checkOrderLink');
    if (link) {
      link.href = '/order-tracking/?orderId=' + orderId;
      console.log('🔗 Check order link set:', link.href);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
