const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const api = {
  register: (name, email, password) =>
    request('POST', '/register', { name, email, password }),
  login: (email, password) =>
    request('POST', '/login', { email, password }),
  logout: () =>
    request('POST', '/logout'),
  me: () =>
    request('GET', '/me'),
};
