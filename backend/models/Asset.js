const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Branch = require('./Branch');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Branch,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('hardware', 'furniture', 'appliance', 'stationery', 'other'),
    defaultValue: 'hardware'
  },
  serial_no: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'retired', 'lost'),
    defaultValue: 'active'
  },
  last_maintained: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true
});

Asset.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = Asset;
