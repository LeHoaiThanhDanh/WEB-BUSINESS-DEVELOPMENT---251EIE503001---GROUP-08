(function() {
  // Lấy blog ID từ URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');

  if (!blogId) {
    document.getElementById('blog-heading').textContent = 'Blog không tồn tại';
    document.getElementById('blog-body').innerHTML = '<p>Vui lòng chọn một blog để xem chi tiết.</p>';
    return;
  }

  const blogData = BLOG_DATA[blogId];

  if (!blogData) {
    document.getElementById('blog-heading').textContent = 'Blog không tồn tại';
    document.getElementById('blog-body').innerHTML = '<p>Xin lỗi, blog này không tồn tại hoặc đã bị xóa.</p>';
    return;
  }

  // Cập nhật tiêu đề trang
  document.getElementById('blog-title').textContent = blogData.title;
  document.title = blogData.title;

  // Cập nhật ngày đăng
  const dateEl = document.getElementById('blog-date-text');
  if (dateEl && blogData.date) {
    dateEl.textContent = blogData.date;
  }

  // Cập nhật heading với màu động
  const headingEl = document.getElementById('blog-heading');
  headingEl.textContent = blogData.heading;
  headingEl.style.color = blogData.headingColor || '#305C33';

  // Cập nhật subheading
  const subheadingEl = document.getElementById('blog-subheading');
  if (blogData.subheading) {
    subheadingEl.textContent = blogData.subheading;
    subheadingEl.style.color = blogData.headingColor || '#666';
    subheadingEl.style.display = 'block';
  } else {
    subheadingEl.style.display = 'none';
  }

  // Xử lý layout ảnh
  const singleLayout = document.getElementById('single-image-layout');
  const galleryLayout = document.getElementById('gallery-image-layout');

  if (blogData.layoutType === 'gallery' && blogData.images && blogData.images.length >= 2) {
    // Hiển thị layout gallery (blog 2)
    singleLayout.style.display = 'none';
    galleryLayout.style.display = 'flex';
    
    document.getElementById('gallery-left-img').src = blogData.images[0];
    document.getElementById('gallery-right-img-1').src = blogData.images[1];
    document.getElementById('gallery-right-img-2').src = blogData.images[2] || blogData.images[1];
  } else {
    // Hiển thị layout đơn (blog 1, 3, 4...)
    singleLayout.style.display = 'block';
    galleryLayout.style.display = 'none';
    
    const mainImageEl = document.getElementById('blog-main-image');
    mainImageEl.src = blogData.image || (blogData.images ? blogData.images[0] : '');
    mainImageEl.alt = blogData.title;
  }

  // Cập nhật nội dung
  document.getElementById('blog-body').innerHTML = blogData.content;

  // Render related blogs
  const relatedContainer = document.getElementById('related-container');
  const relatedBlogs = RELATED_BLOGS.filter(blog => blog.id !== blogId).slice(0, 6);

  // ✅ Lấy current URL pathname
  const currentPath = window.location.pathname;

  relatedContainer.innerHTML = relatedBlogs.map(blog => `
    <div class="related-card">
      <a href="${currentPath}?id=${blog.id}">
        <img src="${blog.image}" alt="${blog.title}" class="related-img">
      </a>
      <p style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color:#0088ff;
        font-size: 14px;
        margin: 0;
        padding-top:10px;
      ">
        <img src="${window.ICON_CALENDAR || '/static/assets/icons/Vector (1).png'}" alt="icon" width="12px" height="12px" style="flex-shrink: 0;"/>
        ${blog.date}
      </p>
      <h3><a href="${currentPath}?id=${blog.id}" style="text-decoration:none;color:inherit;">${blog.title}</a></h3>
      <p>${blog.description}</p>
      <a href="${currentPath}?id=${blog.id}" class="related-link">Xem chi tiết</a>
    </div>
  `).join('');

  // Page init callback
  if (window.NGPageInit) {
    window.NGPageInit();
  }
})();