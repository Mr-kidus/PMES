// src/components/sidebar/useWorkunitSideMenuTitles.js
import {
  MdOutlineDisplaySettings,
} from "react-icons/md";
import { FcPlanner } from "react-icons/fc";
import {
  TbReportAnalytics,
} from "react-icons/tb";
import {
  FaChartLine,
  FaFileExport,
  FaFileAlt,
} from "react-icons/fa";

import useAuthStore from "../../store/auth.store";

export default function useWorkunitSideMenuTitles() {
  const { user } = useAuthStore();
  const userId = user?._id;
  const subsectorId = user?.subsector?._id || user?.subsector;

  return [
    {
      sectionTitle: "Annual/Quarterly",
      sectionIcon: <FcPlanner size={20} />, // section title icon
      items: [
        {
          key: "planning",
          menu: "Planning",
          link: "planning",
          icon: <TbReportAnalytics size={16} color="#F36F21" />, // menu icon
        },
        {
          key: "performance",
          menu: "Performance",
          link: "performance",
          icon: <FaChartLine size={16} color="#F36F21" />,
        },
      ],
    },
    {
      sectionTitle: "Data Management",
      sectionIcon: <MdOutlineDisplaySettings size={20} color="#F36F21" />,
      items: [
        {
          key: "performance-alert",
          menu: "Performance Alert",
          link: "#",
          icon: <FaFileAlt size={16} color="#F36F21" />,
        },
      ],
    },
    {
      sectionTitle: "Export",
      sectionIcon: <FaFileExport size={20} color="#F36F21" />,
      items: [
        {
          key: "exportReporting",
          menu: "Export and Reporting",
          link: "worker-report",
          icon: <FaFileExport size={16} color="#F36F21" />,
        },
      ],
    },
  ];
}
