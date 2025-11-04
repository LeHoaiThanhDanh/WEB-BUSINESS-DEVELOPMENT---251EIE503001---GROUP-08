(() => {
  const $ = (s) => document.querySelector(s);
  
  const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  let POSTS_ALL = [];
  let currentDeleteId = null;
  let uploadedImages = []; // ✅ LƯU HÌNH ẢNH ĐÃ TẢI LÊN

  // ✅ LOAD DỮ LIỆU TỪ FILE JSON VỚI LOGGING
  async function loadDefaultPosts() {
    try {
      console.log('🔄 Đang tải blogs.json...');
      const response = await fetch('/data/blogs.json');
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`Failed to load blogs.json: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Đã tải thành công:', data.length, 'bài viết');
      
      return data;
    } catch (error) {
      console.error('❌ Lỗi khi tải blogs.json:', error);
      return [];
    }
  }

  // ✅ KIỂM TRA DỮ LIỆU TRONG fetchPosts
  async function fetchPosts() {
    try {
      const stored = localStorage.getItem('blog_posts');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 Dữ liệu từ localStorage:', parsed.length, 'bài viết');
        
        if (parsed.length < 8) {
          console.warn('⚠️ Dữ liệu cũ không đủ, tải lại từ blogs.json...');
          localStorage.removeItem('blog_posts');
          POSTS_ALL = await loadDefaultPosts();
          localStorage.setItem('blog_posts', JSON.stringify(POSTS_ALL));
        } else {
          const hasFullContent = parsed.every(p => p.content && p.content.length > 50);
          if (!hasFullContent) {
            console.warn('⚠️ Dữ liệu thiếu content, tải lại từ blogs.json...');
            localStorage.removeItem('blog_posts');
            POSTS_ALL = await loadDefaultPosts();
            localStorage.setItem('blog_posts', JSON.stringify(POSTS_ALL));
          } else {
            POSTS_ALL = parsed;
            console.log('✅ Sử dụng dữ liệu từ localStorage');
          }
        }
      } else {
        console.log('📥 Chưa có dữ liệu, tải từ blogs.json...');
        POSTS_ALL = await loadDefaultPosts();
        localStorage.setItem('blog_posts', JSON.stringify(POSTS_ALL));
      }
      
      console.log('📊 Tổng số bài viết:', POSTS_ALL.length);
      console.log('📝 Bài viết đầu tiên:', POSTS_ALL[0]);
      
      renderPosts();
      updateStats();
    } catch (err) {
      console.error('❌ Lỗi fetchPosts:', err);
      POSTS_ALL = [];
    }
  }

  function renderPosts() {
    const body = $('#postsBody');
    if (!body) return;
    
    body.innerHTML = '';
    
    if (POSTS_ALL.length === 0) {
      body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Không có bài viết</td></tr>';
      return;
    }
    
    console.log('🎨 Rendering', POSTS_ALL.length, 'bài viết...');
    
    POSTS_ALL.forEach(p => {
      const tr = document.createElement('tr');
      const imageUrl = p.image || '/assets/images/placeholder.png';
      const statusClass = p.status === 'published' ? 'badge-success' : 'badge-warning';
      const statusText = p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp';
      
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.title}</td>
        <td>${fmtDate(p.date)}</td>
        <td><img src="${imageUrl}" alt="${p.title}" class="product-thumb" onerror="this.onerror=null; this.style.display='none';"></td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td>
          <span class="btns">
            <button class="btn" data-edit="${p.id}"><img src="/assets/icons/edit2.png" alt="Edit"></button>
            <button class="btn" data-delete="${p.id}"><img src="/assets/icons/delete2.png" alt="Delete"></button>
          </span>
        </td>`;
      body.appendChild(tr);
    });
    
    console.log('✅ Render hoàn tất');
  }

  function updateStats() {
    const total = POSTS_ALL.length;
    const published = POSTS_ALL.filter(p => p.status === 'published').length;
    const draft = POSTS_ALL.filter(p => p.status === 'draft').length;
    
    const sTotalPosts = $('#sTotalPosts');
    const sPublished = $('#sPublished');
    const sDraft = $('#sDraft');
    
    if (sTotalPosts) sTotalPosts.textContent = total;
    if (sPublished) sPublished.textContent = published;
    if (sDraft) sDraft.textContent = draft;
    
    console.log('📈 Thống kê:', { total, published, draft });
  }

  function openAddPostModal() {
    const modal = $('#modal-add-post');
    if (!modal) return;

    const titleInput = $('#add-post-title');
    const excerptInput = $('#add-post-excerpt');
    const contentInput = $('#add-post-content');

    if (titleInput) titleInput.value = '';
    if (excerptInput) excerptInput.value = '';
    if (contentInput) contentInput.value = '';
    
    // ✅ RESET UPLOADED IMAGES
    uploadedImages = [];

    const gallery = $('#add-image-gallery');
    if (gallery) {
      gallery.innerHTML = `
        <div class="image-upload-box" id="add-image-upload-box">
          <div class="upload-icon-circle">
            <img src="/assets/icons/upload.png" alt="Upload" class="upload-icon-small">
          </div>
          <span class="upload-text-small">Tải ảnh lên *</span>
        </div>
      `;
      
      const uploadBox = gallery.querySelector('#add-image-upload-box');
      if (uploadBox) {
        uploadBox.addEventListener('click', () => {
          const input = $('#add-post-image');
          if (input) input.click();
        });
      }
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  function closeAddPostModal() {
    const modal = $('#modal-add-post');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  }

  function openEditPostModal(postId) {
    const modal = $('#modal-edit-post');
    if (!modal) return;
    
    const post = POSTS_ALL.find(p => p.id === postId);
    if (!post) {
      alert('Không tìm thấy bài viết');
      return;
    }

    const titleInput = $('#edit-post-title');
    const excerptInput = $('#edit-post-excerpt');
    const contentInput = $('#edit-post-content');

    if (titleInput) titleInput.value = post.title || '';
    if (excerptInput) excerptInput.value = post.excerpt || '';
    if (contentInput) contentInput.value = post.content?.replace(/<\/?p>/g, '').replace(/<br>/g, '\n') || '';

    const gallery = $('#edit-image-gallery');
    if (gallery) {
      const images = post.images || [post.image];
      gallery.innerHTML = '';
      
      images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.innerHTML = `
          <img src="${img}" alt="Poster ${index + 1}">
          <span class="image-label">Poster ${index + 1}.png</span>
        `;
        gallery.appendChild(item);
      });

      const uploadBox = document.createElement('div');
      uploadBox.className = 'image-upload-box';
      uploadBox.innerHTML = `
        <div class="upload-icon-circle">
          <img src="/assets/icons/upload.png" alt="Upload" class="upload-icon-small">
        </div>
        <span class="upload-text-small">Tải ảnh lên</span>
      `;
      uploadBox.addEventListener('click', () => {
        const input = $('#edit-post-image');
        if (input) input.click();
      });
      gallery.appendChild(uploadBox);
    }

    modal.dataset.postId = postId;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  function closeEditPostModal() {
    const modal = $('#modal-edit-post');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
        delete modal.dataset.postId;
      }, 300);
    }
  }

  function openDeleteConfirmModal(postId) {
    const modal = $('#modal-delete-confirm');
    if (!modal) return;

    const post = POSTS_ALL.find(p => p.id === postId);
    if (!post) {
      alert('Không tìm thấy bài viết');
      return;
    }

    currentDeleteId = postId;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
  }

  function closeDeleteConfirmModal() {
    const modal = $('#modal-delete-confirm');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
        currentDeleteId = null;
      }, 300);
    }
  }

  function confirmDeletePost() {
    if (!currentDeleteId) return;

    const index = POSTS_ALL.findIndex(p => p.id === currentDeleteId);
    if (index !== -1) {
      POSTS_ALL.splice(index, 1);
      localStorage.setItem('blog_posts', JSON.stringify(POSTS_ALL));
      renderPosts();
      updateStats();
      closeDeleteConfirmModal();
      showSuccess('XÓA BÀI VIẾT THÀNH CÔNG');
    }
  }

  // ✅ HIỂN THỊ THÔNG BÁO LỖI
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-weight: 500;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  function initAddPostForm() {
    const form = $('#form-add-post');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = $('#add-post-title');
      const excerptInput = $('#add-post-excerpt');
      const contentInput = $('#add-post-content');

      // ✅ KIỂM TRA BẮT BUỘC PHẢI CÓ HÌNH ẢNH
      if (uploadedImages.length === 0) {
        showError('❌ Vui lòng tải lên ít nhất 1 hình ảnh!');
        return;
      }

      // ✅ KIỂM TRA CÁC TRƯỜNG BẮT BUỘC KHÁC
      if (!titleInput?.value.trim()) {
        showError('❌ Vui lòng nhập tiêu đề!');
        return;
      }

      if (!excerptInput?.value.trim()) {
        showError('❌ Vui lòng nhập mô tả ngắn!');
        return;
      }

      if (!contentInput?.value.trim()) {
        showError('❌ Vui lòng nhập nội dung!');
        return;
      }

      const newPost = {
        id: `blog_${Date.now()}`,
        title: titleInput.value.trim(),
        excerpt: excerptInput.value.trim(),
        content: contentInput.value.trim(),
        date: new Date().toISOString().split('T')[0],
        image: uploadedImages[0], // 
        images: uploadedImages, // 
        status: 'published',
        views: 0
      };

      POSTS_ALL.unshift(newPost);
      localStorage.setItem('blog_posts', JSON.stringify(POSTS_ALL));
      renderPosts();
      updateStats();
      closeAddPostModal();
      showSuccess('THÊM BÀI VIẾT THÀNH CÔNG');
      
      // ✅ RESET UPLOADED IMAGES
      uploadedImages = [];
    });

    // ✅ XỬ LÝ TẢI HÌNH ẢNH LÊN
    const imageInput = $('#add-post-image');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const gallery = $('#add-image-gallery');
        if (!gallery) return;

        // ✅ XÓA ẢNH CŨ
        const existingImages = gallery.querySelectorAll('.image-item');
        existingImages.forEach(item => item.remove());
        uploadedImages = [];

        Array.from(files).forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageData = event.target.result;
            uploadedImages.push(imageData); 

            const item = document.createElement('div');
            item.className = 'image-item';
            item.innerHTML = `
              <img src="${imageData}" alt="Poster ${index + 1}">
              <span class="image-label">${file.name}</span>
            `;
            
            const uploadBox = gallery.querySelector('#add-image-upload-box');
            gallery.insertBefore(item, uploadBox);
          };
          reader.readAsDataURL(file);
        });
      });
    }
  }

  function initEditPostForm() {
    const form = $('#form-edit-post');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const modal = $('#modal-edit-post');
      const postId = modal?.dataset.postId;
      if (!postId) return;

      const titleInput = $('#edit-post-title');
      const excerptInput = $('#edit-post-excerpt');
      const contentInput = $('#edit-post-content');

      const updatedPost = {
        title: titleInput?.value || '',
        excerpt: excerptInput?.value || '',
        content: contentInput?.value || ''
      };

      const index = POSTS_ALL.findIndex(p => p.id === postId);
      if (index !== -1) {
        POSTS_ALL[index] = { ...POSTS_ALL[index], ...updatedPost };
        localStorage.setItem('blog_posts', JSON.stringify(POSTS_ALL));
        renderPosts();
        updateStats();
        closeEditPostModal();
        showSuccess('CẬP NHẬT THÀNH CÔNG');
      }
    });
  }

  function showSuccess(message = 'THÀNH CÔNG') {
    const modal = $('#modal-success');
    const messageEl = $('#success-message');
    if (!modal) return;
    if (messageEl) messageEl.textContent = message;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    setTimeout(() => hideSuccess(), 2000);
  }

  function hideSuccess() {
    const modal = $('#modal-success');
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-add-post') || (e.target.closest('.btn-add') && e.target.closest('.card-actions-row'))) {
      e.preventDefault();
      openAddPostModal();
      return;
    }

    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      e.preventDefault();
      openEditPostModal(editBtn.dataset.edit);
      return;
    }

    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      e.preventDefault();
      openDeleteConfirmModal(deleteBtn.dataset.delete);
      return;
    }

    if (e.target.closest('[data-close-modal]') || (e.target.classList.contains('modal-overlay') && e.target.closest('#modal-edit-post'))) {
      closeEditPostModal();
      return;
    }

    if (e.target.closest('[data-close-add-modal]') || (e.target.classList.contains('modal-overlay') && e.target.closest('#modal-add-post'))) {
      closeAddPostModal();
      return;
    }

    if (e.target.closest('[data-close-delete]') || (e.target.classList.contains('modal-overlay') && e.target.closest('#modal-delete-confirm'))) {
      closeDeleteConfirmModal();
      return;
    }

    if (e.target.closest('#btn-confirm-delete')) {
      e.preventDefault();
      confirmDeletePost();
      return;
    }

    if (e.target.closest('#btn-close-success')) {
      hideSuccess();
      return;
    }
  });

  async function init() {
    const pager = $('#postsPager');
    if (pager) pager.innerHTML = ''; 
    
    await fetchPosts();
    initAddPostForm();
    initEditPostForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();