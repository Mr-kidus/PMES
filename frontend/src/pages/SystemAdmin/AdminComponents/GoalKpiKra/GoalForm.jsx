function GoalForm({ newGoal, setNewGoal, handleAddGoal }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Register Goal</h3>
      <input
        type="text"
        placeholder="Goal Name"
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
        className="border p-2 rounded-md mb-2 w-full"
      />
      <button
        onClick={handleAddGoal}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Goal
      </button>
    </div>
  );
}

export default GoalForm;
