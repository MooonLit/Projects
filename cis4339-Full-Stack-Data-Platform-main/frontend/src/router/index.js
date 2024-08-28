// Import necessary modules from Vue Router and Vuex
import { createRouter, createWebHistory } from "vue-router";
import { useLoggedInUserStore } from "@/store/loggedInUser"; // Import the Vuex store for logged-in user data

// Define the routes for the application
const routes = [
  { path: "/", component: () => import("../views/Home.vue") }, // Home page route
  { path: "/login", component: () => import("../views/Login.vue") }, // Login page route
  {
    path: "/clientform",
    component: () => import("../views/ClientForm.vue"), // Client form page route
    meta: { requiresAuth: true, requiresRole: "editor" }, // Authorization metadata for editor role
  },
  {
    path: "/clientdetails/:id",
    name: "clientdetails",
    meta: { requiresAuth: true }, // Authorization metadata for authenticated users
    component: () => import("../views/clientdetails.vue"), // Client details page route
  },
  {
    path: "/eventform",
    name: "eventform",
    meta: { requiresAuth: true, requiresRole: "editor" }, // Authorization metadata for editor role
    component: () => import("../views/eventform.vue"), // Event form page route
  },
  {
    path: "/findevents",
    name: "findevents",
    meta: { requiresAuth: true }, // Authorization metadata for authenticated users
    component: () => import("../views/findevents.vue"), // Find events page route
  },
  {
    path: "/eventdetails/:id",
    name: "eventdetails",
    meta: { requiresAuth: true }, // Authorization metadata for authenticated users
    component: () => import("../views/eventdetails.vue"), // Event details page route
  },
  {
    path: "/serviceform",
    name: "serviceform",
    meta: { requiresAuth: true, requiresRole: "editor" }, // Authorization metadata for editor role
    component: () => import("../views/serviceform.vue"), // Service form page route
  },
  {
    path: "/findservice",
    name: "findservice",
    meta: { requiresAuth: true }, // Authorization metadata for authenticated users
    component: () => import("../views/findservice.vue"), // Find service page route
  },
  {
    path: "/findclient",
    name: "findclient",
    meta: { requiresAuth: true }, // Authorization metadata for authenticated users
    component: () => import("../views/findclient.vue"), // Find client page route
  },
  {
    path: "/services/:id",
    name: "servicedetails",
    meta: { requiresAuth: true }, // Authorization metadata for authenticated users
    component: () => import("../views/servicedetails.vue"), // Services details page route
  },
];

// Create the router instance using Vue Router
const router = createRouter({
  history: createWebHistory(), // Use web history mode for router
  routes, // Pass the defined routes to the router instance
});

// Navigation guard to check authentication and role requirements before each route navigation
router.beforeEach((to, from, next) => {
  const store = useLoggedInUserStore(); // Get the Vuex store instance for logged-in user data

  // Check if the route requires authentication and user is not logged in
  if (to.meta.requiresAuth && !store.isLoggedIn) {
    next({ path: "/login", query: { redirect: to.fullPath } }); // Redirect to login page with redirection query
  } else if (to.meta.requiresRole && store.role !== to.meta.requiresRole) {
    next({ path: "/" }); // Redirect to home page if user role does not match required role
  } else {
    next(); // Proceed to the requested route
  }
});

// Export the router instance to be used in the main Vue application
export default router;
