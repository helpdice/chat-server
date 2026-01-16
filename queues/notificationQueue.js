const { Queue } = require('bullmq');
const connection = require('../utils/redisClient');

const notificationQueue = new Queue('notifications', {
    connection
});

module.exports = notificationQueue;
