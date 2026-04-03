const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Branch = require('../models/Branch');

exports.register = async (req, res) => {
  try {
    const { name, email, password, branch_id, role } = req.body;

    const rawPassword = password || require('crypto').randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      branch_id,
      role
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name, email, role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Fetch full user with associations for the response
    const fullUser = await User.findOne({
      where: { id: user.id },
      include: ['Branch', 'Student'].filter(m => !!User.associations[m])
    });

    res.json({ token, user: fullUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: {
        role: {
          [require('sequelize').Op.notIn]: ['student', 'guardian']
        },
        branch_id: req.branchId
      },
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const user = await User.findOne({ where: { id: userId, branch_id: req.branchId } });
    if (!user) return res.status(404).json({ error: 'User not found or you do not have permission.' });

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully.', user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setStaffPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
       return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({ where: { id: userId, branch_id: req.branchId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.password = await require('bcryptjs').hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
