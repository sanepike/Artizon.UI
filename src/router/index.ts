/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

// Attach route meta centrally so file-based routes don't need per-file changes.
// This maps logical paths to meta flags used by the global beforeEach guard.
const routeMetaMap: Record<string, Record<string, boolean>> = {
  "/auth/login": { requiresGuest: true },
  "/auth/signup": { requiresGuest: true },
  "/dashboard": { requiresAuth: true },
  "/dashboard/CustomerDashboard": {
    requiresAuth: true,
    requiresCustomer: true,
  },
  "/dashboard/VendorDashboard": { requiresAuth: true, requiresVendor: true },
  "/dashboard/ProductForm": { requiresAuth: true, requiresVendor: true },
  "/dashboard/ProfileForm": { requiresAuth: true },
  "/orders/customer": { requiresAuth: true, requiresCustomer: true },
  "/orders/vendor": { requiresAuth: true, requiresVendor: true },
  "/cart": {
    /* keep cart browse open, requireAuth for checkout handled in UI */
  },
};

// Apply meta to the actual router routes (matching by path)
for (const r of router.getRoutes()) {
  const key = r.path.replace(/\/$/, ""); // normalize trailing slash
  const meta = routeMetaMap[key];
  if (meta) {
    r.meta = Object.assign(r.meta || {}, meta);
  }
}

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // Initialize auth store if needed
  if (auth.token && !auth.user) {
    await auth.initialize();
  }

  // Handle routes that require guest access
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next("/dashboard");
  }

  // Handle routes that require authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/auth/login");
  }

  // Handle routes that require customer role
  if (to.meta.requiresCustomer && !auth.isCustomer) {
    return next("/dashboard");
  }

  // Handle routes that require vendor role
  if (to.meta.requiresVendor && !auth.isVendor) {
    return next("/dashboard");
  }

  next();
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (localStorage.getItem("vuetify:dynamic-reload")) {
      console.error("Dynamic import error, reloading page did not fix it", err);
    } else {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
