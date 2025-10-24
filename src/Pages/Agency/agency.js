// Khi click vào card → đổi src của iframe sang URL embed tương ứng
document.querySelectorAll('.branch-card').forEach(card => {
  card.addEventListener('click', () => {
    // active style
    document.querySelectorAll('.branch-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');

    const url = card.dataset.embed;
    const iframe = document.getElementById('branchMap');
    if (iframe && url) {
      iframe.src = url;
      // Lưu url mở tab mới (chuyển từ /embed? → /)
      iframe.dataset.open = url.replace('/embed?', '/');
    }
  });
});

// Click vào bản đồ → mở Google Maps ngoài tab mới
document.getElementById('branchMap')?.addEventListener('click', (e) => {
  e.preventDefault();
  const iframe = e.currentTarget;
  const openUrl = iframe.dataset.open || iframe.src.replace('/embed?', '/');
  // Phòng trường hợp URL không chuyển được, vẫn fallback dùng src
  window.open(openUrl || iframe.src, '_blank', 'noopener');
});
