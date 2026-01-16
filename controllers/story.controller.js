const Story = require('../models/Story');

exports.createStory = async (req, res) => {
    const { image, author } = req.body;
    const story = await Story.create({
        image,
        author,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    res.status(201).json(story);
};

exports.getStories = async (req, res) => {
    const now = new Date();
    const stories = await Story.find({ expiresAt: { $gt: now } });
    res.json(stories);
};
