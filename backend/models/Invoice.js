const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');
const Enrollment = require('./Enrollment');
const Student = require('./Student');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Branch, key: 'id' },
  },
  invoice_no: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  enrollment_id: {
    type: DataTypes.INTEGER,
    references: { model: Enrollment, key: 'id' },
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: { model: Student, key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paid: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'paid', 'overdue', 'partial'),
    defaultValue: 'pending',
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'invoices',
  underscored: true,
});

Invoice.belongsTo(Branch, { foreignKey: 'branch_id' });
Invoice.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });
Invoice.belongsTo(Student, { foreignKey: 'student_id' });

module.exports = Invoice;
