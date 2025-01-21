import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// axiosInstance.interceptors.request.use((config) => {
//   const localUser: string | null = localStorage.getItem('user');
//   const parsedUser = localUser ? JSON.parse(localUser) : null;

//   if (parsedUser && parsedUser.accessToken) {
//     // Bearer
//     config.headers.Authorization = `Bearer ${parsedUser.accessToken}`;
//   } else {
//     config.headers.Authorization = null;
//   }

//   return config;
// });
export default axiosInstance;
