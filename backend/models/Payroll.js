const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');
const JournalEntry = require('./JournalEntry');

const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Branch,
      key: 'id',
    },
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  base_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  allowances: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  deductions: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  net_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'paid'),
    defaultValue: 'draft',
  },
  journal_entry_id: {
    type: DataTypes.INTEGER,
    references: {
      model: JournalEntry,
      key: 'id',
    },
  },
}, {
  tableName: 'payrolls',
  underscored: true,
});

Payroll.belongsTo(User, { foreignKey: 'staff_id', as: 'Staff' });
Payroll.belongsTo(Branch, { foreignKey: 'branch_id' });
Payroll.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id' });

module.exports = Payroll;
