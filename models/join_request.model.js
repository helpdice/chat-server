const JoinRequestSchema = new Schema({
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
    requestedAt: {
      type: Date,
      default: Date.now
    }
  });
  
  JoinRequestSchema.index({ groupId: 1, userId: 1 }, { unique: true });
  
  module.exports = mongoose.model('JoinRequest', JoinRequestSchema);
  