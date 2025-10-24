document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('supportForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã gửi phản hồi!');
  });
});
