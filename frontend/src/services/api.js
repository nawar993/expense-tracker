import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// إضافة Interceptor لتمرير التوكن لكل طلب  تلقائيا
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token"); // جلب التوكن  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//معالجة الاخطاء 
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/reglog";
    }
    return Promise.reject(error);
  }
);