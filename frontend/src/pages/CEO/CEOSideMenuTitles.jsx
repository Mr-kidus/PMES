// src/components/sidebar/useCEOSideMenuTitles.js
import {
  MdOutlineDisplaySettings,
  MdVerified,
} from "react-icons/md";
import { IoAnalyticsSharp } from "react-icons/io5";
import { FcPlanner } from "react-icons/fc";
import {
  TbReportAnalytics,
  TbTarget,
} from "react-icons/tb";
import {
  FaChartLine,
  FaFileExport,
  FaChartPie,
  FaFileAlt,
} from "react-icons/fa";

import useAuthStore from "../../store/auth.store";

export default function useCEOSideMenuTitles() {
  const { user } = useAuthStore();
  const userId = user?._id;
  const subsectorId = user?.subsector?._id || user?.subsector;

  return [
    {
      sectionTitle: "Annual/Quarterly",
      key: "planning",
      menu: "Planning",
      link: "planning",
      icon: <FcPlanner size={20} />,
    },
    {
      key: "performance",
      menu: "Performance",
      link: "performance",
      icon: <FaChartLine size={16} color="#F36F21" />,
    },
    {
      sectionTitle: "Worker Management",
      key: "Task Assignment",
      menu: "Task Assignment",
      link: `KPI-Measures`,
      icon: <IoAnalyticsSharp size={20} color="#F36F21" />,
    },
    {
      key: "workerReport",
      menu: "Worker Report",
      link: "worker-report",
      icon: <FaChartPie size={16} color="#F36F21" />,
    },
    {
      sectionTitle: "Validation",
      key: "validation",
      menu: "Target Validation",
      link: "Target-validation",
      icon: <TbTarget size={20} color="#F36F21" />,
    },
    {
      key: "performanceValidation",
      menu: "Performance Validation",
      link: "Performance-validation",
      icon: <MdVerified size={20} color="#F36F21" />,
    },
    {
      sectionTitle: "Data Management",
      key: "dataManagement",
      menu: "Performance Alert",
      icon: <MdOutlineDisplaySettings size={20} color="#F36F21" />,
    },
    {
      key: "exportReporting",
      menu: "Export and Reporting",
      link: `Subsector-reporting/${subsectorId}?userId=${userId}`,
      icon: <FaFileExport size={16} color="#F36F21" />,
    },
        
  ];
}
