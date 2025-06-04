require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const petsRoutes = require("./routes/pets");
const appointmentsRoutes = require("./routes/appointments");

const app = express();

// Middleware'ler
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch((err) => console.log("MongoDB bağlantı hatası:", err));

// Rotalar
app.use("/api", authRoutes);
app.use("/api", usersRoutes);
app.use("/api", petsRoutes);
app.use("/api", appointmentsRoutes);

// Basit bir test endpointi
app.get("/", (req, res) => {
  res.send("Veteriner Yönetim Sistemi API Çalışıyor!");
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
