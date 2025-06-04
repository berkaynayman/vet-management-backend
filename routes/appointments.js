const express = require("express");
const Appointment = require("../models/Appointment");
const AppointmentDetails = require("../models/AppointmentDetails");
const Pet = require("../models/Pet");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Randevuları getir (filtreler ile)
router.get("/appointments", authMiddleware, async (req, res) => {
  try {
    const { pet_ids, doctor_id } = req.query;
    
    let query = {};
    
    if (pet_ids) {
      const petIdsArray = pet_ids.split(',');
      query.pet = { $in: petIdsArray };
    }
    
    if (doctor_id) {
      query.doctor = doctor_id;
    }
    
    const appointments = await Appointment.find(query)
      .populate({
        path: "pet",
        populate: {
          path: "owner",
          select: "-password"
        }
      })
      .populate({
        path: "doctor",
        select: "-password"
      });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Randevu detaylarını getir
router.get("/appointments/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "pet",
        populate: {
          path: "owner",
          select: "-password"
        }
      })
      .populate({
        path: "doctor",
        select: "-password"
      });
    
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }
    
    // Randevu detaylarını getir
    const details = await AppointmentDetails.findOne({ appointment: appointment._id });
    
    res.json({
      ...appointment.toObject(),
      details: details || null
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Yeni randevu oluştur
router.post("/appointments", authMiddleware, async (req, res) => {
  try {
    const { pet_id, doctor_id, appointment_date, description, status = "scheduled" } = req.body;
    
    // Pet ve doktor kontrolü
    const pet = await Pet.findById(pet_id);
    if (!pet) {
      return res.status(404).json({ message: "Evcil hayvan bulunamadı" });
    }
    
    const doctor = await User.findOne({ _id: doctor_id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doktor bulunamadı" });
    }
    
    const newAppointment = new Appointment({
      pet: pet_id,
      doctor: doctor_id,
      appointmentDate: appointment_date,
      description,
      status
    });
    
    await newAppointment.save();
    
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Randevu güncelle
router.put("/appointments/:id", authMiddleware, async (req, res) => {
  try {
    const { appointment_date, description, status } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }
    
    // Güncelleme
    if (appointment_date) appointment.appointmentDate = appointment_date;
    if (description) appointment.description = description;
    if (status) appointment.status = status;
    
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Randevu detayları oluştur veya güncelle
router.post("/appointments/:id/details", authMiddleware, async (req, res) => {
  try {
    const { diagnosis, treatment, notes } = req.body;
    
    // Randevu kontrolü
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }
    
    // Mevcut detayları kontrol et
    let details = await AppointmentDetails.findOne({ appointment: req.params.id });
    
    if (details) {
      // Güncelleme
      details.diagnosis = diagnosis || details.diagnosis;
      details.treatment = treatment || details.treatment;
      details.notes = notes || details.notes;
    } else {
      // Yeni oluştur
      details = new AppointmentDetails({
        appointment: req.params.id,
        diagnosis,
        treatment,
        notes
      });
    }
    
    await details.save();
    
    res.status(201).json(details);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// İstatistikleri getir
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Toplam randevu sayısı
    const totalAppointments = await Appointment.countDocuments();
    
    // Bugünkü randevular
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd }
    });
    
    // Toplam evcil hayvan sayısı
    const totalPets = await Pet.countDocuments();
    
    // Toplam hayvan sahibi sayısı
    const totalOwners = await User.countDocuments({ role: "pet_owner" });
    
    res.json({
      totalAppointments,
      todayAppointments,
      totalPets,
      totalOwners
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;