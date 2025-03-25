const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  
  console.log("Gönderilen Token:", token);  // 🔍 Token var mı kontrol et

  if (!token) {
    return res.status(401).json({ message: "Yetkisiz erişim, token eksik" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ message: "Geçersiz token formatı" });
    }

    const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // 🔍 Token decode edildi mi?

    req.doctorId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token" });
  }
};

module.exports = authMiddleware;
