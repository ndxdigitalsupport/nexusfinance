export const API = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? window.location.origin + '/api' : 'http://localhost:3001/api');

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('nexus_token');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_portal');
    localStorage.removeItem('nexus_active_menu');
    throw new Error('Session expired. Please login again.');
  }
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body.error === 'Invalid or expired token.' || body.error === 'No token provided. Login first.') {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_portal');
      localStorage.removeItem('nexus_active_menu');
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(body.error || 'Access denied.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
