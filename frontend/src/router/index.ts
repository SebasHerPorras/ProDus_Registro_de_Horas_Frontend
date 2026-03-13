import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import RegistroHorasView from "../views/RegistroHorasView.vue";
import BlockedView from "../views/BlockedView.vue";

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

// Guard para verificar autenticación
router.beforeEach((to) => {
  const isAuthenticated = isUserAuthenticated();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isAuthenticated) {
    return { name: 'login' };
  }

  if ((to.name === 'login' || to.name === 'login-page' || to.path === '/') && isAuthenticated) {
    return { name: 'home' };
  }

  return true;
});

export default router;
