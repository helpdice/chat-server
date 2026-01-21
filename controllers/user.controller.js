const bcrypt = require('bcrypt');
const { update } = require('../models/user.model');
const user = require('../models/user.model');
const { uniqueId } = require('lodash');

/*
    @method POST
    @url    /api/user
    @access public
*/
module.exports.createUser = async (req, res, next) => {
    try {
        // console.log(req.body);
        const { username, name, password, avatar, countryCode } = Object.keys(req.body)?.length > 0 ? req.body : res.locals;
        // console.log('Register Body:', username, name, phoneNo, password);
        // console.log(res.locals);
        const phoneNo = `${countryCode},${username}`;
        const doesExistsAlready = await user.exists({ phoneNo });
        // console.log('Exists Already :', doesExistsAlready);
        if (doesExistsAlready) {
            // console.log(res.locals);
            if (Object.keys(res.locals)?.length > 0) {
                console.log('Locals :', Object.keys(res.locals)?.length > 0);
                next();
            } else {
                return res.status(200).json({
                    message: 'Account already exists, please login',
                    userExists: true
                });
            }
        } else {
            const result = await user.create({ phoneNo, password, dp: avatar });
            console.log('Result :', result);
            res.locals = result;
            next();
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
};

/*
    @method PUT
    @url    /api/user
    @access public
*/
module.exports.updateUser = async (req, res) => {
    try {
        const {
            userName,
            phoneNo,
            status,
            dp,
            bio,
            name,
            address,
            state,
            city,
            postal,
            seeBio,
            addGroup,
            seeOnline,
            visitLinks,
            seeDp,
            seeStatus,
            disappearingMessageDays
        } = req.body;

        if (!phoneNo) {
            return res.status(400).json({ success: false, message: "phoneNo is required" });
        }

        // console.log(req.body);

        const updateFields = {
            ...(userName && { userName }),
            ...(name && { name }),
            ...(status && { status }),
            ...(dp && { dp }),
            ...(bio && { bio }),
            ...(address && state && city && postal && { address, state, city, postal }),
            ...(seeBio && { seeBio }),
            ...(addGroup && { addGroup }),
            ...(seeOnline && { seeOnline }),
            ...(visitLinks && { visitLinks }),
            ...(seeDp && { seeDp }),
            ...(seeStatus && { seeStatus }),
            ...(disappearingMessageDays && { disappearingMessageDays })
        };

        console.log('Updating with:', updateFields);

        const result = await user.findOneAndUpdate(
            { phoneNo },
            updateFields,
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            payload: result,
            message: "Updated successfully"
        });

    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};


/*
    @method POST
    @url    /api/user
    @access public
*/
module.exports.searchUser = async (req, res, next) => {
    try {
        let { search } = req.query;
        let result = await user.find({ name: { $regex: new RegExp(search, 'i') } });
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method POST
    @url    /api/user/findById
    @access public
*/
module.exports.getUserById = async (req, res, next) => {
    try {
        let { id } = req.query;
        let result = await user.findById({ _id: id }, { password: false });
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

module.exports.getProfile = async (req, res) => {
    try {
        const profile = await user.findById(req.user._id);
        return res.status(200).json({
            payload: profile,
            success: true
        });
    } catch (err) {
        console.log("Error in get Profile", err);
    }
}

/*
    @method POST
    @url    /api/user/findListById
    @access public
*/
module.exports.getUserListById = async (req, res, next) => {
    try {
        console.log(req.query);
        let ids = JSON.parse(req.query.ids);
        console.log(ids);
        let result = await user.find(
            {
                _id: {
                    $in: ids
                }
            },
            { password: false, contacts: false, fav: false, blocked: false, pendingContacts: false }
        );
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        console.log(err);
        // next({ status: 400, message: err.message, stack: err.stack });
    }
};

module.exports.checkContact = async (req, res) => {
    try {
        const { contacts } = req.body;

        const _user = await user.findById(req.user._id);

        // Extract all phone numbers
        const phoneNumbers = contacts.flatMap(item => item.contacts.map(contact => contact.phone));

        // Find all users with one query
        const users = await user.find({ phoneNo: { $in: phoneNumbers } }).exec();

        if (users.length > 0) {
            const userIds = users.map((usr) => usr._id);
            _user.contacts = [...new Set([..._user.contacts, ...userIds])];
            _user.save();
        }

        // Map users by phone number for quick lookup
        const userMap = users.reduce((acc, user) => {
            acc[user.phoneNo] = user._id;
            return acc;
        }, {});

        // Update contacts with user IDs
        contacts.forEach((item) => {
            item.contacts.forEach(contact => {
                if (userMap[contact.phone]) {
                    contact.id = userMap[contact.phone];
                }
            });
        });

        return res.status(200).json({ success: true, payload: contacts });
    } catch (err) {
        console.log('Error in Check Contact', err);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};


module.exports.addContact = async (req, res) => {
    try {
        const { phone, userId } = req.body;
    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

module.exports.getContacts = async (req, res) => {
    try {
        const usr = await user.findById(req.user._id);
        console.log(usr);
        const users = await user.find({ _id: { $in: usr.contacts } }).exec();
        console.log('User Contacts', users);
        return res.status(200).json({ success: true, payload: users });
    } catch (err) {
        console.log('Error in Get Contacts :', err);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

/*
    @method POST
    @url    /api/user/contact/sendRequest
    @access public
*/
module.exports.addToContactRequest = async (req, res, next) => {
    //add to pending request of both sender and receiver
    try {
        let { senderId, receiverId } = req.body;
        // console.log(senderId, receiverId);
        //start transaction
        let result = await user.findByIdAndUpdate(
            { _id: senderId },
            {
                $addToSet: {
                    pendingContacts: {
                        userId: receiverId,
                        type: 'sent'
                    }
                }
            },
            { new: true }
        );
        await user.findByIdAndUpdate(
            { _id: receiverId },
            {
                $addToSet: {
                    pendingContacts: {
                        userId: senderId,
                        type: 'received'
                    }
                }
            }
        );
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method PUT
    @url    /api/user/contact/confirmRequest
    @access public
*/
module.exports.confirmRequest = async (req, res, next) => {
    //confirm or delete request
    try {
        let { userId, requestId } = req.body;
        console.log(userId, requestId);
        //requestId sent request and userId received request

        let result = await user.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    pendingContacts: {
                        userId: requestId,
                        type: 'received'
                    }
                },
                $addToSet: { contacts: requestId }
            },
            { new: true }
        );
        // console.log(result);
        await user.findByIdAndUpdate(requestId, {
            $pull: {
                pendingContacts: {
                    userId,
                    type: 'sent'
                }
            },
            $addToSet: { contacts: userId }
        });
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method PUT
    @url    /api/user/contact/rejectRequest
    @access public
*/
module.exports.rejectRequest = async (req, res, next) => {
    try {
        let { userId, requestId } = req.body;
        //requestId sent request and userId received request

        let result = await user.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    pendingContacts: {
                        userId: requestId,
                        type: 'received'
                    }
                }
            },
            { new: true }
        );
        await user.findByIdAndUpdate(requestId, {
            $pull: {
                pendingContacts: {
                    userId,
                    type: 'sent'
                }
            }
        });
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method PUT
    @url    /api/user/contact/cancelRequest
    @access public
*/
module.exports.cancelRequest = async (req, res, next) => {
    try {
        let { userId, requestId } = req.body;
        //requestId sent request and userId received request

        let result = await user.findByIdAndUpdate(
            { _id: userId },
            {
                $pull: {
                    pendingContacts: {
                        userId: requestId,
                        type: 'sent'
                    }
                }
            },
            { new: true }
        );
        await user.findByIdAndUpdate(
            { _id: requestId },
            {
                $pull: {
                    pendingContacts: {
                        userId,
                        type: 'received'
                    }
                }
            }
        );
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method PUT
    @url    /api/user/contact/removeContact
    @access public
*/
module.exports.removeFromContact = async (req, res, next) => {
    try {
        let { userId, contactId } = req.body;
        console.log(`USER ID: ${userId}, CONTACT ID: ${contactId}`);
        //remove form fav and contact list
        let result = await user.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    contacts: contactId,
                    fav: contactId
                }
            },
            { new: true }
        );
        await user.findByIdAndUpdate(contactId, {
            $pull: {
                contacts: userId,
                fav: userId
            }
        });
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method POST
    @url    /api/user
    @access public
*/
module.exports.addFavorite = async (req, res, next) => {
    try {
        let { userId, favId } = req.body;
        let result = await user.findByIdAndUpdate(
            { _id: userId },
            {
                $addToSet: {
                    fav: favId
                }
            },
            { new: true }
        );
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method POST
    @url    /api/user
    @access public
*/
module.exports.removeFavorite = async (req, res, next) => {
    try {
        let { userId, favId } = req.body;
        let result = await user.findByIdAndUpdate(
            { _id: userId },
            {
                $pull: {
                    fav: favId
                }
            },
            { new: true }
        );
        res.status(200).json({ sucess: true, payload: result });
    } catch (err) {
        next({ status: 400, message: err.message, stack: err.stack });
    }
};

/*
    @method POST
    @url    /api/user
    @access public
*/
module.exports.deleteUser = (req, res, next) => {
    res.status(200).json({ sucess: true, fun: 'delete' });
};
