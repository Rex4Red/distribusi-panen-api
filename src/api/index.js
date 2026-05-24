import axios from 'axios';

const api = axios.create({
  baseURL: 'https://distribusi-panen-api-720084965883.us-central1.run.app',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menyisipkan token otomatis sebelum request dikirim
api.interceptors.request.use(
  (config) => {
    // Mengambil token yang disimpan di localStorage setelah login
    const token = localStorage.getItem('token');
    
    // Jika token ada, masukkan ke dalam header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;