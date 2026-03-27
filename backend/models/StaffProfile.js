const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');

const StaffProfile = sequelize.define('StaffProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
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
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  base_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  bank_name: {
    type: DataTypes.STRING,
  },
  account_no: {
    type: DataTypes.STRING,
  },
  father_name: {
    type: DataTypes.STRING,
  },
  mother_name: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  contact_details: {
    type: DataTypes.STRING,
  },
  educational_background: {
    type: DataTypes.JSON,
  },
  work_experience: {
    type: DataTypes.JSON,
  },
}, {
  tableName: 'staff_profiles',
  underscored: true,
});

StaffProfile.belongsTo(User, { foreignKey: 'user_id' });
StaffProfile.belongsTo(Branch, { foreignKey: 'branch_id' });

module.exports = StaffProfile;
