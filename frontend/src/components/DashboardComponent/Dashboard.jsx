import InfoNavigation from "../InfoNavigation";
import KpiGaugeChart from "./KpiGaugeChart";
import KPIProgressTable from "./KPIProgressTable";
import PerformancePieChart from "./PerformancePieChart";
import StrategicGoalsDiagram from "./StrategicGoalsDiagram";
import useThemeStore from "../../store/themeStore";

function Dashboard() {
  const dark = useThemeStore((state) => state.dark);

  return (
    <div
      className={`w-full h-full overflow-y-auto px-4 md:px-8 py-6 transition-colors duration-300 ${
        dark
          ? "bg-gray-900 text-white"
          : "bg-[rgba(13,42,92,0.08)] text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Navigation Header */}
        <div className="w-full">
          <InfoNavigation />
        </div>

        {/* Charts Section */}
        <div className="w-full flex flex-col lg:flex-row justify-around items-center gap-6">
          <PerformancePieChart />
          <KpiGaugeChart value={56} />
        </div>

        {/* Diagram + Table Section */}
        <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-6">
          <StrategicGoalsDiagram />
          <KPIProgressTable />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
