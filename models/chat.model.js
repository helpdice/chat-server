const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'sent by id is required in chat Schema ']
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'received by id is required in chat Schema '],
        index: true
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    text: {
        type: String
    },
    media: {
        //store url here
        type: String
    },
    status: {
        type: String,
        enum: ['delivered', 'seen', 'sent'],
        default: 'sent'
    },
    type: {
        type: String,
        enum: ['text', 'gif', 'image', 'audio', 'video', 'document', 'location'],
        default: 'text'
    },
    identifier: {
        type: String,
        required: [true, 'identifier is required in mongoose schema']
    },
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String
    }]
}, 
{ 
    timestamps: true 
});


chatSchema.index({ receivedBy: 1, createdAt: 1 }); // Fast fetching for latest messages

module.exports = mongoose.model('Chat', chatSchema);

