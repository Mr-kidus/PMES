function SearchInput({ searchTerm, setSearchTerm }) {
  return (
    <input
      type="text"
      placeholder="Search by Goal, KRA, or KPI"
      className="border p-2 rounded-md w-full mb-6"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}

export default SearchInput;
