const mongoose = require('mongoose');

const taskStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['todo', 'inprogress', 'qa', 'release'],
    unique: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TaskStatus', taskStatusSchema);
