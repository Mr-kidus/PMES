import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../store/auth.store";
import useThemeStore from "../store/themeStore";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

const BACKEND_PORT = 1221;
const backendUrl = `http://localhost:${BACKEND_PORT}`;

function getCurrentEthiopianYear() {
  const today = new Date();
  const gregorianYear = today.getFullYear();
  const gregorianMonth = today.getMonth() + 1; // January is 0
  const gregorianDay = today.getDate();

  if (gregorianMonth < 9 || (gregorianMonth === 9 && gregorianDay < 11)) {
    return gregorianYear - 8;
  } else {
    return gregorianYear - 7;
  }
}

function Filter({
  year, setYear,
  quarter, setQuarter,
  sectors, sector, setSector,
  filteredSubsectors, subsector, setSubsector,
  statusFilter, setStatusFilter,
  onFilter, loading,
  userRole
}) {
  const dark = useThemeStore(s => s.dark);
  const base = dark
    ? "bg-[#1f2937] text-white"
    : "bg-[rgba(13,42,92,0.08)] text-[#0D2A5C]";
  const input = dark
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-[#0D2A5C] border-gray-300";
  const hoverBtn = dark ? "hover:bg-[#F36F21]" : "hover:bg-orange-500";

  const roleIsCeo = userRole?.toLowerCase() === "ceo";

  const filters = [
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
        <select
          value={quarter}
          onChange={e => setQuarter(e.target.value)}
          className={`border px-3 py-2 rounded ${input}`}
        >
          {["year", "q1", "q2", "q3", "q4"].map(q => (
            <option key={q} value={q}>
              {q.toUpperCase()}
            </option>
          ))}
        </select>
      ),
    },
  ];

  if (!roleIsCeo) {
    filters.push(
      {
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
              <option key={s._id} value={s._id}>
                {s.sector_name}
              </option>
            ))}
          </select>
        ),
      },
      {
        label: "Subsector",
        content: (
          <select
            value={subsector}
            onChange={e => setSubsector(e.target.value)}
            disabled={!sector}
            className={`border px-3 py-2 rounded ${input}`}
          >
            <option value="">All</option>
            {filteredSubsectors.map(ss => (
              <option key={ss._id} value={ss._id}>
                {ss.subsector_name}
              </option>
            ))}
          </select>
        ),
      }
    );
  }

  filters.push({
    label: "Status",
    content: (
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className={`border px-3 py-2 rounded ${input}`}
      >
        <option value="">All</option>
        {["Approved", "Pending", "Rejected"].map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    ),
  });

  return (
    <div
      className={`p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-end mb-6 ${base}`}
    >
      {filters.map(({ label, content }) => (
        <div key={label}>
          <label className={`block text-sm mb-1 font-semibold`}>{label}</label>
          {content}
        </div>
      ))}

      <button
        onClick={onFilter}
        disabled={loading}
        className={`px-5 py-2 rounded font-semibold transition-colors duration-200 ${
          dark ? `bg-[#F36F21] text-white` : `bg-gray-600 text-white ${hoverBtn}`
        }`}
      >
        {loading ? "Filtering..." : "Filter"}
      </button>
    </div>
  );
}

function getValidationPrefix(role) {
  if (!role) return "";
  const r = role.toLowerCase();
  if (r === "ceo") return "ceo";
  if (r.includes("chief")) return "chiefCeo";
  if (r.includes("strategic")) return "strategic";
  if (r === "minister") return "minister";
  return "";
}

function useSectors() {
  const [sectors, set] = useState([]);
  const [err, setErr] = useState(null);
  useEffect(() => {
    axios
      .get(`${backendUrl}/api/sector/get-sector`)
      .then(r => set(r.data.data || []))
      .catch(() => setErr("Failed to load sectors"));
  }, []);
  return { sectors, sectorError: err };
}

function useSubsectors() {
  const [subsectors, set] = useState([]);
  const [err, setErr] = useState(null);
  useEffect(() => {
    axios
      .get(`${backendUrl}/api/subsector/get-subsector`)
      .then(r => set(r.data.data || r.data || []))
      .catch(() => setErr("Failed to load subsectors"));
  }, []);
  return { subsectors, subsectorError: err };
}

const Toast = ({ type, message, onClose, dark }) => {
  const iconClasses = "inline-block mr-2 align-middle";
  const baseClasses =
    "fixed bottom-6 right-6 z-50 flex items-center max-w-xs w-full rounded-lg px-4 py-3 shadow-lg font-semibold text-sm select-none transition-transform duration-300 ease-in-out";

  let bgColor, textColor, IconComp;
  if (type === "success") {
    bgColor = dark ? "bg-green-700" : "bg-green-100";
    textColor = dark ? "text-green-200" : "text-green-800";
    IconComp = IoCheckmarkCircleOutline;
  } else if (type === "error") {
    bgColor = dark ? "bg-red-700" : "bg-red-100";
    textColor = dark ? "text-red-200" : "text-red-800";
    IconComp = IoCloseCircleOutline;
  } else {
    return null;
  }

  return (
    <div
      className={`${baseClasses} ${bgColor} ${textColor} drop-shadow-lg`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onClick={onClose}
      style={{ cursor: "pointer" }}
    >
      <IconComp size={20} className={iconClasses} />
      <span className="flex-grow">{message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className={`${textColor} hover:opacity-70 transition-opacity duration-150 ml-3`}
      >
        &times;
      </button>
    </div>
  );
};

const TargetValidation = () => {
  const dark = useThemeStore(s => s.dark);
  const { user } = useAuthStore();

  // Call all hooks unconditionally
  const { sectors, sectorError } = useSectors();
  const { subsectors, subsectorError } = useSubsectors();

  const [year, setYear] = useState(getCurrentEthiopianYear());
  const [quarter, setQuarter] = useState("year");
  const [sector, setSector] = useState("");
  const [subsector, setSubsector] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [plans, setPlans] = useState([]);
  const [edits, setEdits] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState({ type: "", message: "", visible: false });

  const showToast = (type, message) => {
    setToast({ type, message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  // If user not loaded yet, show loading message
  if (!user) {
    return <p className="p-6">Loading user info...</p>;
  }

  const prefix = getValidationPrefix(user.role);

  const filteredSubsectors = subsectors.filter(ss => {
    if (!sector) return true;
    const id = ss.sectorId?._id || ss.sectorId;
    return String(id) === String(sector);
  });

  const fetchPlans = async () => {
    if (!year) return setError("Year is required");
    setLoadingFetch(true);
    try {
      const roleLower = user.role.toLowerCase();
      const params = { year, quarter, role: roleLower };

      if (sector) params.sector = sector;
      if (subsector) params.subsector = subsector;
      if (statusFilter) params.statusFilter = statusFilter;

      const headers = {
        "x-user-role": user.role,
        "x-sector-id": user.sector?._id || "",
        "x-subsector-id": user.subsector?._id || "",
      };

      const res = await axios.get(`${backendUrl}/api/target-validation`, {
        params,
        withCredentials: true,
        headers,
      });

      setPlans(res.data || []);
      setError(null);
    } catch (e) {
      console.error("fetchPlans error:", e);
      setError("Failed to load plans");
    } finally {
      setLoading(false);
      setLoadingFetch(false);
    }
  };

  React.useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = plans.filter(plan => {
    if (String(plan.year) !== String(year)) return false;
    const statusField =
      quarter === "year"
        ? `${prefix}ValidationYear`
        : `${prefix}Validation${quarter.toUpperCase()}`;
    if (plan[statusField] === undefined) return false;
    if (sector && String(plan.sectorId?._id || plan.sectorId) !== String(sector)) return false;
    if (subsector && String(plan.subsectorId?._id || plan.subsectorId) !== String(subsector)) return false;
    if (statusFilter && plan[statusField] !== statusFilter) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, p) => {
    const goal = p.goalId?.goal_desc || "-";
    const kra = p.kraId?.kra_name || "-";
    const key = `${goal}|||${kra}`;
    acc[key] = acc[key] || [];
    acc[key].push(p);
    return acc;
  }, {});

  const handleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    const allEdits = {};
    Object.values(grouped)
      .flat()
      .forEach(p => {
        allEdits[p._id] = { ...edits[p._id], status: next ? "Approved" : "Pending" };
      });
    setEdits(allEdits);
  };

  const handleToggle = id => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: prev[id]?.status === "Approved" ? "Pending" : "Approved",
      },
    }));
  };

  const handleComment = (id, val) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], description: val } }));
  };

  const submitOne = async id => {
    const { status = "Pending", description = "" } = edits[id] || {};
    try {
      await axios.patch(
        `${backendUrl}/api/target-validation/validate/${id}`,
        {
          type: quarter,
          status,
          description,
          role: user.role.toLowerCase(),
        },
        {
          withCredentials: true,
          headers: { "x-user-role": user.role },
        }
      );
      showToast("success", "Saved successfully!");
    } catch {
      showToast("error", "Save failed. Please try again.");
    }
  };

  const submitBulk = async () => {
    const ids = Object.entries(edits)
      .filter(([, e]) => e.status === "Approved")
      .map(([id]) => id);
    if (!ids.length) return showToast("error", "No KPI selected for validation.");

    for (const id of ids) {
      await axios
        .patch(
          `${backendUrl}/api/target-validation/validate/${id}`,
          {
            type: quarter,
            status: edits[id].status,
            description: edits[id].description || "",
            role: user.role.toLowerCase(),
          },
          {
            withCredentials: true,
            headers: { "x-user-role": user.role },
          }
        )
        .catch(() => {});
    }
    showToast("success", "Bulk validation completed.");
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (sectorError || subsectorError)
    return <p className="p-6 text-red-600">Loading filters failed.</p>;

  const bg = dark ? "bg-[#1f2937] text-white" : "bg-[rgba(13,42,92,0.08)] text-[#0D2A5C]";
  const cardHeader = dark ? "bg-[#374151] text-white" : "bg-yellow-100 text-[#0D2A5C]";
  const cardSubHeader = dark ? "bg-[#4B5563] text-white" : "bg-gray-200 text-[#0D2A5C]";
  const borderColor = dark ? "border-gray-600" : "border-gray-300";
  const inputField = dark ? "bg-gray-700 text-white border-gray-500" : "bg-white text-[#0D2A5C] border-gray-300";
  const buttonBase = "rounded px-3 py-1 text-xs font-semibold";
  const saveButton = dark ? "bg-[#F36F21] text-white hover:opacity-90" : "bg-gray-700 text-white hover:bg-orange-500";

  return (
    <>
      <div className={`p-6 max-w-7xl mx-auto transition-all duration-300 ${bg}`}>
        <h1 className={`text-2xl font-bold mb-2 ${dark ? "text-white" : "text-[#040613]"}`}>
          Target Validation {year} / {quarter.toUpperCase()}
        </h1>

        <Filter
          year={year} setYear={setYear}
          quarter={quarter} setQuarter={setQuarter}
          sectors={sectors} sector={sector} setSector={setSector}
          filteredSubsectors={filteredSubsectors}
          subsector={subsector} setSubsector={setSubsector}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          onFilter={fetchPlans}
          loading={loadingFetch}
          userRole={user.role}
        />

        {Object.entries(grouped).map(([key, items]) => {
          const [goal, kra] = key.split("|||");
          return (
            <div key={key} className="mb-10 rounded overflow-hidden shadow-lg">
              <div className={`p-3 font-bold text-sm ${cardHeader}`}>🎯 Goal: {goal}</div>
              <div className={`p-3 font-semibold text-sm ${cardSubHeader}`}>🏷️ KRA: {kra}</div>
              <table className={`w-full border-collapse text-sm ${borderColor}`}>
                <thead className={dark ? "bg-gray-800" : "bg-gray-100"}>
                  <tr>
                    <th className={`border p-2 ${borderColor}`}>Indicator</th>
                    <th className={`border p-2 ${borderColor}`}>Value</th>
                    <th className={`border p-2 text-center ${borderColor}`}>
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                    </th>
                    <th className={`border p-2 ${borderColor}`}>Comments</th>
                    <th className={`border p-2 text-center ${borderColor}`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => {
                    const field =
                      quarter === "year"
                        ? `${prefix}ValidationYear`
                        : `${prefix}Validation${quarter.toUpperCase()}`;
                    const descField =
                      quarter === "year"
                        ? `${prefix}ValidationDescriptionYear`
                        : `${prefix}ValidationDescription${quarter.toUpperCase()}`;
                    const val = p.target ?? p.value ?? "-";
                    const status = edits[p._id]?.status ?? p[field] ?? "Pending";
                    const desc = edits[p._id]?.description ?? p[descField] ?? "";
                    return (
                      <tr key={p._id} className={dark ? "hover:bg-gray-800" : "hover:bg-gray-50"}>
                        <td className={`border p-2 ${borderColor}`}>{p.kpiId?.kpi_name}</td>
                        <td className={`border p-2 ${borderColor}`}>{val}</td>
                        <td className={`border p-2 text-center ${borderColor}`}>
                          <input
                            type="checkbox"
                            checked={status === "Approved"}
                            onChange={() => handleToggle(p._id)}
                          />
                        </td>
                        <td className={`border p-2 ${borderColor}`}>
                          <input
                            type="text"
                            value={desc}
                            onChange={e => handleComment(p._id, e.target.value)}
                            className={`w-full rounded px-2 py-1 border ${inputField}`}
                          />
                        </td>
                        <td className={`border p-2 text-center ${borderColor}`}>
                          <button
                            onClick={() => submitOne(p._id)}
                            className={`${buttonBase} ${saveButton}`}
                          >
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

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No KPI targets found.</p>
        )}

        {filtered.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={submitBulk}
              className={`bg-gray-700 text-white px-6 py-2 rounded font-semibold transition-colors duration-200 hover:bg-orange-500`}
            >
              Validate All Selected
            </button>
          </div>
        )}
      </div>

      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(t => ({ ...t, visible: false }))}
          dark={dark}
        />
      )}
    </>
  );
};

export default TargetValidation;
