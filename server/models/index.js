const Lead = require('./Lead');
const Note = require('./Note');
const User = require('./User');

// One lead has many notes; deleting a lead cascades to notes
Lead.hasMany(Note, { foreignKey: 'lead_id', as: 'notes', onDelete: 'CASCADE' });
Note.belongsTo(Lead, { foreignKey: 'lead_id' });

module.exports = { Lead, Note, User };
