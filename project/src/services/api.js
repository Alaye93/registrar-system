// src/services/api.js
const BASE_URL = 'http://localhost:5000/api';

export const apiClient = async (endpoint, options = {}) => {
  // 1. Grab the stored user/token
  const savedUser = localStorage.getItem('registrar_user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const token = user?.token;

  // 2. Setup Headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 3. Attach Token if it exists (Matches your backend "split(' ')[1]" logic)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Handle Errors (like 401 Access Denied)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server Error: ${response.status}`);
  }

  return response.json();
};