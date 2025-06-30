import { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../store/themeStore";

const backendUrl = "http://localhost:1221";

const AddUser = () => {
  const { dark } = useThemeStore();

  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    sector: "",
    subsector: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [useSector, setUseSector] = useState(false);
  const [useSubsector, setUseSubsector] = useState(false);

  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [filteredSubsectors, setFilteredSubsectors] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDropdownData = async () => {
    try {
      const [sectorRes, subsectorRes] = await Promise.all([
        axios.get(`${backendUrl}/api/sector/get-sector`),
        axios.get(`${backendUrl}/api/subsector/get-subsector`),
      ]);
      setSectors(sectorRes.data?.data || []);
      setSubsectors(subsectorRes.data || []);
    } catch (error) {
      console.error("Failed to fetch sectors/subsectors:", error);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!useSector || !formData.sector) {
      setFilteredSubsectors([]);
      setFormData((prev) => ({ ...prev, subsector: "" }));
      setUseSubsector(false);
      return;
    }
    const filtered = subsectors.filter((sub) => {
      const sectorIdFromSub =
        typeof sub.sectorId === "object"
          ? sub.sectorId._id || sub.sectorId
          : sub.sectorId;
      return sectorIdFromSub === formData.sector;
    });
    setFilteredSubsectors(filtered);
    if (!filtered.find((sub) => sub._id === formData.subsector)) {
      setFormData((prev) => ({ ...prev, subsector: "" }));
      setUseSubsector(false);
    }
  }, [formData.sector, subsectors, useSector]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (id === "useSector") {
        setUseSector(checked);
        if (!checked) {
          setFormData((prev) => ({ ...prev, sector: "", subsector: "" }));
          setUseSubsector(false);
        }
      } else if (id === "useSubsector") {
        setUseSubsector(checked);
        if (!checked) {
          setFormData((prev) => ({ ...prev, subsector: "" }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
    setErrorMsg("");
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim()) return setErrorMsg("Please enter full name.");
    if (!formData.role) return setErrorMsg("Please select a role.");
    if (!formData.email) return setErrorMsg("Please enter an email.");
    if (!isValidEmail(formData.email)) return setErrorMsg("Enter a valid email.");
    if (!formData.password) return setErrorMsg("Please enter a password.");
    if (!isStrongPassword(formData.password))
  return setErrorMsg("Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
    if (formData.password !== formData.confirmPassword) return setErrorMsg("Passwords do not match.");
    if (useSector && !formData.sector) return setErrorMsg("Select a sector or uncheck sector option.");
    if (useSubsector && !formData.subsector) return setErrorMsg("Select a subsector or uncheck subsector option.");

    const payload = {
      fullName: formData.fullName,
      role: formData.role,
      email: formData.email,
      password: formData.password,
      sector: useSector ? formData.sector || null : null,
      subsector: useSubsector ? formData.subsector || null : null,
    };

    try {
      await axios.post(`${backendUrl}/api/users/create`, payload);
      alert("User created successfully!");
      setFormData({
        fullName: "",
        role: "",
        sector: "",
        subsector: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setUseSector(false);
      setUseSubsector(false);
    } catch (error) {
      console.error("User creation failed:", error);
      setErrorMsg(error.response?.data?.error || "Server error occurred.");
    }
  };

  return (
    <div
      className={`mb-8 p-6 rounded shadow-sm border ${
        dark ? "bg-[#1f2937] border-gray-700 text-[#F9FAFB]" : "bg-white border-orange-100 text-[#1F2937]"
      }`}
    >
      <h2 className="text-2xl font-semibold mb-6">Add User</h2>

      <form onSubmit={handleSubmit}>
        {[
          { id: "fullName", label: "Full Name", type: "text", placeholder: "Full Name" },
          { id: "email", label: "Email", type: "email", placeholder: "user@example.com" },
          { id: "password", label: "Password", type: "password" },
          { id: "confirmPassword", label: "Confirm Password", type: "password" },
        ].map(({ id, label, type, placeholder }) => (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block mb-1 font-medium">
              {label}
            </label>
            <input
              id={id}
              type={type}
              value={formData[id]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              className={`w-full rounded-md px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-[#F36F21] ${
                dark
                  ? "bg-gray-800 text-gray-100 border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
          </div>
        ))}

        <div className="mb-4">
          <label htmlFor="role" className="block mb-1 font-medium">
            Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={`w-full rounded-md px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-[#F36F21] ${
              dark
                ? "bg-gray-800 text-gray-100 border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          >
            <option value="">Select Role</option>
            <option value="Chief CEO">Chief CEO</option>
            <option value="CEO">CEO</option>
            <option value="Worker">Worker</option>
            <option value="System Admin">System Admin</option>
            <option value="Minister">Minister</option>
            <option value="Strategic Unit">Strategic Unit</option>
          </select>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <input
            type="checkbox"
            id="useSector"
            checked={useSector}
            onChange={handleChange}
            className="form-checkbox text-[#F36F21]"
          />
          <label htmlFor="useSector" className="font-medium">
            Assign Sector
          </label>
        </div>

        <div className="mb-4">
          <label
            htmlFor="sector"
            className={`block mb-1 font-medium ${
              !useSector ? "text-gray-400 dark:text-gray-600" : ""
            }`}
          >
            Sector
          </label>
          <select
            id="sector"
            value={formData.sector}
            onChange={handleChange}
            disabled={!useSector}
            className={`w-full rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F36F21] ${
              useSector
                ? dark
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "bg-white text-gray-900 border border-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-gray-700 dark:text-gray-600"
            }`}
          >
            <option value="">Select Sector</option>
            {sectors.map((sec) => (
              <option key={sec._id} value={sec._id}>
                {sec.sector_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <input
            type="checkbox"
            id="useSubsector"
            checked={useSubsector}
            onChange={handleChange}
            disabled={!useSector}
            className="form-checkbox text-[#F36F21]"
          />
          <label
            htmlFor="useSubsector"
            className={`font-medium ${
              !useSector ? "text-gray-400 dark:text-gray-600" : ""
            }`}
          >
            Assign Subsector
          </label>
        </div>

        <div className="mb-4">
          <label
            htmlFor="subsector"
            className={`block mb-1 font-medium ${
              !useSubsector || !useSector ? "text-gray-400 dark:text-gray-600" : ""
            }`}
          >
            Subsector
          </label>
          <select
            id="subsector"
            value={formData.subsector}
            onChange={handleChange}
            disabled={!useSubsector || !useSector}
            className={`w-full rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F36F21] ${
              useSubsector && useSector
                ? dark
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "bg-white text-gray-900 border border-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-gray-700 dark:text-gray-600"
            }`}
          >
            <option value="">Select Subsector</option>
            {filteredSubsectors.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subsector_name}
              </option>
            ))}
          </select>
        </div>

        {errorMsg && (
          <div className="mb-4 text-red-600 dark:text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="rounded bg-[#F36F21] px-6 py-2 font-semibold text-white hover:bg-[#e05e1d] transition focus:outline-none focus:ring-2 focus:ring-[#F36F21]"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
