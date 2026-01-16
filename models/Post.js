const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: { type: String, index: true },
    media: [{ type: String }],
    author: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    likes: [{ type: String, index: true }],
    shares: [{ type: String }],
    privacy: { type: String },
    location: { type: String },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 }); // compound index for feed queries

module.exports = mongoose.model('Post', postSchema);
