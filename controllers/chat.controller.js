const chat = require('../models/chat.model');
const createIdentifire = require('../util/createIdentifire.util');

const mongoose = require('mongoose');

/*

*/

//use express file loader here
module.exports.createChat = async (req, res, next) => {
    try {
        // console.log(req.body);
        const { sentBy, receivedBy, media, text, type, id, replyTo } = req.body;
        //this identifire will help us fetch last chat in mongodb
        const identifier = createIdentifire(sentBy, receivedBy);
        message = {
            _id: id,
            sentBy,
            receivedBy,
            text,
            media,
            type,
            identifier,
            replyTo,
            status: 'sent'
        };
        if (id) {
            message._id = id;
        }
        let result = await chat.create(message);
        res.status(200).json({ sucess: true, payload: result });
    }
    catch (err) {
        console.log(err);
        // next({ status: 400, message: err.message, stack: err.stack });
    }
}

module.exports.getChat = async (req, res, next) => {
    //also add pagination
    try {
        const { userId, chattingWithId } = req.query;
        let result = await chat.find({
            '$or': [
                {
                    sentBy: userId,
                    receivedBy: chattingWithId
                },
                {
                    receivedBy: userId,
                    sentBy: chattingWithId
                    
                }
            ]
        });
        res.status(200).json({ sucess: true, payload: result });
    }
    catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
}

module.exports.getChatList = async (req, res, next) => {
    //get id's of all users 
    //count unread messages
    //store last message
    const { userId } = req.query;

    const getUsersChat = {
        $match: {
            $or: [
                { sentBy: new mongoose.Types.ObjectId(userId) },
                { receivedBy: new mongoose.Types.ObjectId(userId) }
            ]
        }
    };

    const getLastChat = {
        $group: {
            _id: '$identifire',
            unread: {
                $sum: {
                    $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
                }
            },
            lastChat: {
                $last: '$$ROOT'
            }
        }
    }

    try {
        let result = await chat.aggregate([getUsersChat, getLastChat]);
        res.status(200).json({ sucess: true, payload: result });
    }
    catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
}

module.exports.markAsRead = async (req, res, next) => {
    try {
        let { ids: unreadChatIds, userId, chattingWithId } = req.body;
        await chat.updateMany({ _id: { $in: unreadChatIds } }, { $set: { status: 'seen' } });
        let result = await chat.find({
            '$or': [
                {
                    sentBy: userId,
                    receivedBy: chattingWithId
                },
                {
                    receivedBy: userId,
                    sentBy: chattingWithId
                }
            ]
        });
        res.status(200).json({ sucess: true, payload: result });
    }
    catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
}

module.exports.syncToServer = async (req, res) => {
    try  {
        // console.log('Sync To Server :', req.body);
        const messages = req.body;
        messages.forEach(async (message) => {
           try {
            const messageId = message.id;
            const hasMessage = await chat.findById(messageId);
            // console.log(hasMessage);
            if (hasMessage) {
                await chat.findByIdAndUpdate(messageId, { ...message });
            } else {
                await chat.create({ ...message, _id: message.id, status: 'sent' });
            }
           } catch (er) {
            console.log(er);
           }
        });
        const messageIds = messages.map((msg) => msg.id);
        const updatedMessages = await chat.find({ _id: { $in: messageIds } });
        // console.log('Updated Messages', updatedMessages);
        return res.status(200).json({
            payload: updatedMessages,
            message: "Success"
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports.syncFromServer = async (req, res) => {
    try {
        const messages = await chat.find({ status: { $in: ['sent', 'seen'] } });
        // console.log('Messages to Client', messages);
        return res.status(200).json({
            payload: messages,
            message: ""
        });
    } catch (err) {
        console.log(err);
    }
}


module.exports.getChatList