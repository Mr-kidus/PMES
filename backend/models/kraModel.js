import mongoose from 'mongoose';

const kraSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  kra_name: { type: String, required: true },
 
});

const KRA = mongoose.model('KRA', kraSchema);
export default KRA;
