import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function UserReportTable() {
  const [userProfile, setUserProfile] = useState(null);
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          "http://localhost:1221/api/reports/generate-report",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setUserProfile(res.data.userProfile);
        setReport(res.data.report);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching report:", error);
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Flatten the report data for Excel
  const prepareExcelData = () => {
    // User Profile sheet data
    const userProfileSheet = [
      ["Field", "Value"],
      ["Full Name", userProfile.fullName],
      ["Email", userProfile.email],
      ["Role", userProfile.role],
      ["Sector", userProfile.sector],
      ["Subsector", userProfile.subSector],
    ];

    // Prepare Performance Report sheet rows
    const reportRows = [];

    // Iterate through nested report data to flatten
    for (const [goal, kras] of Object.entries(report)) {
      for (const [kra, kpis] of Object.entries(kras)) {
        kpis.forEach((item) => {
          reportRows.push({
            Goal: goal,
            KRA: kra,
            KPI: item.kpi,
            Target: item.target,
            Q1: item.q1,
            Q2: item.q2,
            Q3: item.q3,
            Q4: item.q4,
            Year: item.year,
            "Validation Year": item.validationStatus.year,
            "Validation Q1": item.validationStatus.q1,
            "Validation Q2": item.validationStatus.q2,
            "Validation Q3": item.validationStatus.q3,
            "Validation Q4": item.validationStatus.q4,
            "Validation Desc Year": item.validationDescription.year,
            "Validation Desc Q1": item.validationDescription.q1,
            "Validation Desc Q2": item.validationDescription.q2,
            "Validation Desc Q3": item.validationDescription.q3,
            "Validation Desc Q4": item.validationDescription.q4,
          });
        });
      }
    }

    return { userProfileSheet, reportRows };
  };

  const downloadExcel = () => {
    const { userProfileSheet, reportRows } = prepareExcelData();

    const wb = XLSX.utils.book_new();

    // Sheet 1: User Profile
    const wsProfile = XLSX.utils.aoa_to_sheet(userProfileSheet);
    XLSX.utils.book_append_sheet(wb, wsProfile, "User Profile");

    // Sheet 2: Performance Report (flattened)
    const wsReport = XLSX.utils.json_to_sheet(reportRows);
    XLSX.utils.book_append_sheet(wb, wsReport, "Performance Report");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `Performance_Report_${userProfile.fullName}.xlsx`);
  };

  if (loading)
    return (
      <div className="p-4 text-gray-700 font-medium text-center">Loading...</div>
    );
  if (!userProfile)
    return (
      <div className="p-4 text-red-500 font-semibold text-center">
        No user data
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
        Performance Report
      </h2>

      <button
        onClick={downloadExcel}
        className="mb-6 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
      >
        Download Excel
      </button>

      {/* User Profile Table */}
      <div className="mb-8 overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="py-3 px-6 text-left text-lg font-semibold">
                User Profile
              </th>
              <th className="py-3 px-6 text-left text-lg font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-3 px-6 font-medium text-gray-700">Full Name</td>
              <td className="py-3 px-6">{userProfile.fullName}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-3 px-6 font-medium text-gray-700">Email</td>
              <td className="py-3 px-6">{userProfile.email}</td>
            </tr>
            <tr>
              <td className="py-3 px-6 font-medium text-gray-700">Role</td>
              <td className="py-3 px-6">{userProfile.role}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-3 px-6 font-medium text-gray-700">Sector</td>
              <td className="py-3 px-6">{userProfile.sector}</td>
            </tr>
            <tr>
              <td className="py-3 px-6 font-medium text-gray-700">Subsector</td>
              <td className="py-3 px-6">{userProfile.subSector}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Report by Goal > KRA > KPI */}
      {Object.entries(report).map(([goal, kras]) => (
        <div
          key={goal}
          className="mb-10 rounded-lg border border-gray-300 shadow-md overflow-hidden"
        >
          <h3 className="bg-green-700 text-white p-3 font-semibold text-xl">
            Goal: {goal}
          </h3>

          {Object.entries(kras).map(([kra, kpis]) => (
            <div key={kra} className="p-4 border-b last:border-none">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">KRA: {kra}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">KPI</th>
                      <th className="px-3 py-2 text-right">Target</th>
                      <th className="px-3 py-2 text-right">Q1</th>
                      <th className="px-3 py-2 text-right">Q2</th>
                      <th className="px-3 py-2 text-right">Q3</th>
                      <th className="px-3 py-2 text-right">Q4</th>
                      <th className="px-3 py-2 text-center">Year</th>
                      <th className="px-3 py-2 text-left">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {kpis.map((item, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-3 py-2">{item.kpi}</td>
                        <td className="px-3 py-2 text-right">{item.target}</td>
                        <td className="px-3 py-2 text-right">{item.q1}</td>
                        <td className="px-3 py-2 text-right">{item.q2}</td>
                        <td className="px-3 py-2 text-right">{item.q3}</td>
                        <td className="px-3 py-2 text-right">{item.q4}</td>
                        <td className="px-3 py-2 text-center">{item.year}</td>
                        <td className="px-3 py-2">
                          <div>
                            <strong>Year:</strong> {item.validationStatus.year} <br />
                            <strong>Q1:</strong> {item.validationStatus.q1} <br />
                            <strong>Q2:</strong> {item.validationStatus.q2} <br />
                            <strong>Q3:</strong> {item.validationStatus.q3} <br />
                            <strong>Q4:</strong> {item.validationStatus.q4}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default UserReportTable;
