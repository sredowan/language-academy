const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('head', 'branch'),
    defaultValue: 'branch',
  },
  address: {
    type: DataTypes.TEXT,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'branches',
  underscored: true,
});

module.exports = Branch;
