/**
 * Servicio de API para comunicación con el backend.
 * Maneja autenticación JWT y peticiones HTTP.
 */
import config from '@/config';

// Tipos
interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    is_admin: boolean;
    name?: string;
    role?: string;
  };
}

interface CheckIPResponse {
  allowed: boolean;
  dev_mode: boolean;
  client_ip?: string;
}

interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Clase para manejar las peticiones a la API.
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  /**
   * Obtiene el token de acceso del localStorage.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el token de refresh del localStorage.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene el usuario actual del localStorage.
   */
  getUser(): AuthTokens['user'] | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Guarda los tokens y usuario en localStorage.
   */
  setAuthData(data: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  /**
   * Limpia los datos de autenticación.
   */
  clearAuthData(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Verifica si el usuario está autenticado.
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Construye los headers para las peticiones.
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Realiza una petición HTTP genérica.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    });

    // Si el token expiró, intentar refresh
    if (response.status === 401 && includeAuth) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Reintentar la petición original
        return this.request<T>(endpoint, options, includeAuth);
      } else {
        // No se pudo refrescar, limpiar auth y redirigir
        this.clearAuthData();
        window.location.href = '/';
        throw new Error('Sesión expirada');
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || `Error ${response.status}`);
    }

    // Si la respuesta está vacía (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Intenta refrescar el token de acceso.
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
      if (data.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
      }
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  /**
   * Inicia sesión con credenciales.
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const data = await this.request<AuthTokens>(
      '/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false // No incluir auth header en login
    );
    this.setAuthData(data);
    return data;
  }

  /**
   * Verifica si la IP del cliente está permitida.
   */
  async checkIP(): Promise<CheckIPResponse> {
    return this.request<CheckIPResponse>(
      '/auth/check-ip/',
      {
        method: 'GET',
      },
      false
    );
  }

  /**
   * Cierra sesión.
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Obtiene el perfil del usuario actual.
   */
  async getProfile(): Promise<AuthTokens['user']> {
    return this.request<AuthTokens['user']>('/users/me/');
  }

  // ============================================
  // REPORTS ENDPOINTS
  // ============================================

  /**
   * Obtiene los reportes del usuario.
   */
  async getReports(params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<unknown[]> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return this.request<unknown[]>(`/reports/${query ? `?${query}` : ''}`);
  }

  /**
   * Crea un nuevo reporte.
   */
  async createReport(data: {
    activity: number;
    start_time: string;
    end_time: string;
    date: string;
    notes?: string;
  }): Promise<unknown> {
    return this.request('/reports/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Obtiene el resumen de horas del usuario.
   */
  async getMySummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<unknown> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const query = searchParams.toString();
    return this.request(`/reports/my_summary/${query ? `?${query}` : ''}`);
  }

  // ============================================
  // ACTIVITIES ENDPOINTS
  // ============================================

  /**
   * Obtiene las actividades disponibles.
   */
  async getActivities(): Promise<unknown[]> {
    return this.request<unknown[]>('/activities/');
  }

  // ============================================
  // SCHEDULES ENDPOINTS
  // ============================================

  /**
   * Obtiene el horario del usuario.
   */
  async getMySchedule(): Promise<unknown> {
    return this.request('/schedules/');
  }

  // ============================================
  // GENERIC METHODS
  // ============================================

  /**
   * GET request genérico.
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  /**
   * POST request genérico.
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request genérico.
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request genérico.
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request genérico.
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Exportar instancia única (singleton)
export const api = new ApiService();
export default api;
