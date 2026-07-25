const express = require('express');
const router = express.Router();
const { User, Role, Branch } = require('../models');
const { authenticate } = require('../middlewares/authenticate');
const bcrypt = require('bcryptjs');

const { validateUser, validateUpdateUser, validateRole, validateUpdateRole } = require('../middlewares/userValidation');

// Middleware: Admin only (Super Admin role_id=1 OR role_name contains 'admin')
const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  const roleId = Number(req.user.role_id);
  const roleName = (req.user.role_name || '').toLowerCase();
  if (roleId === 1 || roleName.includes('admin')) return next();
  return res.status(403).json({ message: 'Admin access required', your_role_id: req.user.role_id });
};

// GET all users with their roles
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all roles
router.get('/roles', authenticate, async (req, res) => {
  try {
    const roles = await Role.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create new role (Admin only)
router.post('/roles', authenticate, adminOnly, validateRole, async (req, res) => {
  try {
    const existing = await Role.findOne({ where: { name: req.body.name } });
    if (existing) return res.status(400).json({ message: 'Role with this name already exists' });
    const role = await Role.create(req.body);
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update role (Admin only)
router.put('/roles/:id', authenticate, adminOnly, validateUpdateRole, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    await role.update(req.body);
    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create new user (Admin only)
router.post('/', authenticate, adminOnly, validateUser, async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role_id, branch_id } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: `Duplicate entry: Email '${email}' already exists in the system. Please use a unique email address.` });
    const user = await User.create({
      username, email, password_hash: password,
      first_name, last_name, phone,
      role_id, branch_id: branch_id || 1,
      organization_id: 1,
      status: 'active'
    });
    const created = await User.findByPk(user.id, { include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }], attributes: { exclude: ['password_hash'] } });
    res.status(201).json({ message: 'User created successfully', user: created });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(400).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update user role and status (Admin only)
router.put('/:id', authenticate, adminOnly, validateUpdateUser, async (req, res) => {
  try {
    const { role_id, status, first_name, last_name, phone, branch_id } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Prevent admin from deactivating themselves
    if (req.user.id === parseInt(req.params.id) && status && status !== 'active') {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    await user.update({ role_id: role_id || user.role_id, status: status || user.status, first_name: first_name || user.first_name, last_name: last_name || user.last_name, phone: phone || user.phone, branch_id: branch_id || user.branch_id });
    const updated = await User.findByPk(user.id, { include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }], attributes: { exclude: ['password_hash'] } });
    res.json({ message: 'User updated successfully', user: updated });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
      return res.status(400).json({ message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.` });
    }
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
      return res.status(400).json({ message: `Validation error: ${messages}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH toggle user active/inactive (Admin only)
router.patch('/:id/toggle-status', authenticate, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await user.update({ status: newStatus });
    res.json({ message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, status: newStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE user (Admin only) - soft delete by setting inactive
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await user.update({ status: 'inactive' });
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH reset password (Admin only)
router.patch('/:id/reset-password', authenticate, adminOnly, async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Directly update password_hash — model hook will auto-hash it
    await user.update({ password_hash: new_password });
    res.json({ message: `Password reset successfully for ${user.first_name} ${user.last_name}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
