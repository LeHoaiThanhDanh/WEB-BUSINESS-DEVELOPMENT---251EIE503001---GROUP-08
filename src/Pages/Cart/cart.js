(function (window, document) {
  const STORAGE_KEY = 'cart_items';
  const COUPON_KEY = 'ngogia_coupon';
  const subscribers = [];
  const couponRules = {
    NGOGIAFS: {
      type: 'amount',
      value: 10000,
      minSubtotal: 50000,
      description: 'Giảm 10.000d cho đơn từ 50.000d',
    },
    NGOVIP15: {
      type: 'percent',
      value: 15,
      minSubtotal: 80000,
      max: 40000,
      description: 'Giảm 15% tối đa 40.000d cho đơn từ 80.000d',
    },
    123456789: {
      type: 'perItem',
      value: 3000,
      description: 'Giảm 3.000đ trên mỗi món trong giỏ hàng',
    },
  };

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function priceVN(value) {
    try {
      return Number(value || 0).toLocaleString('vi-VN');
    } catch {
      return String(value || 0);
    }
  }

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn('Cannot parse cart storage', err);
    }
    return [];
  }

  function sanitizeItem(data) {
    const qty = Math.max(1, Math.min(99, Number(data.qty) || 1));
    const price = Math.max(0, Number(data.price) || 0);
    return {
      id: data.id != null ? String(data.id) : '',
      name: data.name || 'Do uong',
      price,
      image: data.image || '',
      size: data.size || '',
      note: data.note || '',
      options: Array.isArray(data.options) ? data.options : [],
      qty,
    };
  }

  function sameOptions(a, b) {
    return JSON.stringify(a || []) === JSON.stringify(b || []);
  }

  function findExisting(items, candidate) {
    return items.find(
      (item) =>
        String(item.id || '') === String(candidate.id || '') &&
        String(item.size || '') === String(candidate.size || '') &&
        String(item.note || '') === String(candidate.note || '') &&
        sameOptions(item.options, candidate.options)
    );
  }

  function computeSubtotal(items) {
    return items.reduce((sum, item) => {
      return sum + (Number(item.price) || 0) * (Number(item.qty) || 1);
    }, 0);
  }

  function calculateTotals(items, couponAmount = 0) {
    const subtotal = computeSubtotal(items);
    const shipping = subtotal >= 150000 || !items.length ? 0 : 10000;
    const discount = Math.min(Math.max(Number(couponAmount) || 0, 0), subtotal);
    const grand = Math.max(0, subtotal + shipping - discount);
    return { subtotal, shipping, discount, grand };
  }

  function getCouponData() {
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Cannot parse coupon storage', err);
      return null;
    }
  }

  function setCouponData(data) {
    localStorage.setItem(COUPON_KEY, JSON.stringify(data));
  }

  function clearCouponData() {
    localStorage.removeItem(COUPON_KEY);
  }

  function resolveCoupon(subtotal) {
    const stored = getCouponData();
    if (!stored || !stored.code) {
      return { code: '', amount: 0, description: '', valid: false, message: 'Chưa áp dụng' };
    }
    const code = String(stored.code || '').trim().toUpperCase();
    const rule = couponRules[code];
    if (!rule) {
      clearCouponData();
      return { code: '', amount: 0, description: '', valid: false, message: 'Mã không hợp lệ' };
    }
    if (rule.minSubtotal && subtotal < rule.minSubtotal) {
      return {
        code,
        amount: 0,
        description: rule.description || '',
        valid: false,
        message: `Áp dụng cho đơn từ ${priceVN(rule.minSubtotal)}d`,
      };
    }
    let amount = 0;
    if (rule.type === 'percent') {
      amount = Math.round(subtotal * (rule.value / 100));
      if (rule.max) amount = Math.min(amount, rule.max);
    } else {
      amount = Number(rule.value) || 0;
    }
    amount = Math.min(Math.max(amount, 0), subtotal);
    return { code, amount, description: rule.description || '', valid: amount > 0, message: rule.description || '' };
  }

  function evaluateCouponInput(rawCode, subtotal) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!code) {
      return { success: false, reason: 'empty', error: 'Vui lòng nhập mã giảm giá.' };
    }
    const rule = couponRules[code];
    if (!rule) {
      return { success: false, reason: 'notFound', error: 'Mã giảm giá không tồn tại.' };
    }
    if (rule.minSubtotal && subtotal < rule.minSubtotal) {
      return {
        success: false,
        reason: 'minSubtotal',
        error: `Áp dụng cho đơn từ ${priceVN(rule.minSubtotal)}d.`,
      };
    }
    let amount = 0;
    if (rule.type === 'percent') {
      amount = Math.round(subtotal * (rule.value / 100));
      if (rule.max) amount = Math.min(amount, rule.max);
    } else if (rule.type === 'perItem') {
      const items = loadItems();
      const totalItems = items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
      amount = totalItems * (Number(rule.value) || 0);
    } else {
      amount = Number(rule.value) || 0;
    }
    amount = Math.min(Math.max(amount, 0), subtotal);
    if (!amount) {
      return { success: false, reason: 'noDiscount', error: 'Mã chưa áp dụng được cho đơn hiện tại.' };
    }
    return { success: true, code, amount, description: rule.description || '' };
  }

  function updateHeader(items) {
    const el = document.getElementById('cart-total');
    if (!el) return;
    const subtotal = computeSubtotal(items);
    const coupon = resolveCoupon(subtotal);
    const totals = calculateTotals(items, coupon.amount);
    el.textContent = priceVN(totals.grand) + 'd';
  }

  function notify(items) {
    subscribers.slice().forEach((cb) => {
      try {
        cb(items);
      } catch (err) {
        console.error(err);
      }
    });
    window.dispatchEvent(new CustomEvent('ng:cart-change', { detail: { items, silent: true } }));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items, silent: true } }));
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateHeader(items);
    notify(items);
  }

  function addItem(data) {
    const items = loadItems();
    const normalized = sanitizeItem(data);
    const existing = findExisting(items, normalized);
    if (existing) {
      existing.qty = Math.min(99, (Number(existing.qty) || 1) + normalized.qty);
    } else {
      items.push(normalized);
    }
    saveItems(items);
    return normalized;
  }

  function setItemQty(index, qty) {
    const items = loadItems();
    if (!items[index]) return;
    items[index].qty = Math.max(1, Math.min(99, Number(qty) || 1));
    saveItems(items);
  }

  function removeItem(index) {
    const items = loadItems();
    if (!items[index]) return;
    items.splice(index, 1);
    saveItems(items);
  }

  function clearItems() {
    saveItems([]);
  }

  function subscribe(cb) {
    if (typeof cb !== 'function') return () => {};
    subscribers.push(cb);
    try {
      cb(loadItems());
    } catch (err) {
      console.error(err);
    }
    return () => {
      const idx = subscribers.indexOf(cb);
      if (idx >= 0) subscribers.splice(idx, 1);
    };
  }

  window.addEventListener('storage', (evt) => {
    if (evt.storageArea !== localStorage) return;
    if (evt.key === STORAGE_KEY || evt.key === COUPON_KEY) {
      const items = loadItems();
      updateHeader(items);
      notify(items);
    }
  });
  
  updateHeader(loadItems());

  window.NGCart = {
    getItems: loadItems,
    addItem,
    setItemQty,
    removeItem,
    clear: clearItems,
    subscribe,
    totals: calculateTotals,
    price: priceVN,
    subtotal: computeSubtotal,
    coupon: {
      key: COUPON_KEY,
      rules: couponRules,
      get: getCouponData,
      set: setCouponData,
      clear: clearCouponData,
      resolve: resolveCoupon,
      evaluate: evaluateCouponInput,
    },
  };
})(window, document);

(function (window, document) {
  const cartPage = document.querySelector('.cart-page');
  if (!cartPage || !window.NGCart) return;

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function cartLoadHtml(targetSelector, url) {
    const host = document.querySelector(targetSelector);
    if (!host) return;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return;
      const html = await res.text();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const frag = document.createDocumentFragment();
      for (const node of Array.from(temp.childNodes)) {
        const isScript = node.tagName && node.tagName.toLowerCase() === 'script';
        if (!isScript) frag.appendChild(node.cloneNode(true));
      }
      host.innerHTML = '';
      host.appendChild(frag);
      for (const script of Array.from(temp.querySelectorAll('script'))) {
        const clone = document.createElement('script');
        for (const { name, value } of Array.from(script.attributes)) {
          clone.setAttribute(name, value);
        }
        if (script.src) clone.src = script.src;
        else clone.textContent = script.textContent || '';
        document.body.appendChild(clone);
      }
      if (window.NGCart) {
        const totals = window.NGCart.totals(window.NGCart.getItems());
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = window.NGCart.price(totals.grand) + 'd';
      }
    } catch (err) {
      console.error('cartLoadHtml error:', url, err);
    }
  }

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

  const STATIC_BASE =
    document.querySelector('meta[name="static-base"]')?.content || '/static/';



  function markCartNavActive() {
    const nav = document.querySelector('.nav-bar');
    if (!nav) return false;
    const target = nav.querySelector('a[href="/cart/"]');
    if (!target) return false;
    nav.querySelectorAll('a').forEach((link) => {
      if (link === target) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
    return true;
  }

  const navObserver = new MutationObserver((_, observer) => {
    if (markCartNavActive()) observer.disconnect();
  });
  navObserver.observe(document.body, { childList: true, subtree: true });

  const shippingKey = 'ngogia_shipping';
  const modalRootId = 'cart-modal-root';
  const TIME_OPTIONS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30',
  ];

  function buildTimeText(dateValue, timeValue) {
    if (!dateValue && !timeValue) return '';
    const parts = String(dateValue || '').split('-');
    const [year, month = '', day = ''] = parts;
    const displayDate =
      parts.length === 3 ? `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}` : '';
    if (displayDate && timeValue) return `Nhận hàng ngày ${displayDate} - Vào lúc ${timeValue}`;
    if (displayDate) return `Nhận hàng ngày ${displayDate}`;
    if (timeValue) return `Nhận hàng vào lúc ${timeValue}`;
    return '';
  }

  function parseTimeText(value) {
    if (!value) return null;
    const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    const timeMatch = value.match(/(\d{1,2}:\d{2})/);
    const result = {};
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      result.deliveryDate = `${year}-${month}-${day}`;
    }
    if (timeMatch) {
      result.deliveryTime = timeMatch[1];
    }
    return Object.keys(result).length ? result : null;
  }

  const defaultShipping = {
    address: '76C Luy 198C 3B, khu pho 3, Thu Duc, TP. Ho Chi Minh, Viet Nam',
    receiver: 'Nguyen Ba Du',
    phone: '0123 456 789',
    deliveryDate: '2025-10-29',
    deliveryTime: '19:30',
    note: 'Ghi chu: Quan de ly 2 voi 2 ben rieng giup nhe!',
  };
  defaultShipping.time = buildTimeText(defaultShipping.deliveryDate, defaultShipping.deliveryTime);

  function getShippingInfo() {
    try {
      const raw = localStorage.getItem(shippingKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Cannot parse shipping info', err);
      return null;
    }
  }

  function setShippingInfo(info) {
    localStorage.setItem(shippingKey, JSON.stringify(info));
  }

  function normalizeShipping(info) {
    const data = { ...defaultShipping, ...(info || {}) };
    if ((!data.deliveryDate || !data.deliveryTime) && data.time) {
      const parsed = parseTimeText(data.time);
      if (parsed) {
        if (!data.deliveryDate && parsed.deliveryDate) data.deliveryDate = parsed.deliveryDate;
        if (!data.deliveryTime && parsed.deliveryTime) data.deliveryTime = parsed.deliveryTime;
      }
    }
    if (data.deliveryDate && data.deliveryTime) {
      data.time = buildTimeText(data.deliveryDate, data.deliveryTime);
    } else if (!data.time) {
      data.time = buildTimeText(defaultShipping.deliveryDate, defaultShipping.deliveryTime);
    }
    data.note = (data.note || '').trim();
    return data;
  }

  function buildShippingRow(key, label, value) {
    return `
      <div class="shipping-row">
        <div class="row-body">
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
        <button class="row-edit" type="button" data-field="${key}" aria-label="Sua ${label}">
          <img src="/assets/icons/edit.png" alt="" aria-hidden="true">
        </button>
      </div>`;
  }

  function renderShipping(info) {
    const host = document.getElementById('shipping-info');
    if (!host) return null;
    const data = normalizeShipping(info);
    host.innerHTML = [
      buildShippingRow('address', 'Địa chỉ giao hàng', data.address),
      buildShippingRow('receiver', 'Người nhận', `${data.receiver}<br>${data.phone}`),
      buildShippingRow('time', 'Thời gian giao hàng', data.time),
      buildShippingRow('note', 'Ghi chú cho cửa hàng', data.note || 'Không có ghi chú'),
    ].join('');
    return data;
  }

  function ensureModalRoot() {
    let root = document.getElementById(modalRootId);
    if (!root) {
      root = document.createElement('div');
      root.id = modalRootId;
      document.body.appendChild(root);
    }
    return root;
  }

  function presentModal(config) {
    if (!config) return Promise.resolve(null);
    return new Promise((resolve) => {
      const root = ensureModalRoot();
      const overlay = document.createElement('div');
      overlay.className = 'cart-modal';

      const dialog = document.createElement('div');
      dialog.className = 'cart-modal__dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');

      const titleId = `cart-modal-title-${Date.now()}`;
      dialog.setAttribute('aria-labelledby', titleId);

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'cart-modal__close';
      closeBtn.setAttribute('aria-label', 'Dong');
      closeBtn.innerHTML = '&times;';

      const titleEl = document.createElement('h3');
      titleEl.className = 'cart-modal__title';
      titleEl.id = titleId;
      titleEl.textContent = config.title;

      const form = document.createElement('form');
      form.className = 'cart-modal__form';
      form.noValidate = true;

      let resolved = false;
      const finish = (value) => {
        if (resolved) return;
        resolved = true;
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        resolve(value);
      };

      const onKeyDown = (evt) => {
        if (evt.key === 'Escape') finish(null);
      };

      const setup = config.build(form, finish) || {};
      const focusEl = setup.focus;
      const getValue = setup.getValue;

      closeBtn.addEventListener('click', () => finish(null));
      overlay.addEventListener('click', (evt) => {
        if (evt.target === overlay) finish(null);
      });
      document.addEventListener('keydown', onKeyDown);
      form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        if (typeof getValue !== 'function') {
          finish(null);
          return;
        }
        const value = getValue();
        if (value == null) return;
        finish(value);
      });

      dialog.append(closeBtn, titleEl, form);
      overlay.appendChild(dialog);
      root.appendChild(overlay);
      document.body.classList.add('modal-open');

      if (focusEl && typeof focusEl.focus === 'function') {
        setTimeout(() => focusEl.focus(), 30);
      }
    });
  }

  function openShippingModal(field, current) {
    return presentModal(getShippingModalConfig(field, current));
  }

  function getShippingModalConfig(field, current) {
    const data = normalizeShipping(current);
    if (field === 'address') {
      return {
        title: 'Thay đổi địa chỉ giao hàng',
        build(form, finish) {
          const current = escapeHTML(data.address || '');
          form.innerHTML = `
            <div class="cart-modal__address">
              <label class="cart-modal__search">
                <span class="sr-only">Nhập địa chỉ nhận hàng mới</span>
                <input name="address" type="text" required placeholder="Vui lòng nhập địa chỉ nhận hàng">
                <span class="cart-modal__search-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" focusable="false">
                    <path d="M8.75 2a6.75 6.75 0 0 1 5.632 10.646l3.486 3.486a1 1 0 0 1-1.414 1.414l-3.486-3.486A6.75 6.75 0 1 1 8.75 2Zm0 2a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z" fill="currentColor"/>
                  </svg>
                </span>
              </label>
              <p class="cart-modal__current"><span>Địa chỉ hiện tại:</span> ${current || 'Chưa có thông tin'}</p>
              <p class="cart-modal__note cart-modal__note--accent">Cảnh báo: thay đổi địa chỉ có thể làm thay đổi phí hoặc thời gian giao hàng.</p>
              <p class="cart-modal__error" data-role="message"></p>
              <div class="cart-modal__actions">
                <button type="button" class="cart-modal__btn cart-modal__btn--ghost" data-action="cancel">Huỷ</button>
                <button type="submit" class="cart-modal__btn cart-modal__btn--primary">Xác nhận</button>
              </div>
            </div>`;
          const addressInput = form.querySelector('input[name="address"]');
          if (addressInput) addressInput.value = data.address || '';
          const messageEl = form.querySelector('[data-role="message"]');
          if (messageEl) {
            messageEl.style.color = '#d93025';
            messageEl.style.margin = '8px 0 0';
            messageEl.style.fontSize = '0.9rem';
            messageEl.textContent = 'Nhập địa chỉ và kiểm tra trước khi xác nhận.';
          }
          const cancelBtn = form.querySelector('[data-action="cancel"]');
          if (cancelBtn) cancelBtn.addEventListener('click', () => finish(null));
          return {
            focus: addressInput,
            getValue() {
              const value = addressInput ? addressInput.value.trim() : '';
              if (messageEl) {
                messageEl.textContent = value ? '' : 'Vui lòng nhập địa chỉ nhận hàng.';
              }
              if (!value) {
                if (addressInput) addressInput.focus();
                return null;
              }
              if (!form.reportValidity()) return null;
              return { address: value };
            },
          };
        },
      };
    }

    if (field === 'receiver') {
      return {
        title: 'Cập nhật người nhận',
        build(form, finish) {
          form.innerHTML = `
            <label>
              <span>Họ tên nguời nhận</span>
              <input name="receiver" type="text" required maxlength="80">
            </label>
            <label>
              <span>Số điện thoại</span>
              <input name="phone" type="tel" required maxlength="20" pattern="[0-9\s\+\-]{9,20}">
              <span class="cart-modal__hint">Số điện thoại có thể gồm khoảng trắng</span>
            </label>
            <p class="cart-modal__error" data-role="message"></p>
            <div class="cart-modal__actions">
              <button type="button" class="cart-modal__btn cart-modal__btn--ghost" data-action="cancel">Huỷ</button>
              <button type="submit" class="cart-modal__btn cart-modal__btn--primary">Xác nhận</button>
            </div>
          `;
          const receiverInput = form.querySelector('input[name="receiver"]');
          const phoneInput = form.querySelector('input[name="phone"]');
          if (receiverInput) receiverInput.value = data.receiver || '';
          if (phoneInput) phoneInput.value = data.phone || '';
          const messageEl = form.querySelector('[data-role="message"]');
          if (messageEl) {
            messageEl.style.color = '#d93025';
            messageEl.style.margin = '8px 0 0';
            messageEl.style.fontSize = '0.9rem';
          }
          const cancelBtn = form.querySelector('[data-action="cancel"]');
          if (cancelBtn) cancelBtn.addEventListener('click', () => finish(null));
          return {
            focus: receiverInput,
            getValue() {
              const receiver = receiverInput ? receiverInput.value.trim() : '';
              const phone = phoneInput ? phoneInput.value.trim() : '';
              if (messageEl) messageEl.textContent = '';
              if (!receiver) {
                if (messageEl) messageEl.textContent = 'Vui lòng nhập họ tên người nhận.';
                if (receiverInput) receiverInput.focus();
                return null;
              }
              if (!phone) {
                if (messageEl) messageEl.textContent = 'Vui lòng nhập số điện thoại người nhận.';
                if (phoneInput) phoneInput.focus();
                return null;
              }
              if (!form.reportValidity()) return null;
              return { receiver, phone };
            },
          };
        },
      };
    }

    if (field === 'time') {

      return {
        title: 'Thời gian nhận hàng',
        build(form, finish) {
          const today = new Date();
          const minDate = today.toISOString().split('T')[0];
          form.innerHTML = `
            <div class="cart-modal__row">
              <label>
                <span>Ngày nhận hàng</span>
                <input name="deliveryDate" type="date" required min="${minDate}">
              </label>
              <label>
                <span>Thời gian</span>
                <select name="deliveryTime" required></select>
              </label>
            </div>
            <span class="cart-modal__hint">Cửa hàng sẽ giao trong vòng +/-30 phút quanh thời gian bạn chọn.</span>
            <div class="cart-modal__actions">
              <button type="button" class="cart-modal__btn cart-modal__btn--ghost" data-action="cancel">Hủy</button>
              <button type="submit" class="cart-modal__btn cart-modal__btn--primary">Xác nhận</button>
            </div>`;
          const dateInput = form.querySelector('input[name="deliveryDate"]');
          const timeSelect = form.querySelector('select[name="deliveryTime"]');
          if (dateInput) {
            const value = data.deliveryDate || minDate;
            dateInput.value = value;
            dateInput.min = minDate;
          }
          if (timeSelect) {
            TIME_OPTIONS.forEach((opt) => {
              const option = document.createElement('option');
              option.value = opt;
              option.textContent = opt;
              timeSelect.appendChild(option);
            });
            timeSelect.value = data.deliveryTime || TIME_OPTIONS[0];
          }
          const cancelBtn = form.querySelector('[data-action="cancel"]');
          if (cancelBtn) cancelBtn.addEventListener('click', () => finish(null));
          return {
            focus: dateInput,
            getValue() {
              if (!form.reportValidity()) return null;
              const deliveryDate = dateInput ? dateInput.value : '';
              const deliveryTime = timeSelect ? timeSelect.value : '';
              if (!deliveryDate || !deliveryTime) return null;
              return {
                deliveryDate,
                deliveryTime,
                time: buildTimeText(deliveryDate, deliveryTime),
              };
            },
          };
        },
      };
    }

    if (field === 'note') {
      return {
        title: 'Ghi chú cho cửa hàng',
        build(form, finish) {
          form.innerHTML = `
            <label>
              <span>Ghi chú</span>
              <textarea name="note" rows="4" placeholder="Ví dụ: Nhớ để thêm đá"></textarea>
            </label>
            <div class="cart-modal__actions">
              <button type="button" class="cart-modal__btn cart-modal__btn--ghost" data-action="cancel">Hủy</button>
              <button type="submit" class="cart-modal__btn cart-modal__btn--primary">Xác nhận</button>
            </div>`;
          const noteInput = form.querySelector('textarea[name="note"]');
          if (noteInput) noteInput.value = data.note || '';
          const cancelBtn = form.querySelector('[data-action="cancel"]');
          if (cancelBtn) cancelBtn.addEventListener('click', () => finish(null));
          return {
            focus: noteInput,
            getValue() {
              return { note: noteInput ? noteInput.value.trim() : '' };
            },
          };
        },
      };
    }

    return null;
  }


  function getCouponModalConfig(state) {
    const subtotal = Number(state.subtotal) || 0;
    const current = state.current || { code: '', valid: false, message: '' };
    const activeCode = current.code || '';
    const hint = activeCode
      ? current.valid
        ? `Mã hiện tại: ${activeCode}`
        : `${activeCode} - ${current.message || 'Chưa đáp ứng điều kiện'}`
      : 'Vi du ma: NGOGIAFS, NGOVIP15';
    return {
      title: 'Nhập mã giảm giá',
      build(form, finish) {
        form.innerHTML = `
          <label>
            <span>Mã giảm giá</span>
            <input name="coupon" type="text" autocomplete="off" placeholder="Nhập mã giảm giá hoặc Số điện thoại VIP">
          </label>
          <p class="cart-modal__hint">${hint}</p>
          <div class="cart-modal__actions">
            <button type="button" class="cart-modal__btn cart-modal__btn--ghost" data-action="cancel">Đóng</button>
            ${activeCode ? '<button type="button" class="cart-modal__btn cart-modal__btn--ghost" data-action="clear">Bỏ mã</button>' : ''}
            <button type="submit" class="cart-modal__btn cart-modal__btn--primary">Áp dụng</button>
          </div>`;
        const input = form.querySelector('input[name="coupon"]');
        if (input) input.value = activeCode;
        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn) cancelBtn.addEventListener('click', () => finish(null));
        const clearBtn = form.querySelector('[data-action="clear"]');
        if (clearBtn) clearBtn.addEventListener('click', () => finish({ action: 'clear' }));
        return {
          focus: input,
          getValue() {
            if (!form.reportValidity()) return null;
            const code = input ? input.value.trim() : '';
            return { action: 'apply', code };
          },
        };
      },
    };
  }

  function openCouponModal(state) {
    return presentModal(getCouponModalConfig(state));
  }

  function initEditShipping(initial) {
    const state = normalizeShipping(initial);
    const host = document.getElementById('shipping-info');
    if (!host) return;
    host.addEventListener('click', async (evt) => {
      const button = evt.target.closest('.row-edit');
      if (!button) return;
      const field = button.dataset.field;
      const result = await openShippingModal(field, state);
      if (!result) return;
      const updated = normalizeShipping({ ...state, ...result });
      setShippingInfo(updated);
      renderShipping(updated);
      Object.assign(state, updated);
    });
  }

  function initCouponEntry() {
    const btn = document.getElementById('btn-coupon');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const items = window.NGCart.getItems();
      const subtotal = window.NGCart.subtotal(items);
      const current = window.NGCart.coupon.resolve(subtotal);
      const result = await openCouponModal({ subtotal, current });
      if (!result) return;
      let shouldRefresh = false;
      if (result.action === 'clear') {
        window.NGCart.coupon.clear();
        shouldRefresh = true;
      } else if (result.action === 'apply') {
        const normalized = String(result.code || '').trim().toUpperCase();
        const evaluation = window.NGCart.coupon.evaluate(normalized, subtotal);
        if (!evaluation.success) {
          if (evaluation.reason === 'minSubtotal') {
            window.NGCart.coupon.set({ code: normalized });
            alert(evaluation.error);
            shouldRefresh = true;
          } else {
            alert(evaluation.error);
            return;
          }
        } else {
          window.NGCart.coupon.set({ code: evaluation.code });
          alert(`Đã áp dụng mã ${evaluation.code}!`);
          shouldRefresh = true;
        }
      }
      if (!shouldRefresh) return;
      const latestItems = window.NGCart.getItems();
      renderCartItems(latestItems);
    });
  }

  function renderEmptyState() {
    return `
      <div class="cart-empty">
        <img src="/assets/icons/menu.png" alt="" aria-hidden="true">
        <p>Giỏ hàng hiện đang trống, hãy thêm vài món yêu thích nhé!</p>
      </div>`;
  }

  function renderCartItems(items) {
    const list = document.getElementById('cart-list');
    const countEl = document.getElementById('cart-count');
    if (!list || !countEl) return;
    if (!items.length) {
      list.innerHTML = renderEmptyState();
      countEl.textContent = '0 món';
    } else {
      list.innerHTML = items
        .map((item, idx) => {
          const image = `/${String(item.image || '').replace(/^\//, '')}`;
          const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
          const details = [
            item.size ? `Size ${item.size}` : '',
            Array.isArray(item.options) && item.options.length ? item.options.join(', ') : '',
            item.note || '',
          ]
            .filter(Boolean)
            .join(' - ');
          return `
            <article class="cart-item" data-idx="${idx}">
              <img src="${image}" alt="${item.name || 'Do uong'}">
              <div class="info">
                <h4>${item.name || 'Do uong'}</h4>
                ${details ? `<p>${details}</p>` : ''}
                <div class="price">${window.NGCart.price(lineTotal)}d</div>
              </div>
              <div class="item-controls">
                <div class="qty-shell" role="group" aria-label="So luong ${item.name || ''}">
                  <button class="qty-minus" type="button" aria-label="Giam so luong">-</button>
                  <span>${item.qty || 1}</span>
                  <button class="qty-plus" type="button" aria-label="Tang so luong">+</button>
                </div>
                <button class="remove-item" type="button" aria-label="Xoa ${item.name || ''}">
                  <img src="/assets/icons/delete.png" alt="" aria-hidden="true">
                </button>
              </div>
            </article>`;
        })
        .join('');
      const totalQty = items.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);
      countEl.textContent = `${totalQty} món`;
    }
    bindCartControls(list);
    updateTotals(items);
  }

  function bindCartControls(list) {
    list.querySelectorAll('.cart-item').forEach((row) => {
      const idx = Number(row.dataset.idx);
      const minus = row.querySelector('.qty-minus');
      const plus = row.querySelector('.qty-plus');
      const remove = row.querySelector('.remove-item');
      if (minus) minus.addEventListener('click', () => window.NGCart.setItemQty(idx, getQuantity(idx) - 1));
      if (plus) plus.addEventListener('click', () => window.NGCart.setItemQty(idx, getQuantity(idx) + 1));
      if (remove) remove.addEventListener('click', () => window.NGCart.removeItem(idx));
    });
  }

  function getQuantity(idx) {
    const items = window.NGCart.getItems();
    return items[idx] ? (Number(items[idx].qty) || 1) : 1;
  }

  function updateTotals(items) {
    const subtotal = window.NGCart.subtotal(items);
    const coupon = window.NGCart.coupon.resolve(subtotal);
    const totals = window.NGCart.totals(items, coupon.amount);
    const subEl = document.getElementById('total-sub');
    const shipEl = document.getElementById('total-ship');
    const discountEl = document.getElementById('total-discount');
    const grandEl = document.getElementById('total-grand');
    const couponLabel = document.getElementById('coupon-label');
    if (subEl) subEl.textContent = window.NGCart.price(totals.subtotal) + 'd';
    if (shipEl) shipEl.textContent = window.NGCart.price(totals.shipping) + 'd';
    if (discountEl) {
      discountEl.textContent = totals.discount ? `- ${window.NGCart.price(totals.discount)}d` : '0d';
    }
    if (grandEl) grandEl.textContent = window.NGCart.price(totals.grand) + 'd';
    if (couponLabel) {
      if (coupon.code) {
        if (coupon.valid && totals.discount) {
          couponLabel.textContent = `Đã áp dụng: ${coupon.code} (-${window.NGCart.price(totals.discount)}d)`;
          couponLabel.classList.remove('invalid');
        } else {
          couponLabel.textContent = `${coupon.code} (${coupon.message || 'Chưa đáp ứng điều kiện'})`;
          couponLabel.classList.add('invalid');
        }
      } else {
        couponLabel.textContent = 'Chưa áp dụng';
        couponLabel.classList.remove('invalid');
      }
    }
  }

  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    if (!form || !emailInput) return;
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const value = emailInput.value.trim();
      if (!value) {
        alert('Vui lòng nhập email trước khi đăng ký.');
        emailInput.focus();
        return;
      }
      alert(`Cảm ơn bạn đã đăng ký nhận bản tin, ${value}!`);
      emailInput.value = '';
    });
  }

  function initCheckout() {
    const btn = document.getElementById('btn-checkout');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const agree = document.getElementById('agree-terms');
      if (!agree || !agree.checked) {
        alert('Vui lòng đồng ý với các điều khoản trước khi thanh toán.');
        return;
      }
      const items = window.NGCart.getItems();
      if (!items.length) {
        alert('Giỏ hàng hiện đang trống.');
        return;
      }
      // Chuyen sang trang thanh toan theo phuong thuc da chon
      const pm = document.querySelector('input[name="payment"]:checked');
      const val = (pm && pm.value) || '';
      const map = { momo: 'momo', zalopay: 'zalopay', ewallet: 'payoo' };
      const method = map[val] || 'momo';
      try { window.location.href = '/payment/?method=' + method; }
      catch { location.assign('/payment/?method=' + method); }
    });
  }

  const renderedShipping = renderShipping(getShippingInfo() || defaultShipping);
  initEditShipping(renderedShipping || defaultShipping);
  initCouponEntry();
  initNewsletter();
  initCheckout();

  window.NGCart.subscribe(renderCartItems);
})(window, document);

