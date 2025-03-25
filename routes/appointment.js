const express = require("express");
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
  

module.exports = router;
