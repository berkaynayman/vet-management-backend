const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PetOwner = require("../models/PetOwner");
const Pet = require("../models/Pet");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🟢 Hasta Kullanıcı Kayıt (Register)
router.post("/pet-owner/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await PetOwner.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPetOwner = new PetOwner({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await newPetOwner.save();
    res.status(201).json({ message: "Kullanıcı başarıyla kaydedildi!" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 🟢 Hasta Kullanıcı Giriş (Login)
router.post("/pet-owner/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const petOwner = await PetOwner.findOne({ email });
    if (!petOwner) {
      return res.status(400).json({ message: "Email veya şifre hatalı!" });
    }

    const isMatch = await bcrypt.compare(password, petOwner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email veya şifre hatalı!" });
    }

    const token = jwt.sign({ id: petOwner._id, role: "petOwner" }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({ token, petOwner });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 🟢 Evcil Hayvan Ekleme
router.post("/pet-owner/pets", authMiddleware, async (req, res) => {
    try {
      const { name, species, breed, age } = req.body;
      const ownerId = req.petOwnerId; // Token’den gelen pet sahibi ID’si
  
      const newPet = new Pet({
        name,
        species,
        breed,
        age,
        owner: ownerId
      });
  
      await newPet.save();
  
      // Kullanıcının pet listesine ekle
      await PetOwner.findByIdAndUpdate(ownerId, { $push: { pets: newPet._id } });
  
      res.status(201).json({ message: "Evcil hayvan başarıyla eklendi!", pet: newPet });
    } catch (error) {
      res.status(500).json({ message: "Sunucu hatası", error });
    }
  });

  // 🟢 Kullanıcının Evcil Hayvanlarını Listeleme
router.get("/pet-owner/pets", authMiddleware, async (req, res) => {
    try {
      const ownerId = req.petOwnerId; // Token’den gelen kullanıcı ID’si
  
      const pets = await Pet.find({ owner: ownerId });
  
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });
  
module.exports = router;
