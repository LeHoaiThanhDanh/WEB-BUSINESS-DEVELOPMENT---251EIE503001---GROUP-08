/**
 * Admin Header Loader
 * Tải và khởi tạo header cho tất cả các trang admin
 */
(function() {
  'use strict';

  /**
   * Load header admin và setup các chức năng
   * @param {string} headerContainerId - ID của container chứa header (mặc định: 'app-header' hoặc 'admin-header')
   */
  async function loadAdminHeader(headerContainerId) {
    try {
      // Tìm container
      const containerId = headerContainerId || 'app-header';
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error(`Header container #${containerId} not found`);
        return;
      }

      // Fetch header HTML
      const response = await fetch('/src/Components/page-header/header-admin.html', { 
        cache: 'no-cache' 
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load header: ${response.status}`);
      }

      const html = await response.text();
      container.innerHTML = html;

      // Chờ DOM render xong
      await new Promise(resolve => setTimeout(resolve, 150));

      // Setup user menu dropdown
      setupUserMenu();

      // Setup navigation
      setupNavigation();

      console.log('✅ Admin header loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load admin header:', err);
    }
  }

  /**
   * Setup dropdown menu cho tài khoản user
   */
  function setupUserMenu() {
    const userBtn = document.getElementById('user-btn');
    const userMenu = document.getElementById('user-menu');
    const userBox = document.getElementById('user-box');

    if (!userBtn || !userMenu) {
      console.warn('User menu elements not found');
      return;
    }

    // Đóng menu ban đầu
    userMenu.setAttribute('hidden', '');
    userBtn.setAttribute('aria-expanded', 'false');

    // Toggle menu khi click button
    userBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = userBtn.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closeUserMenu();
      } else {
        openUserMenu();
      }
    });

    // Đóng menu khi click bên ngoài
    document.addEventListener('click', function(e) {
      if (userBox && !userBox.contains(e.target)) {
        closeUserMenu();
      }
    });

    // Đóng menu khi nhấn ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeUserMenu();
      }
    });

    // Setup logout button
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }

    function openUserMenu() {
      userMenu.removeAttribute('hidden');
      userBtn.setAttribute('aria-expanded', 'true');
      userBox?.classList.add('open');
    }

    function closeUserMenu() {
      userMenu.setAttribute('hidden', '');
      userBtn.setAttribute('aria-expanded', 'false');
      userBox?.classList.remove('open');
    }

    console.log('✅ User menu initialized');
  }

  /**
   * Xử lý đăng xuất
   */
  function handleLogout(e) {
    e.preventDefault();
    
    const confirmMsg = 'Bạn có chắc muốn đăng xuất?';
    if (confirm(confirmMsg)) {
      // Xóa tất cả dữ liệu auth
      localStorage.removeItem('admin_token');
      localStorage.removeItem('authAdmin');
      localStorage.removeItem('authUser');
      localStorage.removeItem('ngogia_user');
      
      // Redirect về trang login
      window.location.href = '/login-admin/';
    }
  }

  /**
   * Setup navigation và active state
   */
  function setupNavigation() {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const currentHash = window.location.hash;
    const navItems = document.querySelectorAll('.nav-bar .nav-item');

    // Remove all active classes first
    navItems.forEach(item => item.classList.remove('active'));

    // Setup click handlers for navigation items
    navItems.forEach(item => {
      const action = item.getAttribute('data-action');
      const target = item.getAttribute('data-target');
      const href = item.getAttribute('href');

      // Add click handler
      item.addEventListener('click', function(e) {
        const isAdminPage = currentPath.includes('admin-dashboard') || currentPath.includes('Admin.html');

        // Case 1: Navigate to another page
        if (action === 'navigate') {
          return; // Let default navigation happen
        }

        // Case 2: Scroll to section
        if (action === 'scroll') {
          e.preventDefault();

          // If not on admin page, navigate with hash
          if (!isAdminPage) {
            window.location.href = `/admin-dashboard#${target}`;
            return;
          }

          // If on admin page, scroll to section
          const targetSection = document.getElementById(target);
          if (targetSection) {
            const headerHeight = 100;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
          }
        }
      });
    });

    // Determine which item should be active on load
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (!href) return;

      const [path, hash] = href.split('#');
      const cleanPath = path.replace(/\/$/, '');

      // Case 1: Exact path match (for admin-order, admin-account, admin-blog)
      if (currentPath === cleanPath && !hash) {
        item.classList.add('active');
        return;
      }

      // Case 2: Dashboard with hash (Sản phẩm section)
      if (hash && currentPath.includes('admin-dashboard')) {
        if (currentHash === `#${hash}`) {
          item.classList.add('active');
          return;
        }
      }

      // Case 3: Dashboard overview (no hash)
      if (cleanPath.includes('admin-dashboard') && !hash && !currentHash && currentPath.includes('admin-dashboard')) {
        item.classList.add('active');
        return;
      }
    });

    // If on dashboard with no active item, set "Tổng quan" as active
    const hasActive = Array.from(navItems).some(item => item.classList.contains('active'));
    if (!hasActive && currentPath.includes('admin-dashboard')) {
      const overviewItem = Array.from(navItems).find(item => {
        const href = item.getAttribute('href');
        return href && href.includes('admin-dashboard') && !href.includes('#');
      });
      if (overviewItem) {
        overviewItem.classList.add('active');
      }
    }

    console.log('✅ Navigation initialized - Active:', document.querySelector('.nav-bar .nav-item.active')?.textContent.trim());
  }

  /**
   * Expose API ra global scope
   */
  window.AdminHeaderLoader = {
    load: loadAdminHeader,
    setupUserMenu: setupUserMenu,
    setupNavigation: setupNavigation
  };

  /**
   * Auto-load nếu trang có #app-header hoặc #admin-header
   */
  function autoInit() {
    const appHeader = document.getElementById('app-header');
    const adminHeader = document.getElementById('admin-header');
    
    if (appHeader) {
      loadAdminHeader('app-header');
    } else if (adminHeader) {
      loadAdminHeader('admin-header');
    }
  }

  /**
   * Setup hash change listener để scroll khi URL thay đổi
   */
  function setupHashChangeListener() {
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('admin-dashboard') || currentPath.includes('Admin.html');
    
    if (!isAdminPage) return;

    // Handle hash change
    window.addEventListener('hashchange', function() {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const targetSection = document.getElementById(hash);
      if (targetSection) {
        const headerHeight = 100;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update active state
        const navItems = document.querySelectorAll('.nav-bar .nav-item');
        navItems.forEach(item => {
          const target = item.getAttribute('data-target');
          if (target === hash) {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
          }
        });
      }
    });

    // Trigger scroll on page load if hash exists
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      setTimeout(() => {
        const targetSection = document.getElementById(initialHash);
        if (targetSection) {
          const headerHeight = 100;
          const targetPosition = targetSection.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }

  // Auto init khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      autoInit();
      setupHashChangeListener();
    });
  } else {
    autoInit();
    setupHashChangeListener();
  }

})();
