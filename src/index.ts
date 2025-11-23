import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "./pages/LandingPage.vue";
import LoginPage from "./pages/LoginPage.vue";
import SignupPage from "./pages/SignupPage.vue";
import AddDestinationPage from "./pages/AddDestinationPage.vue";
import DestinationDetailPage from "./pages/DestinationDetailPage.vue";

const routes = [
  { path: "/", name: "Home", component: LandingPage },
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/signup", name: "Signup", component: SignupPage },
  {
    path: "/add-destination-page",
    name: "Add Destination",
    component: AddDestinationPage,
  },
  {
    path: "/trip/:id",
    name: "TripDetail",
    component: DestinationDetailPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
