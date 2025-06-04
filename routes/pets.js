const express = require("express");
const Pet = require("../models/Pet");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Evcil hayvanları getir (owner_id filtresi ile)
router.get("/pets", authMiddleware, async (req, res) => {
  try {
    const { owner_id } = req.query;
    
    let query = {};
    if (owner_id) {
      query.owner = owner_id;
    }
    
    const pets = await Pet.find(query).populate({
      path: "owner",
      select: "-password"
    });
    
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Evcil hayvan detaylarını getir
router.get("/pets/:id", authMiddleware, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate({
      path: "owner",
      select: "-password"
    });
    
    if (!pet) {
      return res.status(404).json({ message: "Evcil hayvan bulunamadı" });
    }
    
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Yeni evcil hayvan ekle
router.post("/pets", authMiddleware, async (req, res) => {
  try {
    const { name, type, breed, date_of_birth, gender, owner_id } = req.body;
    
    // Kullanıcı kontrolü
    const owner = await User.findById(owner_id || req.userId);
    if (!owner) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    
    const newPet = new Pet({
      name,
      type,
      breed,
      date_of_birth,
      gender,
      owner: owner_id || req.userId
    });
    
    await newPet.save();
    
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Evcil hayvan bilgilerini güncelle
router.put("/pets/:id", authMiddleware, async (req, res) => {
  try {
    const { name, type, breed, date_of_birth, gender } = req.body;
    
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Evcil hayvan bulunamadı" });
    }
    
    // Güncelleme
    pet.name = name || pet.name;
    pet.type = type || pet.type;
    pet.breed = breed || pet.breed;
    pet.date_of_birth = date_of_birth || pet.date_of_birth;
    pet.gender = gender || pet.gender;
    
    await pet.save();
    
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Evcil hayvan sil
router.delete("/pets/:id", authMiddleware, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Evcil hayvan bulunamadı" });
    }
    
    await Pet.deleteOne({ _id: req.params.id });
    
    res.json({ message: "Evcil hayvan başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;