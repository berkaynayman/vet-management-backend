const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer token al

  if (!token) {
    return res.status(401).json({ message: "Yetkilendirme reddedildi!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcı ID'sini ve rolünü request'e ekle
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ message: "Geçersiz token!" });
  }
};

module.exports = authMiddleware;
