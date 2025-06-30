import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../store/auth.store";
import useThemeStore from "../store/themeStore";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

const BACKEND_PORT = 1221;
const backendUrl = `http://localhost:${BACKEND_PORT}`;

function getCurrentEthiopianYear() {
  return new Date().getFullYear() - 8;
}

function useSectors() {
  const [sectors, setSectors] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios.get(`${backendUrl}/api/sector/get-sector`)
      .then(res => setSectors(res.data.data || []))
      .catch(() => setError("Failed to load sectors"));
  }, []);
  return { sectors, error };
}

function useSubsectors() {
  const [subsectors, setSubsectors] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios.get(`${backendUrl}/api/subsector/get-subsector`)
      .then(res => setSubsectors(res.data.data || res.data || []))
      .catch(() => setError("Failed to load subsectors"));
  }, []);
  return { subsectors, error };
}

const Filter = ({
  year, setYear,
  quarter, setQuarter,
  sectors, sector, setSector,
  filteredSubsectors, subsector, setSubsector,
  statusFilter, setStatusFilter,
  onFilter, loading,
  hideSectorFilters
}) => {
  const dark = useThemeStore(s => s.dark);
  const input = dark ? "bg-gray-700 text-white border-gray-600" : "bg-white text-[#0D2A5C] border-gray-300";
  const label = dark ? "text-white" : "text-[#0D2A5C]";
  const hoverBtn = dark ? "hover:bg-[#F36F21]" : "hover:bg-orange-500";
  const base = dark ? "bg-[#1f2937] text-white" : "bg-[rgba(13,42,92,0.08)] text-[#0D2A5C]";

  const fields = [
    {
      label: "Year",
      content: (
        <input
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          min="2000"
          max="2100"
          className={`border px-3 py-2 rounded ${input}`}
        />
      ),
    },
    {
      label: "Period",
      content: (
        <select value={quarter} onChange={e => setQuarter(e.target.value)} className={`border px-3 py-2 rounded ${input}`}>
          {["year", "q1", "q2", "q3", "q4"].map(q => (
            <option key={q} value={q}>{q.toUpperCase()}</option>
          ))}
        </select>
      ),
    },
    !hideSectorFilters && {
      label: "Sector",
      content: (
        <select
          value={sector}
          onChange={e => {
            setSector(e.target.value);
            setSubsector("");
          }}
          className={`border px-3 py-2 rounded ${input}`}
        >
          <option value="">All</option>
          {sectors.map(s => (
            <option key={s._id} value={s._id}>{s.sector_name}</option>
          ))}
        </select>
      ),
    },
    !hideSectorFilters && {
      label: "Subsector",
      content: (
        <select
          value={subsector}
          onChange={e => setSubsector(e.target.value)}
          disabled={!sector}
          className={`border px-3 py-2 rounded ${input} ${!sector ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <option value="">All</option>
          {filteredSubsectors.map(ss => (
            <option key={ss._id} value={ss._id}>{ss.subsector_name}</option>
          ))}
        </select>
      ),
    },
    {
      label: "Status",
      content: (
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`border px-3 py-2 rounded ${input}`}>
          <option value="">All</option>
          {["Approved", "Pending", "Rejected"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    }
  ].filter(Boolean);

  return (
    <div className={`p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-end mb-6 ${base}`}>
      {fields.map(({ label, content }) => (
        <div key={label}>
          <label className={`block text-sm mb-1 font-semibold ${label}`}>{label}</label>
          {content}
        </div>
      ))}
      <button
        onClick={onFilter}
        disabled={loading}
        className={`px-5 py-2 rounded font-semibold transition-colors duration-200 ${dark ? "bg-[#F36F21] text-white" : `bg-gray-600 text-white ${hoverBtn}`}`}
      >
        {loading ? "Filtering..." : "Filter"}
      </button>
    </div>
  );
};

const PerformanceValidation = () => {
  const dark = useThemeStore(s => s.dark);
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase() || "";
  const hideSectorFilters = role === "ceo";

  const { sectors } = useSectors();
  const { subsectors } = useSubsectors();

  const [year, setYear] = useState(getCurrentEthiopianYear());
  const [quarter, setQuarter] = useState("year");
  const [sector, setSector] = useState("");
  const [subsector, setSubsector] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [performances, setPerformances] = useState([]);
  const [edits, setEdits] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ type: "", message: "", visible: false });

  const showToast = (type, message) => {
    setToast({ type, message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const filteredSubsectors = subsectors.filter(ss => {
    if (!sector) return true;
    const id = ss.sectorId?._id || ss.sectorId;
    return String(id) === String(sector);
  });

  const fetchPerformances = async () => {
    setLoading(true);
    setLoadingFetch(true);
    try {
      const params = { year };
      if (quarter && quarter !== "year") params.quarter = quarter;
      if (sector) params.sectorId = sector;
      if (subsector) params.subsectorId = subsector;
      if (statusFilter) params.statusFilter = statusFilter;

      const res = await axios.get(`${backendUrl}/api/performance-validation`, {
        params,
        withCredentials: true,
        headers: {
          "x-user-role": user.role,
          "x-sector-id": user?.sector?._id || "",
          "x-subsector-id": user?.subsector?._id || ""
        }
      });

      setPerformances(res.data || []);
      setError(null);
    } catch {
      setError("Failed to load performances");
    } finally {
      setLoading(false);
      setLoadingFetch(false);
    }
  };

  useEffect(() => { fetchPerformances(); }, []);

  const filtered = performances.filter(p => {
    if (String(p.year) !== String(year)) return false;
    if (quarter === "year" && p.performanceYear == null) return false;
    if (quarter !== "year" && p[`${quarter}Performance`]?.value == null) return false;
    if (sector && String(p.sectorId?._id || p.sectorId) !== String(sector)) return false;
    if (subsector && String(p.subsectorId?._id || p.subsectorId) !== String(subsector)) return false;
    if (statusFilter) {
      const field = quarter === "year" ? "validationStatusYear" : `validationStatus${quarter.toUpperCase()}`;
      return p[field] === statusFilter;
    }
    return true;
  });

  const grouped = filtered.reduce((acc, p) => {
  const goal = p.goalId?.goal_desc || "-";
  const kra = p.kraId?.kra_name || "-";

  // ✅ Log goal and kra names
  console.log("Goal:", goal, "| KRA:", kra);

  const key = `${goal}|||${kra}`;
  acc[key] = acc[key] || [];
  acc[key].push(p);
  return acc;
}, {});


  const handleCheckbox = id => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: prev[id]?.status === "Approved" ? "Pending" : "Approved"
      }
    }));
  };

  const handleComment = (id, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], description: value }
    }));
  };

  const submitOne = async id => {
    const { status = "Pending", description = "" } = edits[id] || {};
    try {
      await axios.patch(`${backendUrl}/api/performance-validation/validate/${id}`, {
        type: quarter, status, description
      }, {
        withCredentials: true,
        headers: { "x-user-role": user.role }
      });
      showToast("success", "Validation saved.");
    } catch {
      showToast("error", "Failed to save validation.");
    }
  };

  const submitBulk = async () => {
    const ids = Object.entries(edits)
      .filter(([, e]) => e.status === "Approved")
      .map(([id]) => id);
    if (!ids.length) return showToast("error", "No selections made.");

    for (const id of ids) {
      const { status = "Approved", description = "" } = edits[id];
      await axios.patch(`${backendUrl}/api/performance-validation/validate/${id}`, {
        type: quarter, status, description
      }, {
        withCredentials: true,
        headers: { "x-user-role": user.role }
      }).catch(() => {});
    }
    showToast("success", "Bulk validation sent.");
  };

  const inputField = dark ? "bg-gray-700 text-white border-gray-500" : "bg-white text-[#0D2A5C] border-gray-300";

  return (
    <>
      <div className={`p-6 max-w-7xl mx-auto transition-all duration-300 ${dark ? "bg-[#1f2937] text-white" : "bg-[rgba(13,42,92,0.08)] text-[#0D2A5C]"}`}>
        <h1 className={`text-2xl font-bold mb-2 ${dark ? "text-white" : "text-[#040613]"}`}>
          Performance Validation {year} / {quarter.toUpperCase()}
        </h1>

        <Filter
          year={year} setYear={setYear}
          quarter={quarter} setQuarter={setQuarter}
          sectors={sectors} sector={sector} setSector={setSector}
          filteredSubsectors={filteredSubsectors}
          subsector={subsector} setSubsector={setSubsector}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          onFilter={fetchPerformances}
          loading={loadingFetch}
          hideSectorFilters={hideSectorFilters}
        />

        {Object.entries(grouped).map(([key, items]) => {
          const [goal, kra] = key.split("|||");
          return (
            <div key={key} className="mb-10 rounded overflow-hidden shadow-lg">
              <div className={`p-3 font-bold text-sm ${dark ? "bg-[#374151]" : "bg-yellow-100"}`}>🎯 Goal: {goal}</div>
              <div className={`p-3 font-semibold text-sm ${dark ? "bg-[#4B5563]" : "bg-gray-200"}`}>🏷️ KRA: {kra}</div>
              <table className={`w-full border-collapse text-sm ${dark ? "border-gray-600" : "border-gray-300"}`}>
                <thead className={dark ? "bg-gray-800" : "bg-gray-100"}>
                  <tr>
                    <th className="border p-2">Indicator</th>
                    <th className="border p-2">Value</th>
                    <th className="border p-2 text-center"><input type="checkbox" checked={selectAll} onChange={() => {
                      setSelectAll(!selectAll);
                      const newEdits = {};
                      Object.values(grouped).flat().forEach(p => {
                        newEdits[p._id] = { ...edits[p._id], status: !selectAll ? "Approved" : "Pending" };
                      });
                      setEdits(newEdits);
                    }} /></th>
                    <th className="border p-2">Comments</th>
                    <th className="border p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => {
                    const value = quarter === "year" ? p.performanceYear : p[`${quarter}Performance`]?.value ?? "-";
                    const status = edits[p._id]?.status ?? p.status ?? "Pending";
                    const desc = edits[p._id]?.description ?? (quarter === "year" ? p.performanceDescription : p[`${quarter}Performance`]?.description) ?? "";
                    return (
                      <tr key={p._id}>
                        <td className="border p-2">{p.kpiId?.kpi_name}</td>
                        <td className="border p-2">{value}</td>
                        <td className="border p-2 text-center">
                          <input type="checkbox" checked={status === "Approved"} onChange={() => handleCheckbox(p._id)} />
                        </td>
                        <td className="border p-2">
                          <input
                            value={desc}
                            onChange={e => handleComment(p._id, e.target.value)}
                            className={`w-full px-2 py-1 rounded border ${inputField}`}
                          />
                        </td>
                        <td className="border p-2 text-center">
                          <button onClick={() => submitOne(p._id)} className={`rounded px-3 py-1 text-xs font-semibold ${dark ? "bg-[#F36F21] text-white" : "bg-gray-700 text-white hover:bg-orange-500"}`}>
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {filtered.length > 0 && (
          <div className="flex justify-end mt-4">
            <button onClick={submitBulk} className={`px-6 py-2 rounded font-semibold ${dark ? "bg-green-700 hover:opacity-90" : "bg-green-700 hover:bg-green-800"} text-white`}>
              Validate All Selected
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <p className={`text-center py-10 font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>No KPI performances found.</p>
        )}
      </div>

      {toast.visible && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded shadow-lg text-sm font-semibold ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default PerformanceValidation;
