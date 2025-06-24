const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Kullanıcı Kaydı (Register)
router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role = "pet_owner" } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanılıyor." });
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role
    });

    await newUser.save();
    res.status(201).json({ message: "Kayıt başarılı!" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Kullanıcı Girişi (Login)
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });
    }

    // Şifreyi doğrula
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });
    }

    // JWT oluştur
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userResponse = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Mevcut kullanıcı bilgilerini getir
router.get("/auth/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Yetkilendirme reddedildi!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Geçersiz token!" });
  }
});

// Profil bilgilerini getir
router.get("/profile", async (req, res) => {
  try {
    console.log("req", req)
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Yetkilendirme reddedildi!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Geçersiz token!" });
  }
});

// Profil bilgilerini güncelle
router.put("/profile", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Yetkilendirme reddedildi!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { first_name, last_name, phone } = req.body;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Güncelleme
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    // Şifre olmadan kullanıcı bilgilerini döndür
    const updatedUser = await User.findById(decoded.id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;