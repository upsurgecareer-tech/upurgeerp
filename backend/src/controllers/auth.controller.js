const { User, Role } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

// Register User
const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role_id, branch_id } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: password,
      first_name,
      last_name,
      phone,
      role_id,
      branch_id
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Account is inactive'
      });
    }

    // Fetch role for role_name
    const role = await Role.findByPk(user.role_id);

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      branch_id: user.branch_id,
      role_name: role ? role.name.toLowerCase() : 'staff'
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id,
          branch_id: user.branch_id,
          role_name: role ? role.name.toLowerCase() : 'staff',
          is_active: user.status === 'active',
          status: user.status
        },
        token: accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get Current User
const me = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  me
};
