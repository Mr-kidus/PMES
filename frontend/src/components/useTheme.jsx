import React, { useEffect, useState } from "react";

export default function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
      console.log("Dark mode enabled");
    } else {
      root.classList.remove("dark");
      console.log("Light mode enabled");
    }
  }, [dark]);

  return (
    <div className="min-h-screen p-10 bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-500">
      <button
        onClick={() => setDark(!dark)}
        className="px-6 py-3 rounded bg-blue-600 text-white dark:bg-yellow-400 dark:text-black transition-colors duration-300"
      >
        Toggle Dark Mode
      </button>

      <p className="mt-4">
        Current mode: <strong>{dark ? "Dark" : "Light"}</strong>
      </p>
    </div>
  );
}
