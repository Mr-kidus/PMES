import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./context/ChatContext";
import "./index.css";  // Tailwind + your custom styles
import useThemeStore from "./store/themeStore";

function Root() {
  const dark = useThemeStore((state) => state.dark);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <ChatProvider>
      <App />
    </ChatProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
