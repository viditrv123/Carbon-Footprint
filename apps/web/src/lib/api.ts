const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiError {
  message: string;
  statusCode: number;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    // Attempt token refresh
    const storedRefresh = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (storedRefresh) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem('accessToken', refreshData.tokens.accessToken);
          localStorage.setItem('refreshToken', refreshData.tokens.refreshToken);
          // Retry original request with new token
          const retryRes = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
              Authorization: `Bearer ${refreshData.tokens.accessToken}`,
            },
          });
          if (!retryRes.ok) throw new Error(await retryRes.text());
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json() as Promise<T>;
        }
      } catch {
        // refresh failed — fall through to clear tokens
      }
      // Clear stale tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw { message: error.message || 'Request failed', statusCode: res.status } as ApiError;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string; country?: string }) =>
      fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    refresh: (refreshToken: string) =>
      fetchJson('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    logout: (refreshToken: string) =>
      fetchJson('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  },
  users: {
    getMe: () => fetchJson('/users/me'),
    updateMe: (data: any) => fetchJson('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  activities: {
    create: (data: any) => fetchJson('/activities', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchJson(`/activities${qs}`);
    },
    update: (id: string, data: { value?: number; notes?: string }) =>
      fetchJson(`/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson(`/activities/${id}`, { method: 'DELETE' }),
    exportCsv: (): Promise<{ csv: string; filename: string }> =>
      fetchJson('/activities/export/csv'),
  },
  dashboard: {
    getStats: () => fetchJson('/dashboard'),
  },
  insights: {
    get: () => fetchJson('/insights'),
  },
};
