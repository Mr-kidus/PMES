import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import useThemeStore from "../../../../store/themeStore";

const BASE_URL = "http://localhost:1221/api";

function GoalKraKpiManagement() {
  const { dark } = useThemeStore();

  const [activeTab, setActiveTab] = useState("add");
  const [goals, setGoals] = useState([]);
  const [kras, setKras] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editType, setEditType] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [goalSearch, setGoalSearch] = useState("");
  const [kraSearch, setKraSearch] = useState("");
  const [kpiSearch, setKpiSearch] = useState("");

  const tableRef = useRef();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/goal2/get-goal2`)
      .then((res) => setGoals(res.data))
      .catch(() => setGoals([]));
    axios
      .get(`${BASE_URL}/kras2/get-kra2`)
      .then((res) => setKras(res.data))
      .catch(() => setKras([]));
    axios
      .get(`${BASE_URL}/kpi2/all2`)
      .then((res) => setKpis(res.data.data || []))
      .catch(() => setKpis([]));
  }, [refresh]);

  const handleAddGoal = async (desc) => {
    if (!desc.trim()) return;
    await axios.post(`${BASE_URL}/goal2/create-goal2`, { goal_desc: desc });
    setRefresh((r) => !r);
  };
  const handleAddKRA = async (name, goalId) => {
    if (!name.trim() || !goalId) return;
    await axios.post(`${BASE_URL}/kra2/create-kra2`, { kra_name: name, goalId });
    setRefresh((r) => !r);
  };
  const handleAddKPI = async (name, kraId, goalId) => {
    if (!name.trim() || !kraId || !goalId) return;
    await axios.post(`${BASE_URL}/kpi2/create-kpi2`, { kpi_name: name, kraId, goalId });
    setRefresh((r) => !r);
  };

  const handleEdit = (type, item) => {
    setEditType(type);
    setEditItem(item);
  };
  const handleEditSave = async (type, item) => {
    if (type === "goal") {
      await axios.put(`${BASE_URL}/goal2/edit-goal2/${item.id}`, { goal_desc: item.goal_desc });
    } else if (type === "kra") {
      await axios.put(`${BASE_URL}/kra2/edit-kra2/${item.id}`, { kra_name: item.kra_name, goalId: item.goalId });
    } else if (type === "kpi") {
      await axios.put(`${BASE_URL}/kpi2/edit-kpi2/${item.id}`, {
        kpi_name: item.kpi_name,
        kraId: item.kraId,
        goalId: item.goalId,
      });
    }
    setEditType(null);
    setEditItem(null);
    setRefresh((r) => !r);
  };

  const handleDelete = async (type, id) => {
    const endpoint =
      type === "goal" ? "goal2/delete-goal2" : type === "kra" ? "kra2/delete-kra2" : "kpi2/delete-kpi2";
    await axios.delete(`${BASE_URL}/${endpoint}/${id}`);
    setRefresh((r) => !r);
  };

  const filteredGoals = goals.filter((g) => g.goal_desc?.toLowerCase().includes(goalSearch.toLowerCase()));
  const filteredKras = kras.filter((k) => k.kra_name?.toLowerCase().includes(kraSearch.toLowerCase()));
  const filteredKpis = kpis.filter((k) => k.kpi_name?.toLowerCase().includes(kpiSearch.toLowerCase()));

  // Export functions
  const exportToExcel = () => {
    const data = [];

    goals.forEach((goal) => {
      const relatedKRAs = kras.filter((k) => k.goalId === goal._id || k.goalId?._id === goal._id);
      if (relatedKRAs.length === 0) {
        data.push({ Goal: goal.goal_desc, KRA: "No KRAs", KPI: "" });
      } else {
        relatedKRAs.forEach((kra) => {
          const relatedKPIs = kpis.filter((k) => k.kraId === kra._id);
          if (relatedKPIs.length === 0) {
            data.push({ Goal: goal.goal_desc, KRA: kra.kra_name, KPI: "No KPIs" });
          } else {
            relatedKPIs.forEach((kpi, i) => {
              data.push({
                Goal: i === 0 ? goal.goal_desc : "",
                KRA: i === 0 ? kra.kra_name : "",
                KPI: kpi.kpi_name,
              });
            });
          }
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPI_Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), `KPI_Report_${new Date().toISOString()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    const data = [];

    goals.forEach((goal) => {
      const relatedKRAs = kras.filter((k) => k.goalId === goal._id || k.goalId?._id === goal._id);
      if (relatedKRAs.length === 0) {
        data.push([goal.goal_desc, "No KRAs", ""]);
      } else {
        relatedKRAs.forEach((kra) => {
          const relatedKPIs = kpis.filter((k) => k.kraId === kra._id);
          if (relatedKPIs.length === 0) {
            data.push([goal.goal_desc, kra.kra_name, "No KPIs"]);
          } else {
            relatedKPIs.forEach((kpi, i) => {
              data.push([i === 0 ? goal.goal_desc : "", i === 0 ? kra.kra_name : "", kpi.kpi_name]);
            });
          }
        });
      }
    });

    autoTable(doc, {
      head: [["Goal", "KRA", "KPI"]],
      body: data,
      styles: { fillColor: dark ? "#1e293b" : "#fff", textColor: dark ? "#fff" : "#000" },
      headStyles: { fillColor: dark ? "#475569" : "#f3f4f6", textColor: dark ? "#fff" : "#000" },
    });

    doc.save(`KPI_Report_${new Date().toISOString()}.pdf`);
  };

  return (
    <div className={`p-6 max-w-5xl mx-auto min-h-screen ${dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <h2 className={`text-2xl font-bold mb-4 ${dark ? "text-orange-400" : "text-[#040613]"}`}>
        Goal, KRA, KPI Management
      </h2>

      <nav
        className={`flex border-b mb-6 ${
          dark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {["add", "view", "table"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 -mb-px font-semibold border-b-4 transition-all
              ${
                activeTab === tab
                  ? "border-[#F36F21] text-orange-500"
                  : dark
                  ? "border-transparent text-gray-400 hover:text-gray-200"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab === "add" ? "Add Goal/KRA/KPI" : tab === "view" ? "View & Manage" : "Table View"}
          </button>
        ))}
      </nav>

      {activeTab === "add" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AddGoalCard onAdd={handleAddGoal} dark={dark} />
          <AddKRACard onAdd={handleAddKRA} goals={goals} dark={dark} />
          <AddKPICard onAdd={handleAddKPI} kras={kras} goals={goals} dark={dark} />
        </div>
      )}

      {activeTab === "view" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ViewCard
            title="Goals"
            items={filteredGoals}
            type="goal"
            onEdit={handleEdit}
            onEditSave={handleEditSave}
            onDelete={handleDelete}
            search={goalSearch}
            setSearch={setGoalSearch}
            dark={dark}
          />
          <ViewCard
            title="KRAs"
            items={filteredKras}
            type="kra"
            onEdit={handleEdit}
            onEditSave={handleEditSave}
            onDelete={handleDelete}
            search={kraSearch}
            setSearch={setKraSearch}
            goals={goals}
            dark={dark}
          />
          <ViewCard
            title="KPIs"
            items={filteredKpis}
            type="kpi"
            onEdit={handleEdit}
            onEditSave={handleEditSave}
            onDelete={handleDelete}
            search={kpiSearch}
            setSearch={setKpiSearch}
            kras={kras}
            goals={goals}
            dark={dark}
          />
        </div>
      )}

      {activeTab === "table" && (
        <div
          className={`rounded-xl shadow p-6 border ${
            dark ? "border-gray-700 bg-gray-800" : "border-blue-100 bg-white"
          }`}
        >
          <div className="flex justify-between mb-4">
            <div className={`text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
              Export date: {new Date().toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1 px-4 py-2 bg-[#040613] text-white rounded hover:bg-blue-800"
              >
                <FaFileExcel className="text-[#F36F21]" size={20} />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-1 px-4 py-2 bg-[#F36F21] text-white rounded hover:bg-orange-700"
              >
                <FaFilePdf className="text-white" size={20} />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" ref={tableRef}>
            <table
              className={`w-full border-collapse border ${
                dark ? "border-gray-600" : "border-gray-300"
              }`}
            >
              <thead className={`${dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-[#040613]"}`}>
                <tr>
                  <th className="border border-gray-300 p-2">Goal</th>
                  <th className="border border-gray-300 p-2">KRA</th>
                  <th className="border border-gray-300 p-2">KPI</th>
                </tr>
              </thead>
              <tbody>
                {goals.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center p-4">
                      No data available.
                    </td>
                  </tr>
                ) : (
                  goals.map((goal) => {
                    const relatedKRAs = kras.filter(
                      (k) => k.goalId === goal._id || k.goalId?._id === goal._id
                    );
                    const totalRows =
                      relatedKRAs.reduce(
                        (acc, kra) => acc + Math.max(kpis.filter((k) => k.kra?.kra_id === kra._id).length, 1),
                        0
                      ) || 1;

                    if (relatedKRAs.length === 0) {
                      return (
                        <tr key={goal._id}>
                          <td className="border p-2 font-semibold">{goal.goal_desc}</td>
                          <td colSpan="2" className="border p-2 italic text-gray-500">
                            No KRAs
                          </td>
                        </tr>
                      );
                    }

                    const rows = [];
                    let goalRendered = false;

                    relatedKRAs.forEach((kra) => {
                      const relatedKPIs = kpis.filter((k) => k.kra?.kra_id === kra._id);

                      if (relatedKPIs.length === 0) {
                        rows.push(
                          <tr key={kra._id}>
                            {!goalRendered && (
                              <td rowSpan={totalRows} className="border p-2 align-top font-semibold">
                                {goal.goal_desc}
                              </td>
                            )}
                            <td className="border p-2">{kra.kra_name}</td>
                            <td className="border p-2 italic text-gray-500">No KPIs</td>
                          </tr>
                        );
                        goalRendered = true;
                      } else {
                        relatedKPIs.forEach((kpi, i) => {
                          rows.push(
                            <tr key={kpi.kpi_id}>
                              {!goalRendered && i === 0 && (
                                <td rowSpan={totalRows} className="border p-2 align-top font-semibold">
                                  {goal.goal_desc}
                                </td>
                              )}
                              {i === 0 && (
                                <td rowSpan={relatedKPIs.length} className="border p-2">
                                  {kra.kra_name}
                                </td>
                              )}
                              <td className="border p-2">{kpi.kpi_name}</td>
                            </tr>
                          );
                          goalRendered = true;
                        });
                      }
                    });

                    return rows;
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editType && (
        <EditModal
          type={editType}
          item={editItem}
          onClose={() => setEditType(null)}
          onSave={handleEditSave}
          goals={goals}
          kras={kras}
          dark={dark}
        />
      )}
    </div>
  );
}

// Add Goal Card Component
function AddGoalCard({ onAdd, dark }) {
  return (
    <div
      className={`rounded-xl shadow p-6 flex flex-col gap-3 border ${
        dark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-[#040613]/20 text-[#040613]"
      }`}
    >
      <h3 className="font-bold text-lg mb-2">Add Goal</h3>
      <AddInput
        placeholder="Goal description"
        onAdd={onAdd}
        buttonText="Add Goal"
        dark={dark}
      />
    </div>
  );
}

// Add KRA Card Component
function AddKRACard({ onAdd, goals, dark }) {
  const [kra, setKra] = useState("");
  const [goalId, setGoalId] = useState("");

  return (
    <div
      className={`rounded-xl shadow p-6 flex flex-col gap-3 border ${
        dark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-[#040613]/20 text-[#040613]"
      }`}
    >
      <h3 className="font-bold text-lg mb-2">Add KRA</h3>
      <input
        className={`border rounded px-3 py-2 ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-600"
        }`}
        placeholder="KRA name"
        value={kra}
        onChange={(e) => setKra(e.target.value)}
      />
      <select
        className={`border rounded px-3 py-2 ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100"
            : "bg-white border-gray-300 text-gray-900"
        }`}
        value={goalId}
        onChange={(e) => setGoalId(e.target.value)}
      >
        <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
          Select Goal
        </option>
        {goals.map((g) => (
          <option
            key={g._id}
            value={g._id}
            className={dark ? "text-gray-100" : "text-gray-900"}
          >
            {g.goal_desc}
          </option>
        ))}
      </select>
      <button
        className="bg-[#040613] hover:bg-[#003a8c] text-white rounded px-4 py-2 mt-2 disabled:opacity-50"
        onClick={() => {
          onAdd(kra, goalId);
          setKra("");
          setGoalId("");
        }}
        disabled={!kra.trim() || !goalId}
      >
        Add KRA
      </button>
    </div>
  );
}

// Add KPI Card Component
function AddKPICard({ onAdd, kras, goals, dark }) {
  const [kpi, setKpi] = useState("");
  const [kraId, setKraId] = useState("");
  const [goalId, setGoalId] = useState("");

  return (
    <div
      className={`rounded-xl shadow p-6 flex flex-col gap-3 border ${
        dark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-[#040613]/20 text-[#040613]"
      }`}
    >
      <h3 className="font-bold text-lg mb-2">Add KPI</h3>
      <input
        className={`border rounded px-3 py-2 ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-600"
        }`}
        placeholder="KPI name"
        value={kpi}
        onChange={(e) => setKpi(e.target.value)}
      />
      <select
        className={`border rounded px-3 py-2 ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100"
            : "bg-white border-gray-300 text-gray-900"
        }`}
        value={goalId}
        onChange={(e) => setGoalId(e.target.value)}
      >
        <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
          Select Goal
        </option>
        {goals.map((g) => (
          <option
            key={g._id}
            value={g._id}
            className={dark ? "text-gray-100" : "text-gray-900"}
          >
            {g.goal_desc}
          </option>
        ))}
      </select>
      <select
        className={`border rounded px-3 py-2 ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100"
            : "bg-white border-gray-300 text-gray-900"
        }`}
        value={kraId}
        onChange={(e) => setKraId(e.target.value)}
        disabled={!goalId}
      >
        <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
          Select KRA
        </option>
        {kras
          .filter((k) => k.goalId === goalId || k.goalId?._id === goalId)
          .map((k) => (
            <option
              key={k._id}
              value={k._id}
              className={dark ? "text-gray-100" : "text-gray-900"}
            >
              {k.kra_name}
            </option>
          ))}
      </select>
      <button
        className="bg-[#040613] hover:bg-[#003a8c] text-white rounded px-4 py-2 mt-2 disabled:opacity-50"
        onClick={() => {
          onAdd(kpi, kraId, goalId);
          setKpi("");
          setKraId("");
          setGoalId("");
        }}
        disabled={!kpi.trim() || !kraId || !goalId}
      >
        Add KPI
      </button>
    </div>
  );
}

// View Card Component
function ViewCard({
  title,
  items,
  type,
  onEdit,
  onEditSave,
  onDelete,
  goals = [],
  kras = [],
  search,
  setSearch,
  dark,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (item) => {
    setEditingId(item._id || item.kpi_id);
    setForm({
      ...item,
      goalId: item.goalId || item.goal?._id || item.goal?.goal_id || "",
      kraId: item.kraId || item.kra?._id || item.kra?.kra_id || "",
    });
  };

  const filteredKras = kras.filter((kra) => {
    const kraGoalId =
      typeof kra.goalId === "object" && kra.goalId !== null
        ? kra.goalId._id || kra.goalId.toString()
        : kra.goalId;
    return kraGoalId === form.goalId;
  });

  const handleSave = async () => {
    let idField = "_id";
    if (type === "kpi") idField = "kpi_id";
    if (!form[idField]) return;

    let payload;
    if (type === "kpi") {
      payload = {
        id: form.kpi_id || form._id,
        kpi_name: form.kpi_name,
        goalId: form.goalId,
        kraId: form.kraId,
      };
    } else if (type === "kra") {
      payload = {
        id: form._id,
        kra_name: form.kra_name,
        goalId: form.goalId,
      };
    } else if (type === "goal") {
      payload = {
        id: form._id,
        goal_desc: form.goal_desc,
      };
    }

    try {
      await onEditSave(type, payload);
      setEditingId(null);
      setForm({});
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  return (
    <div
      className={`rounded-xl shadow p-6 border ${
        dark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-[#040613]/20 text-[#040613]"
      }`}
    >
      <h3 className="font-semibold mb-3">{title}</h3>

      <input
        type="text"
        placeholder={`Search ${title}`}
        className={`mb-3 w-full rounded border px-3 py-2 ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-600"
        }`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="max-h-[450px] overflow-y-auto">
        {items.length === 0 ? (
          <p className={`italic ${dark ? "text-gray-400" : "text-gray-500"}`}>
            No {title.toLowerCase()} found.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const id = item._id || item.kpi_id;
              const isEditing = editingId === id;

              return (
                <li
                  key={id}
                  className={`flex justify-between items-center border rounded p-2 hover:shadow-sm ${
                    dark ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-col w-full gap-3">
                      {type === "goal" && (
                        <input
                          className={`rounded border px-2 py-1 w-full ${
                            dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          value={form.goal_desc || ""}
                          onChange={(e) => setForm((f) => ({ ...f, goal_desc: e.target.value }))}
                        />
                      )}

                      {type === "kra" && (
                        <div className="flex flex-col gap-2 min-h-[120px] w-full">
                          <input
                            className={`rounded border px-2 py-1 ${
                              dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            value={form.kra_name || ""}
                            onChange={(e) => setForm({ ...form, kra_name: e.target.value })}
                          />
                          <select
                            className={`rounded border px-2 py-1 ${
                              dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            value={form.goalId || ""}
                            onChange={(e) => setForm({ ...form, goalId: e.target.value })}
                          >
                            <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
                              Select Goal
                            </option>
                            {goals.map((g) => (
                              <option key={g._id} value={g._id} className={dark ? "text-gray-100" : "text-gray-900"}>
                                {g.goal_desc}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {type === "kpi" && (
                        <div className="flex flex-col gap-2 min-h-[160px] w-full">
                          <input
                            className={`rounded border px-2 py-1 ${
                              dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            value={form.kpi_name || ""}
                            onChange={(e) => setForm({ ...form, kpi_name: e.target.value })}
                          />
                          <select
                            className={`rounded border px-2 py-1 ${
                              dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            value={form.goalId || ""}
                            onChange={(e) => {
                              const newGoalId = e.target.value;
                              setForm((f) => ({ ...f, goalId: newGoalId, kraId: "" }));
                            }}
                          >
                            <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
                              Select Goal
                            </option>
                            {goals.map((g) => (
                              <option key={g._id} value={g._id} className={dark ? "text-gray-100" : "text-gray-900"}>
                                {g.goal_desc}
                              </option>
                            ))}
                          </select>
                          <select
                            className={`rounded border px-2 py-1 ${
                              dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            value={form.kraId || ""}
                            onChange={(e) => setForm({ ...form, kraId: e.target.value })}
                            disabled={!form.goalId}
                          >
                            <option value="" className={dark ? "text-gray-400" : "text-gray-600"}>
                              Select KRA
                            </option>
                            {filteredKras.map((k) => (
                              <option key={k._id} value={k._id} className={dark ? "text-gray-100" : "text-gray-900"}>
                                {k.kra_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-1 bg-[#F36F21] hover:bg-[#d45f1d] text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>
                        {type === "goal" && item.goal_desc}
                        {type === "kra" && item.kra_name}
                        {type === "kpi" && item.kpi_name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="hover:underline"
                          style={{ color: dark ? "inherit" : "#040613" }}
                          aria-label={`Edit ${type}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(type, id)}
                          className="text-red-600 hover:underline"
                          aria-label={`Delete ${type}`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({ type, item, onClose, onSave, goals, kras, dark }) {
  const [form, setForm] = useState({ ...item });

  useEffect(() => {
    setForm({ ...item });
  }, [item]);

  const handleSave = () => {
    onSave(type, form);
    onClose();
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div
        className={`rounded-lg shadow-lg p-6 w-96 max-w-full ${
          dark ? "bg-gray-800 text-gray-100" : "bg-white text-[#040613]"
        }`}
      >
        <h3 className="text-xl font-semibold mb-4 text-green-700">
          Edit {type.toUpperCase()}
        </h3>
        {type === "goal" && (
          <input
            className={`border rounded px-3 py-2 w-full mb-4 ${
              dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
            }`}
            value={form.goal_desc}
            onChange={(e) => setForm((f) => ({ ...f, goal_desc: e.target.value }))}
          />
        )}
        {type === "kra" && (
          <>
            <input
              className={`border rounded px-3 py-2 w-full mb-4 ${
                dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
              }`}
              value={form.kra_name}
              onChange={(e) => setForm((f) => ({ ...f, kra_name: e.target.value }))}
            />
            <select
              className={`border rounded px-3 py-2 w-full mb-4 ${
                dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
              }`}
              value={form.goalId?._id || form.goalId || ""}
              onChange={(e) => setForm((f) => ({ ...f, goalId: e.target.value }))}
            >
              <option value="">Select Goal</option>
              {goals.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.goal_desc}
                </option>
              ))}
            </select>
          </>
        )}
        {type === "kpi" && (
          <>
            <input
              className={`border rounded px-3 py-2 w-full mb-4 ${
                dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
              }`}
              value={form.kpi_name}
              onChange={(e) => setForm((f) => ({ ...f, kpi_name: e.target.value }))}
            />
            <select
              className={`border rounded px-3 py-2 mb-4 w-full ${
                dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
              }`}
              value={form.goal?.goal_id || form.goalId || ""}
              onChange={(e) => setForm((f) => ({ ...f, goal: { goal_id: e.target.value } }))}
            >
              <option value="">Select Goal</option>
              {goals.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.goal_desc}
                </option>
              ))}
            </select>
            <select
              className={`border rounded px-3 py-2 w-full mb-4 ${
                dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"
              }`}
              value={form.kra?.kra_id || form.kraId || ""}
              onChange={(e) => setForm((f) => ({ ...f, kra: { kra_id: e.target.value } }))}
            >
              <option value="">Select KRA</option>
              {kras
                .filter((k) => k.goalId === (form.goal?.goal_id || form.goalId))
                .map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.kra_name}
                  </option>
                ))}
            </select>
          </>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Add Input with button for AddGoalCard
function AddInput({ placeholder, onAdd, buttonText, dark }) {
  const [value, setValue] = useState("");

  const handleAddClick = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };

  return (
    <>
      <input
        type="text"
        className={`border rounded px-3 py-2 w-full ${
          dark
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-600"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        className="bg-[#040613] hover:bg-[#003a8c] text-white rounded px-4 py-2 mt-2 disabled:opacity-50"
        onClick={handleAddClick}
        disabled={!value.trim()}
      >
        {buttonText}
      </button>
    </>
  );
}

export default GoalKraKpiManagement;
