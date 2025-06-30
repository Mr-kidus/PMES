import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ChiefCEO from "./pages/ChiefCEO/ChiefCEO";
import CEO from "./pages/CEO/CEO";
import Strategic from "./pages/Strategic/Strategic";
import Minister from "./pages/Minister/Minister";
import Worker from "./pages/Worker/Worker";

import useAuthStore from "./store/auth.store";
import useThemeStore from "./store/themeStore";
import { useEffect } from "react";

import Login from "./Authentication/Login/Login";
import ProtectRoute from "./utils/ProtectRoute";
import Admin from "./pages/SystemAdmin/Admin";
import AdminDashboard from "./pages/SystemAdmin/AdminDashboard";
import Chart from "./components/Chart/Chart";
import UserManagment from "./components/UserManagment";
import Alert from "./components/Alert";
import Configuration from "./components/Configuration";
import LiChart from "./components/Chart/LiChart";
import BChart from "./components/Chart/BChart";
import EditSystemSetting from "./components/EditSystemSetting";
import UserProfile from "./components/UserProfile";
import KpiAssignment from "./pages/SystemAdmin/AdminComponents/KpiAssignment";
import KpiYearAssignmentPage from "./pages/SystemAdmin/AdminComponents/KpiYearAssignmentPage";
import AddGoalKraKpi from "./pages/SystemAdmin/AdminComponents/GoalKpiKra/AddGoalKraKpi";
import AllSector from "./components/Sector/AllSector";
import AllSubsector from "./components/Sector/AllSubsector";
import PerformanceValidation from "./components/PerformanceValidation";
import TargetValidation from "./components/TargetValidation";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Dashboard from "./components/DashboardComponent/Dashboard";
import ChatPage from "./components/Chat/ChatPage";
import GoalKraKpiManagement from "./pages/SystemAdmin/AdminComponents/GoalKpiKra/GoalKraKpiManagement";
import UserReportTable from "./components/UserReportTble";
import Setting from "./components/Setting";
import KPITableReport from "./components/Table/KPITableReport";
import AllSubsectorReport from "./components/Sector/AllSubsectorReport";
import AllSectorReport from "./components/Sector/AllSectorReoprt";
import KpiMeasureAssignment from "./components/KpiMeasureAssignment";
import WorkerPlans from "./components/Sector/WorkerPlans";
import WorkerPerformanceSubmission from "./components/Sector/WorkerPerformanceSubmission";
import WorkerPerformanceReport from "./components/Sector/WorkerPerformanceReport";
import FullPMESChatBot from "./components/FullPMESChatBot";
import Notifications from "./components/NotificationCard2";
import NotificationCard from "./components/NotificationCard";

function AppContent() {
  const { checkAuth } = useAuthStore();
  const dark = useThemeStore((state) => state.dark);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const hideChatbot = location.pathname === "/" || location.pathname.startsWith("/admin");

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-gray-900 text-white" : "bg-[rgba(13,42,92,0.08)] text-gray-900"
      }`}
    >
      <Routes>
        <Route path="/" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectRoute>
              <Admin />
            </ProtectRoute>
          }
        >
          <Route index element={<Navigate to="admin-dashboard" replace />} />
          <Route path="admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<Navigate to="chart" replace />} />
            <Route path="chart" element={<Chart />}>
              <Route index element={<Navigate to="linechart" replace />} />
              <Route path="linechart" element={<LiChart />} />
              <Route path="barchart" element={<BChart />} />
            </Route>
            <Route path="setting" element={<EditSystemSetting />} />
          </Route>
          <Route path="user-managment" element={<UserManagment />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="Kpi-Assign" element={<KpiAssignment />} />
          <Route path="alert" element={<Alert />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="Goal-Kra-Kpi" element={<AddGoalKraKpi />} />
          <Route path="Goal-" element={<AddGoalKraKpi />} />
          <Route path="Kpi-Year-Assign" element={<KpiYearAssignmentPage />} />
          <Route path="goal-kra-kpi-management" element={<GoalKraKpiManagement />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="setting" element={<Setting />} />
          <Route path="notification" element={<NotificationCard />} />
            
        </Route>

        {/* CEO ROUTES */}
        <Route
          path="/ceo"
          element={
            <ProtectRoute>
              <CEO />
            </ProtectRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="allSector/:sectorId" element={<AllSector />} />
          <Route path="allSubsector/:subsectorId" element={<AllSubsector />} />
          <Route path="Subsector-reporting/:subsectorId" element={<AllSubsectorReport />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="performance-validation" element={<PerformanceValidation />} />
          <Route path="Target-validation" element={<TargetValidation />} />
          <Route path="user-report" element={<KPITableReport />} />
          <Route path="setting" element={<Setting />} />
          <Route path="KPI-Measures" element={<KpiMeasureAssignment />} />
          <Route path="planning" element={<WorkerPlans />} />
          <Route path="performance" element={<WorkerPerformanceSubmission />} />
          <Route path="worker-report" element={<WorkerPerformanceReport />} />
          <Route path="notification" element={<NotificationCard />} />
            
        </Route>

        {/* CHIEF CEO ROUTES */}
        <Route
          path="/chief-ceo"
          element={
            <ProtectRoute>
              <ChiefCEO />
            </ProtectRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="allSector/:sectorId" element={<AllSector />} />
          <Route path="allSubsector/:subsectorId" element={<AllSubsector />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="performance-validation" element={<PerformanceValidation />} />
          <Route path="Target-validation" element={<TargetValidation />} />
          <Route path="user-report" element={<UserReportTable />} />
          <Route path="sector-reporting/:sectorId" element={<AllSectorReport />} />
          <Route path="setting" element={<Setting />} />
          <Route path="notification" element={<NotificationCard />} />
            
        </Route>

        {/* STRATEGIC */}
        <Route
          path="/strategic"
          element={
            <ProtectRoute>
              <Strategic />
            </ProtectRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="allSector/:sectorId" element={<AllSector />} />
          <Route path="allSubsector/:subsectorId" element={<AllSubsector />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="performance-validation" element={<PerformanceValidation />} />
          <Route path="Target-validation" element={<TargetValidation />} />
          <Route path="sector-reporting" element={<AllSectorReport />} />
          <Route path="setting" element={<Setting />} />
          <Route path="notification" element={<NotificationCard />} />
            
        </Route>

        {/* MINISTER */}
        <Route
          path="/minister"
          element={
            <ProtectRoute>
              <Minister />
            </ProtectRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="allSector/:sectorId" element={<AllSector />} />
          <Route path="allSubsector/:subsectorId" element={<AllSubsector />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="setting" element={<Setting />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="performance-validation" element={<PerformanceValidation />} />
          <Route path="Target-validation" element={<TargetValidation />} />
          <Route path="sector-reporting" element={<AllSectorReport />} />
          <Route path="notification" element={<NotificationCard />} />
            
        </Route>

        {/* WORKER */}
        <Route
          path="/worker"
          element={
            <ProtectRoute>
              <Worker />
            </ProtectRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="allSector/:sectorId" element={<AllSector />} />
          <Route path="allSubsector/:subsectorId" element={<AllSubsector />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="user-report" element={<UserReportTable />} />
          <Route path="Subsector-reporting/:subsectorId" element={<AllSubsectorReport />} />
          <Route path="setting" element={<Setting />} />
          <Route path="planning" element={<WorkerPlans />} />
          <Route path="performance" element={<WorkerPerformanceSubmission />} />
          <Route path="worker-report" element={<WorkerPerformanceReport />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {!hideChatbot && <FullPMESChatBot />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
