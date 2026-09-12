const API_BASE = "/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("tracepoint_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (body) => api("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => api("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api("/auth/me"),
};

export const issueApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, value]) => value))
    ).toString();
    return api(`/issues${query ? `?${query}` : ""}`);
  },
  stats: () => api("/issues/stats"),
  assist: (body) => api("/issues/assist", { method: "POST", body: JSON.stringify(body) }),
  create: (body) => api("/issues", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => api(`/issues/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => api(`/issues/${id}`, { method: "DELETE" }),
};
