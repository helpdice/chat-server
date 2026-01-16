const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Types.ObjectId,
  },
  receiver: {
    type: mongoose.Types.ObjectId,
  },
  timestamp: { type: Date, default: Date.now },
  duration: Number, // duration in seconds
  status: { type: String, enum: ['missed', 'received', 'dialed'], default: 'dialed' }
},
{
  timestamps: true
});

callSchema.index({ caller: 1 });
callSchema.index({ receiver: 1 });
callSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Call', callSchema);
