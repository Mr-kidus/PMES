import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({

  goal_desc: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
