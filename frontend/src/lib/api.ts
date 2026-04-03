const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Token Storage ────────────────────────────────────────────────────────────
export const TokenStorage = {
  getAccess: () =>
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  getRefresh: () =>
    typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  setAccess: (t: string) => localStorage.setItem('accessToken', t),
  setRefresh: (t: string) => localStorage.setItem('refreshToken', t),
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────
type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
};

async function request<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, skipRefresh = false } = opts;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = TokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !skipRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...opts, skipRefresh: true });
    } else {
      TokenStorage.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(err.message || 'Request failed', res.status, err);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = TokenStorage.getRefresh();
  if (!refreshToken) return false;

  try {
    const data = await request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: { refreshToken },
        auth: false,
        skipRefresh: true,
      }
    );
    TokenStorage.setAccess(data.accessToken);
    TokenStorage.setRefresh(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: data, auth: false }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: data, auth: false }),

  logout: (refreshToken: string) =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),
};

// ─── Task API ─────────────────────────────────────────────────────────────────
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export const taskApi = {
  getAll: (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<TasksResponse>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  getOne: (id: string) => request<{ data: Task }>(`/tasks/${id}`),

  create: (data: CreateTaskData) =>
    request<{ data: Task; message: string }>('/tasks', { method: 'POST', body: data }),

  update: (id: string, data: Partial<CreateTaskData>) =>
    request<{ data: Task; message: string }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),

  toggle: (id: string) =>
    request<{ data: Task; message: string }>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    }),
};
