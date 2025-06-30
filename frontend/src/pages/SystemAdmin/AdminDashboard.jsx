import AdminInfo from "./AdminInfo";
import { Outlet } from "react-router-dom";
import Actions from "../../components/Actions";
import Modal from "../../components/Modal";
import AddSector from "./AdminComponents/AddSector";
import AddSubSector from "./AdminComponents/AddSubSector";
import { useState } from "react";
import ViewUsers from "../../components/ViewUsers";
import useThemeStore from "../../store/themeStore";

function AdminDashboard() {
  const [showForm, setShowForm] = useState({});
  const dark = useThemeStore((state) => state.dark);

  function toggleForm(id) {
    setShowForm((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className={`${dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"} space-y-6`}>
      <AdminInfo />

      {showForm[1] && (
        <Modal toggleForm={toggleForm} id={1}>
          <ViewUsers />
        </Modal>
      )}
      {showForm[2] && (
        <Modal toggleForm={toggleForm} id={2}>
          <AddSector />
        </Modal>
      )}
      {showForm[3] && (
        <Modal toggleForm={toggleForm} id={3}>
          <AddSubSector />
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Outlet />
        </div>
        <div>
          <Actions toggleForm={toggleForm} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
