const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { checkAuthentication } = require('../config/auth');

router.post('/', checkAuthentication, postController.createPost);
router.get('/', postController.getPosts);
router.post('/like', postController.likePost);
router.post('/share', postController.sharePost);
router.post('/comment', postController.addComment);
router.post('/comment/reply', postController.replyToComment);

module.exports = router;
