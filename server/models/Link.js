const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  color: { type: String, default: '#4ade80' },
  progress: { type: Number, default: 0 },
  category: { type: String, default: 'learning' }
});

module.exports = mongoose.model('Link', LinkSchema);