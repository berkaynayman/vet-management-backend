const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },  // dog, cat, etc.
  breed: { type: String },
  date_of_birth: { type: Date },
  gender: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model("Pet", PetSchema);
