const mongoose = require("mongoose");

const PetOwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }]
}, { timestamps: true });

module.exports = mongoose.model("PetOwner", PetOwnerSchema);