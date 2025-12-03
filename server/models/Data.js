const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 인덱스 추가 (검색 성능 향상)
dataSchema.index({ title: 'text', content: 'text' });
dataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Data', dataSchema);

