// Central API configuration — all views import BASE_URL from here.
// The value is read from .env (VITE_API_BASE_URL).
// Vite exposes env vars prefixed with VITE_ via import.meta.env.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not defined. Falling back to http://localhost:5000');
}

export default BASE_URL;
