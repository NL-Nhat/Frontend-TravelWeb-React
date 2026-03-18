
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api', // Đường dẫn của backend

  // Bắt buộc trình duyệt đính kèm HTTP-Only Cookie vào mọi Request
    withCredentials: true
});

export default api;