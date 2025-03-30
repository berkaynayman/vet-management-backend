const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer token al

  if (!token) {
    return res.status(401).json({ message: "Yetkilendirme reddedildi!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "doctor") {
      req.doctorId = decoded.id; // Eğer doktor ise req.doctorId'yi set et
    } else if (decoded.role === "petOwner") {
      req.petOwnerId = decoded.id; // Eğer petOwner ise req.petOwnerId'yi set et
    } else {
      return res.status(403).json({ message: "Geçersiz rol!" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Geçersiz token!" });
  }
};

module.exports = authMiddleware;
