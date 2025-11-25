import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "./pages/LandingPage.vue";
import LoginPage from "./pages/LoginPage.vue";
import SignupPage from "./pages/SignupPage.vue";
import DestinationDetailPage from "./pages/DestinationDetailPage.vue";
import DashboardPage from "./pages/DashboardPage.vue";

import { useAuth } from "@clerk/vue";
import { watch } from "vue";
import DestinationFormPage from "./pages/DestinationFormPage.vue";

const routes = [
  { path: "/", name: "Home", component: LandingPage },
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/signup", name: "Signup", component: SignupPage },
  {
    path: "/trip/:id",
    name: "TripDetail",
    component: DestinationDetailPage,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard/create",
    name: "CreateTrip",
    component: DestinationFormPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard/edit/:id",
    name: "EditTrip",
    component: DestinationFormPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Prevent anon user from visiting create page
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (!requiresAuth) {
    return next();
  }

  const { userId, isLoaded } = useAuth();

  if (!isLoaded.value) {
    await new Promise((resolve) => {
      const unwatch = watch(isLoaded, (val) => {
        if (val) {
          unwatch();
          resolve(val);
        }
      });
    });
  }

  if (!userId.value) {
    return next({ name: "Login" });
  }

  next();
});

export default router;
