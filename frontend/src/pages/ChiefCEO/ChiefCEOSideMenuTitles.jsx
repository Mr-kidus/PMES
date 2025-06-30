// src/components/sidebar/ChiefCEOSideMenuTitles.js
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

export default function useChiefCEOSideMenuTitles() {
  const { user } = useAuthStore();
  const userId = user?._id;
  const sectorId = user?.sector?._id || user?.sector;

  return [
    {
      sectionTitle: "Annual/Quarterly",
      key: "annual",
      menu: "Planning",
      icon: <FcPlanner size={20} />,
    },
    {
      key: "performance",
      menu: "Performance",
      icon: <FaChartLine size={16} color="#F36F21" />,
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
      // Dynamically include sectorId and userId in the link
      link: `Sector-reporting/${sectorId}?userId=${userId}`,
      icon: <FaFileExport size={16} color="#F36F21" />,
    },
    {
      sectionTitle: "Data Analysis",
      key: "dataAnalysis",
      menu: "Sectorial Illustration",
      icon: <IoAnalyticsSharp size={20} color="#F36F21" />,
    },
    {
      key: "subSectorialIllustration",
      menu: "Sub-Sectorial Illustration",
      icon: <FaChartPie size={16} color="#F36F21" />,
    },
    {
      sectionTitle: "Master Report",
      key: "masterReport",
      menu: "Performance Report",
      icon: <TbReportAnalytics size={20} color="#F36F21" />,
    },
    {
      key: "reportAffiliated",
      menu: "Report Affiliated",
      icon: <FaFileAlt size={16} color="#F36F21" />,
    },
  ];
}
