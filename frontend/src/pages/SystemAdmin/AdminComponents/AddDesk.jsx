function AddDesk() {
  return (
    <div className="flex bg-white rounded flex-col p-4 w-[450px] shadow-2xl">
      <h1 className="text-2xl mb-6 font-semibold">Add Sector</h1>
      <form action="" className="flex flex-col gap-4 ">
        <div className="flex flex-col">
          <label htmlFor="desk" className="mb-2 font-semibold">
            Desk:
          </label>
          <input
            type="text"
            id="desk"
            name="sectorName"
            className="bg-gray-100 border-2 border-black p-1 text-sm font-semibold outline-none mb-2"
          />

          <label htmlFor="Sub-sector" className="mb-2 font-semibold">
            Sub-sector:
          </label>
          <select
            name="Sub-sector"
            id="1"
            className="bg-gray-100 border-2 border-black p-1 text-sm font-semibold outline-none mb-2"
          >
            <option value="Sector-1">Sector-1</option>
            <option value="Sector-2">Sector-2</option>
            <option value="Sector-3">Sector-3</option>
            <option value="Sector-4">Sector-4</option>
          </select>

          <label htmlFor="Sector" className="mb-2 font-semibold">
            Sector:
          </label>

          <select
            name="Sector"
            id="1"
            className="bg-gray-100 border-2 border-black p-1 text-sm font-semibold outline-none"
          >
            <option value="Sector-1">Sector-1</option>
            <option value="Sector-2">Sector-2</option>
            <option value="Sector-3">Sector-3</option>
            <option value="Sector-4">Sector-4</option>
          </select>
        </div>
        <input
          type="submit"
          className="cursor-pointer bg-blue-500 text-white font-semibold p-2 rounded"
        />
      </form>
    </div>
  );
}

export default AddDesk;
