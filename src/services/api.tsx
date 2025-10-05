import axios, { AxiosHeaders } from "axios";

// Use .env value; fallback to backend
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Skip Authorization header for /auth/* (login, verify-otp)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "";
  const url = String(config.url ?? "");
  const isAuthEndpoint = /\/auth(\/|$)/.test(url);

  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  if (token && !isAuthEndpoint) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  config.headers = headers;
  return config;
});

export default api;
