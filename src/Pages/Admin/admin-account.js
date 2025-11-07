// Get CSRF token
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

const csrftoken = getCookie('csrftoken');

let currentEditField = '';
let currentEditLabel = '';

function previewAvatar(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('avatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function editField(fieldId, labelKey) {
  currentEditField = fieldId;
  currentEditLabel = labelKey;
  
  const modal = document.getElementById('editModal');
  const fieldInput = document.getElementById('fieldInput');
  
  fieldInput.value = document.getElementById(fieldId).textContent;
  modal.classList.add('show');
}

function saveField() {
  const newValue = document.getElementById('fieldInput').value.trim();
  
  if (!newValue) {
    alert(getI18nText('admin.account.modal.pleaseEnterValue') || 'Vui lòng nhập giá trị');
    return;
  }
  
  document.getElementById(currentEditField).textContent = newValue;
  closeModal();
  alert(getI18nText('admin.account.modal.updateSuccess') || 'Cập nhật thành công!');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('show');
}

function changePassword() {
  document.getElementById('passwordModal').classList.add('show');
}

function savePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert(getI18nText('admin.account.modal.fillAllFields') || 'Vui lòng điền đầy đủ thông tin');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert(getI18nText('admin.account.modal.passwordMismatch') || 'Mật khẩu mới không khớp');
    return;
  }
  
  if (newPassword.length < 8) {
    alert(getI18nText('admin.account.modal.passwordMinLength') || 'Mật khẩu phải có ít nhất 8 ký tự');
    return;
  }
  
  closePasswordModal();
  alert(getI18nText('admin.account.modal.passwordChangeSuccess') || 'Đổi mật khẩu thành công!');
  
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

function closePasswordModal() {
  document.getElementById('passwordModal').classList.remove('show');
}

function toggleSMS(checkbox) {
  const status = checkbox.checked 
    ? (getI18nText('admin.account.enabled') || 'Bật') 
    : (getI18nText('admin.account.disabled') || 'Tắt');
  console.log('SMS notification:', status);
}

function editSMS() {
  alert(getI18nText('admin.account.featureInDevelopment') || 'Chức năng đang phát triển');
}

// Change language - Open modal
function changeLanguage() {
  document.getElementById('languageModal').classList.add('show');
}

// Close language modal
function closeLanguageModal() {
  document.getElementById('languageModal').classList.remove('show');
}

// ✅ Update active button
function updateActiveButton(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    }
  });
}

// ✅ Update language display
function updateLanguageDisplay(lang) {
  const languageDisplay = document.getElementById('language');
  if (languageDisplay) {
    if (lang === 'vi') {
      languageDisplay.textContent = 'Tiếng Việt';
    } else if (lang === 'en') {
      languageDisplay.textContent = 'English';
    }
  }
}

// Select language
async function selectLanguage(lang) {
  try {
    // Save to localStorage
    localStorage.setItem('app.lang', lang);
    
    // ✅ Broadcast event để các tab khác biết
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'app.lang',
      newValue: lang,
      oldValue: localStorage.getItem('app.lang'),
      storageArea: localStorage
    }));
    
    // Load translations
    await loadTranslations(lang);
    
    // Update display
    updateLanguageDisplay(lang);
    updateActiveButton(lang);
    closeLanguageModal();
    
    console.log('✅ Language changed to:', lang);
  } catch (error) {
    console.error('Error changing language:', error);
  }
}

// ✅ Load translations với broadcast
async function loadTranslations(lang) {
  try {
    const response = await fetch(`/public/lang/${lang}.json`);
    if (!response.ok) throw new Error('Failed to load translations');
    
    const translations = await response.json();
    
    // Apply translations to all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        if (el.tagName === 'TITLE') {
          document.title = translations[key];
        } else if (el.tagName === 'INPUT' && el.type !== 'button') {
          el.placeholder = translations[key];
        } else {
          el.textContent = translations[key];
        }
      }
    });
    
    // Apply placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.placeholder = translations[key];
      }
    });
    
    document.documentElement.lang = lang;
    
    // ✅ Store translations globally
    window.currentTranslations = translations;
    
    console.log('✅ Translations loaded for:', lang);
  } catch (error) {
    console.error('Failed to load translations:', error);
    throw error;
  }
}

// ✅ Listen for language change from other tabs/pages
window.addEventListener('storage', function(e) {
  if (e.key === 'app.lang' && e.newValue) {
    console.log('🔄 Language changed in another tab:', e.newValue);
    loadTranslations(e.newValue).catch(console.error);
    updateLanguageDisplay(e.newValue);
    updateActiveButton(e.newValue);
  }
});

// ✅ Load saved language on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedLang = localStorage.getItem('app.lang') || 'vi';
  loadTranslations(savedLang).catch(console.error);
  updateLanguageDisplay(savedLang);
  updateActiveButton(savedLang);
  console.log('Current language:', savedLang);
});

function changeCurrency() {
  alert(getI18nText('admin.account.featureInDevelopment') || 'Chức năng đang phát triển');
}

// Helper function to get i18n text
function getI18nText(key) {
  const el = document.querySelector(`[data-i18n="${key}"]`);
  return el ? el.textContent : null;
}

console.log('✅ admin-account.js loaded');