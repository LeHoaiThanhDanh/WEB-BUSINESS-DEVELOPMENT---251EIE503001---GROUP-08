// Chỉ load thời tiết TP Hồ Chí Minh
const HCMC_CITY_ID = '2347728';

// DỮ LIỆU ĐỀ XUẤT MÓN THEO THỜI TIẾT
const WEATHER_RECOMMENDATIONS = {
    // Nắng nóng (>32°C)
    hot: {
        icon: '☀️',
        title: 'Trời nóng - Giải nhiệt ngay!',
        products: [
            {
                id: 'NG02', // ✅ ID từ products.json
                name: 'Hồng Trà Bí Đao',
                price: '19.000đ',
                image: '/assets/images/products/hong-tra-bi-dao.jpg',
                reason: 'Ngọt thanh, giải nhiệt tốt'
            },
            {
                id: 'NG03', // ✅ ID từ products.json
                name: 'Trà Xanh Bí Đao',
                price: '19.000đ',
                image: '/assets/images/products/tra-xanh-bi-dao.jpg',
                reason: 'Thanh mát, giải nhiệt'
            },
            {
                id: 'NG29', // ✅ ID từ products.json
                name: 'Trà Xanh Chanh',
                price: '24.000đ',
                image: '/assets/images/products/tra-xanh-chanh.jpg',
                reason: 'Chua ngọt sảng khoái'
            },
            {
                id: 'NG30', // ✅ ID từ products.json
                name: 'Hồng Trà Chanh Vải Thiều',
                price: '24.000đ',
                image: '/assets/images/products/hong-tra-chanh-vai-thieu.jpg',
                reason: 'Chua ngọt, giải khát'
            },
            {
                id: 'NG31', // ✅ ID từ products.json
                name: 'Bí Đao Chanh',
                price: '24.000đ',
                image: '/assets/images/products/tra-bi-dao-chanh.jpg',
                reason: 'Mát lạnh, giải nhiệt tốt'
            }
        ]
    },
    
    // Mát mẻ (25-32°C)
    warm: {
        icon: '🌤️',
        title: 'Thời tiết dễ chịu - Thưởng thức trà ngon!',
        products: [
            {
                id: 'NG07', // ✅ ID từ products.json
                name: 'Hồng Trà Đài Loan',
                price: '16.000đ',
                image: '/assets/images/products/hong-tra-dai-loan.jpg',
                reason: 'Hương vị truyền thống'
            },
            {
                id: 'NG15', // ✅ ID từ products.json
                name: 'Trà Sữa Đài Loan',
                price: '21.000đ',
                image: '/assets/images/products/tra-sua-dai-loan.jpg',
                reason: 'Béo ngậy, đậm đà'
            },
            {
                id: 'NG18', // ✅ ID từ products.json
                name: 'Sữa Tươi Trân Châu Đường Đen',
                price: '44.000đ',
                image: '/assets/images/products/sua-tuoi-tran-chau-duong-den.png',
                reason: 'Ngọt thanh, béo ngậy'
            },
            {
                id: 'NG42', // ✅ ID từ products.json
                name: 'Ô Long Kem Cheese',
                price: '26.000đ',
                image: '/assets/images/products/o-long-kem-cheese.png',
                reason: 'Béo mịn, mặn ngọt hài hòa'
            },
            {
                id: 'NG01', // ✅ ID từ products.json
                name: 'Trà Ô Long Mộc Hương',
                price: '19.000đ',
                image: '/assets/images/products/tra-o-long-moc-huong.png',
                reason: 'Nhẹ nhàng, tinh tế'
            }
        ]
    },
    
    // Mát lạnh (<25°C)
    cool: {
        icon: '⛅',
        title: 'Thời tiết mát - Hãy thử đồ ấm!',
        products: [
            {
                id: 'NG23', // ✅ ID từ products.json
                name: 'Hồng Trà Latte Đài Loan',
                price: '28.000đ',
                image: '/assets/images/products/hong-tra-latte-dai-loan.jpg',
                reason: 'Ấm áp cơ thể'
            },
            {
                id: 'NG17', // ✅ ID từ products.json
                name: 'Ô Long Latte',
                price: '31.000đ',
                image: '/assets/images/products/o-long-latte.png',
                reason: 'Thơm nồng, ấm áp'
            },
            {
                id: 'NG11', // ✅ ID từ products.json
                name: 'Trà Sữa Trân Châu Đường Đen',
                price: '26.000đ',
                image: '/assets/images/products/tra-sua-tran-chau-duong-den.jpg',
                reason: 'Béo ngậy, dai mềm'
            },
            {
                id: 'NG14', // ✅ ID từ products.json
                name: 'Trà Sữa Bí Đao',
                price: '24.000đ',
                image: '/assets/images/products/tra-sua-bi-dao.jpg',
                reason: 'Ngọt thanh, mát lành'
            },
            {
                id: 'NG10', // ✅ ID từ products.json
                name: 'Trà Sữa Socola',
                price: '28.000đ',
                image: '/assets/images/products/tra-sua-socola.png',
                reason: 'Đậm đà, béo ngậy'
            }
        ]
    },
    
    // Mưa
    rainy: {
        icon: '🌧️',
        title: 'Trời mưa - Đồ ấm cho bạn!',
        products: [
            {
                id: 'NG23', // ✅ ID từ products.json
                name: 'Hồng Trà Latte Đài Loan',
                price: '28.000đ',
                image: '/assets/images/products/hong-tra-latte-dai-loan.jpg',
                reason: 'Ấm bụng, xua tan cái lạnh'
            },
            {
                id: 'NG10', // ✅ ID từ products.json
                name: 'Trà Sữa Socola',
                price: '28.000đ',
                image: '/assets/images/products/tra-sua-socola.png',
                reason: 'Ngọt ngào, ấm áp'
            },
            {
                id: 'NG16', // ✅ ID từ products.json
                name: 'Sữa Tươi Khoai Môn Nghiền',
                price: '41.000đ',
                image: '/assets/images/products/sua-tuoi-khoai-mon-nghien.png',
                reason: 'Béo ngậy, thơm bùi'
            },
            {
                id: 'NG19', // ✅ ID từ products.json
                name: 'Trân Châu Đường Đen Latte',
                price: '33.000đ',
                image: '/assets/images/products/tran-chau-duong-den-latte.jpg',
                reason: 'Nóng ấm, thơm béo'
            },
            {
                id: 'NG17', // ✅ ID từ products.json
                name: 'Ô Long Latte',
                price: '31.000đ',
                image: '/assets/images/products/o-long-latte.png',
                reason: 'Thơm nồng, tăng cường sức đề kháng'
            }
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeWeatherPopup();
    loadHCMCWeather();
});

function initializeWeatherPopup() {
    // Tạo HTML cho popup
    const popupHTML = `
        <style>
            .weather-popup-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .weather-toggle-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0088ff 0%, #0066cc 100%); 
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                transition: all 0.3s ease;
                position: relative;
                animation: btnPulseStrong 1.5s ease-in-out infinite;
            }

            @keyframes btnPulseStrong {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                25% {
                    transform: scale(1.15) rotate(5deg);
                    box-shadow: 0 8px 24px rgba(0, 136, 255, 0.8); 
                }
                50% {
                    transform: scale(1) rotate(0deg);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                75% {
                    transform: scale(1.15) rotate(-5deg);
                    box-shadow: 0 8px 24px rgba(0, 102, 204, 0.8); 
                }
            }

            .weather-toggle-btn::before {
                content: '';
                position: absolute;
                inset: -5px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0088ff 0%, #0066cc 100%); 
                animation: rippleEffect 2s ease-out infinite;
            }

            @keyframes rippleEffect {
                0% {
                    transform: scale(1);
                    opacity: 0.6;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }

            /* ✅ THÊM SPARKLE EFFECT */
            .weather-toggle-btn::after {
                content: '✨';
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 16px;
                animation: sparkle 1.5s ease-in-out infinite;
            }

            @keyframes sparkle {
                0%, 100% {
                    opacity: 0;
                    transform: scale(0) rotate(0deg);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.2) rotate(180deg);
                }
            }

            .weather-toggle-btn:hover {
                transform: scale(1.2) rotate(15deg);
                box-shadow: 0 8px 32px rgba(0, 136, 255, 0.9); 
                animation: none;
            }

            .weather-toggle-btn:hover::before {
                animation: none;
                opacity: 0;
            }

            .weather-toggle-btn:active {
                transform: scale(0.95);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }

            .weather-popup {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 380px;
                max-height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                overflow-y: auto;
                transform: scale(0) rotate(-10deg);
                opacity: 0;
                transform-origin: bottom right;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            .weather-popup.show {
                transform: scale(1) rotate(0deg);
                opacity: 1;
            }

            @keyframes popupBounceIn {
                0% {
                    transform: scale(0) translateY(50px);
                    opacity: 0;
                }
                60% {
                    transform: scale(1.1) translateY(-10px);
                    opacity: 1;
                }
                100% {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }

            .weather-popup.auto-open {
                animation: popupBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            .weather-popup::-webkit-scrollbar {
                width: 6px;
            }

            .weather-popup::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .weather-popup::-webkit-scrollbar-thumb {
                background: #0088ff; 
                border-radius: 3px;
            }

            .weather-popup-header {
                background: #0088ff;
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .weather-popup-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .weather-popup-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }

            .weather-popup-close:hover {
                background: rgba(255,255,255,0.2);
                transform: rotate(90deg);
            }

            .weather-popup-body {
                padding: 20px;
            }

            .weather-main {
                text-align: center;
                margin-bottom: 20px;
            }

            .weather-temp {
                font-size: 48px;
                font-weight: 700;
                color: #0088ff; 
                margin: 10px 0;
            }

            .weather-status {
                font-size: 16px;
                color: #666;
                margin-bottom: 5px;
            }

            .weather-city {
                font-size: 14px;
                color: #999;
            }

            .weather-details-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #0000002a;
            }

            .weather-detail {
                text-align: center;
                padding: 8px;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .weather-detail-label {
                font-size: 12px;
                color: #999;
                margin-bottom: 4px;
            }

            .weather-detail-value {
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }

            .weather-recommendations {
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid #0000002a;
            }

            .recommendations-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
            }

            .recommendations-header .icon {
                font-size: 24px;
            }

            .recommendations-header .title {
                font-size: 15px;
                font-weight: 600;
                color: #333;
                flex: 1;
            }

            .recommendations-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .recommendation-item {
                display: flex;
                gap: 12px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 12px;
                transition: all 0.2s;
                cursor: pointer;
            }

            .recommendation-item:hover {
                background: #e9ecef;
                transform: translateX(-4px);
            }

            .recommendation-image {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                object-fit: cover;
                flex-shrink: 0;
            }

            .recommendation-info {
                flex: 1;
            }

            .recommendation-name {
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .recommendation-reason {
                font-size: 12px;
                color: #0088ff; 
                margin-bottom: 4px;
            }

            .recommendation-price {
                font-size: 13px;
                font-weight: 700;
                color: #ff6b6b;
            }

            .weather-loading {
                text-align: center;
                padding: 30px;
                color: #667eea;
            }

            .weather-error {
                text-align: center;
                padding: 20px;
                color: #dc3545;
            }

            .weather-refresh-btn {
                margin-top: 12px;
                padding: 8px 16px;
                background: #0088ff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }

            .weather-refresh-btn:hover {
                background: #5568d3;
            }

            /* Responsive */
            @media (max-width: 640px) {
                .weather-popup-container {
                    bottom: 80px;
                    right: 10px;
                }

                .weather-popup {
                    width: 320px;
                }

                .weather-toggle-btn {
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                }

                .recommendation-item {
                    flex-direction: column;
                }

                .recommendation-image {
                    width: 100%;
                    height: 120px;
                }
            }
        </style>

        <div class="weather-popup-container">
            <button class="weather-toggle-btn" id="weatherToggleBtn" aria-label="Xem thời tiết">
                🌤️
            </button>

            <div class="weather-popup" id="weatherPopup">
                <div class="weather-popup-header">
                    <h3>🌤️ Thời Tiết & Đề Xuất</h3>
                    <button class="weather-popup-close" id="weatherPopupClose">&times;</button>
                </div>

                <div class="weather-popup-body">
                    <div id="weatherLoadingDiv" class="weather-loading">
                        <div>⏳ Đang tải...</div>
                    </div>

                    <div id="weatherErrorDiv" class="weather-error" style="display: none;"></div>

                    <div id="weatherContentDiv" style="display: none;"></div>
                </div>
            </div>
        </div>
    `;

    // Thêm popup vào body
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Xử lý sự kiện
    const toggleBtn = document.getElementById('weatherToggleBtn');
    const popup = document.getElementById('weatherPopup');
    const closeBtn = document.getElementById('weatherPopupClose');

    toggleBtn.addEventListener('click', () => {
        popup.classList.toggle('show');
        popup.classList.remove('auto-open');
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show');
        popup.classList.remove('auto-open');
    });

    // Đóng popup khi click bên ngoài
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.weather-popup-container')) {
            popup.classList.remove('show');
            popup.classList.remove('auto-open');
        }
    });

    // ✅ TỰ ĐỘNG MỞ POPUP KHI VÀO TRANG (CHỈ 1 LẦN)
    const hasShownPopup = sessionStorage.getItem('weatherPopupShown');
    
    if (!hasShownPopup) {
        setTimeout(() => {
            popup.classList.add('show', 'auto-open');
            sessionStorage.setItem('weatherPopupShown', 'true');
            
            // Tự động đóng sau 10 giây
            setTimeout(() => {
                popup.classList.remove('show', 'auto-open');
            }, 10000);
            
        }, 1500);
    }
}

async function loadHCMCWeather() {
    const loadingDiv = document.getElementById('weatherLoadingDiv');
    const errorDiv = document.getElementById('weatherErrorDiv');
    const contentDiv = document.getElementById('weatherContentDiv');
    
    try {
        const weatherData = await getWeatherData(HCMC_CITY_ID);
        
        if (!weatherData) {
            throw new Error('Không thể lấy dữ liệu thời tiết');
        }
        
        displayWeather(weatherData);
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        errorDiv.innerHTML = `
            <div>❌ ${error.message}</div>
            <button class="weather-refresh-btn" onclick="location.reload()">🔄 Thử lại</button>
        `;
        errorDiv.style.display = 'block';
        loadingDiv.style.display = 'none';
    }
}

async function getWeatherData(cityId) {
    try {
        const apiUrl = `https://utils3.cnnd.vn/ajax/weatherinfo/${cityId}.htm`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error('Không thể kết nối đến API');
        }
        
        const result = await response.json();
        const apiData = JSON.parse(result.contents);
        
        if (!apiData.Data || !apiData.Data.data || !apiData.Data.data.datainfo) {
            throw new Error('Dữ liệu không hợp lệ');
        }
        
        return apiData.Data.data.datainfo;
        
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function getWeatherCategory(temperature, status) {
    const temp = parseFloat(temperature);
    const statusLower = (status || '').toLowerCase();
    
    if (statusLower.includes('mưa') || statusLower.includes('rain')) {
        return 'rainy';
    }
    
    if (temp > 32) {
        return 'hot';
    } else if (temp >= 25) {
        return 'warm';
    } else {
        return 'cool';
    }
}

function displayWeather(data) {
    const contentDiv = document.getElementById('weatherContentDiv');
    
    const tempMin = data.temperature_min || 
                    data.temp_min || 
                    data.min_temp ||
                    data.minTemp ||
                    (data.temperature ? (parseFloat(data.temperature) - 3) : 'N/A');
                    
    const tempMax = data.temperature_max || 
                    data.temp_max || 
                    data.max_temp ||
                    data.maxTemp ||
                    (data.temperature ? (parseFloat(data.temperature) + 3) : 'N/A');
    
    const weatherCategory = getWeatherCategory(data.temperature, data.status);
    const recommendations = WEATHER_RECOMMENDATIONS[weatherCategory];
    
    const html = `
        <div class="weather-main">
            <div class="weather-temp">${data.temperature}°C</div>
            <div class="weather-status">${data.status || 'Không có dữ liệu'}</div>
            <div class="weather-city">TP. Hồ Chí Minh</div>
        </div>
        <div class="weather-details-grid">
            <div class="weather-detail">
                <div class="weather-detail-label">🌡️ Thấp nhất</div>
                <div class="weather-detail-value">${tempMin}${tempMin !== 'N/A' ? '°C' : ''}</div>
            </div>
            
            <div class="weather-detail">
                <div class="weather-detail-label">🌡️ Cao nhất</div>
                <div class="weather-detail-value">${tempMax}${tempMax !== 'N/A' ? '°C' : ''}</div>
            </div>
        </div>

        <div class="weather-recommendations">
            <div class="recommendations-header">
                <span class="icon">${recommendations.icon}</span>
                <span class="title">${recommendations.title}</span>
            </div>
            
            <div class="recommendations-list">
                ${recommendations.products.map(product => `
                    <div class="recommendation-item" onclick="viewProduct('${product.id}', '${product.name}')">
                        <img src="${product.image}" alt="${product.name}" class="recommendation-image" 
                             onerror="this.src='/assets/images/placeholder.png'">
                        <div class="recommendation-info">
                            <div class="recommendation-name">${product.name}</div>
                            <div class="recommendation-reason">✨ ${product.reason}</div>
                            <div class="recommendation-price">${product.price}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <button class="weather-refresh-btn" onclick="location.reload()" style="width: 100%; margin-top: 16px;">
            🔄 Làm mới
        </button>
    `;
    
    contentDiv.innerHTML = html;
}

// ✅ HÀM CHUYỂN ĐÕI TRANG SẢN PHẨM (DÙNG ID CHÍNH XÁC)
function viewProduct(productId, productName) {
    console.log('View product:', productId, productName);
    
    // ✅ SỬ DỤNG CẤU TRÚC ROUTING GIỐNG Home.js
    const qs = new URLSearchParams({
        pid: productId,
        name: productName
    });
    
    window.location.href = `/product/?${qs.toString()}`;
}
