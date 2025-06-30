import MinisterSideHeader from "./MinisterSideHeader";
import MinisterSideBody from "./MinisterSideBody";

function MinisterSideMenu({ open = true }) {
  return (
    <div
      className={`bg-green-700 h-full p-4 relative duration-300 scrollbar-hidden flex flex-col ${
        open ? "w-72" : "w-20"
      }`}
    >
      {/* Removed BsArrowLeftShort button as requested */}

      {/* Pass open to header */}
      <MinisterSideHeader open={open} />

      {/* Scrollable area */}
      <div className="flex-1 overflow-auto scrollbar-hidden mt-2">
        {/* Pass open to body */}
        <MinisterSideBody open={open} />
      </div>
    </div>
  );
}

export default MinisterSideMenu;
