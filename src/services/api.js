// // src/services/api.js
// import axios from 'axios';

// // Tạo instance axios với đường dẫn cơ sở của Backend
// const api = axios.create({
//     baseURL: 'https://localhost:7004/api', // Đổi port 5119 nếu backend của bạn chạy port khác
// });

// // Cấu hình Interceptor: Tự động thêm Token vào mỗi request nếu đã đăng nhập
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api', // Đường dẫn của backend
});

export default api;