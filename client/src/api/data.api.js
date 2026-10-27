import { jsonBody, request } from "./http.js";

function queryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const suffix = search.toString();
  return suffix ? `?${suffix}` : "";
}

function resource(path) {
  return {
    list: (params) => request(`${path}${queryString(params)}`),
    create: (data) => request(path, { method: "POST", body: jsonBody(data) }),
    update: (id, data) => request(`${path}/${id}`, { method: "PATCH", body: jsonBody(data) }),
    remove: (id) => request(`${path}/${id}`, { method: "DELETE" }),
  };
}

export const subjectsApi = resource("/subjects");
export const tasksApi = resource("/tasks");
export const sessionsApi = resource("/sessions");

export const dashboardApi = {
  summary: () => request("/dashboard/summary"),
  studyTime: () => request("/dashboard/study-time"),
};

export const usersApi = {
  get: () => request("/users/me"),
  update: (data) => request("/users/me", { method: "PATCH", body: jsonBody(data) }),
};