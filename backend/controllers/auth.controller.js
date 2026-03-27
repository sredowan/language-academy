const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Branch = require('../models/Branch');

exports.register = async (req, res) => {
  try {
    const { name, email, password, branch_id, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
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
        role: ['super_admin', 'branch_admin', 'staff', 'teacher'],
        branch_id: req.branchId
      },
      attributes: ['id', 'name', 'role']
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
