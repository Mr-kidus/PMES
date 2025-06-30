import React, { useEffect, useState } from "react";
import axios from "axios";

const backendUrl = "http://localhost:1221";

function AddSector() {
  const [sectors, setSectors] = useState([]);

  const fetchAllData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/sector/get-sector`);
      const { data } = res.data; // destructure data from response
      setSectors(data);
    } catch (err) {
      console.error("Error fetching sector data", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sectorName = e.target.sectorName.value;

    if (!sectorName.trim()) {
      return alert("Enter sector name");
    }

    try {
      await axios.post(`${backendUrl}/api/sector/add-sector`, {
        sector_name: sectorName, // key matches backend controller
      });
      alert("✅ Sector created!");
      e.target.reset();
      fetchAllData(); // refresh sector list after adding new sector
    } catch (err) {
      alert("❌ Failed to create sector");
      console.error("Add sector error:", err);
    }
  };

  return (
    <div className="flex bg-white rounded flex-col p-4 w-[450px] shadow-2xl">
      <h1 className="text-2xl mb-6 font-semibold">Add Sector</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="sectorName" className="mb-2 font-semibold">
            Sector Name:
          </label>
          <input
            type="text"
            id="sectorName"
            name="sectorName"
            className="bg-gray-100 border-2 border-black p-1 text-lg outline-none"
          />
        </div>
        <input
          type="submit"
          value="Add Sector"
          className="cursor-pointer bg-blue-500 text-white font-semibold p-2 rounded"
        />
      </form>

      {/* Optional: display the list of sectors */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Existing Sectors:</h2>
        {sectors.length === 0 ? (
          <p>No sectors found.</p>
        ) : (
          <ul className="list-disc list-inside">
            {sectors.map((sector) => (
              <li key={sector._id}>{sector.sector_name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AddSector;
