const mongoose = require("mongoose");

const AppointmentDetailsSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  diagnosis: { type: String },
  treatment: { type: String },
  notes: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model("AppointmentDetails", AppointmentDetailsSchema);