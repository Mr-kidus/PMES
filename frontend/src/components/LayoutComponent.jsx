import StrategicTopBar from "./../pages/Strategic/StrategicTopBar";

import InfoNavigation from "../components/InfoNavigation";

function LayoutComponent() {
  return (
    <div className="flex ">
      <div className="h-screen relative w-70 bg-orange-300"></div>

      <div className="flex-1 flex flex-col bg-green-200 ">
        <div>
          <StrategicTopBar />
        </div>
        <div className="px-6 py-3">
          <InfoNavigation />
        </div>
      </div>
    </div>
  );
}

export default LayoutComponent;
