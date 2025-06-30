import { Link, NavLink, Outlet } from "react-router-dom";

function Chart() {
  return (
    <div
      className={` flex-2 transform transition-all duration-500  rounded-sm shadow-lg `}
    >
      <div className="mx-auto mt-2 p-1 flex justify-around w-55  shadow mb-4 ">
        <NavLink to=".">
          <div
            className={`w-25 font-semibold p-2 text-center rounded text-sm cursor-pointer  shadow `}
          >
            Line Chart
          </div>
        </NavLink>
        <NavLink to="barchart">
          <div
            className={`w-25 font-semibold p-2 text-center rounded text-sm cursor-pointer  shadow`}
          >
            Bar Chart
          </div>
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}

export default Chart;
