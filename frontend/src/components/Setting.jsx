import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import useAuthStore from "../store/auth.store";
import useThemeStore from "../store/themeStore";

const backendUrl = "http://localhost:1221";

const MintWatermark = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 mx-auto my-auto max-w-xs max-h-64 opacity-5 select-none"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ zIndex: 0, userSelect: "none" }}
  >
    <circle cx="100" cy="100" r="90" stroke="#2E2E2E" strokeWidth="3" />
    <circle cx="100" cy="100" r="65" stroke="#F36F21" strokeWidth="3" />
    <circle cx="100" cy="100" r="40" stroke="#2E2E2E" strokeWidth="3" />
    <path d="M100 30 L120 100 L80 100 Z" fill="#F36F21" opacity="0.4" />
  </svg>
);

function ToggleSwitch({ label, checked, onChange, dark }) {
  return (
    <label className="flex items-center cursor-pointer select-none text-sm space-x-3">
      <span className={`${dark ? "text-white" : "text-gray-800"} font-medium`}>{label}</span>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-300 ${
            checked ? "bg-[#F36F21]" : dark ? "bg-gray-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            checked
              ? dark
                ? "bg-gray-200 translate-x-5"
                : "bg-white translate-x-5"
              : dark
              ? "bg-gray-200 translate-x-0"
              : "bg-white translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);
  const toggleDark = useThemeStore((state) => state.toggleDark);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setProfileImage(user.image || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setProfileImage(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let imageUrl = profileImage;
      if (profileImage instanceof File) {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        const res = await axios.post(`${backendUrl}/api/user/upload-profile-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        imageUrl = res.data.imageUrl;
      }

      await updateProfile({ fullName, email, image: imageUrl });
      setMessage("✅ Profile updated successfully");
      setPreviewImage(null);
    } catch {
      setMessage("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/user/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setMessage("✅ Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen py-10 px-4 transition-colors duration-300 text-sm ${
        dark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <MintWatermark />

      <div
        className={`relative max-w-4xl mx-auto rounded-xl border p-6 space-y-10 shadow-md transition-colors duration-300 ${
          dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
        }`}
      >
        <h1 className="text-2xl font-bold">Settings</h1>

        {message && (
          <div
            className={`p-2 rounded font-medium max-w-xl text-sm ${
              message.startsWith("✅")
                ? dark
                  ? "bg-green-900 text-green-300"
                  : "bg-green-100 text-green-800"
                : dark
                ? "bg-red-900 text-red-300"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className={`relative w-24 h-24 rounded-full border-4 overflow-hidden ${
                  dark ? "border-[#F36F21]" : "border-[#0D2A5C]"
                }`}
              >
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
                ) : profileImage ? (
                  <img src={profileImage} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <FaUserCircle
                    className={`w-full h-full ${
                      dark ? "text-white" : "text-[#0D2A5C]"
                    }`}
                  />
                )}
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
              </div>
              <div className="flex-1 grid gap-4 w-full">
                <div>
                  <label className="block font-medium mb-1">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`w-full p-2 rounded border ${
                      dark ? "bg-gray-900 border-[#F36F21] text-white" : "bg-white border-[#0D2A5C] text-gray-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full p-2 rounded border ${
                      dark ? "bg-gray-900 border-[#F36F21] text-white" : "bg-white border-[#0D2A5C] text-gray-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Role</label>
                  <p
                    className={`p-2 rounded border ${
                      dark ? "bg-gray-800 border-[#F36F21] text-white" : "bg-gray-100 border-[#0D2A5C] text-gray-800"
                    }`}
                  >
                    {user?.role || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 rounded font-semibold text-sm transition ${
                dark
                  ? "bg-[#F36F21] hover:bg-orange-700 text-gray-900"
                  : "bg-[#0D2A5C] hover:bg-[#0D1A3C] text-white"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        <hr className={dark ? "border-gray-700" : "border-gray-300"} />

        {/* Security Section */}
        <section className="max-w-md">
          <h2 className="text-xl font-semibold mb-3">Security</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className={`w-full p-2 rounded border ${
                  dark ? "bg-gray-900 border-[#F36F21] text-white" : "bg-white border-[#0D2A5C] text-gray-800"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`w-full p-2 rounded border ${
                  dark ? "bg-gray-900 border-[#F36F21] text-white" : "bg-white border-[#0D2A5C] text-gray-800"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full p-2 rounded border ${
                  dark ? "bg-gray-900 border-[#F36F21] text-white" : "bg-white border-[#0D2A5C] text-gray-800"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 rounded font-semibold text-sm transition ${
                dark
                  ? "bg-[#F36F21] hover:bg-orange-700 text-gray-900"
                  : "bg-[#0D2A5C] hover:bg-[#0D1A3C] text-white"
              }`}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>

        <hr className={dark ? "border-gray-700" : "border-gray-300"} />

        {/* Preferences */}
        <section className="max-w-md space-y-4">
          <h2 className="text-xl font-semibold mb-3">Preferences</h2>
          <ToggleSwitch label="Enable Dark Mode" checked={dark} onChange={toggleDark} dark={dark} />
          <ToggleSwitch
            label="Email Notifications"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            dark={dark}
          />
          <ToggleSwitch
            label="Two-Factor Authentication"
            checked={twoFactorAuth}
            onChange={() => setTwoFactorAuth(!twoFactorAuth)}
            dark={dark}
          />
        </section>

        <div className="pt-4 max-w-md">
          <button
            onClick={logout}
            className="w-full px-4 py-2 rounded font-semibold text-sm bg-[#F36F21] hover:bg-gray-900 transition-colors text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
