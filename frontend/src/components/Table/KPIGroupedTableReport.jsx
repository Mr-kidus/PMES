import React, { useState, useEffect } from "react";
import KPITableReport from "./KPITableReport";
import useAuthStore from "../../store/auth.store";

const BACKEND_URL = "https://pmes-gimp.onrender.com";

function getCurrentEthiopianYear() {
  const today = new Date();
  const gYear = today.getFullYear();
  const gMonth = today.getMonth() + 1;
  const gDate = today.getDate();
  const isLeap = (gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0;
  const newYearDay = isLeap ? 12 : 11;
  return gMonth < 9 || (gMonth === 9 && gDate < newYearDay) ? gYear - 8 : gYear - 7;
}

function extractId(idField) {
  if (!idField) return "";
  if (typeof idField === "string") return idField;
  if (typeof idField === "object") {
    if ("_id" in idField) return extractId(idField._id);
    if ("id" in idField) return extractId(idField.id);
    if (typeof idField.toString === "function") {
      const str = idField.toString();
      if (str !== "[object Object]") return str;
    }
  }
  return "";
}

function mergeRowsByKpi(rows) {
  const merged = {};
  rows.forEach((row) => {
    const key = row.kpiId || row.kpiName;
    if (!merged[key]) {
      merged[key] = { ...row };
    } else {
      merged[key].targets = { ...(merged[key].targets || {}), ...(row.targets || {}) };
      merged[key].performance = { ...(merged[key].performance || {}), ...(row.performance || {}) };
      merged[key].ratio = { ...(merged[key].ratio || {}), ...(row.ratio || row.ratios || {}) };
    }
  });
  return Object.values(merged);
}

function KPIGroupedTableReport({ data, detailedKpis }) {
  const { user: authUser } = useAuthStore();
  const [isUserReady, setIsUserReady] = useState(false);
  const [tableValues, setTableValues] = useState({});
  const [loadingTableValues, setLoadingTableValues] = useState(true);
  const [notification, setNotification] = useState(null);
  const currentEthYear = getCurrentEthiopianYear();

  useEffect(() => {
    if (authUser && (authUser.id || authUser._id) && authUser.role) {
      setIsUserReady(true);
    }
  }, [authUser]);

  useEffect(() => {
    async function fetchTableValues() {
      setLoadingTableValues(true);

      const user = authUser || {};

      console.log("Full authUser object:", user);

      const userId = extractId(user.id || user._id);
      const rawRole = user.role || "";
      const role =
        rawRole
          .toLowerCase()
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      const sectorId = extractId(user.sectorId || user.sector);
      const subsectorId = extractId(user.subsectorId || user.subsector);

      console.log("Extracted IDs -> userId:", userId);
      console.log("Extracted IDs -> role:", role);
      console.log("Extracted IDs -> sectorId:", sectorId);
      console.log("Extracted IDs -> subsectorId:", subsectorId);

      if (!userId || !role) {
        setLoadingTableValues(false);
        return;
      }

      try {
        const yearsToFetch = [currentEthYear - 1, currentEthYear];
        let combinedResults = [];

        // Treat Chief CEO same as other roles: only fetch own data
        const userIdsToFetch = [userId];

        for (const year of yearsToFetch) {
          for (const uid of userIdsToFetch) {
            const params = new URLSearchParams({
              userId: uid,
              role,
              year: year.toString(),
            });

            // For CEO and Worker, append subsectorId only if available
            if (role === "Ceo" || role === "Worker") {
              if (subsectorId) params.append("subsectorId", subsectorId);
            } else {
              // For all other roles including Chief CEO, Minister, Strategic, append sector and subsector if available
              if (sectorId) params.append("sectorId", sectorId);
              if (subsectorId) params.append("subsectorId", subsectorId);
            }

            const url = `${BACKEND_URL}/api/kpi-table/table-data?${params.toString()}`;
            console.log(`Fetching KPI table data: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
              console.warn(`Failed to fetch KPI table for user ${uid}, year ${year}`);
              continue;
            }
            const result = await response.json();

            if (Array.isArray(result)) {
              const transformed = result.map((item) => ({
                ...item,
                performance: {
                  ...item.performance,
                  Q1: item.q1Performance?.value ?? 0,
                  Q2: item.q2Performance?.value ?? 0,
                  Q3: item.q3Performance?.value ?? 0,
                  Q4: item.q4Performance?.value ?? 0,
                },
                ratios: item.ratios || item.ratio || {},
              }));
              combinedResults = combinedResults.concat(transformed);
            }
          }
        }

        // Group by goal and kra for UI rendering
        const groupedData = {};
        combinedResults.forEach((item) => {
          const groupKey = `${item.goal}|||${item.kra}`;
          if (!groupedData[groupKey]) groupedData[groupKey] = [];
          groupedData[groupKey].push(item);
        });

        setTableValues(groupedData);
      } catch (error) {
        console.error("Error fetching KPI values:", error);
        setNotification({ type: "error", message: "Failed to load KPI values." });
      } finally {
        setLoadingTableValues(false);
      }
    }

    fetchTableValues();
  }, [authUser, currentEthYear]);

  if (!isUserReady) return <div className="p-4">Loading user information...</div>;

  // Normalize raw KPI data for this report
  const normalizedData = [];
  data.forEach((goal) => {
    const goalName = goal.goal_desc || "N/A";
    goal.kras?.forEach((kra) => {
      const kraName = kra.kra_name || "N/A";
      kra.kpis?.forEach((kpi) => {
        const kpiDetail = detailedKpis.find((d) => d._id === kpi._id) || {};
        normalizedData.push({
          kpiId: kpiDetail.kpiId || kpi.kpiId || kpi._id,
          kpiName: kpiDetail.kpi_name || kpi.kpi_name,
          kraId: kpiDetail.kraId || kra.kra_id || kra._id,
          sectorId: kpiDetail.sectorId || null,
          subsectorId: kpiDetail.subsectorId || null,
          year: kpiDetail.year || currentEthYear,
          q1: kpiDetail.q1 || "N/A",
          q2: kpiDetail.q2 || "N/A",
          q3: kpiDetail.q3 || "N/A",
          q4: kpiDetail.q4 || "N/A",
          target: kpiDetail.target || "",
          performanceMeasure: kpiDetail.performanceMeasure || "",
          description: kpiDetail.description || "",
          kra: kraName,
          goal: goalName,
        });
      });
    });
  });

  // Group normalized data by goal and kra
  const groupedData = {};
  normalizedData.forEach((row) => {
    const groupKey = `${row.goal}|||${row.kra}`;
    if (!groupedData[groupKey]) groupedData[groupKey] = [];
    groupedData[groupKey].push(row);
  });

  // Merge and enrich rows with fetched KPI values
  const enrichRowsWithFetchedValues = (rows, groupKey) => {
    const fetchedRows = tableValues[groupKey] || [];
    const mergedFetchedRows = mergeRowsByKpi(fetchedRows);
    return rows.map((row) => {
      const fetchedRow = mergedFetchedRows.find(
        (f) => f.kpiId === row.kpiId || f.kpiName === row.kpiName
      );
      return {
        ...row,
        targets: fetchedRow?.targets || {},
        performance: fetchedRow?.performance || {},
        ratios: fetchedRow?.ratio || fetchedRow?.ratios || {},
      };
    });
  };

  const enrichedGroupedData = {};
  Object.entries(groupedData).forEach(([groupKey, rows]) => {
    enrichedGroupedData[groupKey] = enrichRowsWithFetchedValues(rows, groupKey);
  });

  return (
    <div className="p-4 overflow-x-auto relative">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-xs rounded border px-4 py-2 shadow-md ${
            notification.type === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
          role="alert"
        >
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            aria-label="Close notification"
            className="ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {loadingTableValues ? (
        <p className="mt-4 text-center text-gray-600">Loading KPI values...</p>
      ) : Object.entries(enrichedGroupedData).length > 0 ? (
        Object.entries(enrichedGroupedData).map(([groupKey, rows]) => (
          <KPITableReport
            key={groupKey}
            groupKey={groupKey}
            rows={rows}
            currentEthYear={currentEthYear}
          />
        ))
      ) : (
        <p className="mt-4 text-center text-gray-500">No KPI data found.</p>
      )}
    </div>
  );
}

export default KPIGroupedTableReport;
