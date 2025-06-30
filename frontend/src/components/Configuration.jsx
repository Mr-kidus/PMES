import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useThemeStore from "../store/themeStore"; // adjust path if needed

const backendUrl = "http://localhost:1221";

export default function SectorSubsectorConfig() {
  const dark = useThemeStore((state) => state.dark);

  const [activeTab, setActiveTab] = useState("addSector"); // addSector | addSubsector | viewAll

  // Sector states
  const [sectors, setSectors] = useState([]);
  const [loadingSector, setLoadingSector] = useState(false);
  const [editingSector, setEditingSector] = useState(null);

  // Subsector states
  const [subsectors, setSubsectors] = useState([]);
  const [loadingSubsector, setLoadingSubsector] = useState(false);
  const [editingSubsector, setEditingSubsector] = useState(null);

  // Fetch sectors and subsectors
  const fetchAll = async () => {
    try {
      const [sectorRes, subsectorRes] = await Promise.all([
        axios.get(`${backendUrl}/api/sector/get-sector`),
        axios.get(`${backendUrl}/api/subsector/get-subsector`),
      ]);
      setSectors(sectorRes.data.data || []);
      setSubsectors(subsectorRes.data.data || subsectorRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Sector handlers ---

  const handleSectorSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.sectorName.value.trim();
    if (!name) return alert("Please enter sector name");

    setLoadingSector(true);
    try {
      if (editingSector) {
        await axios.put(`${backendUrl}/api/sector/update-sector/${editingSector._id}`, {
          sector_name: name,
        });
        alert("Sector updated!");
      } else {
        await axios.post(`${backendUrl}/api/sector/add-sector`, { sector_name: name });
        alert("Sector added!");
      }
      e.target.reset();
      setEditingSector(null);
      fetchAll();
      setActiveTab("viewAll");
    } catch (err) {
      alert("Error saving sector");
      console.error(err);
    } finally {
      setLoadingSector(false);
    }
  };

  const handleSectorDelete = async (id) => {
    if (!window.confirm("Delete this sector?")) return;
    try {
      await axios.delete(`${backendUrl}/api/sector/delete-sector/${id}`);
      alert("Sector deleted!");
      fetchAll();
    } catch (err) {
      alert("Error deleting sector");
      console.error(err);
    }
  };

  // --- Subsector handlers ---

  const handleSubsectorSubmit = async (e) => {
    e.preventDefault();
    const subsectorName = e.target.subsectorName.value.trim();
    const sectorId = e.target.sector.value;
    if (!sectorId) return alert("Please select a sector");
    if (!subsectorName) return alert("Please enter subsector name");

    setLoadingSubsector(true);
    try {
      if (editingSubsector) {
        await axios.put(`${backendUrl}/api/subsector/update-subsector/${editingSubsector._id}`, {
          subsector_name: subsectorName,
          sectorId,
        });
        alert("Subsector updated!");
      } else {
        await axios.post(`${backendUrl}/api/subsector/add-subsector`, {
          subsector_name: subsectorName,
          sectorId,
        });
        alert("Subsector added!");
      }
      e.target.reset();
      setEditingSubsector(null);
      fetchAll();
      setActiveTab("viewAll");
    } catch (err) {
      alert("Error saving subsector");
      console.error(err);
    } finally {
      setLoadingSubsector(false);
    }
  };

  const handleSubsectorDelete = async (id) => {
    if (!window.confirm("Delete this subsector?")) return;
    try {
      await axios.delete(`${backendUrl}/api/subsector/delete-subsector/${id}`);
      alert("Subsector deleted!");
      fetchAll();
    } catch (err) {
      alert("Error deleting subsector");
      console.error(err);
    }
  };

  // Export helpers

  const exportExcel = () => {
    const combinedData = [
      ...sectors.map(({ _id, sector_name }) => ({
        Type: "Sector",
        Name: sector_name,
        RelatedSector: "-",
      })),
      ...subsectors.map(({ _id, subsector_name, sectorId }) => ({
        Type: "Subsector",
        Name: subsector_name,
        RelatedSector: sectorId?.sector_name || "N/A",
      })),
    ];
    const ws = XLSX.utils.json_to_sheet(combinedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sectors & Subsectors");
    XLSX.writeFile(wb, "sectors_subsectors.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sectors & Subsectors List", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Type", "Name", "Sector"]],
      body: [
        ...sectors.map(({ sector_name }) => ["Sector", sector_name, "-"]),
        ...subsectors.map(({ subsector_name, sectorId }) => [
          "Subsector",
          subsector_name,
          sectorId?.sector_name || "N/A",
        ]),
      ],
    });
    doc.save("sectors_subsectors.pdf");
  };

  // MINT colors
  const mintBlue = dark ? "#A3AED0" : "#040613"; // lighter blue in dark mode
  const mintOrange = "#F36F21";

  // Common transition classes
  const transitionClasses = "transition-colors duration-300 ease-in-out";

  return (
    <div
      className={`max-w-7xl mx-auto p-6 space-y-8 rounded-md ${
        dark ? "bg-gray-900 text-gray-100" : "bg-white text-[#040613]"
      } ${transitionClasses}`}
    >
      <h1
        className={`text-4xl font-bold mb-6 border-b-4 pb-1 ${transitionClasses}`}
        style={{
          color: mintBlue,
          borderBottomColor: mintOrange,
        }}
      >
        Sector & Subsector Configuration
      </h1>

      <div className={`flex space-x-4 border-b mb-6 ${dark ? "border-gray-700" : "border-gray-300"} ${transitionClasses}`}>
        {["addSector", "addSubsector", "viewAll"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setEditingSector(null);
              setEditingSubsector(null);
            }}
            className={`py-3 px-6 font-semibold rounded-t ${transitionClasses} ${
              activeTab === tab
                ? `bg-[${mintBlue}] text-white shadow-md`
                : `hover:bg-[${mintOrange}]/20 ${
                    dark ? "text-gray-300" : `text-[${mintBlue}]`
                  }`
            }`}
            style={{
              backgroundColor: activeTab === tab ? mintBlue : "transparent",
              color: activeTab === tab ? "white" : mintBlue,
            }}
          >
            {tab === "addSector"
              ? "Add Sector"
              : tab === "addSubsector"
              ? "Add Subsector"
              : "View All"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "addSector" && (
        <form
          onSubmit={handleSectorSubmit}
          className={`rounded shadow-md p-6 max-w-md space-y-4 ${
            dark ? "bg-gray-800" : "bg-white"
          } ${transitionClasses}`}
        >
          <label className="block font-semibold">
            Sector Name:
            <input
              type="text"
              name="sectorName"
              defaultValue={editingSector?.sector_name || ""}
              className={`mt-1 w-full p-2 rounded border focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-[#A3AED0]"
                  : "bg-white border-gray-300 text-[#040613] focus:ring-[#040613]"
              } ${transitionClasses}`}
              disabled={loadingSector}
              required
              autoComplete="off"
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loadingSector}
              className={`font-semibold py-2 px-6 rounded transition ${
                dark
                  ? "bg-[#A3AED0] hover:bg-[#8091bc] text-gray-900"
                  : "bg-[#040613] hover:bg-[#003B82] text-white"
              }`}
            >
              {loadingSector ? "Saving..." : editingSector ? "Update Sector" : "Add Sector"}
            </button>
            {editingSector && (
              <button
                type="button"
                onClick={() => setEditingSector(null)}
                className={`hover:underline ${
                  dark ? "text-[#F36F21]" : "text-[#F36F21]"
                }`}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {activeTab === "addSubsector" && (
        <form
          onSubmit={handleSubsectorSubmit}
          className={`rounded shadow-md p-6 max-w-md space-y-4 ${
            dark ? "bg-gray-800" : "bg-white"
          } ${transitionClasses}`}
        >
          <label className="block font-semibold">
            Sector:
            <select
              name="sector"
              defaultValue={editingSubsector?.sectorId?._id || ""}
              className={`mt-1 w-full p-2 rounded border focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-[#A3AED0]"
                  : "bg-white border-gray-300 text-[#040613] focus:ring-[#040613]"
              } ${transitionClasses}`}
              disabled={loadingSubsector}
              required
            >
              <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
                Select a sector
              </option>
              {sectors.map(({ _id, sector_name }) => (
                <option
                  key={_id}
                  value={_id}
                  className={dark ? "text-gray-100" : "text-[#040613]"}
                >
                  {sector_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block font-semibold">
            Subsector Name:
            <input
              type="text"
              name="subsectorName"
              defaultValue={editingSubsector?.subsector_name || ""}
              className={`mt-1 w-full p-2 rounded border focus:outline-none focus:ring-2 ${
                dark
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-[#A3AED0]"
                  : "bg-white border-gray-300 text-[#040613] focus:ring-[#040613]"
              } ${transitionClasses}`}
              disabled={loadingSubsector}
              required
              autoComplete="off"
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loadingSubsector}
              className={`font-semibold py-2 px-6 rounded transition ${
                dark
                  ? "bg-[#A3AED0] hover:bg-[#8091bc] text-gray-900"
                  : "bg-[#040613] hover:bg-[#003B82] text-white"
              }`}
            >
              {loadingSubsector
                ? "Saving..."
                : editingSubsector
                ? "Update Subsector"
                : "Add Subsector"}
            </button>
            {editingSubsector && (
              <button
                type="button"
                onClick={() => setEditingSubsector(null)}
                className={`hover:underline ${
                  dark ? "text-[#F36F21]" : "text-[#F36F21]"
                }`}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {activeTab === "viewAll" && (
        <>
          <div className="flex justify-end mb-4 gap-2 max-w-md">
            <button
              onClick={exportExcel}
              className={`px-4 py-2 rounded shadow-md font-semibold transition-colors ${
                dark
                  ? "bg-[#A3AED0] hover:bg-[#8091bc] text-gray-900"
                  : "bg-[#040613] hover:bg-[#003B82] text-white"
              }`}
            >
              Export Excel
            </button>
            <button
              onClick={exportPDF}
              className={`px-4 py-2 rounded shadow-md font-semibold transition-colors ${
                dark
                  ? "bg-[#F36F21] hover:bg-[#c75a17] text-white"
                  : "bg-[#F36F21] hover:bg-[#c75a17] text-white"
              }`}
            >
              Export PDF
            </button>
          </div>

          <div
            className={`overflow-x-auto max-w-full rounded-md border shadow-sm ${
              dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
            } ${transitionClasses}`}
          >
            <table className="min-w-full text-left">
              <thead
                className={`text-white ${
                  dark ? "bg-[#A3AED0]" : "bg-[#040613]"
                } ${transitionClasses}`}
              >
                <tr>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Sector</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectors.length === 0 && subsectors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className={`text-center py-6 ${
                        dark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No sectors or subsectors found.
                    </td>
                  </tr>
                ) : (
                  <>
                    {sectors.map(({ _id, sector_name }) => (
                      <tr
                        key={`sector-${_id}`}
                        className={`border-b hover:bg-opacity-20 transition ${
                          dark
                            ? "border-gray-700 hover:bg-gray-700"
                            : "border-gray-200 hover:bg-gray-100"
                        } ${transitionClasses}`}
                      >
                        <td className={`py-3 px-6 font-semibold ${dark ? "text-[#A3AED0]" : "text-[#040613]"}`}>
                          Sector
                        </td>
                        <td className="py-3 px-6">{sector_name}</td>
                        <td className="py-3 px-6">-</td>
                        <td className="py-3 px-6 text-center space-x-3">
                          <button
                            onClick={() => {
                              setEditingSector({ _id, sector_name });
                              setActiveTab("addSector");
                            }}
                            className={`font-semibold transition-colors ${
                              dark
                                ? "text-[#A3AED0] hover:text-[#F36F21]"
                                : "text-[#040613] hover:text-[#F36F21]"
                            }`}
                            title="Edit Sector"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSectorDelete(_id)}
                            className={`font-semibold transition-colors ${
                              dark
                                ? "text-[#F36F21] hover:text-[#A3AED0]"
                                : "text-[#F36F21] hover:text-[#040613]"
                            }`}
                            title="Delete Sector"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subsectors.map(({ _id, subsector_name, sectorId }) => (
                      <tr
                        key={`subsector-${_id}`}
                        className={`border-b hover:bg-opacity-20 transition ${
                          dark
                            ? "border-gray-700 hover:bg-gray-700"
                            : "border-gray-200 hover:bg-gray-100"
                        } ${transitionClasses}`}
                      >
                        <td className="py-3 px-6 font-semibold text-[#F36F21]">Subsector</td>
                        <td className="py-3 px-6">{subsector_name}</td>
                        <td className="py-3 px-6">{sectorId?.sector_name || "N/A"}</td>
                        <td className="py-3 px-6 text-center space-x-3">
                          <button
                            onClick={() => {
                              setEditingSubsector({ _id, subsector_name, sectorId });
                              setActiveTab("addSubsector");
                            }}
                            className={`font-semibold transition-colors ${
                              dark
                                ? "text-[#A3AED0] hover:text-[#F36F21]"
                                : "text-[#040613] hover:text-[#F36F21]"
                            }`}
                            title="Edit Subsector"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSubsectorDelete(_id)}
                            className={`font-semibold transition-colors ${
                              dark
                                ? "text-[#F36F21] hover:text-[#A3AED0]"
                                : "text-[#F36F21] hover:text-[#040613]"
                            }`}
                            title="Delete Subsector"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
