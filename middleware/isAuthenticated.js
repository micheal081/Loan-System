const isAuthenticated = (req, res, next) => {
  // check if user is authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized user" });
  }
  // user is authenticated, continue to next middleware or route handler
  next();
};

module.exports = isAuthenticated;
