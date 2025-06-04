const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Tüm kullanıcıları getir (role filtresi ile)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Kullanıcı detaylarını getir
router.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;