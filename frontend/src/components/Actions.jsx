import { CgAdd } from "react-icons/cg";
import { TbReport } from "react-icons/tb";
import { IoMdNotificationsOutline } from "react-icons/io";
import useThemeStore from "../store/themeStore";

function Actions({ toggleForm }) {
  const dark = useThemeStore((state) => state.dark);

  const buttonBaseClasses =
    "p-4 flex flex-col items-center gap-2 justify-center rounded-lg cursor-pointer border transition-colors duration-300 select-none";

  return (
    <div
      className={`flex flex-col col-start-4 col-end-5 gap-6 rounded-md shadow-lg p-6 max-w-md mx-auto ${
        dark
          ? "bg-[#1f2937] text-white" // Dark background consistent with sidebar bg
          : "bg-white text-[rgba(13,42,92,0.85)]" // Light text color matches sidebar text
      }`}
    >
      <h2
        className={`text-2xl font-semibold mb-1 ${
          dark ? "text-white" : "text-[rgba(13,42,92,0.85)]"
        }`}
      >
        Quick Actions
      </h2>
      <p
        className={`text-xs mb-4 ${
          dark ? "text-gray-300" : "text-[rgba(13,42,92,0.6)]"
        }`}
      >
        Common tasks and shortcuts
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* View Users */}
        <div
          className={`${buttonBaseClasses} border-[rgba(13,42,92,0.3)] hover:bg-[rgba(13,42,92,0.1)] hover:text-[#F36F21]`}
          onClick={() => toggleForm(1)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleForm(1);
          }}
        >
          <CgAdd size={28} className={`${dark ? "text-white" : "text-[#0D2A5C]"}`} />
          <p className="font-semibold text-xs text-center">
            View Users
          </p>
        </div>

        {/* Add Sector */}
        <div
          className={`${buttonBaseClasses} border-[rgba(13,42,92,0.3)] hover:bg-[rgba(13,42,92,0.1)] hover:text-[#F36F21]`}
          onClick={() => toggleForm(2)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleForm(2);
          }}
        >
          <CgAdd size={28} className={`${dark ? "text-white" : "text-[#0D2A5C]"}`} />
          <p className="font-semibold text-xs text-center">
            Add Sector
          </p>
        </div>

        {/* Add Sub-Sector */}
        <div
          className={`${buttonBaseClasses} border-[rgba(13,42,92,0.3)] hover:bg-[rgba(13,42,92,0.1)] hover:text-[#F36F21]`}
          onClick={() => toggleForm(3)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleForm(3);
          }}
        >
          <CgAdd size={28} className={`${dark ? "text-white" : "text-[#0D2A5C]"}`} />
          <p className="font-semibold text-xs text-center">
            Add Sub-Sector
          </p>
        </div>

        {/* Generate Report */}
        <div
          className={`${buttonBaseClasses} border-[#F36F21] hover:bg-[#F36F21] hover:text-white`}
          onClick={() => toggleForm("report")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleForm("report");
          }}
        >
          <TbReport size={28} className="text-[#F36F21]" />
          <p className="font-semibold text-xs text-center">Generate Report</p>
        </div>

        {/* View Alert */}
        <div
          className={`${buttonBaseClasses} border-[#F36F21] hover:bg-[#F36F21] hover:text-white`}
          onClick={() => toggleForm("alert")}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleForm("alert");
          }}
        >
          <IoMdNotificationsOutline size={28} className="text-[#F36F21]" />
          <p className="font-semibold text-xs text-center">View Alert</p>
        </div>
      </div>
    </div>
  );
}

export default Actions;
