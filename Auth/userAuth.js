const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("token");
    if (!token)
      return res
        .status(401)
        .json({ msg: "No authentication token, authorization denied." });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied." });
    req.user = verified.id;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Token verification failed, authorization denied." });
  }
};

module.exports = auth;
