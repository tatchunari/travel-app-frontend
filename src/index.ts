import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "./pages/LandingPage.vue";
import LoginPage from "./pages/LoginPage.vue";
import SignupPage from "./pages/SignupPage.vue";
import AddDestinationPage from "./pages/AddDestinationPage.vue";
import DestinationDetailPage from "./pages/DestinationDetailPage.vue";

import { useAuth } from "@clerk/vue";
import { watch } from "vue";

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
    path: "/add-destination-page",
    name: "Add Destination",
    component: AddDestinationPage,
    meta: { requiredAuth: true },
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
    return next({ name: "login" });
  }

  next();
});

export default router;
