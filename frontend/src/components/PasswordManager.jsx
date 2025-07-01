import { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../store/themeStore";

const backendUrl = "https://pmes-gimp.onrender.com";

export default function PasswordManager() {
  const dark = useThemeStore((state) => state.dark);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/users/get-users`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  const handleUpdatePassword = async () => {
    setMessage("");
    if (!newPassword || !confirmPassword) {
      setMessage("Please enter and confirm the new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
  setMessage("Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
  return;
}
    try {
      await axios.put(
        `${backendUrl}/api/users/update-password/${selectedUser._id}`,
        { password: newPassword },
        { withCredentials: true }
      );
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage("Failed to update password.");
    }
  };

  return (
    <div
      className={`max-w-3xl mx-auto p-6 rounded-xl border shadow-md
        ${
          dark
            ? "bg-gray-900 border-gray-700 text-[#F36F21]"
            : "bg-white border-orange-100 text-[#0D2A5C]"
        }`}
    >
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search user by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full px-4 py-2 rounded border focus:outline-none transition
            ${
              dark
                ? "bg-gray-900 border-[#F36F21] placeholder-[#F36F21] text-[#F36F21] focus:border-orange-500"
                : "bg-white border-[#0D2A5C] placeholder-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
            }`}
          aria-label="Search users"
        />
      </div>

      {/* User List */}
      {!selectedUser && (
        <div
          className={`space-y-3 max-h-64 overflow-y-auto rounded-lg
            ${dark ? "scrollbar-thin scrollbar-thumb-[#F36F21]/70 scrollbar-track-gray-900" : "scrollbar-thin scrollbar-thumb-[#0D2A5C]/70 scrollbar-track-white"}`}
        >
          {filtered.slice(0, 10).map((u) => (
            <button
              key={u._id}
              onClick={() => handleSelectUser(u)}
              className={`w-full flex justify-between items-center p-4 rounded-lg
                transition-colors duration-200
                ${
                  dark
                    ? "bg-gray-800 text-[#F36F21] hover:bg-[#F36F21]/20"
                    : "bg-white text-[#0D2A5C] hover:bg-[#0D2A5C]/10"
                }`}
              type="button"
              aria-label={`Select user ${u.fullName}`}
            >
              <div className="text-left">
                <div className="font-semibold text-base">{u.fullName}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{u.email}</div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{u.role}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className={`text-center py-8 text-sm ${
              dark ? "text-gray-500" : "text-gray-500"
            }`}>
              No users found.
            </div>
          )}
        </div>
      )}

      {/* User Card & Password Update */}
      {selectedUser && (
        <section
          aria-label={`Update password for ${selectedUser.fullName}`}
          className={`mt-6 rounded-xl p-6 border shadow-md
            ${
              dark
                ? "bg-gray-800 border-gray-700 text-[#F36F21]"
                : "bg-white border-orange-100 text-[#0D2A5C]"
            }`}
        >
          <h2 className="text-2xl font-bold mb-2">{selectedUser.fullName}</h2>
          <p className="mb-1 text-sm text-gray-400 dark:text-gray-300">{selectedUser.email}</p>
          <p className="mb-1 text-sm text-gray-400 dark:text-gray-300">Role: {selectedUser.role}</p>
          <p className="mb-1 text-sm text-gray-400 dark:text-gray-300">
            Sector: {selectedUser.sector?.sector_name || "-"}
          </p>
          <p className="mb-6 text-sm text-gray-400 dark:text-gray-300">
            Subsector: {selectedUser.subsector?.subsector_name || "-"}
          </p>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded border focus:outline-none transition
                ${
                  dark
                    ? "bg-gray-900 border-[#F36F21] placeholder-[#F36F21] text-[#F36F21] focus:border-orange-500"
                    : "bg-white border-[#0D2A5C] placeholder-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
                }`}
              aria-label="New password"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded border focus:outline-none transition
                ${
                  dark
                    ? "bg-gray-900 border-[#F36F21] placeholder-[#F36F21] text-[#F36F21] focus:border-orange-500"
                    : "bg-white border-[#0D2A5C] placeholder-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
                }`}
              aria-label="Confirm new password"
            />
          </div>

          {message && (
            <p
              className={`mt-4 text-sm ${
                message.toLowerCase().includes("success")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
              role="alert"
            >
              {message}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdatePassword}
              className="flex-1 bg-[#F36F21] text-white py-3 rounded-lg hover:bg-[#e05e1d] transition"
              type="button"
            >
              Update Password
            </button>
            <button
              onClick={() => setSelectedUser(null)}
              className={`flex-1 py-3 rounded-lg border transition
                ${
                  dark
                    ? "border-[#F36F21] text-[#F36F21] hover:bg-[#F36F21] hover:text-gray-900"
                    : "border-[#0D2A5C] text-[#0D2A5C] hover:bg-[#0D2A5C] hover:text-white"
                }`}
              type="button"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
