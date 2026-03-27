const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');
const Branch = require('./Branch');
const Batch = require('./Batch');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
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
  batch_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Batch,
      key: 'id',
    },
  },
  guardian_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
  first_name: {
    type: DataTypes.STRING,
  },
  middle_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  father_name: {
    type: DataTypes.STRING,
  },
  mother_name: {
    type: DataTypes.STRING,
  },
  mobile_no: {
    type: DataTypes.STRING,
  },
  nid_birth_cert: {
    type: DataTypes.STRING,
  },
  current_address: {
    type: DataTypes.TEXT,
  },
  permanent_address: {
    type: DataTypes.TEXT,
  },
  passport_no: {
    type: DataTypes.STRING,
  },
  photograph_url: {
    type: DataTypes.STRING,
  },
  educational_details: {
    type: DataTypes.JSON,
  },
  employment_details: {
    type: DataTypes.JSON,
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
  },
  plan_type: {
    type: DataTypes.ENUM('free', 'premium'),
    defaultValue: 'free',
  },
  premium_start_date: {
    type: DataTypes.DATE,
  },
  premium_expiry_date: {
    type: DataTypes.DATE,
  },
  active_devices: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  target_score: {
    type: DataTypes.INTEGER,
    defaultValue: 79,
  },
  exam_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('active', 'graduated', 'dropped'),
    defaultValue: 'active',
  },
}, {
  tableName: 'students',
  underscored: true,
});

Student.belongsTo(User, { foreignKey: 'user_id' });
Student.belongsTo(Branch, { foreignKey: 'branch_id' });
Student.belongsTo(Batch, { foreignKey: 'batch_id' });
Student.belongsTo(User, { as: 'Guardian', foreignKey: 'guardian_id' });

module.exports = Student;
