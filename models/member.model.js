const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupMemberSchema = new Schema({
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'creator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  });
  
  // To ensure uniqueness of user per group
  GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
  
  module.exports = mongoose.model('GroupMember', GroupMemberSchema);
  