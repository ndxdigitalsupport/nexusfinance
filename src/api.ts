export const API = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? window.location.origin + '/api' : 'http://localhost:3001/api');
