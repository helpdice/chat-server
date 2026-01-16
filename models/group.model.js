const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: String,
  avatar: String,
  isPrivate: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
},
{ 
    timestamps: true 
});

module.exports = mongoose.model('Group', GroupSchema);


GroupSchema.index({ name: "text" }); // For search

module.exports = mongoose.model('Group', GroupSchema);
