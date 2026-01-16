const router = require('express').Router();

const { createChat, getChat, getChatList, markAsRead, syncFromServer, syncToServer } = require('../../controllers/chat.controller');

router
    .route('/')
    .get(getChat)
    .post(createChat);

router
    .route('/sync')
    .get(syncFromServer)
    .post(syncToServer)

router
    .route('/getChatList')
    .get(getChatList);

router
    .route('/markAsRead')
    .post(markAsRead);

module.exports = router;