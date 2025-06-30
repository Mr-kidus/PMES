import { MdOutlineDisplaySettings } from "react-icons/md";
import { IoAnalyticsSharp } from "react-icons/io5";
import { FcPlanner } from "react-icons/fc";
import { TbReportAnalytics } from "react-icons/tb";
import { FaChartLine, FaFileExport, FaChartPie, FaFileAlt } from "react-icons/fa";

const Datas = [
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
    icon: <FcPlanner size={20} />,
  },
  {
    key: "performanceValidation",
    menu: "Performance Validation",
    link: "Performance-validation",
    icon: <FcPlanner size={20} />,
  },
  {
    sectionTitle: "Data Management",
    key: "dataManagement",
    menu: "Performance Alert",
    icon: <MdOutlineDisplaySettings size={20} color="#F36F21" />,
  },
  {
    key: "reporting",
    menu: "Export and Reporting",
    // no link with sector or subsector id, open page with filter UI inside
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
    key: "subsectorial",
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
