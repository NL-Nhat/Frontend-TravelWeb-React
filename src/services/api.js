
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8085/api', // Đường dẫn của backend

    // Bắt buộc trình duyệt đính kèm HTTP-Only Cookie vào mọi Request
    withCredentials: true
});

// Biến tránh gọi refresh nhiều lần
let isRefreshing = false;
let refreshSubscribers = [];

// Thêm request vào hàng đợi
const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

// Gọi lại request sau khi refresh xong
const onRefreshed = () => {
    refreshSubscribers.forEach(cb => cb());
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Tránh vòng lặp hoặc treo (hang) khi chính API /auth/refresh trả về 401
        if (originalRequest.url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Nếu đang refresh rồi → cho các request khác vào hàng chờ
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API refresh bằng axios gốc để chắc chắn không bị dính interceptor nữa
                await axios.post("http://localhost:8085/api/auth/refresh", {}, { withCredentials: true });

                isRefreshing = false;
                onRefreshed();

                // Gọi lại request ban đầu vừa bị lỗi
                return api(originalRequest);

            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = []; // Hủy toàn bộ hàng đợi nếu refresh thất bại

                // Refresh token hết hạn hoặc không hợp lệ → Đăng xuất
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userAvatar');
                
                // Dispatch event để Header.jsx (hoặc các component khác) nhận biết ngay lập tức
                window.dispatchEvent(new Event('authStatusChanged'));
                
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;