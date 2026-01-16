const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.createPost = async (req, res) => {
    console.log(req.body);
    const post = await Post.create({
       ...req.body,
       author: req.user._id
    });
    res.status(201).json(post);
};

exports.getPosts = async (req, res) => {
    const posts = await Post.find().populate('author');
    console.log(posts);
    res.status(200).json({ payload: posts });
};

exports.likePost = async (req, res) => {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post.likes.includes(userId)) {
        post.likes.push(userId);
    }
    await post.save();
    res.json(post);
};

exports.sharePost = async (req, res) => {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post.shares.includes(userId)) {
        post.shares.push(userId);
    }
    await post.save();
    res.json(post);
};

exports.addComment = async (req, res) => {
    const { postId, author, text } = req.body;
    const comment = await Comment.create({ post: postId, author, text });
    const post = await Post.findById(postId);
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
};

exports.replyToComment = async (req, res) => {
    const { commentId, author, text } = req.body;
    const comment = await Comment.findById(commentId);
    comment.replies.push({ author, text });
    await comment.save();
    res.json(comment);
};
