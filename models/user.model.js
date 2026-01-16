const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const pendingContactsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'userId is required in pending contacts']
    },
    type: {
        type: String,
        enum: ['sent', 'received'],
        required: [true, 'type is required in pending requestsF']
    }
}, { _id: false });


const eop = ['Everyone', 'Contacts', 'Nobody'];

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        // required: [true, 'username is required in user model'],
        unique: true
    },
    name: {
        type: String,
    },
    bio: {
        type: String
    },
    phoneNo: {
        type: String,
        required: [true, 'phone no. is required in user model'],
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'Hey! drop me a message.'
    },
    contacts: [mongoose.Schema.Types.ObjectId],
    dp: {
        type: String,
        default: 'https://lwlies.com/wp-content/uploads/2017/04/avatar-2009-1108x0-c-default.jpg'
    },
    blocked: [mongoose.Schema.Types.ObjectId],
    fav: [mongoose.Schema.Types.ObjectId],
    password: {
        type: String,
        required: [true, 'password is required in creating userSchema']
    },
    pendingContacts: [pendingContactsSchema],
    lastSeen: String,
    chatList: [{

    }],
    seeBio: {
        type: String,
        enum: eop,
        default: 'Everyone'
    },
    addGroup: {
        type: String,
        enum: eop,
        default: 'Everyone'
    },
    seeOnline: {
        type: String,
        enum: eop,
        default: 'Everyone'
    },
    visitLinks: {
        type: String,
        enum: eop,
        default: 'Everyone'
    },
    seeDp: {
        type: String,
        enum: eop,
        default: 'Everyone'
    },
    seeStatus: {
        type: String,
        enum: eop,
        default: 'Everyone'
    },
    disappearingMessageDays: {
        type: Number,
        default: 7
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

module.exports = mongoose.model('User', userSchema);

