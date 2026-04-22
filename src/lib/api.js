export const ADMIN_TOKEN_KEY = 'twentyfivecarat-admin-token';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getAdminToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.auth) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'API request failed.');
  }

  return data;
}

export const api = {
  getAdminToken,
  saveAdminToken(token) {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clearAdminToken() {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
  login(email, password) {
    return request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },
  getContent() {
    return request('/api/content');
  },
  saveContent(content) {
    return request('/api/content', {
      method: 'PUT',
      auth: true,
      body: content,
    });
  },
  createOrder(payload) {
    return request('/api/orders', {
      method: 'POST',
      body: payload,
    });
  },
  getOrders() {
    return request('/api/orders', { auth: true });
  },
  updateOrderStatus(orderId, status) {
    return request(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status },
    });
  },
  createEnquiry(payload) {
    return request('/api/enquiries', {
      method: 'POST',
      body: payload,
    });
  },
  getEnquiries() {
    return request('/api/enquiries', { auth: true });
  },
  removeEnquiry(enquiryId) {
    return request(`/api/enquiries/${encodeURIComponent(enquiryId)}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};
