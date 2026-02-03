import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import BlockedView from "../views/BlockedView.vue";
import api from "../services/api";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/blocked",
      name: "blocked",
      component: BlockedView,
    },
  ],
});

const IP_CHECK_KEY = "ip_check_cache";
const IP_CHECK_TTL_MS = 5 * 60 * 1000;

router.beforeEach(async (to) => {
  if (import.meta.env.MODE === "development") {
    return true;
  }

  if (to.name === "blocked") {
    const cached = sessionStorage.getItem(IP_CHECK_KEY);
    if (cached) {
      const { allowed, dev_mode, ts } = JSON.parse(cached) as {
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
