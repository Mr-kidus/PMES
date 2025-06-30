function KRAForm({
  goals,
  kraGoalId,
  setKraGoalId,
  newKra,
  setNewKra,
  handleAddKRA,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Register KRA</h3>
      <select
        className="border p-2 rounded-md mb-2 w-full"
        value={kraGoalId}
        onChange={(e) => setKraGoalId(e.target.value)}
      >
        <option value="">Select Goal</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="KRA Name"
        value={newKra}
        onChange={(e) => setNewKra(e.target.value)}
        className="border p-2 rounded-md mb-2 w-full"
      />
      <button
        onClick={handleAddKRA}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Add KRA
      </button>
    </div>
  );
}

export default KRAForm;
