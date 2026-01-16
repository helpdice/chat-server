const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    image: String,
    author: String,
    expiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
