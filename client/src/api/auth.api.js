import { jsonBody, request } from "./http.js";

export const authApi = {
  me: () => request("/auth/me"),
  login: (credentials) => request("/auth/login", { method: "POST", body: jsonBody(credentials) }),
  register: (details) => request("/auth/register", { method: "POST", body: jsonBody(details) }),
  logout: () => request("/auth/logout", { method: "POST" }),
};