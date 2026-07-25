const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    const userRole = req.user.role.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = authorize;
