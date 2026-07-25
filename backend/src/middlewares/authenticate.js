const { verifyAccessToken } = require('../utils/jwt');
const { User, Role } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    // Attach role_name from decoded token OR fetch from DB
    user.role_name = decoded.role_name || null;
    if (!user.role_name) {
      try {
        const role = await Role.findByPk(user.role_id);
        user.role_name = role ? role.name.toLowerCase() : '';
      } catch(e) {}
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
