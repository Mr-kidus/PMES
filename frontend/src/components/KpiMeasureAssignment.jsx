import React, { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../store/themeStore";
import useAuthStore from "../store/auth.store";

const backendUrl = "http://localhost:1221";

function getCurrentEthiopianYear() {
  const today = new Date();
  const ethYear = today.getFullYear() - 8; // Adjust if needed
  return ethYear.toString();
}

const KpiMeasureAssignment = () => {
  const { user } = useAuthStore();
  console.log(user);
  const dark = useThemeStore((state) => state.dark);

  const [assignedKpis, setAssignedKpis] = useState([]);
  const [measuresByKpi, setMeasuresByKpi] = useState({});
  const [workers, setWorkers] = useState([]);
  const [selectedAddKpi, setSelectedAddKpi] = useState("");
  const [measureInput, setMeasureInput] = useState("");
  const [selectedAssignKpi, setSelectedAssignKpi] = useState("");
  const [selectedMeasure, setSelectedMeasure] = useState("");
  const [target, setTarget] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [year, setYear] = useState("");
  const [quarter, setQuarter] = useState("");

  useEffect(() => {
    setYear(getCurrentEthiopianYear());
  }, []);

  const inputClasses = `w-full px-3 py-2 rounded-md border text-sm ${
    dark ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-300"
  }`;
  const labelClasses = `text-sm font-semibold mb-1 ${
    dark ? "text-white" : "text-gray-800"
  }`;
  const cardClasses = `rounded-2xl p-5 shadow-md mb-6 max-w-2xl w-full ${
    dark ? "bg-gray-900 text-white" : "bg-white text-gray-800"
  }`;
  const buttonClasses = `bg-[#F36F21] hover:bg-orange-600 transition text-white px-4 py-2 rounded-lg mt-2 font-medium`;

  useEffect(() => {
    const fetchAssignedKpis = async () => {
      const subsectorId = user?.subsector?._id || user?.subsector;
      if (!subsectorId) return;

      try {
        const res = await axios.get(
          `${backendUrl}/api/assign/assigned-kpi-with-goal-details/${subsectorId}`
        );

        const kpisObject = res.data || {};
        const kpiArray = Object.entries(kpisObject).flatMap(([goalId, goalObj]) => {
          return Object.entries(goalObj.kras || {}).flatMap(([kraId, kraObj]) => {
            return kraObj.kpis.map((kpi) => ({
              ...kpi,
              kra_name: kraObj.kra_name,
              goal_desc: goalObj.goal_desc,
            }));
          });
        });

        console.log("✅ Flattened KPIs:", kpiArray);
        setAssignedKpis(kpiArray);
      } catch (err) {
        console.error("Failed to fetch assigned KPIs:", err);
        setAssignedKpis([]);
      }
    };

    fetchAssignedKpis();
  }, [user]);

  useEffect(() => {
    const fetchMeasures = async () => {
      if (!selectedAssignKpi) return;

      try {
        const res = await axios.get(
          `${backendUrl}/api/measure/by-kpi/${selectedAssignKpi}`
        );

        setMeasuresByKpi((prev) => ({
          ...prev,
          [selectedAssignKpi]: res.data || [],
        }));
      } catch (err) {
        console.error("Failed to fetch measures:", err);
      }
    };

    fetchMeasures();
  }, [selectedAssignKpi]);

  useEffect(() => {
    const fetchWorkers = async () => {
      const subsectorId = user?.subsector?._id || user?.subsector;
      if (!subsectorId) return;

      try {
        const res = await axios.get(`${backendUrl}/api/users/get-users`, {
          withCredentials: true,
        });

        const allUsers = res.data || [];
        console.log("✅ All fetched users:", allUsers);

        const filtered = allUsers.filter(
          (u) => u.subsector === subsectorId || u.subsector?._id === subsectorId
        );

        console.log("✅ Users in same subsector:", filtered);
        setWorkers(filtered);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      }
    };

    fetchWorkers();
  }, [user]);

  const addMeasure = async () => {
    if (!selectedAddKpi || !measureInput.trim()) {
      return alert("Please select a KPI and enter a measure");
    }

    try {
      const res = await axios.post(`${backendUrl}/api/measure`, {
        kpiId: selectedAddKpi,
        name: measureInput.trim(),
      });

      if (res.status === 201) {
        setMeasuresByKpi((prev) => {
          const updated = { ...prev };
          if (!updated[selectedAddKpi]) updated[selectedAddKpi] = [];
          updated[selectedAddKpi].push(res.data.data);
          return updated;
        });

        setMeasureInput("");
        alert("Measure added successfully");
      }
    } catch (err) {
      console.error("Failed to add measure:", err);
      alert("Failed to add measure");
    }
  };

  const assignMeasure = async () => {
  if (!selectedAssignKpi || !selectedMeasure || !target || !selectedWorker || !year || !quarter) {
    return alert("Please fill all fields to assign");
  }

  try {
    const res = await axios.post(
      `${backendUrl}/api/measure-assignment`,
      {
        measureId: selectedMeasure,
        workerId: selectedWorker,
        target,
        year,
        quarter,
      },
      { withCredentials: true } // <-- add this line!
    );

    if (res.status === 201 || res.status === 200) {
      alert("Assigned successfully");
      setTarget("");
      setSelectedMeasure("");
      setSelectedWorker("");
      setQuarter("");
    }
  } catch (err) {
    console.error("Failed to assign measure:", err);
    alert("Failed to assign measure");
  }
};


  return (
    <div
      className={`flex flex-col items-center p-6 ${
        dark ? "bg-[#111827]" : "bg-[#f9fafb]"
      } min-h-screen transition-all`}
    >
      {/* Add KPI Measures */}
      <div className={cardClasses}>
        <h2 className="text-lg font-bold mb-4">Add KPI Measures</h2>

        <label className={labelClasses}>Select KPI</label>
        <select
          className={inputClasses}
          value={selectedAddKpi}
          onChange={(e) => setSelectedAddKpi(e.target.value)}
        >
          <option value="">-- Select KPI --</option>
          {assignedKpis.map((k) => (
            <option key={k._id} value={k._id}>
              {k.kpi_name || k.name || "Unnamed KPI"}
            </option>
          ))}
        </select>

        <label className={labelClasses}>Measure</label>
        <input
          className={inputClasses}
          placeholder="e.g., Response Time"
          value={measureInput}
          onChange={(e) => setMeasureInput(e.target.value)}
        />
        <button className={buttonClasses} onClick={addMeasure}>
          Add Measure
        </button>

        <div className="flex flex-wrap mt-4 gap-2">
          {(measuresByKpi[selectedAddKpi] || []).map((m) => (
            <span
              key={m._id}
              className={`text-sm px-3 py-1 rounded-full ${
                dark ? "bg-orange-800 text-white" : "bg-orange-100 text-orange-800"
              }`}
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Assign Measure to Worker */}
      <div className={cardClasses}>
        <h2 className="text-lg font-bold mb-4">Assign Measure to Worker</h2>

        <label className={labelClasses}>Select KPI</label>
        <select
          className={inputClasses}
          value={selectedAssignKpi}
          onChange={(e) => setSelectedAssignKpi(e.target.value)}
        >
          <option value="">-- Select KPI --</option>
          {assignedKpis.map((k) => (
            <option key={k._id} value={k._id}>
              {k.kpi_name || k.name || "Unnamed KPI"}
            </option>
          ))}
        </select>

        <label className={labelClasses}>Select Measure</label>
        <select
          className={inputClasses}
          value={selectedMeasure}
          onChange={(e) => setSelectedMeasure(e.target.value)}
          disabled={!selectedAssignKpi}
        >
          <option value="">-- Select Measure --</option>
          {(measuresByKpi[selectedAssignKpi] || []).map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <label className={labelClasses}>Target</label>
        <input
          className={inputClasses}
          placeholder="e.g., 95%"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />

        <label className={labelClasses}>Select Worker</label>
        <select
          className={inputClasses}
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
        >
          <option value="">-- Select Worker --</option>
          {workers.map((w) => (
            <option key={w._id} value={w._id}>
              {w.fullName} ({w.role})
            </option>
          ))}
        </select>

        <label className={labelClasses}>Year</label>
        <input
          className={inputClasses}
          placeholder="e.g., 2016"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <label className={labelClasses}>Quarter</label>
        <select
          className={inputClasses}
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
        >
          <option value="">-- Select Quarter --</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>

        <button className={buttonClasses} onClick={assignMeasure}>
          Assign
        </button>
      </div>
    </div>
  );
};

export default KpiMeasureAssignment;
