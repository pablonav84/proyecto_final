import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  created_at: { type: Date, default: Date.now, required: true },
  items:{type: Array, required: true},
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;