import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import RegistroHorasView from "../views/RegistroHorasView.vue";
import BlockedView from "../views/BlockedView.vue";
import api from "../services/api";

// Función para verificar si el usuario tiene un token válido
const isUserAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  try {
    // Decodificar el token para verificar si no ha expirado
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/login",
      name: "login-page",
      component: LoginView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },

    {
      path: "/blocked",
      name: "blocked",
      component: BlockedView,
    },
    {
      path: "/registro-horas",
      name: "registro-horas",
      component: RegistroHorasView,
      meta: { requiresAuth: true },
    },
  ],
});

const IP_CHECK_KEY = "ip_check_cache";
const IP_CHECK_TTL_MS = 5 * 60 * 1000;

// Guard para verificar autenticación
router.beforeEach((to, _from, next) => {
  const isAuthenticated = isUserAuthenticated();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isAuthenticated) {
    // Redirigir a login si la ruta requiere autenticación pero no hay token
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.name === 'login-page' || to.path === '/') && isAuthenticated) {
    // Redirigir a home si ya está autenticado e intenta ir a login
    next({ name: 'home' });
  } else {
    next();
  }
});

// Guard para verificar IP (solo en producción)
router.beforeEach(async (to: any) => {
  if (import.meta.env.MODE === "development") {
    return true;
  }

  if (to.name === "blocked") {
    const cached = sessionStorage.getItem(IP_CHECK_KEY);
    if (cached) {
      const { allowed, dev_mode } = JSON.parse(cached) as {
        allowed: boolean;
        dev_mode: boolean;
        ts: number;
      };
      if (allowed || dev_mode) {
        return { path: "/" };
      }
    }
    return true;
  }

  const cached = sessionStorage.getItem(IP_CHECK_KEY);
  if (cached) {
    const { allowed, dev_mode, ts } = JSON.parse(cached) as {
      allowed: boolean;
      dev_mode: boolean;
      ts: number;
    };
    if (dev_mode || allowed) {
      if (dev_mode) return true;
      if (Date.now() - ts < IP_CHECK_TTL_MS) return true;
    }
  }

  try {
    const result = await api.checkIP();
    sessionStorage.setItem(
      IP_CHECK_KEY,
      JSON.stringify({
        allowed: result.allowed,
        dev_mode: result.dev_mode,
        ts: Date.now(),
      })
    );

    if (!result.allowed && !result.dev_mode) {
      return { path: "/blocked" };
    }
  } catch {
    return { path: "/blocked" };
  }

  return true;
});

export default router;
