const router = require('express').Router();
const auth = require('../../config/auth');
const {
    createGroup,
    addAdmin,
    addMember,
    removeAdmin,
    removeMember,
    deleteGroup,
    getGroupsByCreator,
    getGroupMembers,
    changeGroupMembers,
    updateGroup,
    getGroupsByMember
} = require('../../controllers/group.controller');

router
    .route('/')
    .get(auth.checkAuthentication, getGroupsByCreator)
    .post(auth.checkAuthentication, createGroup)
    .delete(auth.checkAuthentication, deleteGroup)
    
router
    .route('/member')
    .get(auth.checkAuthentication, getGroupsByMember)

router
    .route('/:groupId')
    .post(auth.checkAuthentication, updateGroup);

router
    .route('/members/:groupId')
    .get(getGroupMembers)
    .post(auth.checkAuthentication, changeGroupMembers);


router
    .route('/addAdmin')
    .put(addAdmin);

router
    .route('/removeAdmin')
    .put(removeAdmin);

router
    .route('/addMember')
    .put(addMember);

router
    .route('/removeMember')
    .put(removeMember);

module.exports = router;