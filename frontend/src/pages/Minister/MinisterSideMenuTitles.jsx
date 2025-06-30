import { MdOutlineDisplaySettings, MdVerified } from "react-icons/md";
import { IoAnalyticsSharp } from "react-icons/io5";
import { FcPlanner } from "react-icons/fc";
import { TbReportAnalytics, TbTarget } from "react-icons/tb";
import { FaChartLine, FaFileExport, FaChartPie, FaFileAlt } from "react-icons/fa";

const Datas = [
  {
    sectionTitle: "Annual/Quarterly",
    key: "annual",
    menu: "Planning",
    icon: <FcPlanner size={20} />, // blue-ish icon with default color
  },
  {
    key: "performance",
    menu: "Performance",
    icon: <FaChartLine size={16} color="#F36F21" />, // orange icon
  },
  {
    sectionTitle: "Validation",
    key: "validation",
    menu: "Target Validation",
    link: "Target-validation",
    icon: <TbTarget size={20} color="#F36F21" />, // changed to target icon in orange
  },
  {
    key: "performanceValidation",
    menu: "Performance Validation",
    link: "Performance-validation",
    icon: <MdVerified size={20} color="#F36F21" />, // changed to verified icon in orange
  },
  {
    sectionTitle: "Data Management",
    key: "dataManagement",
    menu: "Performance Alert",
    icon: <MdOutlineDisplaySettings size={20} color="#F36F21" />, // orange icon
  },
  {
    key: "exportReporting",
    menu: "Export and Reporting",
    link: "Sector-reporting",
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

export default Datas;
