const BASE = '/api';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    ...(body
      ? { headers: JSON_HEADERS, body: JSON.stringify(body) }
      : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { status: res.status, data };
  }

  return data;
};

export const api = {
  register: (f_name, l_name, email, password) =>
    request('POST', '/register', { f_name, l_name, email, password }),

  login: (email, password) => request('POST', '/login', { email, password }),

  logout: () => request('POST', '/logout'),

  me: () => request('GET', '/me'),
};
