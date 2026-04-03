// src/services/api.js
const BASE_URL = 'http://localhost:5000/api';

export const apiClient = async (endpoint, options = {}) => {
  const savedData = localStorage.getItem('registrar_user');
  const session = savedData ? JSON.parse(savedData) : null;
  const token = session?.token;

  console.log(`[API CALL] ${endpoint} | Token exists: ${!!token}`);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[API CALL] Using token: ${token.substring(0, 20)}...`);
  } else {
    console.warn(`[API CALL] No token found for ${endpoint}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[API RESPONSE] ${endpoint} → Status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn("SECURITY ALERT: Token rejected by backend");
        localStorage.removeItem('registrar_user');
        window.location.href = '/login';
        return null;
      }

      const errorData = await response.json().catch(() => ({}));
      console.error("Error from backend:", errorData);
      throw new Error(errorData.error || `SECTOR_ACCESS_DENIED: ${response.status}`);
    }

    const result = await response.json();
    return result.payload || result;   // fallback if no payload wrapper

  } catch (error) {
    console.error(`🔴 Tactical Link Failure [${endpoint}]:`, error.message);
    throw error;
  }
};