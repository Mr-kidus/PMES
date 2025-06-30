import { create } from "zustand";

const useThemeStore = create((set) => ({
  dark: false,
  toggleDark: () =>
    set((state) => {
      const newDark = !state.dark;
      if (typeof window !== "undefined") {
        if (newDark) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("darkMode", "true");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("darkMode", "false");
        }
      }
      return { dark: newDark };
    }),
  setDark: (value) =>
    set(() => {
      if (typeof window !== "undefined") {
        if (value) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("darkMode", "true");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("darkMode", "false");
        }
      }
      return { dark: value };
    }),
}));

// Initialize from localStorage on app start
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("darkMode");
  if (saved === "true") {
    document.documentElement.classList.add("dark");
    useThemeStore.setState({ dark: true });
  } else {
    document.documentElement.classList.remove("dark");
    useThemeStore.setState({ dark: false });
  }
}

export default useThemeStore;
