import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";
import exampleImage from "../../assets/download.jpg";
import { MdDarkMode, MdLightMode } from "react-icons/md";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { userLogin } = useAuthStore();
  const { dark, toggleDark } = useThemeStore();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const userData = await userLogin(email.trim().toLowerCase(), password);

      if (userData) {
        toast.success("User login successful!");
        const role = (userData?.role || "").toLowerCase();

        switch (role) {
          case "system admin":
            navigate("/admin");
            break;
          case "chief ceo":
            navigate("/chief-ceo");
            break;
          case "ceo":
            navigate("/ceo");
            break;
          case "worker":
            navigate("/worker");
            break;
          case "minister":
            navigate("/minister");
            break;
          case "strategic unit":
            navigate("/strategic");
            break;
          default:
            navigate("/unauthorized");
        }
      } else {
        toast.error("Login failed.");
        setError("Invalid credentials.");
      }
    } catch (err) {
      toast.error("Login error.");
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div
      className={`${
        dark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } flex h-screen relative`}
    >
      {/* DARK/LIGHT MODE TOGGLE SWITCH (fixed top-right) */}
      <button
        onClick={toggleDark}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border p-2 shadow-lg transition
          ${
            dark
              ? "bg-gray-800 border-gray-600 text-yellow-400 hover:bg-gray-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        {dark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        <span className="sr-only">
          {dark ? "Switch to light mode" : "Switch to dark mode"}
        </span>
      </button>

      {/* LEFT INFO SECTION */}
      <div
        className={`hidden lg:flex lg:flex-2 p-10 flex-col justify-between transition-colors duration-300 ${
          dark
            ? "bg-gray-800 text-gray-200"
            : "bg-gradient-to-br from-blue-900 to-purple-900 text-white"
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Ministry of Innovation and Technology
          </h1>
          <p
            className={`${
              dark ? "text-gray-300" : "text-gray-200"
            } text-sm leading-6`}
          >
            The Ministry of Innovation and Technology (MInT) leads Ethiopia’s
            science, innovation, and technology advancement strategy. It works
            to transform the country into a technology-driven economy through
            digital infrastructure, scientific research, and innovative
            solutions.
          </p>
        </div>

        <div className="grid grid-cols-4  gap-4 mt-8">
          <img
            src="http://www.mint.gov.et/documents/d/guest/2-3-jpg?imagePreview=1"
            alt="gallery1"
            className="rounded-lg h-64 object-cover col-span-2"
          />
          <img
            src="http://www.mint.gov.et/documents/d/guest/1-38-jpg?imagePreview=1"
            alt="gallery2"
            className="rounded-lg h-64  object-cover col-span-2"
          />
        </div>

        <footer
          className={`${dark ? "text-gray-400" : "text-gray-300"} mt-8 text-xs`}
        >
          &copy; {new Date().getFullYear()} Ministry of Innovation and
          Technology – Ethiopia
        </footer>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div
        className={`flex w-full lg:flex-1 justify-center items-center ${
          dark ? "bg-gray-900" : " bg-blue-900"
        }`}
      >
        <div
          className={`relative w-90 max-w-md p-8 rounded-xl shadow-lg border transition duration-300 ${
            dark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex flex-col items-center space-y-4 mt-4">
            <img
              src={exampleImage}
              alt="logo"
              className="w-16 h-16 rounded-full border border-purple-300"
            />
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Welcome back, login to continue
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded border focus:ring-2 transition ${
                  dark
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-400"
                    : "bg-white text-gray-800 border-gray-300 focus:ring-purple-400"
                }`}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded border focus:ring-2 transition ${
                  dark
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-purple-400"
                    : "bg-white text-gray-800 border-gray-300 focus:ring-purple-400"
                }`}
                placeholder="********"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="text-purple-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;