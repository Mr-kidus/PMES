import { FaUser } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";
import useThemeStore from "../store/themeStore";

function ImageDropdown() {
  const [opendropDown, setOpenDropDown] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const myref = useRef();

  const dark = useThemeStore((state) => state.dark);
  const toggleDark = useThemeStore((state) => state.toggleDark);

  const getBasePath = (role) => {
    switch (role?.toLowerCase()) {
      case "system admin":
        return "/admin";
      case "chief ceo":
        return "/chief-ceo";
      case "ceo":
        return "/ceo";
      case "worker":
        return "/worker";
      case "minister":
        return "/minister";
      case "strategic unit":
        return "/strategic";
      default:
        return "";
    }
  };

  const basePath = getBasePath(user?.role);

  function toggleProfile() {
    setOpenDropDown((prev) => !prev);
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    setOpenDropDown(false);
    navigate("/");
    await logout();
  };

  return (
    <div className="relative w-10 h-10 rounded-full overflow-visible" ref={myref}>
      {user?.image ? (
        <img
          src={user.image}
          alt={user.fullName || "User profile"}
          className={`w-10 h-10 cursor-pointer object-cover rounded-full border-2 ${
            dark ? "border-gray-600" : "border-gray-300"
          }`}
          onClick={toggleProfile}
        />
      ) : (
        <div
          onClick={toggleProfile}
          className="w-10 h-10 cursor-pointer flex items-center justify-center bg-gray-600 dark:bg-gray-400 rounded-full text-white font-bold text-lg select-none"
          role="button"
          tabIndex={0}
        >
          <FaUser size={20} />
        </div>
      )}

      <div
        className={`absolute right-0 mt-2 w-64 rounded-md border shadow-lg z-[9999] transition-opacity duration-200
          ${
            dark
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-[rgba(13,42,92,0.85)]"
          }
          ${opendropDown ? "block" : "hidden"}
        `}
      >
        {/* Close X button */}
        <div className="flex justify-end px-3 pt-2">
          <button
            onClick={() => setOpenDropDown(false)}
            aria-label="Close dropdown"
            className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className={dark ? "text-gray-200" : "text-gray-600"} />
          </button>
        </div>

        <div
          className={`flex gap-4 border-b pb-2 px-5 pt-1 ${
            dark ? "border-gray-700" : "border-gray-200"
          } items-center`}
        >
          <div
            className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${
              dark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.fullName || "User profile"}
                className={`w-10 h-10 rounded-full object-cover border-2 ${
                  dark ? "border-gray-600" : "border-gray-300"
                }`}
              />
            ) : (
              <FaUser className={`w-10 h-10 ${dark ? "text-gray-200" : "text-gray-600"}`} />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h1
              className={`text-sm font-semibold ${
                dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"
              }`}
            >
              {user?.fullName || "No Name"}
            </h1>
            <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
              {user?.role || "No Role"}
            </p>
          </div>
        </div>

        <ul className="mt-2 px-5 pb-4">
          <Link to={`${basePath}/user-profile`} onClick={() => setOpenDropDown(false)}>
            <li
              className={`group flex items-center justify-between py-2 rounded cursor-pointer transition-colors
                ${
                  dark
                    ? "hover:bg-gray-700 hover:text-white text-gray-300"
                    : "hover:bg-orange-100 hover:text-[#F36F21] text-[rgba(13,42,92,0.85)]"
                }`}
            >
              <span className="flex items-center gap-2 font-medium text-xs">
                <FaUser className={dark ? "text-gray-300" : "text-[#0D2A5C]"} />
                Edit Profile
              </span>
              <ChevronRight
                className={`${
                  dark ? "text-gray-400 group-hover:text-white" : "text-gray-500 group-hover:text-[#F36F21]"
                }`}
              />
            </li>
          </Link>

          <Link to={`${basePath}/setting`} onClick={() => setOpenDropDown(false)}>
            <li
              className={`group flex items-center justify-between py-2 rounded cursor-pointer transition-colors
                ${
                  dark
                    ? "hover:bg-gray-700 hover:text-white text-gray-300"
                    : "hover:bg-orange-100 hover:text-[#F36F21] text-[rgba(13,42,92,0.85)]"
                }`}
            >
              <span className="flex items-center gap-2 font-medium text-xs">
                <IoMdSettings className={dark ? "text-gray-300" : "text-[#0D2A5C]"} />
                System Setting
              </span>
              <ChevronRight
                className={`${
                  dark ? "text-gray-400 group-hover:text-white" : "text-gray-500 group-hover:text-[#F36F21]"
                }`}
              />
            </li>
          </Link>

          {/* Dark mode toggle switch */}
          <li className="flex items-center justify-between py-2 px-2 cursor-pointer select-none">
            <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-[rgba(13,42,92,0.85)]"}`}>
              {dark ? "Dark Mode" : "Light Mode"}
            </span>
            <label htmlFor="toggleTheme" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggleTheme"
                className="sr-only"
                checked={dark}
                onChange={toggleDark}
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-300 ${
                  dark ? "bg-[#F36F21]" : "bg-gray-300"
                }`}
              />
              <div
                className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  dark ? "bg-gray-200 translate-x-5" : "bg-white translate-x-0"
                }`}
              />
            </label>
          </li>

          <li
            onClick={handleLogout}
            className="group flex items-center justify-center gap-2 py-2 rounded cursor-pointer transition-colors hover:bg-[#F36F21] hover:text-white"
          >
            <FiLogOut
              className="text-[#F36F21] group-hover:text-white"
              size={18}
            />
            <span className="text-[#F36F21] group-hover:text-white font-medium text-xs">
              Logout
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ImageDropdown;
