const notificationQueue = require('../queues/notificationQueue');

// const sendNotification = async ({ userId, type, message }) => {
//     await notificationQueue.add('send_notification', {
//         userId,
//         type,
//         message
//     }, {
//         attempts: 3, // retry if failed
//         removeOnComplete: true,
//         removeOnFail: false,
//     });
// };

// module.exports = { sendNotification };

const sendNotification = async ({ userId, type, message, fcmToken = null }) => {
    await notificationQueue.add('send_notification', {
        userId,
        type,
        message,
        fcmToken
    }, {
        attempts: 3,
        removeOnComplete: true,
    });
};

module.exports = { sendNotification };

