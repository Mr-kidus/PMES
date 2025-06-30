import { create } from "zustand";
import axios from "axios";

const backendUrl = "http://localhost:1221";

axios.defaults.withCredentials = true;

const useAuthStore = create((set) => ({
  user: null,
  error: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoading: false,

  adminLogin: async (normalizedEmail, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/admin/login`, {
        email: normalizedEmail,
        password,
      });

      set({ user: response.data.user, error: null, isAuthenticated: true });
    } catch (err) {
      set({ error: err.response?.data?.message || "Admin login failed" });
      throw err;
    }
  },

  userLogin: async (normalizedEmail, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/users/login`, {
        email: normalizedEmail,
        password,
      });
      console.log(response.data.user);
      set({ user: response.data.user, error: null, isAuthenticated: true });
      return response.data.user;
    } catch (err) {
      set({ error: err.response?.data?.message || "User login failed" });
      throw err;
    }
  },

  logout: async () => {
    const response = await axios.post(`${backendUrl}/api/users/logout`);
    set({ user: null, error: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${backendUrl}/api/users/checkAuth`);

      set({
        error: null,
        user: response.data.user,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        isCheckingAuth: false,
        isAuthenticated: false,
      });
      console.log(error.message);
    }
  },

  updateProfile: async (formData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(
        `${backendUrl}/api/users/update-profile`,
        formData
      );

      set({
        user: response.data.user, // update user data after successful save
        error: null,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Profile update failed" });
      throw err;
    }
  },

  fetchProfile: async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/users/profile`);
      console.log(response.data.user);
      set({
        user: response.data.user,
        isAuthenticated: true,
        error: null,
      });
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        error: err.response?.data?.message || "Failed to fetch profile",
      });
      console.error("❌ fetchProfile error:", err.message);
    }
  },
}));

export default useAuthStore;
