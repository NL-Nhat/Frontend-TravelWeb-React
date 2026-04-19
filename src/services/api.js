
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

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Nếu đang refresh rồi → chờ
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
                // Gọi API refresh
                await api.post("/auth/refresh");

                isRefreshing = false;
                onRefreshed();

                // Gọi lại request cũ
                return api(originalRequest);

            } catch (refreshError) {
                isRefreshing = false;

                // Refresh fail → logout
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userAvatar');
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;