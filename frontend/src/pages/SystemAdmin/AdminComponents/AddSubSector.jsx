import React, { useEffect, useState } from "react";
import axios from "axios";

const backendUrl = "http://localhost:1221";

function AddSubSector() {
  const [sectors, setSectors] = useState([]); // state to hold sectors
  const [subsectors, setSubSectors] = useState([]);

  const fetchAllData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/sector/get-sector`);
      const { data } = res.data; // destructure data from response
      setSectors(data);
    } catch (err) {
      console.error("Error fetching sector data", err);
    }
    try {
      const res = await axios.get(`${backendUrl}/api/subsector/get-subsector`);
      const { data } = res.data; // destructure data from response
      setSubSectors(data);
    } catch (err) {
      console.error("Error fetching subsector data", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const subsectorName = e.target.subsectorName.value;
  const sectorId = e.target.sector.value; // Get selected sector id

  if (!sectorId) {
    return alert("Please select a sector");
  }

  if (!subsectorName.trim()) {
    return alert("Enter subsector name");
  }

  try {
    await axios.post(`${backendUrl}/api/subsector/add-subsector`, {
      subsector_name: subsectorName, // key matches backend controller
      sectorId,                     // send selected sector id
    });
    alert("✅ Subsector created!");
    e.target.reset();
    fetchAllData(); // refresh subsector list after adding new subsector
  } catch (err) {
    alert("❌ Failed to create subsector");
    console.error("Add subsector error:", err);
  }
};


  return (
    <div className="flex bg-white rounded flex-col p-4 w-[450px] shadow-2xl">
      <h1 className="text-2xl mb-6 font-semibold">Add Subsector</h1>

      {/* Use onSubmit, NOT action */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div>
          <label htmlFor="sector">Sector Name</label>
          <select
            id="sector"
            name="sector"
            className="bg-gray-100 border-2 border-black p-1 text-sm font-semibold outline-none mb-2" 
          >
            <option value="">Select a sector</option>
            {sectors.map((sector) => (
              <option key={sector._id} value={sector._id}>
                {sector.sector_name}
              </option>
            ))}
          </select>
           
        </div>

        <div className="flex flex-col">
          


          <label htmlFor="subsectorName" className="mb-2 font-semibold">
            Sub-sector Name:
          </label>

          <input
            type="text"
            id="subsectorName"
            name="subsectorName"
            className="bg-gray-100 border-2 border-black p-1 text-sm font-semibold outline-none mb-2"
          />
        </div>

        <input
          type="submit"
          className="cursor-pointer bg-blue-500 text-white font-semibold p-2 rounded"
        />
      </form>
    </div>
  );
}

export default AddSubSector;
