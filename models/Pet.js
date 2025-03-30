const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },  // Örn: Köpek, Kedi
  breed: { type: String },
  age: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "PetOwner", required: true },
  medicalRecords: [{ 
    date: { type: Date, required: true },
    description: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Pet", PetSchema);
