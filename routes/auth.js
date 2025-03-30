const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Veterinarian = require("../models/Veterinarian");

const router = express.Router();

// 🟢 REGISTER (Veteriner Kayıt)
router.post("/doctor/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await Veterinarian.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanılıyor." });
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni veteriner kullanıcısını oluştur
    const newVeterinarian = new Veterinarian({
      name,
      email,
      password: hashedPassword,
    });

    await newVeterinarian.save();
    res.status(201).json({ message: "Kayıt başarılı!" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 🟠 LOGIN (Veteriner Girişi)
router.post("/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await Veterinarian.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });
    }

    // Şifreyi doğrula
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });
    }

    // JWT oluştur
    const token = jwt.sign({ id: user._id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
