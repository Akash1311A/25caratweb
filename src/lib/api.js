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
    credentials: 'same-origin',
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data || 'API request failed.'
        : data?.error || 'API request failed.';
    throw new Error(message);
  }

  return data;
}

async function requestFirst(paths, options = {}) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await request(path, options);
    } catch (error) {
      lastError = error;
      const message = String(error?.message || '').toLowerCase();
      const shouldContinue =
        message.includes('not found') ||
        message.includes('unexpected token') ||
        message.includes('failed to fetch') ||
        message.includes('cannot') ||
        message.includes('html');

      if (!shouldContinue) {
        throw error;
      }
    }
  }

  throw lastError || new Error('API request failed.');
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const headers = {};
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'same-origin',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Image upload failed.');
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
    return requestFirst(['/api/login', '/api/auth/login'], {
      method: 'POST',
      body: { email: String(email || '').trim(), password: String(password || '').trim() },
    });
  },
  validateAdminSession() {
    return request('/api/orders', { auth: true });
  },
  getProducts() {
    return request('/api/products');
  },
  saveProducts(products) {
    return request('/api/products', {
      method: 'PUT',
      auth: true,
      body: { products },
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
  uploadImage,
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
  getAdminUsers() {
    return request('/api/admin/users', { auth: true });
  },
  createAdminUser(payload) {
    return request('/api/admin/users', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },
  removeAdminUser(userId) {
    return request(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};
