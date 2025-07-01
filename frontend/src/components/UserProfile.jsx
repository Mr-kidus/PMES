import React, { useEffect, useState } from "react";
import useAuthStore from "../store/auth.store";
import useThemeStore from "../store/themeStore";

const backendUrl = "https://pmes-gimp.onrender.com";

const UserProfile = () => {
  const dark = useThemeStore((s) => s.dark);
  const { user, updateProfile, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [subsector, setSubsector] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setSector(user.sector?.sector_name || "");
      setSubsector(user.subsector?.subsector_name || "");
      if (user.image) setProfileImage(user.image);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(file);
  };

  const saveChanges = async () => {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("sector", sector);
    formData.append("subsector", subsector);
    formData.append("image", profileImage);
    await updateProfile(formData);
    setActiveTab("view");
  };

  const handleChangePassword = async () => {
    setPasswordMessage("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setPasswordMessage("Please fill in all fields.");
    }
    if (newPassword !== confirmPassword) {
      return setPasswordMessage("New passwords do not match.");
    }
    if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
  setPasswordMessage("Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
  return;
}
    try {
      const res = await fetch(`${backendUrl}/api/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      setPasswordMessage(res.ok ? data.message || "Password changed successfully." : data.message || "Failed to change password.");
      if (res.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage("An unexpected error occurred.");
    }
  };

  const containerBg = dark ? "bg-gray-900 border-gray-700 text-white" : "bg-[rgba(13,42,92,0.08)] border-[rgba(13,42,92,0.1)] text-[#0D2A5C]";

  const tabBtnClass = (tab) =>
    `flex-grow text-center py-2 border-b-2 cursor-pointer transition ${
      activeTab === tab
        ? `border-[#040613] font-semibold text-[#040613]`
        : `border-transparent text-gray-500 hover:text-[#040613] hover:border-[#040613]`
    }`;

  return (
    <div className={`max-w-3xl mx-auto mt-10 p-6 rounded-lg shadow-md border ${containerBg}`}>
      <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${dark ? "text-white" : "text-[#0D2A5C]"}`}>
        👤 User Profile
      </h2>

      <div className={`flex mb-6 border-b ${dark ? "border-gray-700" : "border-gray-300"}`}>
        <button className={tabBtnClass("view")} onClick={() => setActiveTab("view")}>View Profile</button>
        <button className={tabBtnClass("edit")} onClick={() => setActiveTab("edit")}>Edit Profile</button>
        <button className={tabBtnClass("password")} onClick={() => setActiveTab("password")}>Change Password</button>
      </div>

      {activeTab === "view" && (
        <>
          <div className="flex items-center gap-6 mb-6">
            {profileImage ? (
              <img
                src={profileImage instanceof File ? URL.createObjectURL(profileImage) : profileImage}
                alt="Profile"
                className={`w-24 h-24 rounded-full object-cover border-2 shadow ${dark ? "border-[#F36F21]" : "border-[#0D2A5C]"}`}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border">
                No Image
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Full Name", fullName],
              ["Email", email],
              ["Sector", sector],
              ["Subsector", subsector],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-lg">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "edit" && (
        <>
          <div className="flex items-center gap-6 mb-6">
            {profileImage ? (
              <img
                src={profileImage instanceof File ? URL.createObjectURL(profileImage) : profileImage}
                alt="Profile"
                className={`w-24 h-24 rounded-full object-cover border-2 shadow ${dark ? "border-[#F36F21]" : "border-[#0D2A5C]"}`}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm border">
                No Image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm dark:text-gray-200 file:border-0 file:bg-[#F36F21] file:px-3 file:py-1 file:rounded file:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["fullName", fullName, setFullName, "Full Name"],
              ["email", email, setEmail, "Email"],
              ["sector", sector, setSector, "Sector"],
              ["subsector", subsector, setSubsector, "Subsector"],
            ].map(([name, val, setter, label]) => (
              <div key={name}>
                <label htmlFor={name} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                <input
                  type="text"
                  name={name}
                  id={name}
                  value={val}
                  onChange={e => setter(e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 ${
                    dark
                      ? "border-gray-600 bg-gray-800 text-white focus:ring-[#F36F21]"
                      : "border-gray-300 bg-white text-black focus:ring-[#F36F21]"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={saveChanges} disabled={isLoading}
              className={`px-6 py-2 rounded text-white ${dark ? "bg-[#F36F21] hover:bg-[#d97122]" : "bg-[#0D2A5C] hover:bg-[#0D1A3C]"}`}>
              {isLoading ? "Updating..." : "Save Changes"}
            </button>
            <button onClick={() => setActiveTab("view")}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
              Cancel
            </button>
          </div>
        </>
      )}

      {activeTab === "password" && (
        <div className="space-y-4 max-w-md">
          {["Current Password", "New Password", "Confirm New Password"].map((ph, i) => (
            <input
              key={ph}
              type="password"
              placeholder={ph}
              value={[oldPassword, newPassword, confirmPassword][i]}
              onChange={e => [setOldPassword, setNewPassword, setConfirmPassword][i](e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm ${
                dark ? "border-gray-600 bg-gray-800 text-white" : "border-gray-300 bg-white text-black"
              }`}
            />
          ))}
          {passwordMessage && (
            <div className={`text-sm ${passwordMessage.toLowerCase().includes("success") ? (dark ? "text-green-400" : "text-green-600") : (dark ? "text-red-400" : "text-red-600")}`}>
              {passwordMessage}
            </div>
          )}
          <button
            onClick={handleChangePassword}
            className={`px-6 py-2 rounded text-white ${dark ? "bg-[#F36F21] hover:bg-[#d97122]" : "bg-[#0D2A5C] hover:bg-[#00337A]"}`}
          >
            Update Password
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
