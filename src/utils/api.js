import axios from "axios";
import { baseURL } from "../config/config";
import { store } from "../redux/store"; 

const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState(); 
      const token = state.Auth?.token; 

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving auth token from Redux:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.dispatch({type: 'authlice/actionLogout'});
    }
    return Promise.reject(error);
  },
);

export default api;
