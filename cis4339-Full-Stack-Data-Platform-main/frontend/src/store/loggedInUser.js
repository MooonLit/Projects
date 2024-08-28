import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import { loginUser, getOrgName } from "@/api/api";
import jwt_decode from "jwt-decode";
import router from "@/router";

export const useLoggedInUserStore = defineStore("loggedInUser", {
  // Define the initial state of the store
  state: () => ({
    token: null,
    isLoggedIn: false,
    username: "",
    role: "",
    orgId: null,
    orgName: "",
  }),
  actions: {
    // Initialize user details from JWT token stored in localStorage
    async initializeUserFromToken() {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded = jwt_decode(token); // Decode JWT token
          this.token = token;
          this.isLoggedIn = true;
          this.username = decoded.username; // Set username from token
          this.role = decoded.role; // Set user role from token
          this.orgId = decoded.org; // Set organization ID from token
          this.orgName = await getOrgName(this.orgId); // Fetch organization name using orgId
        } catch (error) {
          console.error("Token decode or org fetch failed:", error);
          this.logout(); // Log out if token decoding fails or org details can't be fetched
        }
      }
    },
    // Handle user login
    async login(username, password) {
      const toast = useToast(); // Use toastification for notifications
      try {
        const token = await loginUser(username, password); // Log in and retrieve token
        localStorage.setItem("authToken", token); // Store token in localStorage
        await this.initializeUserFromToken(); // Initialize user details from token
        toast.success("Login successful!");
        await router.push(this.role === "editor" ? "/clientform" : "/"); // Navigate based on user role
      } catch (error) {
        console.error("Login Error:", error);
        toast.error("Login failed: " + error.message); // Show error message on login failure
      }
    },
    // Handle user logout
    logout() {
      localStorage.removeItem("authToken"); // Remove token from localStorage
      this.$reset(); // Reset store to initial state
      router
        .push("/login")
        .catch((err) => console.error("Failed to navigate:", err)); // Navigate to login page
      const toast = useToast(); // Use toastification for notifications
      toast.info("Logged out successfully."); // Show logout success message
    },
  },
});
