const express = require("express");
const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🟢 BUGÜNÜN RANDEVULARINI GETİR
router.get("/doctor/appointments/today", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const today = new Date();
    
    // Günün başlangıcı ve bitişi
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Bugüne ait randevuları bul
    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 🟢 DOKTOR YENİ RANDEVU OLUŞTURMA
router.post("/doctor/appointments", authMiddleware, async (req, res) => {
    try {
      const { petName, ownerName, appointmentDate } = req.body;
      const doctorId = req.doctorId;
  
      const newAppointment = new Appointment({
        doctor: doctorId,
        petName,
        ownerName,
        appointmentDate
      });
  
      await newAppointment.save();
      res.status(201).json({ message: "Randevu başarıyla eklendi!", appointment: newAppointment });
    } catch (error) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
});

// 🟢 Hasta Kullanıcısı Randevu Oluşturma
router.post("/pet-owner/appointments", authMiddleware, async (req, res) => {
  try {
    const { petId, doctorId, appointmentDate } = req.body;
    const ownerId = req.doctorId; // Token'den gelen kullanıcı ID

    const pet = await Pet.findOne({ _id: petId, owner: ownerId });
    if (!pet) {
      return res.status(404).json({ message: "Evcil hayvan bulunamadı!" });
    }

    const newAppointment = new Appointment({
      doctor: doctorId,
      petName: pet.name,
      ownerName: req.ownerId, 
      appointmentDate
    });

    await newAppointment.save();
    res.status(201).json({ message: "Randevu başarıyla oluşturuldu!", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});
  

module.exports = router;
