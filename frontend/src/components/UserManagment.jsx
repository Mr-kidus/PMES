import React, { useState, useEffect } from "react";
import axios from "axios";
import AddUser from "./AddUserForm";
import ViewUsers from "./ViewUsers";
import PasswordManager from "./PasswordManager";
import useThemeStore from "../store/themeStore";

const BASE_URL = "http://localhost:1221";

const tabs = [
  { label: "Add User", key: "add" },
  { label: "View Users", key: "view" },
  { label: "Password Manager", key: "password" },
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    role: "",
    sector: "",
    subsector: "",
    password: "",
    confirmPassword: "",
  });
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("add");

  const dark = useThemeStore((state) => state.dark);
  const textColor = dark
    ? "oklch(0.98 0.005 256.848)"
    : "oklch(0.278 0.033 256.848)";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/get-users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (
      !addForm.fullName ||
      !addForm.email ||
      !addForm.role ||
      !addForm.password ||
      addForm.password !== addForm.confirmPassword
    ) {
      setAddError("Please fill all fields and make sure passwords match.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/users/create`, addForm);
      setAddSuccess("User added!");
      setAddForm({
        fullName: "",
        email: "",
        role: "",
        sector: "",
        subsector: "",
        password: "",
        confirmPassword: "",
      });
      fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.message || "Error adding user");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
        User Management
      </h2>

      {/* Tabs */}
      <nav className="flex border-b border-gray-200 mb-6 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 -mb-px font-semibold border-b-4 transition duration-300
              ${
                activeTab === tab.key
                  ? "border-[#F36F21]"
                  : "border-transparent hover:text-[#F36F21]"
              }`}
            style={{ color: textColor }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <div
        className={`rounded-lg p-4 shadow-sm border ${
          dark ? "bg-gray-900 border-gray-700" : "bg-white border-orange-100"
        }`}
      >
        {activeTab === "add" && (
          <AddUser
            form={addForm}
            onChange={handleAddChange}
            onSubmit={handleAddUser}
            error={addError}
            success={addSuccess}
          />
        )}
        {activeTab === "view" && <ViewUsers />}
        {activeTab === "password" && <PasswordManager />}
      </div>
    </div>
  );
}

export default UserManagement;
