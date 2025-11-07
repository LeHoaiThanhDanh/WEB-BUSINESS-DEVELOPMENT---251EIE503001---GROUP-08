(() => {
  // Helper functions
  const $ = (selector) => document.querySelector(selector);
  const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0) + 'đ';
  const fmtDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Get order ID from URL
  function getOrderIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId');
  }

  // Load order data
  async function loadOrderData() {
    const orderId = getOrderIdFromURL();
    
    if (!orderId) {
      showError('Không tìm thấy thông tin đơn hàng');
      return null;
    }

    console.log('🔍 Loading order with ID:', orderId);

    try {
      // Try to get from localStorage first
      const ordersJSON = localStorage.getItem('orders');
      if (ordersJSON) {
        const orders = JSON.parse(ordersJSON);
        console.log('📦 All orders in localStorage:', orders);
        const order = orders.find(o => (o.id || o.orderId) === orderId);
        if (order) {
          console.log('✅ Found order:', order);
          console.log('💳 Payment method:', order.paymentMethod);
          return order;
        } else {
          console.warn('⚠️ Order not found with ID:', orderId);
        }
      }

      // If not in localStorage, try to fetch from JSON file
      const response = await fetch('/public/data/orders.json');
      if (!response.ok) throw new Error('Failed to load orders');
      
      const orders = await response.json();
      const order = orders.find(o => (o.id || o.orderId) === orderId);
      
      if (!order) {
        showError('Không tìm thấy đơn hàng');
        return null;
      }

      return order;
    } catch (error) {
      console.error('Error loading order:', error);
      showError('Không thể tải thông tin đơn hàng');
      return null;
    }
  }

  // Display order information
  function displayOrderInfo(order) {
    if (!order) return;

    // Order ID and Date
    const orderIdEl = $('#orderId');
    const orderDateEl = $('#orderDate');
    
    if (orderIdEl) orderIdEl.textContent = order.id || order.orderId || 'N/A';
    if (orderDateEl) orderDateEl.textContent = fmtDate(order.date || order.createdAt || new Date());

    // Customer info
    const customerNameEl = $('#customerName');
    const customerAddressEl = $('#customerAddress');
    const paymentMethodEl = $('#paymentMethod');
    const totalAmountEl = $('#totalAmount');
    const deliveryTimeEl = $('#deliveryTime');
    const orderNoteEl = $('#orderNote');

    if (customerNameEl) customerNameEl.textContent = order.customerName || 'N/A';
    if (customerAddressEl) customerAddressEl.textContent = order.customerAddress || 'N/A';
    if (paymentMethodEl) paymentMethodEl.textContent = order.paymentMethod || 'Tiền mặt';
    if (totalAmountEl) totalAmountEl.textContent = fmtMoney(order.total || 0);
    
    // Delivery time
    if (deliveryTimeEl) {
      const deliveryDate = order.deliveryDate || '';
      const deliveryTime = order.deliveryTime || '';
      if (deliveryDate && deliveryTime) {
        deliveryTimeEl.textContent = `${deliveryTime}, ${deliveryDate}`;
      } else {
        deliveryTimeEl.textContent = 'Chưa xác định';
      }
    }
    
    // Order note
    if (orderNoteEl) {
      orderNoteEl.textContent = order.note || 'Không có ghi chú';
    }

    // Display order items
    displayOrderItems(order.items || []);

    // Update timeline based on status (no animation on initial load)
    updateTimeline(order.status || 'pending', false);
  }

  // Display order items
  function displayOrderItems(items) {
    const itemsList = $('#orderItemsList');
    if (!itemsList) return;

    if (!items || items.length === 0) {
      itemsList.innerHTML = '<p style="text-align:center;color:#6b7280;">Không có sản phẩm</p>';
      return;
    }

    itemsList.innerHTML = items.map(item => {
      const quantity = item.qty || item.quantity || 1;
      const price = item.price || 0;
      const size = item.size || 'M';
      const name = item.name || 'Sản phẩm';
      const image = item.image || '/assets/images/products/default.jpg';
      
      return `
        <div class="order-item">
          <img 
            src="${image}" 
            alt="${name}" 
            class="item-image"
          />
          <div class="item-info">
            <div class="item-name">${name}</div>
            <div class="item-details">
              Size: ${size} | Số lượng: ${quantity}
            </div>
          </div>
          <div class="item-price">${fmtMoney(price * quantity)}</div>
        </div>
      `;
    }).join('');
  }

  // Update timeline based on order status with animated progress
  function updateTimeline(status, animate = false) {
    const timelinePending = $('#timeline-pending');
    const timelineProcessing = $('#timeline-processing');
    const timelineReady = $('#timeline-ready');
    const timelineShipping = $('#timeline-shipping');
    const timelineCompleted = $('#timeline-completed');

    // Current time
    const now = new Date();
    const currentTime = fmtDate(now);

    // Reset all statuses first
    setTimelineActive('timeline-pending', false);
    setTimelineCompleted('timeline-pending', false);
    setTimelineActive('timeline-processing', false);
    setTimelineCompleted('timeline-processing', false);
    setTimelineActive('timeline-ready', false);
    setTimelineCompleted('timeline-ready', false);
    setTimelineActive('timeline-shipping', false);
    setTimelineCompleted('timeline-shipping', false);
    setTimelineActive('timeline-completed', false);
    setTimelineCompleted('timeline-completed', false);

    // Helper to set completed with delay for animation (only if animate = true)
    const setCompletedWithDelay = (id, delay) => {
      if (animate) {
        setTimeout(() => {
          triggerNumberAnimation(id); // Trigger bounceIn animation for icon
          setTimelineCompleted(id, true);
        }, delay);
      } else {
        setTimelineCompleted(id, true);
      }
    };

    // Update based on status
    switch (status) {
      case 'pending':
        // Xác nhận đơn hàng (active)
        setTimelineActive('timeline-pending', true);
        setCompletedWithDelay('timeline-pending', 100);
        const timePendingEl = $('#time-pending');
        if (timePendingEl && timePendingEl.textContent === 'Đang xử lý...') {
          timePendingEl.textContent = currentTime;
        }
        break;

      case 'processing':
        // Xác nhận + Chuẩn bị (active)
        setTimelineActive('timeline-pending', true);
        setCompletedWithDelay('timeline-pending', 100);
        setTimelineActive('timeline-processing', true);
        setCompletedWithDelay('timeline-processing', 300);
        $('#time-processing').textContent = currentTime;
        break;

      case 'ready':
        // Xác nhận + Chuẩn bị + Chờ lấy hàng (active)
        setTimelineActive('timeline-pending', true);
        setCompletedWithDelay('timeline-pending', 100);
        setTimelineActive('timeline-processing', true);
        setCompletedWithDelay('timeline-processing', 300);
        setTimelineActive('timeline-ready', true);
        setCompletedWithDelay('timeline-ready', 500);
        $('#time-ready').textContent = currentTime;
        break;

      case 'shipping':
        // Xác nhận + Chuẩn bị + Chờ lấy + Đang giao (active)
        setTimelineActive('timeline-pending', true);
        setCompletedWithDelay('timeline-pending', 100);
        setTimelineActive('timeline-processing', true);
        setCompletedWithDelay('timeline-processing', 300);
        setTimelineActive('timeline-ready', true);
        setCompletedWithDelay('timeline-ready', 500);
        setTimelineActive('timeline-shipping', true);
        setCompletedWithDelay('timeline-shipping', 700);
        $('#time-shipping').textContent = currentTime;
        break;

      case 'completed':
      case 'delivered':
        // All completed
        setTimelineActive('timeline-pending', true);
        setCompletedWithDelay('timeline-pending', 100);
        setTimelineActive('timeline-processing', true);
        setCompletedWithDelay('timeline-processing', 300);
        setTimelineActive('timeline-ready', true);
        setCompletedWithDelay('timeline-ready', 500);
        setTimelineActive('timeline-shipping', true);
        setCompletedWithDelay('timeline-shipping', 700);
        setTimelineActive('timeline-completed', true);
        setCompletedWithDelay('timeline-completed', 900);
        $('#time-completed').textContent = currentTime;
        break;
    }
  }

  function setTimelineActive(id, active) {
    const el = $(`#${id}`);
    if (!el) return;
    
    if (active) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  }

  function setTimelineCompleted(id, completed) {
    const el = $(`#${id}`);
    if (!el) return;
    
    if (completed) {
      el.classList.add('completed');
    } else {
      el.classList.remove('completed');
    }
  }

  // Add animation class for number icon
  function triggerNumberAnimation(id) {
    const el = $(`#${id}`);
    if (!el) return;
    
    const numberIcon = el.querySelector('.timeline-number');
    if (numberIcon) {
      // Remove and re-add to restart animation
      numberIcon.style.animation = 'none';
      setTimeout(() => {
        numberIcon.style.animation = 'bounceIn 0.6s ease-out';
      }, 10);
    }
  }

  // Show error message
  function showError(message) {
    const heroTitle = $('.hero-title');
    const heroSubtitle = $('.hero-subtitle');
    
    if (heroTitle) {
      heroTitle.textContent = 'Có lỗi xảy ra';
      heroTitle.style.color = '#ef4444';
    }
    
    if (heroSubtitle) {
      heroSubtitle.textContent = message;
    }

    // Hide other sections
    const orderInfoSection = $('.order-info-section');
    const timelineSection = $('.timeline-section');
    const itemsSection = $('.order-items-section');
    
    if (orderInfoSection) orderInfoSection.style.display = 'none';
    if (timelineSection) timelineSection.style.display = 'none';
    if (itemsSection) itemsSection.style.display = 'none';
  }

  // Auto-refresh order status (simulate real-time updates)
  function startAutoRefresh() {
    // Refresh every 30 seconds (no animation for auto-refresh)
    setInterval(async () => {
      const order = await loadOrderData();
      if (order) {
        updateTimeline(order.status || 'pending', false);
      }
    }, 30000); // 30 seconds
  }

  // Demo: Next Status Button
  function setupDemoControls(order) {
    const btnNext = $('#btnNextStatus');
    
    if (!btnNext || !order) return;

    // Status progression (5 stages)
    const statusFlow = ['pending', 'processing', 'ready', 'shipping', 'completed'];
    const statusNames = {
      'pending': 'Xác nhận đơn hàng',
      'processing': 'Chuẩn bị đơn hàng',
      'ready': 'Chờ lấy hàng',
      'shipping': 'Đang giao hàng',
      'completed': 'Giao thành công'
    };

    let currentStatus = order.status || 'pending';
    
    // Update button
    function updateButton() {
      const currentIndex = statusFlow.indexOf(currentStatus);
      
      if (currentIndex >= statusFlow.length - 1) {
        btnNext.textContent = '✅';
        btnNext.disabled = true;
        btnNext.title = 'Đơn hàng đã hoàn thành';
      } else {
        const nextStatus = statusFlow[currentIndex + 1];
        btnNext.textContent = '⏭️';
        btnNext.title = `Chuyển sang: ${statusNames[nextStatus]}`;
      }
    }

    updateButton();

    btnNext.addEventListener('click', () => {
      const currentIndex = statusFlow.indexOf(currentStatus);
      if (currentIndex < statusFlow.length - 1) {
        // Move to next status
        currentStatus = statusFlow[currentIndex + 1];
        
        // Update order in localStorage
        const orderId = getOrderIdFromURL();
        try {
          const orders = JSON.parse(localStorage.getItem('orders') || '[]');
          const orderIndex = orders.findIndex(o => (o.id || o.orderId) === orderId);
          if (orderIndex !== -1) {
            orders[orderIndex].status = currentStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            console.log('✅ Status updated to:', currentStatus);
          }
        } catch (err) {
          console.error('Error updating status:', err);
        }

        // Update UI with animation
        updateTimeline(currentStatus, true);
        updateButton();

        // Show notification
        const notification = document.createElement('div');
        notification.className = 'status-notification';
        notification.textContent = `✅ ${statusNames[currentStatus]}`;
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
      }
    });
  }

  // Reset order status to pending
  function resetOrderStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) return;
    
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId || o.orderId === orderId);
    
    if (orderIndex !== -1) {
      // Reset status to pending
      orders[orderIndex].status = 'pending';
      localStorage.setItem('orders', JSON.stringify(orders));
      console.log('🔄 Order status reset to pending');
    }
  }

  // Initialize
  async function init() {
    console.log('🚀 Order Tracking Page Initialized');

    // Load and display order data
    const order = await loadOrderData();
    if (order) {
      displayOrderInfo(order);
      
      // Setup demo controls
      setupDemoControls(order);
      
      // Start auto-refresh for status updates
      startAutoRefresh();
    }

    // Clear cart after successful order (use correct key)
    localStorage.removeItem('cart_items');
    
    // Update cart counter in header
    const cartCounter = document.querySelector('.cart-count');
    if (cartCounter) {
      cartCounter.textContent = '0';
      cartCounter.style.display = 'none';
    }
    
    // Also update cart total in header
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
      cartTotal.textContent = '0đ';
    }
    
    // Setup "Tiếp tục mua sắm" button to reset order status
    const continueShoppingBtn = document.querySelector('.btn-secondary');
    if (continueShoppingBtn) {
      continueShoppingBtn.addEventListener('click', function(e) {
        resetOrderStatus();
      });
    }
    
    // Setup "Viết đánh giá" button
    const writeReviewBtn = document.getElementById('btnWriteReview');
    const reviewModal = document.getElementById('reviewModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelReviewBtn = document.getElementById('cancelReview');
    const reviewForm = document.getElementById('reviewForm');
    
    if (writeReviewBtn && reviewModal) {
      // Open modal
      writeReviewBtn.addEventListener('click', function(e) {
        e.preventDefault();
        reviewModal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
      
      // Close modal functions
      const closeModal = () => {
        reviewModal.classList.remove('show');
        document.body.style.overflow = '';
        reviewForm.reset();
        updateRatingText();
      };
      
      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
      }
      
      if (cancelReviewBtn) {
        cancelReviewBtn.addEventListener('click', closeModal);
      }
      
      // Close modal when clicking outside
      reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
          closeModal();
        }
      });
      
      // Rating stars functionality
      const ratingInputs = document.querySelectorAll('.star-rating input');
      const ratingText = document.getElementById('ratingText');
      
      const updateRatingText = () => {
        const checkedRating = document.querySelector('.star-rating input:checked');
        if (checkedRating) {
          const value = checkedRating.value;
          const texts = {
            '5': 'Tuyệt vời! ⭐⭐⭐⭐⭐',
            '4': 'Rất tốt! ⭐⭐⭐⭐',
            '3': 'Tốt! ⭐⭐⭐',
            '2': 'Trung bình ⭐⭐',
            '1': 'Kém ⭐'
          };
          ratingText.textContent = texts[value] || 'Chưa chọn';
          ratingText.style.color = '#0088ff';
        } else {
          ratingText.textContent = 'Chưa chọn';
          ratingText.style.color = '#6b7280';
        }
      };
      
      ratingInputs.forEach(input => {
        input.addEventListener('change', updateRatingText);
      });
      
      // Handle form submission
      reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const rating = document.querySelector('.star-rating input:checked')?.value;
        const reviewText = document.getElementById('reviewText').value;
        const reviewerName = document.getElementById('reviewerName').value || 'Khách hàng';
        
        // Create review object
        const review = {
          orderId: order?.id || order?.orderId,
          rating: parseInt(rating),
          comment: reviewText,
          reviewerName: reviewerName,
          date: new Date().toISOString(),
          productIds: order?.items?.map(item => item.id) || []
        };
        
        // Save to localStorage
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        console.log('✅ Review submitted:', review);
        
        // Show success message
        alert('Cảm ơn bạn đã đánh giá! Đánh giá của bạn rất quan trọng với chúng tôi.');
        
        // Close modal
        closeModal();
      });
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
