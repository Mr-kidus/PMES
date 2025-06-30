import React, { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../../../store/themeStore";

const backendUrl = "http://localhost:1221";

const KpiYearAssignmentPage = () => {
  const dark = useThemeStore((state) => state.dark);

  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [assignedKPIs, setAssignedKPIs] = useState([]);
  const [editStates, setEditStates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());

  const fetchDropdownData = async () => {
    try {
      const [sectorRes, subsectorRes] = await Promise.all([
        axios.get(`${backendUrl}/api/sector/get-sector`),
        axios.get(`${backendUrl}/api/subsector/get-subsector`),
      ]);
      setSectors(sectorRes.data?.data || []);
      setSubsectors(subsectorRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch sectors or subsectors:", error);
      setErrorMsg("Failed to load sectors or subsectors.");
    }
  };

  const fetchAssignedKPIs = async (sectorId) => {
    setLoading(true);
    try {
      const res = sectorId
        ? await axios.get(`${backendUrl}/api/assign/sector/${sectorId}`)
        : await axios.get(`${backendUrl}/api/assign/assigned-kpi`);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setAssignedKPIs(data);

      const initialEditStates = {};
      data.forEach((assignment) => {
        initialEditStates[assignment._id] = {
          startYear: assignment.startYear ?? "",
          endYear: assignment.endYear ?? "",
          editing: false,
        };
      });
      setEditStates(initialEditStates);
      setErrorMsg("");
    } catch (error) {
      console.error("Failed to fetch assigned KPIs:", error);
      setErrorMsg("Failed to load assigned KPIs.");
      setAssignedKPIs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchAssignedKPIs(selectedSector);
  }, [selectedSector]);

  const handleEditToggle = (assignmentId) => {
    setEditStates((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        editing: !prev[assignmentId].editing,
      },
    }));
  };

  const handleYearChange = (assignmentId, field, value) => {
    if (value === "" || /^\d*$/.test(value)) {
      setEditStates((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          [field]: value,
        },
      }));
    }
  };

  const handleSaveYears = async (assignmentId, kpiId, sectorId, subsectorId, deskId) => {
    const { startYear, endYear } = editStates[assignmentId];
    const startYearNum = Number(startYear);
    const endYearNum = Number(endYear);

    if (
      !startYear ||
      !endYear ||
      isNaN(startYearNum) ||
      isNaN(endYearNum) ||
      startYearNum > endYearNum
    ) {
      alert("Please enter valid start and end years. Start year must not be greater than end year.");
      return;
    }

    try {
      setSavingIds((prev) => new Set(prev).add(assignmentId));

      const res = await axios.post(`${backendUrl}/api/year/assign`, {
        assignmentId,
        kpiId,
        sectorId: sectorId?._id || sectorId,
        subsectorId: subsectorId?._id || subsectorId,
        deskId: deskId?._id || deskId,
        startYear: startYearNum,
        endYear: endYearNum,
      });

      const updated = res.data;

      setAssignedKPIs((prev) =>
        prev.map((a) => (a._id === assignmentId ? updated : a))
      );

      setEditStates((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          editing: false,
          startYear: startYearNum,
          endYear: endYearNum,
        },
      }));

      alert("Years updated successfully!");
    } catch (error) {
      console.error("Failed to save year values:", error);
      alert("Failed to save year values.");
    } finally {
      setSavingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(assignmentId);
        return copy;
      });
    }
  };

  const getSectorNameFromSubsector = (subsectorId) => {
    const subsector =
      typeof subsectorId === "object"
        ? subsectorId
        : subsectors.find((s) => s._id === subsectorId);

    const sectorId =
      typeof subsector?.sectorId === "object"
        ? subsector?.sectorId?._id
        : subsector?.sectorId;

    return sectors.find((s) => s._id === sectorId)?.sector_name || "-";
  };

  const getSectorNameFromSectorId = (sectorId) => {
    const sector =
      typeof sectorId === "object"
        ? sectorId
        : sectors.find((s) => s._id === sectorId);
    return sector?.sector_name || "-";
  };

  const filteredAssignedKPIs = assignedKPIs.filter(({ kpiId }) => {
    const term = searchTerm.toLowerCase();
    return (
      kpiId?.kpi_name?.toLowerCase().includes(term) ||
      kpiId?.kra?.kra_name?.toLowerCase().includes(term) ||
      kpiId?.goal?.goal_desc?.toLowerCase().includes(term)
    );
  });

  return (
    <div
      className={`max-w-6xl mx-auto p-6 rounded-xl shadow border
        ${dark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-blue-100 text-[#040613]"}
      `}
    >
      <h2
        className={`text-2xl font-bold mb-6
          ${dark ? "text-white" : "text-[#040613]"}
        `}
      >
        Assigned KPI Year Management
      </h2>

      {errorMsg && (
        <p className={`${dark ? "text-red-400" : "text-red-600"} mb-4`}>
          {errorMsg}
        </p>
      )}

      <div className="mb-4 flex gap-4 items-center">
        <select
          className={`border rounded-md px-4 py-2 focus:outline-none focus:ring-2
            ${dark ? "border-gray-600 bg-gray-800 text-white focus:ring-[#F36F21]" : "border-gray-300 bg-white text-black focus:ring-[#040613]"}
          `}
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          <option value="">All Sectors</option>
          {sectors.map((sector) => (
            <option
              key={sector._id}
              value={sector._id}
              className={dark ? "bg-gray-900 text-white" : ""}
            >
              {sector.sector_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search assigned KPIs..."
          className={`border rounded-md px-4 py-2 flex-grow focus:outline-none focus:ring-2
            ${dark ? "border-gray-600 bg-gray-800 text-white focus:ring-[#F36F21]" : "border-gray-300 bg-white text-black focus:ring-[#040613]"}
          `}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className={`${dark ? "text-gray-300" : "text-gray-600"}`}>
          Loading assigned KPIs...
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full rounded text-sm" style={{ borderCollapse: "collapse" }}>
            <thead
              className={`${
                dark ? "bg-[#040613] text-white" : "bg-[#F36F21] text-white"
              }`}
            >
              <tr>
                <th className="border px-4 py-2">Sector</th>
                <th className="border px-4 py-2">Subsector</th>
                <th className="border px-4 py-2">KRA</th>
                <th className="border px-4 py-2">KPI</th>
                <th className="border px-4 py-2">Start Year</th>
                <th className="border px-4 py-2">End Year</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignedKPIs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`text-center py-4 ${
                      dark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No assigned KPIs found.
                  </td>
                </tr>
              ) : (
                filteredAssignedKPIs.map(
                  ({ _id: assignmentId, sectorId, subsectorId, deskId, kpiId }) => {
                    const editState = editStates[assignmentId] || {};
                    const isEditing = editState.editing;
                    const isSaving = savingIds.has(assignmentId);

                    return (
                      <tr key={assignmentId} className={dark ? "text-white" : "text-[#040613]"}>
                        <td className="border px-4 py-2">
                          {subsectorId
                            ? getSectorNameFromSubsector(subsectorId)
                            : getSectorNameFromSectorId(sectorId)}
                        </td>
                        <td className="border px-4 py-2">
                          {subsectorId?.subsector_name || "-"}
                        </td>
                        <td className="border px-4 py-2">{kpiId?.kra?.kra_name || "-"}</td>
                        <td className="border px-4 py-2">{kpiId?.kpi_name || "-"}</td>

                        <td className="border px-4 py-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editState.startYear}
                              onChange={(e) =>
                                handleYearChange(assignmentId, "startYear", e.target.value)
                              }
                              className={`w-20 rounded-md px-2 py-1 focus:outline-none focus:ring-2 border ${
                                dark
                                  ? "border-gray-600 bg-gray-800 text-white focus:ring-[#F36F21]"
                                  : "border-gray-300 bg-white text-black focus:ring-[#040613]"
                              }`}
                              maxLength={4}
                            />
                          ) : (
                            kpiId?.startYear ?? "-"
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editState.endYear}
                              onChange={(e) =>
                                handleYearChange(assignmentId, "endYear", e.target.value)
                              }
                              className={`w-20 rounded-md px-2 py-1 focus:outline-none focus:ring-2 border ${
                                dark
                                  ? "border-gray-600 bg-gray-800 text-white focus:ring-[#F36F21]"
                                  : "border-gray-300 bg-white text-black focus:ring-[#040613]"
                              }`}
                              maxLength={4}
                            />
                          ) : (
                            kpiId?.endYear ?? "-"
                          )}
                        </td>

                        <td className="border px-4 py-2 text-center space-x-2 whitespace-nowrap">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() =>
                                  handleSaveYears(
                                    assignmentId,
                                    kpiId?._id,
                                    sectorId,
                                    subsectorId,
                                    deskId
                                  )
                                }
                                disabled={isSaving}
                                className={`px-3 py-1 rounded text-white ${
                                  dark
                                    ? "bg-[#F36F21] hover:bg-[#c75a17] disabled:opacity-50"
                                    : "bg-[#040613] hover:bg-[#00337C] disabled:opacity-50"
                                }`}
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={() => handleEditToggle(assignmentId)}
                                disabled={isSaving}
                                className={`px-3 py-1 rounded text-white ${
                                  dark
                                    ? "bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                                    : "bg-gray-400 hover:bg-gray-500 disabled:opacity-50"
                                }`}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditToggle(assignmentId)}
                              className={`px-3 py-1 rounded text-white ${
                                dark
                                  ? "bg-[#F36F21] hover:bg-[#c75a17]"
                                  : "bg-[#040613] hover:bg-[#00337C]"
                              }`}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KpiYearAssignmentPage;
