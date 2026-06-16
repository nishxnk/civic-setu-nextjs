import { auth } from "./firebase";

const API_BASE = "/api";

async function getToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) return await user.getIdToken();
  } catch {
    // Firebase not ready or user not logged in
  }
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

async function makeRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers as Record<string, string>,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

// ── Auth API ──────────────────────────────────────────────

export const authAPI = {
  firebaseLogin: (idToken: string) =>
    makeRequest<{ user: Record<string, unknown> }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  firebaseRegister: (idToken: string, name: string) =>
    makeRequest<{ user: Record<string, unknown> }>("/users/register", {
      method: "POST",
      body: JSON.stringify({ idToken, name }),
    }),

  getProfile: () => makeRequest<Record<string, unknown>>("/users/profile"),
};

// ── Complaints API ────────────────────────────────────────

export const complaintsAPI = {
  create: (data: Record<string, unknown>) =>
    makeRequest("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return makeRequest(`/complaints${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) => makeRequest(`/complaints/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    makeRequest(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    makeRequest(`/complaints/${id}`, { method: "DELETE" }),

  getStats: () => makeRequest("/complaints/stats/overview"),
};

// ── Admin API ─────────────────────────────────────────────

export const adminAPI = {
  getDashboard: () => makeRequest("/admin/dashboard"),

  getAnalytics: (period = "6months") =>
    makeRequest(`/admin/analytics?period=${period}`),

  getUsers: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return makeRequest(`/admin/users${qs ? `?${qs}` : ""}`);
  },

  updateUser: (id: string, data: Record<string, unknown>) =>
    makeRequest(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    makeRequest(`/admin/users/${id}`, { method: "DELETE" }),

  getDepartments: () => makeRequest("/admin/departments"),
};

// ── Citizen API ───────────────────────────────────────────

export const citizenAPI = {
  getDashboard: () => makeRequest("/citizen/dashboard"),

  getComplaints: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return makeRequest(`/citizen/complaints${qs ? `?${qs}` : ""}`);
  },

  getComplaintById: (id: string) => makeRequest(`/citizen/complaints/${id}`),

  createComplaint: (data: Record<string, unknown>) =>
    makeRequest("/citizen/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => makeRequest("/citizen/profile"),

  updateProfile: (data: Record<string, unknown>) =>
    makeRequest("/citizen/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getStats: () => makeRequest("/citizen/stats"),
};

// ── Legacy helpers ────────────────────────────────────────

export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken");
};
