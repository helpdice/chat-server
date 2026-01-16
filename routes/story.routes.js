const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');

router.post('/', storyController.createStory);
router.get('/', storyController.getStories);

module.exports = router;
