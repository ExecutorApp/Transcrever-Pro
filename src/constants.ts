// Central de constantes da aplicação
// Permite configurar o backend via variável de ambiente Vite (VITE_BACKEND_URL)
// com fallback seguro para IPv4 explícito, evitando problemas com IPv6/localhost.

export const BACKEND_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_BACKEND_URL && String((import.meta as any).env.VITE_BACKEND_URL).trim()) ||
  'http://127.0.0.1:3001';

export const API_BASE = `${BACKEND_URL}/api`;
export const API_HEALTH = `${API_BASE}/health`;
export const API_TRANSCRIBE = `${API_BASE}/transcribe`;
export const API_SAVE_TRANSCRIPTION = `${API_BASE}/save-transcription`;