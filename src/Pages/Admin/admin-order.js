(() => {
  // Guard: only allow access if logged in via admin login
  try {
    const authAdmin = localStorage.getItem('authAdmin');
    if (!authAdmin) {
      window.location.href = '/login-admin/';
      return;
    }
  } catch {}

  const $ = (s, r=document) => r.querySelector(s);
  const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Number(n)||0) + 'đ';
  
  // Format date with time
  const fmtDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  let ORDERS_ALL = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  let totalPages = 1;
  
  let filterState = {
    status: '',
    date: '',
    search: ''
  };
  
  let currentTabStatus = ''; // Track current active tab status

  // ============================================================
  // ✅ SUCCESS MODAL
  // ============================================================
  
  function showSuccess(message = 'CẬP NHẬT THÀNH CÔNG') {
    const modal = document.getElementById('modal-success');
    const messageEl = document.getElementById('success-message');
    
    if (!modal) {
      console.error('Success modal not found');
      return;
    }
    
    // Set message
    if (messageEl) messageEl.textContent = message;
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Auto close sau 2 giây
    setTimeout(() => hideSuccess(), 2000);
  }

  function hideSuccess() {
    const modal = document.getElementById('modal-success');
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
  }

  function initSuccessModal() {
    const btn = document.getElementById('btn-close-success');
    const modal = document.getElementById('modal-success');
    
    if (btn) {
      btn.addEventListener('click', hideSuccess);
    }
    
    // Click overlay to close
    if (modal) {
      modal.querySelector('.modal-overlay')?.addEventListener('click', hideSuccess);
    }
    
    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.style.display === 'flex') {
        hideSuccess();
      }
    });
  }

  // === FETCH ORDERS ===
  async function fetchOrders() {
    try {
      const res = await fetch('/public/data/orders.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load orders');
      ORDERS_ALL = await res.json();
      console.log('✅ Orders loaded:', ORDERS_ALL.length);
      console.log('📊 Orders data:', ORDERS_ALL);
      console.log('📋 First order status:', ORDERS_ALL[0]?.status);
      
      updateOrdersStats();
      applyFilters();
    } catch (err) {
      console.error('❌ Fetch orders error:', err);
      ORDERS_ALL = [];
    }
  }

  // === UPDATE ORDERS STATS ===
  function updateOrdersStats() {
    const statAll = $('#statAll');
    const statPending = $('#statPending');
    const statShipping = $('#statShipping');
    const statCompleted = $('#statCompleted');
    
    const all = ORDERS_ALL.length;
    const pending = ORDERS_ALL.filter(o => o.status === 'pending').length;
    const shipping = ORDERS_ALL.filter(o => o.status === 'shipping').length;
    const completed = ORDERS_ALL.filter(o => o.status === 'completed').length;
    
    if (statAll) statAll.textContent = all;
    if (statPending) statPending.textContent = pending;
    if (statShipping) statShipping.textContent = shipping;
    if (statCompleted) statCompleted.textContent = completed;
  }

  // === FILTERS ===
  function normalize(str) {
    if (str == null) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function filterOrders(orders) {
    return orders.filter(order => {
      // Tab status filter (from clicking tabs)
      if (currentTabStatus && order.status !== currentTabStatus) {
        return false;
      }
      
      // Status filter
      if (filterState.status && order.status !== filterState.status) {
        return false;
      }
      
      // Date filter
      if (filterState.date) {
        const orderDate = new Date(order.date || order.createdAt);
        const filterDate = new Date(filterState.date);
        
        if (orderDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }
      
      // Search filter
      if (filterState.search) {
        const searchNorm = normalize(filterState.search);
        const orderId = normalize(order.id || order.orderId || '');
        const customerName = normalize(order.customerName || '');
        const customerPhone = normalize(order.customerPhone || '');
        
        if (!orderId.includes(searchNorm) && 
            !customerName.includes(searchNorm) && 
            !customerPhone.includes(searchNorm)) {
          return false;
        }
      }
      
      return true;
    });
  }

  function applyFilters() {
    const filtered = filterOrders(ORDERS_ALL);
    totalPages = Math.ceil(filtered.length / itemsPerPage);
    currentPage = 1;
    renderOrdersTable(filtered);
    renderPagination(filtered);
    
    // Update total count
    const totalEl = $('#totalOrders');
    if (totalEl) totalEl.textContent = filtered.length;
  }

  function initFilters() {
    const statusFilter = $('#filter-status');
    const dateFilter = $('#filter-date');
    const searchInput = $('#search-order');
    const resetBtn = $('#btnResetFilter');
    
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        filterState.status = e.target.value;
        applyFilters();
      });
    }
    
    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => {
        filterState.date = e.target.value;
        applyFilters();
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterState.search = e.target.value;
        applyFilters();
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterState = { status: '', date: '', search: '' };
        if (statusFilter) statusFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        if (searchInput) searchInput.value = '';
        applyFilters();
      });
    }
  }

  // === RENDER ORDERS TABLE ===
  function renderOrdersTable(orders) {
    const tbody = $('#ordersTableBody');
    
    if (!tbody) {
      console.error('Orders tbody not found');
      return;
    }
    
    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:40px;color:#6b7785;">
            Không có đơn hàng nào
          </td>
        </tr>
      `;
      return;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOrders = orders.slice(start, end);
    
    tbody.innerHTML = pageOrders.map((order, index) => {
      const stt = start + index + 1;
      const orderId = order.id || order.orderId || '-';
      const dateStr = fmtDate(order.date || order.createdAt);
      const total = fmtMoney(order.total);
      const paymentMethod = order.paymentMethod || 'Tiền mặt';
      
      console.log('🔍 Rendering order:', orderId, 'Status:', order.status);
      
      // Status badge - GIỐNG ADMIN.CSS (chỉ dùng 1 class)
      let badgeClass = '';
      let statusText = '';
      
      switch (order.status) {
        case 'pending':
          badgeClass = 'badge-warning';
          statusText = 'Chờ xác nhận';
          break;
        case 'processing':
          badgeClass = 'badge-info';
          statusText = 'Đang xử lý';
          break;
        case 'shipping':
          badgeClass = 'badge-info';
          statusText = 'Đang giao hàng';
          break;
        case 'completed':
          badgeClass = 'badge-success';
          statusText = 'Đã giao hàng';
          break;
        case 'cancelled':
          badgeClass = 'badge-danger';
          statusText = 'Đã hủy';
          break;
        default:
          badgeClass = 'badge-info';
          statusText = 'Chờ xử lý';
      }
      
      console.log('✅ Badge class:', badgeClass, 'Text:', statusText);
      
      return `
        <tr>
          <td>${stt}</td>
          <td>${orderId}</td>
          <td>${dateStr}</td>
          <td><strong>${total}</strong></td>
          <td><span class="${badgeClass}">${statusText}</span></td>
          <td>${paymentMethod}</td>
          <td>
            <button type="button" class="btn" data-edit-order="${orderId}" title="Chi tiết">
              <img src="/assets/icons/edit2.png" alt="Edit">
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    console.log('✅ Orders table rendered');
  }

  // === RENDER PAGINATION ===
  function renderPagination(orders) {
    const pager = $('#ordersPagination');
    if (!pager) return;
    
    if (totalPages <= 1) {
      pager.innerHTML = '';
      return;
    }
    
    let html = `<button ${currentPage === 1 ? 'disabled' : ''} id="prevPage">←</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
      html += `<button ${currentPage === i ? 'class="active"' : ''} data-page="${i}">${i}</button>`;
    }
    
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} id="nextPage">→</button>`;
    
    pager.innerHTML = html;
    
    const prevBtn = $('#prevPage');
    const nextBtn = $('#nextPage');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderOrdersTable(filterOrders(ORDERS_ALL));
          renderPagination(filterOrders(ORDERS_ALL));
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderOrdersTable(filterOrders(ORDERS_ALL));
          renderPagination(filterOrders(ORDERS_ALL));
        }
      });
    }
    
    document.querySelectorAll('#ordersPagination button[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentPage = parseInt(e.target.dataset.page);
        renderOrdersTable(filterOrders(ORDERS_ALL));
        renderPagination(filterOrders(ORDERS_ALL));
      });
    });
  }

  // === OPEN ORDER DETAIL MODAL ===
  function openOrderDetailModal(orderId) {
    document.querySelectorAll('.modal').forEach(m => {
      if (m.id !== 'modal-order-detail') {
        m.style.display = 'none';
      }
    });

    const modal = document.getElementById('modal-order-detail');
    if (!modal) {
      console.error('Order detail modal not found');
      return;
    }
    
    const order = ORDERS_ALL.find(o => (o.id || o.orderId) == orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }
    
    const orderIdEl = document.getElementById('order-id');
    const orderDateEl = document.getElementById('order-date');
    const orderTimeEl = document.getElementById('order-time');
    const customerNameEl = document.getElementById('customer-name');
    const customerPhoneEl = document.getElementById('customer-phone');
    const customerAddressEl = document.getElementById('customer-address');
    
    if (orderIdEl) orderIdEl.textContent = order.id || order.orderId || '-';
    
    const dateTime = fmtDate(order.date || order.createdAt).split(' ');
    if (orderDateEl) orderDateEl.textContent = dateTime[0] || '-';
    if (orderTimeEl) orderTimeEl.textContent = dateTime[1] || '-';
    
    if (customerNameEl) customerNameEl.textContent = order.customerName || '-';
    if (customerPhoneEl) customerPhoneEl.textContent = order.customerPhone || '-';
    if (customerAddressEl) customerAddressEl.textContent = order.customerAddress || '-';
    
    // Status dropdown
    const statusSelect = document.getElementById('order-status-dropdown');
    
    if (statusSelect && order.status) {
      statusSelect.value = order.status;
      
      // Store original status for comparison
      statusSelect.dataset.originalStatus = order.status;
      statusSelect.dataset.orderId = order.id || order.orderId;
    }
    
    const itemsContainer = document.getElementById('order-items');
    if (itemsContainer && order.items) {
      itemsContainer.innerHTML = order.items.map(item => `
        <div class="order-item">
          <img src="${item.image || '/assets/images/products/default.jpg'}" alt="${item.name}" class="item-image">
          <div class="item-details">
            <div class="item-name">${item.name || '-'}</div>
            <div class="item-specs">Size: ${item.size || 'M'} • SL: ${item.quantity || 1}</div>
          </div>
          <div class="item-price">${fmtMoney(item.price * (item.quantity || 1))}</div>
        </div>
      `).join('');
    }
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingFeeEl = document.getElementById('shipping-fee');
    const discountEl = document.getElementById('discount');
    const totalAmountEl = document.getElementById('total-amount');
    
    if (subtotalEl) subtotalEl.textContent = fmtMoney(order.subtotal || order.total);
    if (shippingFeeEl) shippingFeeEl.textContent = fmtMoney(order.shippingFee || 0);
    if (discountEl) discountEl.textContent = fmtMoney(order.discount || 0);
    if (totalAmountEl) totalAmountEl.textContent = fmtMoney(order.total);
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    console.log('Order modal opened for order:', orderId);
  }

  function closeOrderDetailModal() {
    const modal = document.getElementById('modal-order-detail');
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }

  // === SAVE ORDER ===
  function saveOrderChanges() {
    const statusSelect = document.getElementById('order-status-dropdown');
    if (!statusSelect) return;
    
    const orderId = statusSelect.dataset.orderId;
    const originalStatus = statusSelect.dataset.originalStatus;
    const newStatus = statusSelect.value;
    
    // Check if status changed
    if (originalStatus === newStatus) {
      showSuccess('KHÔNG CÓ THAY ĐỔI');
      closeOrderDetailModal();
      return;
    }
    
    // Find and update order
    const orderIndex = ORDERS_ALL.findIndex(o => (o.id || o.orderId) == orderId);
    if (orderIndex !== -1) {
      ORDERS_ALL[orderIndex].status = newStatus;
      
      // Save to localStorage
      try {
        localStorage.setItem('orders', JSON.stringify(ORDERS_ALL));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      
      // Update stats and table
      updateOrdersStats();
      applyFilters();
      
      showSuccess('CẬP NHẬT TRẠNG THÁI THÀNH CÔNG');
      closeOrderDetailModal();
    } else {
      console.error('Order not found for update:', orderId);
    }
  }

  // === EXPORT ORDERS ===
  function exportOrders() {
    if (!ORDERS_ALL || ORDERS_ALL.length === 0) {
      alert('Không có đơn hàng để xuất!');
      return;
    }
    
    // Create CSV content
    let csv = 'Mã đơn hàng,Khách hàng,Số điện thoại,Địa chỉ,Ngày đặt,Trạng thái,Tổng tiền\n';
    
    ORDERS_ALL.forEach(order => {
      const orderId = order.id || order.orderId || '';
      const customerName = (order.customerName || '').replace(/,/g, ' ');
      const customerPhone = order.customerPhone || '';
      const customerAddress = (order.customerAddress || '').replace(/,/g, ' ');
      const date = fmtDate(order.date || order.createdAt);
      const status = order.status || '';
      const total = order.total || 0;
      
      csv += `${orderId},${customerName},${customerPhone},${customerAddress},${date},${status},${total}\n`;
    });
    
    // Create download link
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showSuccess('XUẤT DANH SÁCH THÀNH CÔNG');
  }

  // === INIT TABS ===
  function initTabs() {
    const tabs = document.querySelectorAll('.stat-card');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Get status from data-status attribute
        const status = tab.getAttribute('data-status');
        
        console.log('📌 Tab clicked:', status || 'all');
        
        // Update active class
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update current tab status
        currentTabStatus = status || '';
        
        // Apply filters
        applyFilters();
      });
    });
  }

  // === INIT ===
  function init() {
    console.log('🚀 Admin Order Page Initialized');
    
    // Load orders from localStorage first (if exists)
    try {
      const localOrders = localStorage.getItem('orders');
      if (localOrders) {
        ORDERS_ALL = JSON.parse(localOrders);
        updateOrdersStats();
        applyFilters();
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
    
    // Then fetch from JSON (will overwrite if different)
    fetchOrders();
    
    // Init success modal
    initSuccessModal();
    
    // Init filters
    initFilters();
    
    // Init tabs
    initTabs();
    
    // Export button
    const btnExport = document.getElementById('btnExportOrders');
    if (btnExport) {
      btnExport.addEventListener('click', exportOrders);
    }
    
    // Save order button
    const btnSaveOrder = document.getElementById('btn-save-order');
    if (btnSaveOrder) {
      btnSaveOrder.addEventListener('click', saveOrderChanges);
    }
  }

  // Event delegation for edit buttons
  document.addEventListener('click', (e) => {
    const editOrderBtn = e.target.closest('[data-edit-order]');
    if (editOrderBtn) {
      e.preventDefault();
      const orderId = editOrderBtn.dataset.editOrder;
      console.log('📝 Opening order detail for:', orderId);
      openOrderDetailModal(orderId);
      return;
    }
    
    // Close order modal
    if (e.target.closest('[data-close-order]') || 
        (e.target.classList.contains('modal-overlay') && 
         e.target.closest('#modal-order-detail'))) {
      closeOrderDetailModal();
      return;
    }
  });

  // ESC key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const orderModal = document.getElementById('modal-order-detail');
      if (orderModal && orderModal.style.display === 'flex') {
        closeOrderDetailModal();
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
