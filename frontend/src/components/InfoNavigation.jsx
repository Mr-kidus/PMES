import React, { useEffect, useState } from "react";
import axios from "axios";
import useThemeStore from "../store/themeStore";

const BACKEND_URL = "http://localhost:1221"; // Adjust if needed

const InfoNavigation = () => {
  const dark = useThemeStore((state) => state.dark);

  const [goals, setGoals] = useState([]);
  const [kras, setKras] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/goal2/get-goal2`)
      .then((res) => {
        console.log("Fetched Goals:", res.data);
        setGoals(res.data);
      })
      .catch(() => setGoals([]));

    axios
      .get(`${BACKEND_URL}/api/kras2/get-kra2`)
      .then((res) => {
        const krasData = res.data;
        console.log("Fetched KRAs:", krasData);

        krasData.forEach((kra) => {
          const relatedGoalDesc = kra.goalId ? kra.goalId.goal_desc : "None";
          console.log(`KRA: ${kra.kra_name}, Related Goal Desc: ${relatedGoalDesc}`);
        });

        setKras(krasData);
      })
      .catch(() => setKras([]));

    axios
      .get(`${BACKEND_URL}/api/kpi2/all2`)
      .then((res) => {
        console.log("Fetched KPIs:", res.data.data || []);
        setKpis(res.data.data || []);
      })
      .catch(() => setKpis([]));
  }, [refresh]);

  const lightBgColors = {
    info: "bg-red-800 text-white",
    goals: "bg-green-800 text-white",
    kras: "bg-yellow-500 text-white",
    kpis: "bg-blue-800 text-white",
  };

  const darkBgColors = {
    info: "bg-red-900 text-gray-300",
    goals: "bg-green-900 text-gray-300",
    kras: "bg-yellow-700 text-gray-300",
    kpis: "bg-blue-900 text-gray-300",
  };

  const bgColors = dark ? darkBgColors : lightBgColors;

  const cardBase =
    "h-32 rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.03] shadow-black-all";

  // For dark mode highlight color: light gray for hover border/text instead of orange
  const darkHighlight = "hover:border-gray-400 hover:text-gray-300";
  const lightHighlight = "hover:border-[#F36F21] hover:text-[#F36F21]";

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  return (
    <>
      {/* Cards container with blur when modal open */}
      <div
        className={`w-full max-w-6xl mx-auto px-4 transition-all duration-300 ${
          modalContent
            ? "filter blur-sm pointer-events-none select-none"
            : "filter blur-0 pointer-events-auto select-auto"
        } grid grid-cols-1 sm:grid-cols-2 gap-6 lg:flex lg:justify-center lg:gap-8`}
      >
        {/* Info Card */}
        <div
          className={`${cardBase} ${bgColors.info} ${
            dark ? darkHighlight : lightHighlight
          } border border-transparent hover:border-current`}
          onClick={() => openModal("info")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === "Enter" && openModal("info")}
        >
          <p className="font-semibold text-lg mb-4 text-center sm:text-left">
            Ministry of Innovation and Technology
          </p>
          <p
            className={`text-sm underline cursor-pointer text-center sm:text-left ${
              dark ? "hover:text-gray-300" : "hover:text-[#F36F21]"
            }`}
          >
            More Info →
          </p>
        </div>

        {/* Goals Card */}
        <div
          className={`${cardBase} ${bgColors.goals} ${
            dark ? darkHighlight : lightHighlight
          } border border-transparent hover:border-current`}
          onClick={() => openModal("goals")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === "Enter" && openModal("goals")}
        >
          <div className="flex justify-between items-center">
            <p className="font-medium">Number of main objectives/GOAL</p>
            <span className="text-3xl font-bold">{goals.length}</span>
          </div>
          <p
            className={`text-sm underline cursor-pointer ${
              dark ? "hover:text-gray-300" : "hover:text-[#F36F21]"
            }`}
          >
            More Info →
          </p>
        </div>

        {/* KRAs Card */}
        <div
          className={`${cardBase} ${bgColors.kras} ${
            dark ? darkHighlight : lightHighlight
          } border border-transparent hover:border-current`}
          onClick={() => openModal("kras")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === "Enter" && openModal("kras")}
        >
          <div className="flex justify-between items-center">
            <p className="font-medium">Number of expected KRA</p>
            <span className="text-3xl font-bold">{kras.length}</span>
          </div>
          <p
            className={`text-sm underline cursor-pointer ${
              dark ? "hover:text-gray-300" : "hover:text-[#F36F21]"
            }`}
          >
            More Info →
          </p>
        </div>

        {/* KPIs Card */}
        <div
          className={`${cardBase} ${bgColors.kpis} ${
            dark ? darkHighlight : lightHighlight
          } border border-transparent hover:border-current`}
          onClick={() => openModal("kpis")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === "Enter" && openModal("kpis")}
        >
          <div className="flex justify-between items-center">
            <p className="font-medium">Number of expected KPI</p>
            <span className="text-3xl font-bold">{kpis.length}</span>
          </div>
          <p
            className={`text-sm underline cursor-pointer ${
              dark ? "hover:text-gray-300" : "hover:text-[#F36F21]"
            }`}
          >
            More Info →
          </p>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 p-4
            ${
              dark
                ? "bg-gray-800/20 backdrop-blur-sm"
                : "bg-white/20 backdrop-blur-sm"
            }`}
          aria-modal="true"
          role="dialog"
          onClick={closeModal} // Close modal on clicking outside
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg p-5
              ${
                dark
                  ? "bg-gray-800 text-gray-300 shadow-lg"
                  : "bg-white text-gray-900 shadow-md"
              }
            `}
            style={{ fontSize: "0.875rem" }}
          >
            {/* No close button as requested */}

            {modalContent === "info" && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-center">
                  Ministry of Innovation and Technology
                </h3>
                <hr /><br />
                <p className="text-sm leading-relaxed text-justify">
  The Ministry of Innovation and Technology (MInT) spearheads Ethiopia’s science, innovation, and technology advancement agenda. Its mission is to transform the nation into a technology-driven economy by building robust digital infrastructure, advancing scientific research, and fostering cutting-edge innovative solutions.
  <br /><br />
  The Ministry’s Sector Plan and Report presents a comprehensive strategic roadmap and key performance outcomes that underpin Ethiopia’s progress in science and technology. It underscores MInT’s dedication to driving economic growth through technological innovation, detailing sector goals, planned initiatives, and measurable achievements.
  <br /><br />
  Additionally, the report offers insight into challenges faced and lessons learned, providing a transparent and holistic overview of efforts aimed at strengthening national competitiveness and promoting sustainable development within an ever-evolving global technology landscape.
</p>

              </div>
            )}

            {(modalContent === "goals" ||
              modalContent === "kras" ||
              modalContent === "kpis") && (
              <>
                <h3 className="text-lg font-semibold mb-3 text-center capitalize">
                  {modalContent === "goals"
                    ? "Goals"
                    : modalContent === "kras"
                    ? "Key Result Areas (KRA)"
                    : "Key Performance Indicators (KPI)"}
                </h3>
                {modalContent === "goals" && goals.length === 0 && (
                  <p className="text-sm text-center">No goals available.</p>
                )}
                {modalContent === "kras" && kras.length === 0 && (
                  <p className="text-sm text-center">No KRAs available.</p>
                )}
                {modalContent === "kpis" && kpis.length === 0 && (
                  <p className="text-sm text-center">No KPIs available.</p>
                )}

                <div
                  className={`space-y-2 max-h-56 overflow-y-auto rounded-lg
                    ${
                      dark
                        ? "scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-800"
                        : "scrollbar-thin scrollbar-thumb-[#0D2A5C]/70 scrollbar-track-white"
                    }`}
                >
                  {(modalContent === "goals"
                    ? goals
                    : modalContent === "kras"
                    ? kras
                    : kpis
                  ).map((item) => {
                    const key =
                      item._id ||
                      item.id ||
                      item.kpi_id ||
                      item.kpiName ||
                      item.goal_desc ||
                      item.kra_name ||
                      JSON.stringify(item);

                    let displayText = "";

                    if (modalContent === "goals") {
                      displayText =
                        item.goal_desc || item.title || item.name || "Unnamed Goal";
                    } else if (modalContent === "kras") {
                      // kra.goalId is an object with goal info
                      const goalDesc = item.goalId ? item.goalId.goal_desc : "Unknown Goal";
                      displayText = `${item.kra_name || item.title || "Unnamed KRA"} — Goal: ${goalDesc}`;
                    } else if (modalContent === "kpis") {
                      // kpi.kra and kpi.goal are objects containing names
                      const kraName = item.kra ? item.kra.kra_name || "Unnamed KRA" : "Unknown KRA";
                      const goalDesc = item.goal ? item.goal.goal_desc || "Unnamed Goal" : "Unknown Goal";

                      displayText = `${item.kpi_name || item.kpiName || item.title || "Unnamed KPI"} — KRA: ${kraName} — Goal: ${goalDesc}`;
                    }

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg cursor-default border ${
                          dark
                            ? "bg-gray-900 text-gray-300 border-gray-400"
                            : "bg-white text-[#0D2A5C] border-[#0D2A5C]/40"
                        }`}
                      >
                        {displayText}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InfoNavigation;
