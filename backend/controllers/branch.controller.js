const Branch = require('../models/Branch');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db.config');

// Get all branches
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      include: [{ model: User, as: 'Manager', attributes: ['name', 'email'] }]
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new branch + Admin User
exports.createBranch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, code, address, phone, email, admin_name, admin_password } = req.body;

    // 1. Create the Branch
    const branch = await Branch.create({
      name,
      code,
      type: 'branch',
      address,
      phone,
      email,
      is_active: true
    }, { transaction: t });

    // 2. Create the Branch Admin User
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    const user = await User.create({
      name: admin_name,
      email: email, 
      password: hashedPassword,
      role: 'branch_admin',
      branch_id: branch.id,
      status: 'active'
    }, { transaction: t });

    // 3. Update Branch with Manager ID
    branch.manager_id = user.id;
    await branch.save({ transaction: t });

    await t.commit();
    res.status(201).json({ branch, user });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Toggle Branch Status
exports.toggleBranchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    branch.is_active = !branch.is_active;
    await branch.save();
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
