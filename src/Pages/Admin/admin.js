(() => {
  // Guard: only allow access if logged in via admin login
  try {
    const authAdmin = localStorage.getItem('authAdmin');
    if (!authAdmin) {
      alert('Vui lòng đăng nhập với tài khoản quản trị.');
      location.href = '/login-admin/';
      return;
    }
  } catch {}

  const $ = (s, r=document) => r.querySelector(s);
  const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Number(n)||0) + 'đ';
  
  // Format date with time
  const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    
    if (isNaN(d.getTime())) return '';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  let ORDERS_ALL = [];
  let PRODUCTS_ALL = [];
  let currentPage = 1;
  const itemsPerPage = 8;
  let totalPages = 1;
  
  let filterState = {
    category: '',
    search: ''
  };

  // ============================================================
  //  SUCCESS MODAL - THAY THẾ TOAST
  // ============================================================
  
  function showSuccess(message = 'CHỈNH SỬA THÀNH CÔNG') {
    const modal = document.getElementById('modal-success');
    const messageEl = document.getElementById('success-message');
    
    if (!modal) {
      console.error('❌ Success modal not found');
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
      const overlay = modal.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', hideSuccess);
      }
    }
    
    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('show')) {
        hideSuccess();
      }
    });
  }

  // === CHARTS ===
  function initCharts() {
    // Revenue/Cost Chart - LINE CHART
    const revCostCtx = document.getElementById('revCostChart');
    if (revCostCtx && typeof Chart !== 'undefined') {
      new Chart(revCostCtx, {
        type: 'line',
        data: {
          labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          datasets: [
            {
              label: 'Doanh thu',
              data: [35, 25, 32, 38, 28, 42, 20, 80, 62, 69, 48, 32, 47, 59, 49],
              borderColor: '#ffffff',
              backgroundColor: 'transparent',
              borderWidth: 3,
              tension: 0.4,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#ffffff',
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Chi Phí',
              data: [32, 22, 28, 35, 25, 38, 18, 60, 58, 50, 45, 30, 45, 48, 18],
              borderColor: '#00eeffff',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              pointBackgroundColor: '#0088ff',
              pointBorderColor: '#ffffff',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: { 
                color: '#fff', 
                font: { size: 13 },
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 15
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#fff',
              borderWidth: 1,
              padding: 10,
              displayColors: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { 
                color: '#fff',
                font: { size: 12 },
                stepSize: 20
              },
              grid: { 
                color: 'rgba(255, 255, 255, 0.1)',
                drawBorder: false
              },
              border: { display: false }
            },
            x: {
              ticks: { 
                color: '#fff',
                font: { size: 12 }
              },
              grid: { 
                display: false
              },
              border: { display: false }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    }

    // Category Doughnut Chart
    const catPieCtx = document.getElementById('catPieChart');
    if (catPieCtx && typeof Chart !== 'undefined') {
      const categoryData = [45, 30, 25];
      const total = categoryData.reduce((a, b) => a + b, 0);
      
      new Chart(catPieCtx, {
        type: 'doughnut',
        data: {
          labels: ['Loại Trà Sữa', 'Loại Trà Latte', 'Loại Trà Trái Cây'],
          datasets: [{
            data: categoryData,
            backgroundColor: ['#0088ff', '#1e5a9e', '#e0f2fe'],
            borderWidth: 8,
            borderColor: '#72D5EC',
            borderRadius: 10,
            spacing: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { 
                color: '#ffffff',
                padding: 15,
                font: { size: 14 },
                usePointStyle: true,
                pointStyle: 'rect',
                boxWidth: 15,
                boxHeight: 15
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${percentage}%`;
                }
              }
            }
          }
        },
        plugins: [{
          id: 'centerText',
          beforeDraw: function(chart) {
            const { ctx, width, height } = chart;
            ctx.restore();
            
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('1.9K', width / 2, height / 2 - 10);
            
            ctx.font = '16px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('VND', width / 2, height / 2 + 20);
            
            ctx.save();
          }
        }]
      });
    }
  }

  window.t = function(key) {
    return window.adminTranslations?.[key] || key;
  };

  // === FETCH ORDERS ===
  async function fetchOrders() {
    try {
      const res = await fetch('/public/data/orders.json');
      if (!res.ok) throw new Error('Failed to fetch orders');
      ORDERS_ALL = await res.json();
      
      window.currentOrders = ORDERS_ALL;
      
      renderOrdersTable(ORDERS_ALL);
      updateOrdersStats();
    } catch (err) {
      console.error('Fetch orders error:', err);
      ORDERS_ALL = [];
      const tbody = $('#ordersBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Không thể tải đơn hàng</td></tr>';
    }
  }

  function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersBody');
    
    if (!tbody) {
      console.error('ordersBody not found');
      return;
    }
    
    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px;">
            ${t('admin.dashboard.noOrders') || 'Không có đơn hàng'}
          </td>
        </tr>
      `;
      return;
    }
    
    const recentOrders = orders.slice(-10).reverse();
    
    tbody.innerHTML = recentOrders.map(order => {
      const orderId = order.id || order.orderId || '';
      const customerName = order.customerName || order.customer?.name || 'Khách hàng';
      const orderDate = fmtDate(order.date || order.createdAt);
      const total = fmtMoney(order.total || order.totalAmount || 0);
      
      let statusKey = 'pending';
      const statusLower = (order.status || '').toLowerCase();
      
      if (statusLower.includes('hoàn') || statusLower.includes('complete')) {
        statusKey = 'completed';
      } else if (statusLower.includes('đang') || statusLower.includes('processing') || statusLower.includes('shipping')) {
        statusKey = 'processing';
      } else if (statusLower.includes('hủy') || statusLower.includes('cancel')) {
        statusKey = 'cancelled';
      }
      
      const statusMap = {
        'pending': 'badge-warning',
        'processing': 'badge-info',
        'shipping': 'badge-primary',
        'completed': 'badge-success',
        'cancelled': 'badge-danger'
      };
      
      const badgeClass = statusMap[statusKey] || 'badge-secondary';
      const statusText = t(`admin.order.status.${statusKey}`) || order.status;
      
      return `
        <tr>
          <td>#${orderId}</td>
          <td>${customerName}</td>
          <td>${orderDate}</td>
          <td><span class="${badgeClass}">${statusText}</span></td>
          <td>${total}</td>
          <td>
            <span class="btns">
              <button class="btn" data-edit-order="${orderId}">
                <img src="/assets/icons/edit2.png" alt="Chỉnh sửa" aria-hidden="true">
              </button>
            </span>
          </td>
        </tr>
      `;
    }).join('');
    
    console.log('✅ Orders table rendered with translations');
  }

  // === UPDATE ORDERS STATS ===
  function updateOrdersStats() {
    console.log('=== UPDATE ORDERS STATS (WEEKLY) ===');
    console.log('Total orders:', ORDERS_ALL.length);
    
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const dayOfWeek = today.getDay(); 
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const weekStart = new Date(todayMidnight);
    weekStart.setDate(weekStart.getDate() - daysToMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    console.log('Week start (Monday):', weekStart);
    console.log('Week end (Sunday):', weekEnd);
    
    const weekOrders = ORDERS_ALL.filter(o => {
      const orderDate = new Date(o.date || o.createdAt);
      return orderDate >= weekStart && orderDate <= weekEnd;
    });
    
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekEnd);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    
    const lastWeekOrders = ORDERS_ALL.filter(o => {
      const orderDate = new Date(o.date || o.createdAt);
      return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
    });
    
    console.log('This week orders:', weekOrders.length);
    console.log('Last week orders:', lastWeekOrders.length);
    
    const weekRevenue = weekOrders.reduce((sum, o) => {
      const orderTotal = Number(o.total) || Number(o.totalAmount) || 0;
      return sum + orderTotal;
    }, 0);
    
    const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => {
      const orderTotal = Number(o.total) || Number(o.totalAmount) || 0;
      return sum + orderTotal;
    }, 0);
    
    let revenueDelta = 0;
    if (lastWeekRevenue > 0) {
      revenueDelta = Math.round(((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100);
    } else if (weekRevenue > 0) {
      revenueDelta = 100;
    }
    
    let ordersDelta = 0;
    if (lastWeekOrders.length > 0) {
      ordersDelta = Math.round(((weekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100);
    } else if (weekOrders.length > 0) {
      ordersDelta = 100;
    }
    
    console.log('Week revenue:', weekRevenue);
    console.log('Last week revenue:', lastWeekRevenue);
    console.log('Revenue delta:', revenueDelta + '%');
    console.log('Orders delta:', ordersDelta + '%');
    
    const sOrders = $('#sOrders');
    const sRevenue = $('#sRevenue');
    const sOrdersDelta = $('#sOrdersDelta');
    const revenueDesc = document.querySelector('.card.stat.revenue .stat-desc');
    
    if (sOrders) {
      sOrders.textContent = weekOrders.length;
      console.log('✅ Updated sOrders to:', weekOrders.length);
    } else {
      console.error('❌ Element #sOrders not found');
    }
    
    if (sRevenue) {
      sRevenue.textContent = fmtMoney(weekRevenue);
      console.log('✅ Updated sRevenue to:', fmtMoney(weekRevenue));
    } else {
      console.error('❌ Element #sRevenue not found');
    }
    
    if (sOrdersDelta) {
      const sign = ordersDelta >= 0 ? '+' : '';
      sOrdersDelta.textContent = `${sign}${ordersDelta}%`;
      sOrdersDelta.style.color = ordersDelta >= 0 ? '#444444' : '#ef4444';
      console.log('✅ Updated sOrdersDelta to:', `${sign}${ordersDelta}%`);
    }
    
    if (revenueDesc) {
      const sign = revenueDelta >= 0 ? '+' : '';
      const color = revenueDelta >= 0 ? '#444444' : '#ef4444';
      revenueDesc.innerHTML = `
        <img src="/assets/icons/grow.png" alt="Growth icon" class="stat-desc-icon">
        Tuần này <span style="color: ${color}; font-weight: 700;">${sign}${revenueDelta}%</span>
      `;
      console.log('✅ Updated revenue desc to:', `Tuần này ${sign}${revenueDelta}%`);
    }
  }

  // === FETCH PRODUCTS ===
  async function fetchProducts() {
    try {
      const res = await fetch('/public/data/products.json');
      if (!res.ok) throw new Error('Failed to fetch products');
      PRODUCTS_ALL = await res.json();
      
      populateCategoryFilter();
      initProductFilters();
      applyFilters();
      updateProductsStats();
    } catch (err) {
      console.error('Fetch products error:', err);
      PRODUCTS_ALL = [];
      const body = $('#productsBody');
      if (body) body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Không thể tải sản phẩm</td></tr>';
    }
  }

  function populateCategoryFilter() {
    const select = document.getElementById('category-filter');
    if (!select) return;
    
    const categories = Array.from(
      new Set(
        PRODUCTS_ALL
          .map(p => (p.category || p.type || '').trim())
          .filter(Boolean)
      )
    ).sort();
    
    select.innerHTML = '<option value="" data-i18n="admin.dashboard.allCategories">Tất cả danh mục</option>';
    
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  }

  function initProductFilters() {
    const searchInput = document.getElementById('product-search');
    const categorySelect = document.getElementById('category-filter');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterState.search = e.target.value.trim();
        applyFilters();
      });
    }
    
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        filterState.category = e.target.value;
        applyFilters();
      });
    }
  }

  function normalize(str) {
    if (str == null) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function filterProducts(items) {
    return items.filter(item => {
      if (filterState.category) {
        const itemCat = (item.category || item.type || '').trim();
        if (itemCat !== filterState.category) return false;
      }
      
      if (filterState.search) {
        const query = normalize(filterState.search);
        const haystack = normalize([
          item.name,
          item.category,
          item.type,
          item.id
        ].join(' '));
        
        if (!haystack.includes(query)) return false;
      }
      
      return true;
    });
  }

  function applyFilters() {
    const filtered = filterProducts(PRODUCTS_ALL);
    totalPages = Math.ceil(filtered.length / itemsPerPage);
    currentPage = 1;
    renderProducts(filtered);
    renderPagination(filtered);
  }

  // === RENDER PRODUCTS TABLE ===
  function renderProducts(items) {
    const body = $('#productsBody');
    if (!body) return;
    body.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);
    
    if (pageItems.length === 0) {
      body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Không có sản phẩm</td></tr>';
      return;
    }
    
    pageItems.forEach(p => {
      const tr = document.createElement('tr');
      const price = fmtMoney(p.price);
      const imageUrl = p.image || p.img || p.imageUrl || p.thumbnail || '/assets/images/placeholder.png';
      
      tr.innerHTML = `
        <td>${p?.id ?? ''}</td>
        <td>${p?.name ?? ''}</td>
        <td>${p?.category ?? p?.type ?? ''}</td>
        <td><img src="${imageUrl}" alt="${p?.name ?? ''}" class="product-thumb" onerror="this.src='/assets/images/placeholder.png'"></td>
        <td>${price}</td>
        <td>
          <span class="btns">
            <button class="btn" data-edit="${p?.id ?? ''}">
              <img src="/assets/icons/edit2.png" alt="" aria-hidden="true">
            </button>
            <button class="btn" data-delete="${p?.id ?? ''}">
              <img src="/assets/icons/delete2.png" alt="" aria-hidden="true">
            </button>
          </span>
        </td>`;
      body.appendChild(tr);
    });
  }

  // === RENDER PAGINATION ===
  function renderPagination(items) {
    const pager = $('#productsPager');
    if (!pager) return;
    
    if (totalPages <= 1) {
      pager.innerHTML = '';
      return;
    }
    
    let html = `<button ${currentPage === 1 ? 'disabled' : ''} id="prevPage">←</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} id="nextPage">→</button>`;
    
    pager.innerHTML = html;
    
    const prevBtn = $('#prevPage');
    const nextBtn = $('#nextPage');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          const filtered = filterProducts(PRODUCTS_ALL);
          renderProducts(filtered);
          renderPagination(filtered);
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          const filtered = filterProducts(PRODUCTS_ALL);
          renderProducts(filtered);
          renderPagination(filtered);
        }
      });
    }
    
    document.querySelectorAll('#productsPager button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        const filtered = filterProducts(PRODUCTS_ALL);
        renderProducts(filtered);
        renderPagination(filtered);
      });
    });
  }

  // === UPDATE PRODUCTS STATS ===
  function updateProductsStats() {
    const sProducts = $('#sProducts');
    if (sProducts) sProducts.textContent = PRODUCTS_ALL.length;
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
      console.error('Modal order-detail not found');
      return;
    }
    
    const order = ORDERS_ALL.find(o => (o.id || o.orderId) == orderId);
    if (!order) {
      alert('Không tìm thấy đơn hàng');
      return;
    }
    
    const orderIdEl = document.getElementById('order-id');
    const orderDateEl = document.getElementById('order-date');
    const orderTimeEl = document.getElementById('order-time');
    const customerNameEl = document.getElementById('customer-name');
    const customerPhoneEl = document.getElementById('customer-phone');
    const customerAddressEl = document.getElementById('customer-address');
    
    if (orderIdEl) orderIdEl.textContent = order.id || order.orderId || '';
    
    const dateTime = fmtDate(order.date || order.createdAt).split(' ');
    if (orderDateEl) orderDateEl.textContent = dateTime[0] || '';
    if (orderTimeEl) orderTimeEl.textContent = dateTime[1] || '';
    
    if (customerNameEl) customerNameEl.textContent = order.customerName || order.customer?.name || '';
    if (customerPhoneEl) customerPhoneEl.textContent = order.customerPhone || order.customer?.phone || '';
    if (customerAddressEl) customerAddressEl.textContent = order.customerAddress || order.customer?.address || '';
    
    // ✅ XỬ LÝ STATUS DROPDOWN - CHỈ HIỂN THỊ DROPDOWN, ẨN BADGE
    const statusSelect = document.getElementById('order-status-dropdown');
    const statusTextEl = document.getElementById('order-status-text');
    
    if (statusSelect && order.status) {
      const statusMap = {
        'Chờ xác nhận': 'pending',
        'Đang xử lý': 'processing',
        'Hoàn tất': 'completed',
        'Đã hủy': 'cancelled',
        'Đã giao hàng': 'completed'
      };
      
      const statusValue = statusMap[order.status] || 'pending';
      statusSelect.value = statusValue;
      
      // ✅ ẨN BADGE VÌ ĐÃ CÓ DROPDOWN
      if (statusTextEl) {
        statusTextEl.style.display = 'none';
      }
    }
    
    const itemsContainer = document.getElementById('order-items');
    if (itemsContainer && order.items) {
      itemsContainer.innerHTML = order.items.map(item => {
        const product = PRODUCTS_ALL.find(p => p.id === item.productId);
        const imgUrl = product?.image || '/assets/images/placeholder.png';
        const name = product?.name || item.productName || 'Sản phẩm';
        const specs = item.specs || item.options || '';
        const price = fmtMoney(item.price || 0);
        
        return `
          <div class="order-item">
            <img src="${imgUrl}" alt="${name}" class="item-image">
            <div class="item-details">
              <div class="item-name">${name}</div>
              <div class="item-specs">${specs}</div>
            </div>
            <div class="item-price">${price}</div>
          </div>
        `;
      }).join('');
    }
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingFeeEl = document.getElementById('shipping-fee');
    const discountEl = document.getElementById('discount');
    const totalAmountEl = document.getElementById('total-amount');
    
    if (subtotalEl) subtotalEl.textContent = fmtMoney(order.subtotal || order.total || 0);
    if (shippingFeeEl) shippingFeeEl.textContent = fmtMoney(order.shippingFee || 0);
    if (discountEl) discountEl.textContent = fmtMoney(order.discount || 0);
    if (totalAmountEl) totalAmountEl.textContent = fmtMoney(order.total || order.totalAmount || 0);
    
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
    
    // ✅ HIỂN THỊ THÔNG BÁO KHI ĐÓNG
    showNotification('Đã đóng chi tiết đơn hàng', 'info');
  }

  // ✅ THÊM HÀM HIỂN THỊ THÔNG BÁO
  function showNotification(message, type = 'info') {
    // Xóa thông báo cũ nếu có
    const existingNotif = document.querySelector('.notification-toast');
    if (existingNotif) {
      existingNotif.remove();
    }

    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    
    // Icon theo loại thông báo
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.innerHTML = `
      <span class="notification-icon">${icons[type] || icons.info}</span>
      <span class="notification-message">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Hiển thị với animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // ============================================================
  // ✅ ADD PRODUCT MODAL
  // ============================================================
  
  function openAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    if (!modal) return;
    
    const form = document.getElementById('form-add-product');
    if (form) form.reset();
    
    const preview = document.getElementById('add-image-preview');
    if (preview) preview.style.display = 'none';
    
    const categorySelect = document.getElementById('add-product-category');
    if (categorySelect && PRODUCTS_ALL.length > 0) {
      const categories = Array.from(
        new Set(
          PRODUCTS_ALL
            .map(p => (p.category || p.type || '').trim())
            .filter(Boolean)
        )
      ).sort();
      
      categorySelect.innerHTML = '<option value="">Chọn loại sản phẩm</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });
    }
    
    modal.style.display = 'flex';
  }

  function closeAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    const form = document.getElementById('form-add-product');
    const previewBox = document.getElementById('add-image-preview-box');
    const previewImg = document.getElementById('add-preview-img');
    const placeholder = document.getElementById('upload-placeholder');
    const fileInput = document.getElementById('add-product-image');
    
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (previewBox) previewBox.classList.remove('has-image');
    if (fileInput) fileInput.value = '';
  }

  function initAddProductImageUpload() {
    const previewBox = document.getElementById('add-image-preview-box');
    const fileInput = document.getElementById('add-product-image');
    const previewImg = document.getElementById('add-preview-img');
    const placeholder = document.getElementById('upload-placeholder');
    
    if (!previewBox || !fileInput) return;
    
    previewBox.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (previewImg) {
          previewImg.src = ev.target.result;
          previewImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (previewBox) previewBox.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    });
  }

  function initAddProductForm() {
    const form = document.getElementById('form-add-product');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      try {
        // ✅ Helper function để parse giá tiền an toàn
        const parsePrice = (value) => {
          if (!value) return 0;
          const str = String(value);
          const cleaned = str.replace(/[^0-9]/g, '');
          return parseFloat(cleaned) || 0;
        };

        // Generate new ID
        const maxId = Math.max(...PRODUCTS_ALL.map(p => {
          const num = parseInt(p.id.replace(/\D/g, ''));
          return isNaN(num) ? 0 : num;
        }), 0);
        const newId = `NG${String(maxId + 1).padStart(2, '0')}`;
        
        // ✅ Lấy giá trị input an toàn
        const priceMInput = document.getElementById('add-price-m');
        const priceLInput = document.getElementById('add-price-l');
        const vipPriceMInput = document.getElementById('add-vip-price-m');
        const vipPriceLInput = document.getElementById('add-vip-price-l');

        const data = {
          id: newId,
          name: document.getElementById('add-product-name')?.value || '',
          category: document.getElementById('add-product-category')?.value || '',
          visible: document.getElementById('add-product-visible')?.checked || false,
          special: document.getElementById('add-product-special')?.checked || false,
          price: parsePrice(priceMInput?.value),
          priceL: parsePrice(priceLInput?.value),
          vipPriceM: parsePrice(vipPriceMInput?.value),
          vipPriceL: parsePrice(vipPriceLInput?.value),
          description: document.getElementById('add-product-desc')?.value || '',
          detail: document.getElementById('add-product-detail')?.value || '',
          image: document.getElementById('add-preview-img')?.src || '/assets/images/placeholder.png'
        };
        
        // ✅ Kiểm tra dữ liệu bắt buộc
        if (!data.name.trim()) {
          alert('❌ Vui lòng nhập tên sản phẩm');
          return;
        }

        if (!data.category) {
          alert('❌ Vui lòng chọn loại sản phẩm');
          return;
        }

        if (data.price === 0) {
          alert('❌ Vui lòng nhập giá size M');
          return;
        }
        
        console.log('✅ Thêm sản phẩm:', data);
        
        PRODUCTS_ALL.push(data);
        localStorage.setItem('products', JSON.stringify(PRODUCTS_ALL));
        
        applyFilters();
        updateProductsStats();
        
        showSuccess('THÊM SẢN PHẨM THÀNH CÔNG');
        
        setTimeout(() => {
          closeAddProductModal();
        }, 500);
        
      } catch (error) {
        console.error('❌ Lỗi thêm:', error);
        alert('❌ Có lỗi xảy ra: ' + error.message);
      }
    });
  }

  // ============================================================
  // ✅ EDIT PRODUCT MODAL
  // ============================================================
  
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function openEditProductModal(productId) {
    console.log('📝 Opening edit modal for product:', productId);
    
    const modal = document.getElementById('modal-edit-product');
    if (!modal) {
      console.error('❌ Modal edit-product not found');
      return;
    }
    
    const product = PRODUCTS_ALL.find(p => p.id === productId);
    if (!product) {
      console.error('❌ Product not found:', productId);
      alert('Không tìm thấy sản phẩm');
      return;
    }
    
    console.log('✅ Product found:', product);
    
    const categorySelect = document.getElementById('edit-product-category');
    if (categorySelect && PRODUCTS_ALL.length > 0) {
      const categories = Array.from(
        new Set(
          PRODUCTS_ALL
            .map(p => (p.category || p.type || '').trim())
            .filter(Boolean)
        )
      ).sort();
      
      categorySelect.innerHTML = '<option value="">Chọn loại sản phẩm</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === (product.category || product.type)) {
          option.selected = true;
        }
        categorySelect.appendChild(option);
      });
    }
    
    const nameInput = document.getElementById('edit-product-name');
    const visibleCheck = document.getElementById('edit-product-visible');
    const specialCheck = document.getElementById('edit-product-special');
    const priceMInput = document.getElementById('edit-price-m');
    const priceLInput = document.getElementById('edit-price-l');
    const vipPriceMInput = document.getElementById('edit-vip-price-m');
    const vipPriceLInput = document.getElementById('edit-vip-price-l');
    const descTextarea = document.getElementById('edit-product-desc');
    const detailTextarea = document.getElementById('edit-product-detail');
    
    if (nameInput) nameInput.value = product.name || '';
    if (visibleCheck) visibleCheck.checked = product.visible !== false;
    if (specialCheck) specialCheck.checked = product.special || false;
    if (priceMInput) priceMInput.value = product.price ? `${product.price.toLocaleString('vi-VN')} VNĐ` : '';
    if (priceLInput) priceLInput.value = product.priceL ? `${product.priceL.toLocaleString('vi-VN')} VNĐ` : '';
    if (vipPriceMInput) vipPriceMInput.value = product.vipPriceM ? `${product.vipPriceM.toLocaleString('vi-VN')} VNĐ` : '';
    if (vipPriceLInput) vipPriceLInput.value = product.vipPriceL ? `${product.vipPriceL.toLocaleString('vi-VN')} VNĐ` : '';
    if (descTextarea) descTextarea.value = product.description || '';
    if (detailTextarea) detailTextarea.value = product.detail || '';
    
    const previewImg = document.getElementById('edit-preview-img');
    const placeholder = document.getElementById('edit-upload-placeholder');
    const previewBox = document.getElementById('edit-image-preview-box');
    
    if (product.image) {
      if (previewImg) {
        previewImg.src = product.image;
        previewImg.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';
      if (previewBox) previewBox.classList.add('has-image');
    } else {
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      if (placeholder) placeholder.style.display = 'flex';
      if (previewBox) previewBox.classList.remove('has-image');
    }
    
    modal.dataset.productId = productId;
    modal.style.display = 'flex';
    console.log('✅ Modal opened successfully');
  }

  function closeEditProductModal() {
    const modal = document.getElementById('modal-edit-product');
    if (modal) {
      modal.style.display = 'none';
      delete modal.dataset.productId;
    }
  }

  function initEditProductImageUpload() {
    const previewBox = document.getElementById('edit-image-preview-box');
    const fileInput = document.getElementById('edit-product-image');
    const previewImg = document.getElementById('edit-preview-img');
    const placeholder = document.getElementById('edit-upload-placeholder');
    
    if (!previewBox || !fileInput) return;
    
    previewBox.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (previewImg) {
          previewImg.src = ev.target.result;
          previewImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (previewBox) previewBox.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    });
  }

  
  function initEditProductForm() {
    const form = document.getElementById('form-edit-product');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const modal = document.getElementById('modal-edit-product');
      const productId = modal?.dataset.productId;
      
      if (!productId) {
        alert('Không tìm thấy ID sản phẩm');
        return;
      }
      
      try {
        // ✅ Helper function để parse giá tiền an toàn
        const parsePrice = (value) => {
          if (!value) return 0;
          const str = String(value);
          const cleaned = str.replace(/[^0-9]/g, '');
          return parseFloat(cleaned) || 0;
        };

        // ✅ Lấy giá trị input an toàn
        const priceMInput = document.getElementById('edit-price-m');
        const priceLInput = document.getElementById('edit-price-l');
        const vipPriceMInput = document.getElementById('edit-vip-price-m');
        const vipPriceLInput = document.getElementById('edit-vip-price-l');

        const updatedProduct = {
          id: productId,
          name: document.getElementById('edit-product-name')?.value || '',
          category: document.getElementById('edit-product-category')?.value || '',
          visible: document.getElementById('edit-product-visible')?.checked || false,
          special: document.getElementById('edit-product-special')?.checked || false,
          price: parsePrice(priceMInput?.value),
          priceL: parsePrice(priceLInput?.value),
          vipPriceM: parsePrice(vipPriceMInput?.value),
          vipPriceL: parsePrice(vipPriceLInput?.value),
          description: document.getElementById('edit-product-desc')?.value || '',
          detail: document.getElementById('edit-product-detail')?.value || '',
          image: document.getElementById('edit-preview-img')?.src || ''
        };
        
        console.log('✅ Cập nhật sản phẩm:', updatedProduct);
        
        const index = PRODUCTS_ALL.findIndex(p => p.id === productId);
        if (index !== -1) {
          PRODUCTS_ALL[index] = { ...PRODUCTS_ALL[index], ...updatedProduct };
          console.log('✅ Đã cập nhật vị trí:', index);
        }
        
        localStorage.setItem('products', JSON.stringify(PRODUCTS_ALL));
        applyFilters();
        
        showSuccess('CHỈNH SỬA THÀNH CÔNG');
        
        setTimeout(() => {
          closeEditProductModal();
        }, 500);
        
      } catch (error) {
        console.error('❌ Lỗi cập nhật:', error);
        alert('❌ Có lỗi xảy ra: ' + error.message);
      }
    });
  }

  // ============================================================
  // ✅ DELETE PRODUCT
  // ============================================================
  
  async function handleDeleteProduct(productId) {
    // Simply open the confirm modal instead of direct deletion
    openDeleteConfirmModal(productId);
  }

  function openDeleteConfirmModal(productId) {
    const product = PRODUCTS_ALL.find(p => p.id === productId);
    if (!product) {
      alert('Không tìm thấy sản phẩm');
      return;
    }
    
    pendingDeleteProductId = productId;
    
    // Update modal message with product name
    const messageEl = document.querySelector('.confirm-message');
    if (messageEl) {
      messageEl.textContent = `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Sau khi xóa, bạn sẽ không thể khôi phục.`;
    }
    
    const modal = document.getElementById('modal-delete-confirm');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
    }
  }

  function closeDeleteConfirmModal() {
    const modal = document.getElementById('modal-delete-confirm');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
        pendingDeleteProductId = null;
      }, 300);
    }
  }

  async function confirmDeleteProduct() {
    if (!pendingDeleteProductId) return;
    
    try {
      const index = PRODUCTS_ALL.findIndex(p => p.id === pendingDeleteProductId);
      if (index !== -1) {
        PRODUCTS_ALL.splice(index, 1);
        console.log('✅ Đã xóa sản phẩm:', pendingDeleteProductId);
      }
      
      localStorage.setItem('products', JSON.stringify(PRODUCTS_ALL));
      applyFilters();
      updateProductsStats();
      
      // Close modals
      closeDeleteConfirmModal();
      closeEditProductModal();
      
      // Show success
      showSuccess('XÓA SẢN PHẨM THÀNH CÔNG');
      
    } catch (error) {
      console.error('❌ Lỗi xóa:', error);
      alert('❌ Có lỗi xảy ra: ' + error.message);
    }
  }

  function initDeleteConfirmModal() {
    // Confirm button
    const btnConfirm = document.getElementById('btn-confirm-delete');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', confirmDeleteProduct);
    }
    
    // Close buttons
    document.querySelectorAll('[data-close-delete]').forEach(btn => {
      btn.addEventListener('click', closeDeleteConfirmModal);
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-delete-confirm');
        if (modal && modal.classList.contains('show')) {
          closeDeleteConfirmModal();
        }
      }
    });
  }

  function initDeleteProductButton() {
    const btn = document.getElementById('btn-delete-product');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      const modal = document.getElementById('modal-edit-product');
      const productId = modal?.dataset.productId;
      
      if (!productId) return;
      
      // Open confirm modal
      openDeleteConfirmModal(productId);
    });
  }

  function bootstrapStats() {}
  function initSidebar() {}
  
  function initLogout() {
    const logoutBtn = $('#btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authAdmin');
        location.href = '/login-admin/';
      });
    }
  }

  function initAdminName() {
    const adminNameEl = $('#adminName');
    if (adminNameEl) {
      try {
        const authAdmin = JSON.parse(localStorage.getItem('authAdmin') || '{}');
        adminNameEl.textContent = authAdmin.name || 'Admin';
      } catch {
        adminNameEl.textContent = 'Admin';
      }
    }
  }

  // === INIT ===
  function init() {
    bootstrapStats();
    initSidebar();
    initLogout();
    initAdminName();
    initCharts();
    
    fetchOrders();
    fetchProducts();
    
    // ✅ Init success modal
    initSuccessModal();
    initDeleteConfirmModal();
    
    // Init modals
    initAddProductImageUpload();
    initAddProductForm();
    initEditProductImageUpload();
    initEditProductForm();
    initDeleteProductButton();
    
    const btnAdd = document.getElementById('btn-add-product');
    if (btnAdd) {
      btnAdd.addEventListener('click', openAddProductModal);
    }
  }


  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      const productId = editBtn.dataset.edit;
      console.log('🔍 Edit button clicked, productId:', productId);
      openEditProductModal(productId);
      return;
    }
    
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const productId = deleteBtn.dataset.delete;
      console.log('🗑️ Delete button clicked, productId:', productId);
      handleDeleteProduct(productId);
      return;
    }
    
    const editOrderBtn = e.target.closest('[data-edit-order]');
    if (editOrderBtn) {
      e.preventDefault();
      e.stopPropagation();
      const orderId = editOrderBtn.dataset.editOrder;
      console.log('Opening order modal for:', orderId);
      openOrderDetailModal(orderId);
      return;
    }
    
    if (e.target.closest('[data-close-modal]') || 
        (e.target.classList.contains('modal-overlay') && 
         e.target.closest('#modal-edit-product'))) {
      closeEditProductModal();
      return;
    }
    
    if (e.target.closest('[data-close-add-modal]') || 
        (e.target.classList.contains('modal-overlay') && 
         e.target.closest('#modal-add-product'))) {
      closeAddProductModal();
      return;
    }
    
    // ĐÓNG MODAL ĐƠN HÀNG
    if (e.target.closest('[data-close-order]')) {
      closeOrderDetailModal();
      return;
    }
    
    // Hoặc click vào overlay
    if (e.target.classList.contains('modal-overlay') && e.target.closest('#modal-order-detail')) {
      closeOrderDetailModal();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const editModal = document.getElementById('modal-edit-product');
      const addModal = document.getElementById('modal-add-product');
      const orderModal = document.getElementById('modal-order-detail');
      const successModal = document.getElementById('modal-success');
      const deleteModal = document.getElementById('modal-delete-confirm');
      
      if (editModal && editModal.style.display === 'flex') {
        closeEditProductModal();
      }
      if (addModal && addModal.style.display === 'flex') {
        closeAddProductModal();
      }
      if (orderModal && orderModal.style.display === 'flex') {
        orderModal.style.display = 'none';
      }
      if (successModal && successModal.classList.contains('show')) {
        hideSuccess();
      }
      if (deleteModal && deleteModal.classList.contains('show')) {
        closeDeleteConfirmModal();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const btnSaveOrder = document.getElementById('btn-save-order');
    if (btnSaveOrder) {
      btnSaveOrder.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const statusDropdown = document.getElementById('order-status-dropdown');
        const orderId = document.getElementById('order-id')?.textContent;
        
        if (!statusDropdown || !orderId) return;
        
        const newStatus = statusDropdown.value;
        const statusLabels = {
          'pending': 'Chờ xác nhận',
          'processing': 'Đang xử lý',
          'completed': 'Đã giao hàng',
          'cancelled': 'Đã hủy'
        };
        
        console.log('💾 Saving order:', orderId, 'Status:', statusLabels[newStatus]);
        
        // ✅ CẬP NHẬT DỮ LIỆU
        const order = ORDERS_ALL.find(o => (o.id || o.orderId) == orderId);
        if (order) {
          order.status = statusLabels[newStatus];
          localStorage.setItem('orders', JSON.stringify(ORDERS_ALL));
          renderOrdersTable(ORDERS_ALL);
          console.log('✅ Order updated successfully');
        }
        
        // ✅ ĐÓNG MODAL ĐƠN HÀNG
        const orderModal = document.getElementById('modal-order-detail');
        if (orderModal) {
          orderModal.classList.remove('show');
          setTimeout(() => {
            orderModal.style.display = 'none';
          }, 300);
        }
        
        // ✅ HIỂN THỊ MODAL SUCCESS SAU 400MS
        setTimeout(() => {
          showSuccess('Cập nhật đơn hàng thành công');
        }, 400);
      });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.reloadAdminTranslations = async function(lang) {
    try {
      const response = await fetch(`/lang/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load translations');
      
      const translations = await response.json();
      window.adminTranslations = translations;
      
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
          if (el.tagName === 'TITLE') {
            document.title = translations[key];
          } else if (el.tagName === 'INPUT' && el.type !== 'button') {
            el.placeholder = translations[key];
          } else if (el.tagName === 'OPTION') {
            el.textContent = translations[key];
          } else {
            el.textContent = translations[key];
          }
        }
      });
      
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
          el.placeholder = translations[key];
        }
      });
      
      document.documentElement.lang = lang;
      
      if (window.currentOrders && typeof renderOrdersTable === 'function') {
        renderOrdersTable(window.currentOrders);
        console.log('✅ Orders table re-rendered with lang:', lang);
      }
      
      console.log('✅ Admin translations reloaded:', lang);
    } catch (error) {
      console.error('Failed to reload admin translations:', error);
    }
  };
})();

