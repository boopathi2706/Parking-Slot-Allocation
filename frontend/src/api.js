// Central API configuration — all views import BASE_URL from here.
// The value is read from .env (VITE_API_BASE_URL).
// Vite exposes env vars prefixed with VITE_ via import.meta.env.

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default BASE_URL;
