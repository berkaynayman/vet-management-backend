const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentDate: { type: Date, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ["scheduled", "in_progress", "completed", "cancelled"],
    default: "scheduled"
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model("Appointment", AppointmentSchema);
