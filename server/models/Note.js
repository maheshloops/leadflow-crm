const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  lead_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true }
  }
}, {
  tableName: 'notes',
  updatedAt: false   // notes are immutable once written
});

module.exports = Note;
