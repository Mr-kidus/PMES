import { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useThemeStore from "../store/themeStore";

const backendUrl = "http://localhost:1221";
const ROWS_PER_PAGE = 10;

export default function ViewUsers() {
  const dark = useThemeStore((state) => state.dark);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [filteredSubsectors, setFilteredSubsectors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAll = async () => {
    try {
      const [usersRes, sectorRes, subsectorRes] = await Promise.all([
        axios.get(`${backendUrl}/api/users/get-users`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/sector/get-sector`),
        axios.get(`${backendUrl}/api/subsector/get-subsector`),
      ]);
      setUsers(usersRes.data);
      setSectors(sectorRes.data?.data || []);
      setSubsectors(subsectorRes.data || []);
    } catch {
      setUsers([]);
      setSectors([]);
      setSubsectors([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!editData.sector) {
      setFilteredSubsectors([]);
      return;
    }
    const filtered = subsectors.filter((sub) => {
      if (!sub.sectorId) return false;
      const sectorIdFromSub =
        typeof sub.sectorId === "object"
          ? sub.sectorId._id || sub.sectorId
          : sub.sectorId;
      return sectorIdFromSub === editData.sector;
    });
    setFilteredSubsectors(filtered);
  }, [editData.sector, subsectors, editingId]);

  const filtered = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleEdit = (user) => {
    setEditingId(user._id);
    setEditData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      sector: user.sector?._id || "",
      subsector: user.subsector?._id || "",
    });
  };

  const handleSave = async (userId) => {
    try {
      await axios.put(
        `${backendUrl}/api/users/update-user/${userId}`,
        editData,
        { withCredentials: true }
      );
      setEditingId(null);
      setEditData({});
      fetchAll();
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "sector" ? { subsector: "" } : {}),
    }));
  };

  const exportToExcel = (all = false) => {
    const data = (all ? filtered : paginated).map((u) => ({
      Name: u.fullName,
      Email: u.email,
      Role: u.role,
      Sector: u.sector?.sector_name || "",
      Subsector: u.subsector?.subsector_name || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "users.xlsx");
  };

  const exportToPDF = (all = false) => {
    const doc = new jsPDF();
    const data = (all ? filtered : paginated).map((u) => [
      u.fullName,
      u.email,
      u.role,
      u.sector?.sector_name || "",
      u.subsector?.subsector_name || "",
    ]);
    autoTable(doc, {
      head: [["Name", "Email", "Role", "Sector", "Subsector"]],
      body: data,
    });
    doc.save("users.pdf");
  };

  return (
    <div
      className={`relative min-h-[80vh] p-6 max-w-6xl mx-auto rounded-xl
        border ${
          dark ? "border-gray-700 bg-gray-800 text-[#F36F21]" : "border-gray-300 bg-white text-[#0D2A5C]"
        } shadow-lg`}
    >
      {/* Search & Export */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className={`w-full md:w-1/3 px-4 py-2 rounded border focus:outline-none transition
            ${
              dark
                ? "bg-gray-900 border-[#F36F21] placeholder-[#F36F21] text-[#F36F21] focus:border-orange-500"
                : "bg-white border-[#0D2A5C] placeholder-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
            }`}
        />

        <div className="flex gap-3">
          {[
            {
              onClick: () => exportToExcel(false),
              icon: <FaFileExcel className="text-green-600" size={20} />,
              label: "Export current page to Excel",
              border: dark ? "border-green-600" : "border-green-600",
            },
            {
              onClick: () => exportToExcel(true),
              icon: <FaFileExcel className="text-green-700" size={20} />,
              label: "Export all users to Excel",
              border: dark ? "border-green-700" : "border-green-700",
            },
            {
              onClick: () => exportToPDF(false),
              icon: <FaFilePdf className="text-red-600" size={20} />,
              label: "Export current page to PDF",
              border: dark ? "border-red-600" : "border-red-600",
            },
            {
              onClick: () => exportToPDF(true),
              icon: <FaFilePdf className="text-red-700" size={20} />,
              label: "Export all users to PDF",
              border: dark ? "border-red-700" : "border-red-700",
            },
          ].map(({ onClick, icon, label, border }, i) => (
            <div className="relative group" key={i}>
              <button
                onClick={onClick}
                className={`flex items-center px-3 py-2 rounded border transition
                  ${border}
                  ${dark ? "bg-gray-900 hover:bg-gray-700" : "bg-white hover:bg-gray-100"}`}
                aria-label={label}
                title={label}
              >
                {icon}
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-transparent dark:border-gray-700">
        <table className="w-full text-sm border-collapse">
          <thead
            className={`${dark ? "bg-gray-900 text-[#F36F21]" : "bg-[#0D2A5C] text-white"}`}
          >
            <tr>
              {["Name", "Email", "Role", "Sector", "Subsector", "Actions"].map((header) => (
                <th key={header} className="p-3 border border-gray-300 dark:border-gray-700 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className={`text-center py-6 ${
                    dark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No users found.
                </td>
              </tr>
            )}

            {paginated.map((u) =>
              editingId === u._id ? (
                <tr
                  key={u._id}
                  className={`bg-yellow-50 dark:bg-yellow-900 text-sm transition-colors duration-300`}
                >
                  {/* Editable Inputs */}
                  {[
                    {
                      name: "fullName",
                      value: editData.fullName,
                    },
                    {
                      name: "email",
                      value: editData.email,
                    },
                  ].map(({ name, value }) => (
                    <td key={name} className="p-2 border border-gray-300 dark:border-gray-700">
                      <input
                        name={name}
                        value={value}
                        onChange={handleEditChange}
                        className={`w-full px-2 py-1 rounded border focus:outline-none transition
                          ${
                            dark
                              ? "bg-gray-900 border-[#F36F21] text-[#F36F21] focus:border-orange-500"
                              : "bg-white border-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
                          }`}
                      />
                    </td>
                  ))}
                  <td className="p-2 border border-gray-300 dark:border-gray-700">
                    <select
                      name="role"
                      value={editData.role}
                      onChange={handleEditChange}
                      className={`w-full px-2 py-1 rounded border focus:outline-none transition
                        ${
                          dark
                            ? "bg-gray-900 border-[#F36F21] text-[#F36F21] focus:border-orange-500"
                            : "bg-white border-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
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
                  </td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700">
                    <select
                      name="sector"
                      value={editData.sector}
                      onChange={handleEditChange}
                      className={`w-full px-2 py-1 rounded border focus:outline-none transition
                        ${
                          dark
                            ? "bg-gray-900 border-[#F36F21] text-[#F36F21] focus:border-orange-500"
                            : "bg-white border-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
                        }`}
                    >
                      <option value="">Select Sector</option>
                      {sectors.map((sec) => (
                        <option key={sec._id} value={sec._id}>
                          {sec.sector_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700">
                    <select
                      name="subsector"
                      value={editData.subsector}
                      onChange={handleEditChange}
                      className={`w-full px-2 py-1 rounded border focus:outline-none transition
                        ${
                          dark
                            ? "bg-gray-900 border-[#F36F21] text-[#F36F21] focus:border-orange-500"
                            : "bg-white border-[#0D2A5C] text-[#0D2A5C] focus:border-blue-700"
                        }`}
                    >
                      <option value="">Select Subsector</option>
                      {filteredSubsectors.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.subsector_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700 whitespace-nowrap">
                    <button
                      onClick={() => handleSave(u._id)}
                      className="mr-2 text-green-600 hover:text-green-800 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-500 hover:text-gray-700 transition"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr
                  key={u._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="p-3 border border-gray-300 dark:border-gray-700">{u.fullName}</td>
                  <td className="p-3 border border-gray-300 dark:border-gray-700">{u.email}</td>
                  <td className="p-3 border border-gray-300 dark:border-gray-700">{u.role}</td>
                  <td className="p-3 border border-gray-300 dark:border-gray-700">{u.sector?.sector_name || ""}</td>
                  <td className="p-3 border border-gray-300 dark:border-gray-700">{u.subsector?.subsector_name || ""}</td>
                  <td className="p-3 border border-gray-300 dark:border-gray-700 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(u)}
                      className={`text-blue-600 hover:text-blue-800 transition font-semibold`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded border transition
              ${
                dark
                  ? "border-[#F36F21] text-[#F36F21] disabled:opacity-40 hover:bg-[#F36F21] hover:text-gray-900"
                  : "border-[#0D2A5C] text-[#0D2A5C] disabled:opacity-40 hover:bg-[#0D2A5C] hover:text-white"
              }`}
          >
            Prev
          </button>
          <span className="text-sm font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded border transition
              ${
                dark
                  ? "border-[#F36F21] text-[#F36F21] disabled:opacity-40 hover:bg-[#F36F21] hover:text-gray-900"
                  : "border-[#0D2A5C] text-[#0D2A5C] disabled:opacity-40 hover:bg-[#0D2A5C] hover:text-white"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
