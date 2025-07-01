import React, { useState, useEffect, useMemo } from "react";
import KPITable from "./KPITable";
import PlanModal from "./PlanModal";
import PerformanceModal from "./PerformanceModal";
import RatioModal from "./RatioModal";
import useAuthStore from "../../store/auth.store";

const BACKEND_URL = "https://pmes-gimp.onrender.com";

// Calculate current Ethiopian year based on Gregorian date
function getCurrentEthiopianYear() {
  const today = new Date();
  const gYear = today.getFullYear();
  const gMonth = today.getMonth() + 1;
  const gDate = today.getDate();
  const isLeapYear = (gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0;
  const newYearDay = isLeapYear ? 12 : 11;
  return gMonth < 9 || (gMonth === 9 && gDate < newYearDay) ? gYear - 8 : gYear - 7;
}

// Utility to extract string id from possibly nested or object id fields
function extractId(idField) {
  if (!idField) return null;
  if (typeof idField === "string") return idField;
  if (Array.isArray(idField)) {
    for (const el of idField) {
      const val = extractId(el);
      if (val) return val;
    }
    return null;
  }
  if (typeof idField === "object") {
    if ("_id" in idField) return extractId(idField._id);
    if ("id" in idField) return extractId(idField.id);
    if (typeof idField.toString === "function") {
      const str = idField.toString();
      if (str !== "[object Object]") return str;
    }
  }
  return null;
}

// Merge multiple rows for the same KPI by combining targets, performance, ratios
function mergeRowsByKpi(rows) {
  const merged = {};
  rows.forEach((row) => {
    const key = extractId(row.kpiId || row.kpi_id || row._id) || row.kpiName || row.kpi_name;
    if (!merged[key]) {
      merged[key] = { ...row };
    } else {
      merged[key].targets = { ...(merged[key].targets || {}), ...(row.targets || {}) };
      merged[key].performance = { ...(merged[key].performance || {}), ...(row.performance || {}) };
      merged[key].ratios = { ...(merged[key].ratios || {}), ...(row.ratios || row.ratio || {}) };
    }
  });
  return Object.values(merged);
}

// Helper to check if subsectorId is empty/null/undefined or string placeholders
function isSubsectorIdEmpty(subsectorId) {
  return (
    subsectorId === null ||
    subsectorId === undefined ||
    subsectorId === "" ||
    subsectorId === "null" ||
    subsectorId === "undefined"
  );
}

const KPIGroupedTable = ({ data, detailedKpis }) => {
  const { user: authUser } = useAuthStore();
  const [planModalInfo, setPlanModalInfo] = useState(null);
  const [performanceModalInfo, setPerformanceModalInfo] = useState(null);
  const [ratioModalInfo, setRatioModalInfo] = useState(null);
  const [planIds, setPlanIds] = useState({});
  const [tableValues, setTableValues] = useState({});
  const [loadingTableValues, setLoadingTableValues] = useState(true);
  const [notification, setNotification] = useState(null);
  const [assignmentMap, setAssignmentMap] = useState({});

  const currentEthYear = getCurrentEthiopianYear();

  // Compose a unique key for KPI + period + year to store Plan IDs and mapping
  const getKpiKey = (row, quarter, year) =>
    `${extractId(row.kpiId || row.kpi_id || row._id) || row.kpiName || row.kpi_name}_${quarter || "year"}_${year}`;

  // Fetch KPI table data filtered by user roles and years, for the relevant users
  useEffect(() => {
    async function fetchTableValues() {
      setLoadingTableValues(true);
      const user = authUser || {};
      const userId = extractId(user.id || user._id);
      const rawRole = user.role || "";
      const role = rawRole.toLowerCase();
      const sectorId = extractId(user.sectorId || user.sector);
      const subsectorId = extractId(user.subsectorId || user.subsector);

      try {
        // Fetch all users to determine who we need to fetch KPI data for
        const resUsers = await fetch(`${BACKEND_URL}/api/users/get-users`, {
          credentials: "include",
        });
        const allUsers = await resUsers.json();

        let userIdsToFetch = [];

        if (role === "strategic") {
          // Strategic role sees all users' data
          userIdsToFetch = allUsers.map(u => extractId(u._id || u.id)).filter(Boolean);
        } else if (role === "minister") {
          // Minister can see all users data (read-only)
          userIdsToFetch = allUsers.map(u => extractId(u._id || u.id)).filter(Boolean);
        } else if (role === "chief ceo") {
          // Chief CEO sees CEOs and Workers within their sector only
          const ceos = allUsers.filter(u => (u.role || "").toLowerCase() === "ceo" && extractId(u.sectorId || u.sector) === sectorId);
          const workers = allUsers.filter(u => (u.role || "").toLowerCase() === "worker" && extractId(u.sectorId || u.sector) === sectorId);
          userIdsToFetch = [...ceos, ...workers].map(u => extractId(u._id || u.id));
        } else {
          // CEO and Worker roles only see their own data
          userIdsToFetch = [userId];
        }

        userIdsToFetch = [...new Set(userIdsToFetch)]; // unique user IDs

        // Fetch KPI data for the last two Ethiopian years per user
        const yearsToFetch = [currentEthYear - 1, currentEthYear];
        let combinedResults = [];

        for (const year of yearsToFetch) {
          const fetches = userIdsToFetch.map(async uid => {
            const params = new URLSearchParams();
            params.append("userId", uid);
            params.append("role", rawRole);
            params.append("year", year.toString());

            // Append sector and subsector of the user for filtering
            const userDetails = allUsers.find(u => extractId(u._id || u.id) === uid);
            if (userDetails) {
              const userSectorId = extractId(userDetails.sectorId || userDetails.sector);
              const userSubsectorId = extractId(userDetails.subsectorId || userDetails.subsector);
              if (userSectorId) params.append("sectorId", userSectorId);
              if (userSubsectorId) params.append("subsectorId", userSubsectorId);
            }

            const url = `${BACKEND_URL}/api/kpi-table/table-data?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            // Accept both array or grouped response with grouped property
            return Array.isArray(data) ? data : Object.values(data.grouped || {}).flat();
          });

          const resultsPerYear = await Promise.all(fetches);
          resultsPerYear.forEach(arr => (combinedResults = combinedResults.concat(arr)));
        }

        // Group fetched data by goal and kra for easier display
        const groupedData = {};
        combinedResults.forEach(item => {
          const key = `${item.goal}|||${item.kra}`;
          if (!groupedData[key]) groupedData[key] = [];
          groupedData[key].push(item);
        });

        setTableValues(groupedData);
      } catch (err) {
        setNotification({ type: "error", message: "Failed to load KPI values." });
      } finally {
        setLoadingTableValues(false);
      }
    }

    if (authUser?.role) {
      fetchTableValues();
    }
  }, [authUser, currentEthYear]);

  // Fetch KPI assignments for the authUser's sector
  useEffect(() => {
    async function fetchAssignments() {
      const sectorId = extractId(authUser?.sector || authUser?.sectorId);
      if (!sectorId) {
        setAssignmentMap({});
        return;
      }

      try {
        const resKpi = await fetch(`${BACKEND_URL}/api/assign/sector/${sectorId}`);
        if (!resKpi.ok) throw new Error(resKpi.statusText);
        const sectorAssignments = await resKpi.json();

        // Build a map of KPI id -> assignment details
        const map = {};
        sectorAssignments.forEach((assignment) => {
          const kpiId = extractId(assignment.kpiId);
          if (kpiId) {
            map[kpiId] = {
              ...assignment,
              sectorId: extractId(assignment.sectorId),
              subsectorId: extractId(assignment.subsectorId),
              kraId: extractId(assignment.kraId),
              goalId: extractId(assignment.kraId?.goalId),
              kpiName: assignment.kpiId?.kpi_name || "",
              kraName: assignment.kraId?.kra_name || "",
              goalDesc: assignment.kraId?.goalId?.goal_desc || "",
            };
          }
        });
        setAssignmentMap(map);
      } catch (error) {
        setAssignmentMap({});
      }
    }

    if (authUser?.sector || authUser?.sectorId) {
      fetchAssignments();
    } else {
      setAssignmentMap({});
    }
  }, [authUser, tableValues]);

  // Normalize input data into flat rows of KPIs with their goal and KRA names
  const normalizedData = useMemo(() => {
    const rows = [];
    data.forEach(goal => {
      const goalName = goal.goal_desc || "N/A";
      goal.kras?.forEach(kra => {
        const kraName = kra.kra_name || "N/A";
        kra.kpis?.forEach(kpi => {
          const detail = detailedKpis.find(d => d._id === kpi._id) || kpi;
          rows.push({
            ...detail,
            kpiId: detail.kpiId || detail.kpi_id || kpi.kpiId || kpi.kpi_id || kpi._id,
            kpiName: detail.kpi_name || kpi.kpi_name,
            kra: kraName,
            goal: goalName,
            year: detail.year || currentEthYear,
          });
        });
      });
    });
    return rows;
  }, [data, detailedKpis, currentEthYear]);

  // Group normalized data by "goal|||kra"
  const groupedData = useMemo(() => {
    const byKey = {};
    normalizedData.forEach(row => {
      const key = `${row.goal}|||${row.kra}`;
      if (!byKey[key]) byKey[key] = [];
      byKey[key].push(row);
    });
    return byKey;
  }, [normalizedData]);

  // Merge fetched KPI data (plan, performance, ratios) into grouped rows, plus assignments
  const enrichedGroupedData = useMemo(() => {
    const enriched = {};
    Object.entries(groupedData).forEach(([key, rows]) => {
      const fetched = tableValues[key] || [];
      const merged = mergeRowsByKpi(fetched);
      enriched[key] = rows.map(row => {
        const kpiKey = extractId(row.kpiId || row.kpi_id || row._id) || row.kpiName || row.kpi_name;
        const match = merged.find(f => {
          const fKey = extractId(f.kpiId || f.kpi_id || f._id) || f.kpiName || f.kpi_name;
          return fKey === kpiKey;
        });
        const assignment = assignmentMap[kpiKey] || null;

        return {
          ...row,
          targets: match?.targets || {},
          performance: match?.performance || {},
          ratios: match?.ratios || match?.ratio || {},
          userId: match?.userId || "",
          userRole: match?.userRole || "",
          assignedSectorId: extractId(assignment?.sectorId) || null,
          assignedSubsectorId: extractId(assignment?.subsectorId) || null,
        };
      });
    });
    return enriched;
  }, [groupedData, tableValues, assignmentMap]);

  // Role flags for easy checking
  const rawRole = (authUser?.role || "").toLowerCase();
  const isMinister = rawRole === "minister";
  const isStrategic = rawRole === "strategic";

  // Open Plan modal with role-based editing control
const openModal = (row, field) => {
  if (isMinister) {
    console.log("⛔ Minister role: editing not allowed");
    return;
  }

  const kpiKey = extractId(row.kpiId || row.kpi_id || row._id) || row.kpiName || row.kpi_name;
  const assignment = assignmentMap[kpiKey] || {};
  const subsectorId = extractId(assignment.subsectorId);

  const currentUserId = extractId(authUser.id || authUser._id);
  const rowUserId = extractId(row.userId);

  if (!isSubsectorIdEmpty(subsectorId)) {
    console.log(`⛔ Skipping Plan Modal: KPI ${kpiKey} has assigned subsector`, subsectorId);
    return;
  }

  if (
    (row.userRole && ["ceo", "chief ceo"].includes(row.userRole.toLowerCase())) &&
    currentUserId !== rowUserId
  ) {
    console.log("⛔ You cannot edit CEO or Chief CEO KPI data of other users");
    return;
  }

  if (isStrategic && row.userRole && row.userRole.toLowerCase() === "ceo") {
    console.log("⛔ Strategic role cannot edit CEO data");
    return;
  }

  setPlanModalInfo({ ...row, field, userId: currentUserId, role: authUser.role, editable: true });
};

const openPerformanceModal = (row, field) => {
  if (isMinister) {
    console.log("⛔ Minister role: editing not allowed");
    return;
  }

  const kpiKey = extractId(row.kpiId || row.kpi_id || row._id) || row.kpiName || row.kpi_name;
  const assignment = assignmentMap[kpiKey] || {};
  const subsectorId = extractId(assignment.subsectorId);

  const currentUserId = extractId(authUser.id || authUser._id);
  const rowUserId = extractId(row.userId);

  if (!isSubsectorIdEmpty(subsectorId)) {
    console.log(`⛔ Skipping Performance Modal: KPI ${kpiKey} has assigned subsector`, subsectorId);
    return;
  }

  if (
    (row.userRole && ["ceo", "chief ceo"].includes(row.userRole.toLowerCase())) &&
    currentUserId !== rowUserId
  ) {
    console.log("⛔ You cannot edit CEO or Chief CEO KPI data of other users");
    return;
  }

  if (isStrategic && row.userRole && row.userRole.toLowerCase() === "ceo") {
    console.log("⛔ Strategic role cannot edit CEO data");
    return;
  }

  if (!field) {
    field = "year-" + (row.year || currentEthYear);
  }

  const quarter = field.toLowerCase().startsWith("q") ? field.toUpperCase() : null;

  setPerformanceModalInfo({
    ...row,
    field,
    quarter,
    planId: planIds[kpiKey] || "",
    userId: currentUserId,
    role: authUser.role,
    editable: true,
  });
};

const openRatioModal = (row, field) => {
  if (isMinister) {
    console.log("⛔ Minister role: editing not allowed");
    return;
  }

  const kpiKey = extractId(row.kpiId || row.kpi_id || row._id) || row.kpiName || row.kpi_name;
  const assignment = assignmentMap[kpiKey] || {};
  const subsectorId = extractId(assignment.subsectorId);

  const currentUserId = extractId(authUser.id || authUser._id);
  const rowUserId = extractId(row.userId);

  if (!isSubsectorIdEmpty(subsectorId)) {
    console.log(`⛔ Skipping Ratio Modal: KPI ${kpiKey} has assigned subsector`, subsectorId);
    return;
  }

  if (
    (row.userRole && ["ceo", "chief ceo"].includes(row.userRole.toLowerCase())) &&
    currentUserId !== rowUserId
  ) {
    console.log("⛔ You cannot edit CEO or Chief CEO KPI data of other users");
    return;
  }

  if (isStrategic && row.userRole && row.userRole.toLowerCase() === "ceo") {
    console.log("⛔ Strategic role cannot edit CEO data");
    return;
  }

  const [quarterRaw, year] = field.split("-");
  const quarter = quarterRaw.toUpperCase();

  setRatioModalInfo({
    ...row,
    field,
    quarter,
    year,
    planId: planIds[kpiKey] || "",
    userId: currentUserId,
    role: authUser.role,
  });
};


  // Handle Plan form submission with role enforcement
  const handlePlanFormSubmit = async (formData) => {
    try {
      // Strategic role: force userId to Chief CEO for CEO's KPI data
      if (
        isStrategic &&
        formData.userRole &&
        formData.userRole.toLowerCase() === "chief ceo"
      ) {
        formData.userId = extractId(authUser.id || authUser._id);
      }

      const res = await fetch(`${BACKEND_URL}/api/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      const kpiKey = getKpiKey(formData, formData.quarter, formData.year);
      setPlanIds((prev) => ({ ...prev, [kpiKey]: result._id || result.planId }));
      setNotification({ type: "success", message: "Plan saved successfully." });
      setPlanModalInfo(null);
    } catch (e) {
      setNotification({ type: "error", message: "Failed to save plan: " + e.message });
    }
  };

  // Handle Performance form submission with role enforcement
  const handlePerformanceFormSubmit = async (formData) => {
    try {
      // Strategic role: force userId to Chief CEO for CEO's KPI data
      if (
        isStrategic &&
        formData.userRole &&
        formData.userRole.toLowerCase() === "chief ceo"
      ) {
        formData.userId = extractId(authUser.id || authUser._id);
      }

      const res = await fetch(`${BACKEND_URL}/api/performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setNotification({ type: "success", message: "Performance saved successfully." });
      setPerformanceModalInfo(null);
    } catch (e) {
      setNotification({ type: "error", message: "Failed to save performance: " + e.message });
    }
  };

  return (
    <div className="p-4 overflow-x-auto relative">
      {notification && (
        <div
          className={`fixed top-4 right-4 max-w-xs z-50 rounded border px-4 py-2 shadow-md ${
            notification.type === "success"
              ? "bg-green-100 text-green-700 border-green-400"
              : "bg-red-100 text-red-700 border-red-400"
          }`}
        >
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-4 font-bold">
            ×
          </button>
        </div>
      )}

      {loadingTableValues ? (
        <p className="mt-4 text-center text-gray-600">Loading KPI values...</p>
      ) : Object.entries(enrichedGroupedData).length > 0 ? (
        Object.entries(enrichedGroupedData).map(([groupKey, rows], idx) => (
          <KPITable
            key={idx}
            groupKey={groupKey}
            rows={rows}
            openModal={openModal}
            openPerformanceModal={openPerformanceModal}
            openRatioModal={openRatioModal}
            currentEthYear={currentEthYear}
            canEdit={() => true}
          />
        ))
      ) : (
        <p className="mt-4 text-center text-gray-600">No results found.</p>
      )}

      {planModalInfo && (
        <PlanModal
          modalInfo={planModalInfo}
          closeModal={() => setPlanModalInfo(null)}
          handleFormSubmit={handlePlanFormSubmit}
        />
      )}
      {performanceModalInfo && (
        <PerformanceModal
          modalInfo={performanceModalInfo}
          closeModal={() => setPerformanceModalInfo(null)}
          handleFormSubmit={handlePerformanceFormSubmit}
        />
      )}
      {ratioModalInfo && (
        <RatioModal
          modalInfo={ratioModalInfo}
          closeModal={() => setRatioModalInfo(null)}
        />
      )}
    </div>
  );
};

export default KPIGroupedTable;
