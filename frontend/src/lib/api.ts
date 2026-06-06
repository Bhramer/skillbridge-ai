import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const state = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = state?.state?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (config.data instanceof FormData) {
    // Let Axios set the multipart boundary header automatically.
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const state = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        const refreshToken = state?.state?.refreshToken;
        if (refreshToken) {
          const { data } = await api.post("/auth/refresh", null, {
            params: { token: refreshToken },
          });
          const newState = {
            ...state,
            state: {
              ...state.state,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            },
          };
          localStorage.setItem("auth-storage", JSON.stringify(newState));
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
