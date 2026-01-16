const { Worker } = require('bullmq');
const connection = require('../utils/redisClient');
const admin = require('../utils/firebase');
const { emitNotification } = require('../sockets/socketServer');

// const worker = new Worker('notifications', async job => {
//     const { userId, type, message } = job.data;

//     // Simulate sending different types of notifications
//     console.log(`[Notification] To User: ${userId} | Type: ${type} | Msg: ${message}`);

//     // Example: Integrate with email service, push service, etc.
//     // if (type === 'EMAIL') sendEmail(userId, message);

// }, {
//     connection,
//     concurrency: 5
// });

const worker = new Worker('notifications', async job => {
    const { userId, type, message, fcmToken } = job.data;

    // 1. Push Notification via FCM
    if (fcmToken) {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: 'New Notification',
                body: message,
            }
        });
        console.log(`[FCM] Sent to ${userId}`);
    }

    // 2. Real-time Socket.IO Notification
    emitNotification(userId, {
        type,
        message,
        timestamp: Date.now(),
    });

}, {
    connection,
    concurrency: 10
});


worker.on('completed', job => {
    console.log(`✅ Notification job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ Notification job failed: ${job.id}`, err.message);
});
