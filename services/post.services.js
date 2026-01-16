const Post = require('../models/Post');
const { getCache, setCache } = require('../utils/cache');

exports.getPaginatedPosts = async (page = 1, limit = 10) => {
    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .populate('comments')
        .exec();

    return posts;
};

exports.getPostById = async (id) => {
    const cacheKey = `post:${id}`;
    let post = await getCache(cacheKey);
    if (!post) {
        post = await Post.findById(id).populate('comments').lean();
        await setCache(cacheKey, post);
    }
    return post;
};
