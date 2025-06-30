import { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../../../store/themeStore"; // adjust path as needed

const backendUrl = "http://localhost:1221";

const KpiAssignment = () => {
  const dark = useThemeStore((state) => state.dark);

  const [formData, setFormData] = useState({
    sector: "",
    subsector: "",
    kra: "",
    kpi: "",
  });

  const [assignedKPIs, setAssignedKPIs] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [kras, setKras] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [filteredSubsectors, setFilteredSubsectors] = useState([]);
  const [filteredKpis, setFilteredKpis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDropdownData = async () => {
    try {
      const [sectorRes, subsectorRes, kraRes, kpiRes] = await Promise.all([
        axios.get(`${backendUrl}/api/sector/get-sector`),
        axios.get(`${backendUrl}/api/subsector/get-subsector`),
        axios.get(`${backendUrl}/api/kras2/get-kra2`),
        axios.get(`${backendUrl}/api/kpis2/all2`),
      ]);
      setSectors(sectorRes.data?.data || []);
      setSubsectors(subsectorRes.data || []);
      setKras(kraRes.data || []);
      setKpis(kpiRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    }
  };

  const fetchAssignedKPIs = async (sectorId) => {
    try {
      const res = sectorId
        ? await axios.get(`${backendUrl}/api/assign/sector/${sectorId}`)
        : await axios.get(`${backendUrl}/api/assign/assigned-kpi`);
      setAssignedKPIs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch assigned KPIs:", error);
      setAssignedKPIs([]);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchAssignedKPIs();
  }, []);

  useEffect(() => {
    if (!formData.sector) {
      setFilteredSubsectors([]);
      setFormData((prev) => ({ ...prev, subsector: "" }));
      fetchAssignedKPIs();
      return;
    }
    const filtered = subsectors.filter((sub) => {
      const subSectorId = typeof sub.sectorId === "object" ? sub.sectorId._id : sub.sectorId;
      return subSectorId === formData.sector;
    });
    setFilteredSubsectors(filtered);
    setFormData((prev) => ({ ...prev, subsector: "" }));
    fetchAssignedKPIs(formData.sector);
  }, [formData.sector, subsectors]);

  useEffect(() => {
    if (!formData.kra) {
      setFilteredKpis([]);
      setFormData((prev) => ({ ...prev, kpi: "" }));
      return;
    }
    const filtered = kpis.filter((kpi) => kpi.kra?.kra_id === formData.kra);
    setFilteredKpis(filtered);
  }, [formData.kra, kpis]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "sector") setFormData((prev) => ({ ...prev, subsector: "" }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.kra || !formData.kpi) {
      setErrorMsg("Please select both KRA and KPI.");
      return;
    }
    if (!formData.sector && !formData.subsector) {
      setErrorMsg("Please select either a Sector or a Subsector.");
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/assign/assign-kpi`, {
        sector: formData.subsector ? null : formData.sector || null,
        subsector: formData.subsector || null,
        kra: formData.kra,
        kpi: formData.kpi,
      });
      alert("KPI assigned successfully!");
      fetchAssignedKPIs(formData.sector || null);
      setFormData({ sector: "", subsector: "", kra: "", kpi: "" });
    } catch (error) {
      console.error("Failed to assign KPI:", error);
      if (error.response?.status === 409) {
        setErrorMsg("This KPI is already assigned to the selected Sector/Subsector.");
      } else {
        setErrorMsg(error.response?.data?.error || "Failed to assign KPI due to server error.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to unassign this KPI?")) return;

    try {
      await axios.delete(`${backendUrl}/api/assign/unassign-kpi/${id}`);
      alert("KPI unassigned successfully.");
      fetchAssignedKPIs(formData.sector || null);
    } catch (error) {
      console.error("Failed to unassign KPI:", error);
      alert("Failed to unassign KPI.");
    }
  };

  const filteredAssignedKPIs = assignedKPIs.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.kpiId?.kpi_name?.toLowerCase().includes(term) ||
      item.kraId?.kra_name?.toLowerCase().includes(term) ||
      item.sectorId?.sector_name?.toLowerCase().includes(term) ||
      item.subsectorId?.subsector_name?.toLowerCase().includes(term)
    );
  });

  const renderSelect = (id, label, options) => {
    let valueKey = "_id";
    let labelKey = label.toLowerCase().replace(" ", "_") + "_name";

    if (id === "kpi") valueKey = "kpi_id";

    const isDisabled = id === "subsector" && !formData.sector;

    // Dark mode style classes
    const selectBg = dark ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-[#040613] border-gray-300";
    const disabledBg = dark ? "bg-gray-600 cursor-not-allowed" : "bg-gray-100 cursor-not-allowed";

    return (
      <div className="flex flex-col mb-4">
        <label
          htmlFor={id}
          className={`mb-1 font-semibold ${dark ? "text-gray-100" : "text-[#040613]"}`}
        >
          {label}
          {id === "subsector" && " (Optional)"}
        </label>
        <select
          id={id}
          value={formData[id] || ""}
          onChange={handleChange}
          required={id === "kra" || id === "kpi"}
          disabled={isDisabled}
          className={`rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F36F21] border ${
            isDisabled ? disabledBg : selectBg
          }`}
        >
          <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
            {id === "subsector" && !formData.sector
              ? "Select Sector first"
              : `Select ${label}`}
          </option>
          {options.map((opt) => (
            <option
              key={opt[valueKey]}
              value={opt[valueKey]}
              className={dark ? "text-gray-100" : "text-[#040613]"}
            >
              {opt[labelKey]}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-6 rounded-xl shadow-md border transition-colors duration-300 ${
        dark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-blue-100 text-[#040613]"
      }`}
    >
      <h2 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-[#040613]"}`}>
        Assign KPI to Sector/Subsector
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        noValidate
      >
        {renderSelect("sector", "Sector", sectors)}
        {renderSelect("subsector", "Subsector", filteredSubsectors)}
        {renderSelect("kra", "KRA", kras)}
        {renderSelect("kpi", "KPI", filteredKpis)}

        {errorMsg && (
          <p
            className={`col-span-full text-sm font-semibold ${
              dark ? "text-red-400" : "text-red-600"
            }`}
            role="alert"
          >
            {errorMsg}
          </p>
        )}

        <div className="col-span-full">
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              dark ? "bg-[#F36F21] hover:bg-[#d97122]" : "bg-[#040613] hover:bg-[#00337C]"
            }`}
          >
            Assign KPI
          </button>
        </div>
      </form>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search assigned KPIs..."
          className={`w-full rounded-md px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-[#F36F21] transition-colors ${
            dark
              ? "bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400"
              : "bg-white text-[#040613] border-gray-300 placeholder-gray-600"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search assigned KPIs"
        />
      </div>

      <div
        className={`overflow-x-auto rounded-md border ${
          dark ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <table
          className={`min-w-full text-sm rounded transition-colors ${
            dark ? "text-gray-100" : "text-[#040613]"
          }`}
        >
          <thead className={`${dark ? "bg-[#F36F21]" : "bg-[#F36F21]"}`}>
            <tr>
              {["Sector", "Subsector", "KRA", "KPI", "Actions"].map((header) => (
                <th
                  key={header}
                  className="border px-4 py-2 text-left font-semibold"
                  scope="col"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssignedKPIs.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className={`text-center py-4 ${
                    dark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No assigned KPIs found.
                </td>
              </tr>
            ) : (
              filteredAssignedKPIs.map((item) => (
                <tr
                  key={item._id || item.id}
                  className={`hover:cursor-default transition-colors ${
                    dark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                >
                  <td className="border px-4 py-2">
                    {item.subsectorId
                      ? (() => {
                          const subObj = subsectors.find(
                            (sub) => sub._id === item.subsectorId._id
                          );
                          const secObj = subObj
                            ? sectors.find(
                                (sec) =>
                                  sec._id ===
                                  (typeof subObj.sectorId === "object"
                                    ? subObj.sectorId._id
                                    : subObj.sectorId)
                              )
                            : null;
                          return secObj?.sector_name || "-";
                        })()
                      : item.sectorId?.sector_name || "-"}
                  </td>
                  <td className="border px-4 py-2">{item.subsectorId?.subsector_name || "-"}</td>
                  <td className="border px-4 py-2">{item.kraId?.kra_name || "-"}</td>
                  <td className="border px-4 py-2">{item.kpiId?.kpi_name || "-"}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(item._id || item.id)}
                      className={`text-sm font-semibold underline transition-colors ${
                        dark ? "text-red-400 hover:text-red-500" : "text-red-600 hover:text-red-700"
                      }`}
                      aria-label={`Unassign KPI ${item.kpiId?.kpi_name || ""}`}
                      type="button"
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KpiAssignment;
