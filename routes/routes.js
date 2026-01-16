const router = require('express').Router();

const userRouter = require('./user/user.route');
const groupRouter = require('./group/group.routes');
const uploadRouter = require('./fileUpload/fileUpload.routes')
const chatRouter = require('./chat/chat.route');
const postRoutes = require('./post.routes');
const storyRoutes = require('./story.routes');
const callRoutes = require('./calls.routes');

router.use('/user', userRouter);
router.use('/group', groupRouter);
router.use('/upload', uploadRouter);
router.use('/chat', chatRouter);
router.use('/posts', postRoutes);
router.use('/stories', storyRoutes);
router.use('/calls', callRoutes);

module.exports = router;