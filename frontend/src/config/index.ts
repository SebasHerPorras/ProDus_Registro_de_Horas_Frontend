/**
 * Configuración de la aplicación usando variables de entorno.
 * Las variables de entorno deben empezar con VITE_ para ser accesibles.
 */

interface AppConfig {
  apiBaseUrl: string;
  appEnv: string;
  appName: string;
  appVersion: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const config: AppConfig = {
  // URL base de la API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // Ambiente actual
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // Nombre de la aplicación
  appName: import.meta.env.VITE_APP_NAME || 'ProDus Registro de Horas',
  
  // Versión de la aplicación
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Helpers
  isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
};

export default config;
