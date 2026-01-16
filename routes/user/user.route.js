const router = require('express').Router();
const auth = require('../../config/auth');

const {
    createUser,
    deleteUser,
    updateUser,
    searchUser,
    getUserById,
    getUserListById,
    addToContactRequest,
    confirmRequest,
    removeFromContact,
    cancelRequest,
    rejectRequest,
    addFavorite,
    removeFavorite,
    checkContact,
    addContact,
    getContacts,
    getProfile
} = require('../../controllers/user.controller');

const { createTokens, login } = require('../../auth/controller/auth.controller');

router
    .route('/')
    .post(createUser, createTokens)
    .put(updateUser)
    .delete(deleteUser);

router.route('/login').post(login, createUser, createTokens)

router
    .route('/search')
    .get(searchUser);

router
    .route('/profile')
    .get(auth.checkAuthentication, getProfile)

router
    .route('/findById')
    .get(getUserById);

router
    .route('/findListById')
    .get(getUserListById);

router
    .route('/contact/check')
    .post( auth.checkAuthentication, checkContact)

router
    .route('/contacts')
    .get(auth.checkAuthentication, getContacts)

router
    .route('/contact/add')
    .post(addContact)

router
    .route('/contact/sendRequest')
    .post(addToContactRequest);

router
    .route('/contact/confirmRequest')
    .put(confirmRequest);

router
    .route('/contact/removeContact')
    .put(removeFromContact);

router
    .route('/contact/cancelRequest')
    .put(cancelRequest);

router
    .route('/contact/rejectRequest')
    .put(rejectRequest);

router
    .route('/favorite')
    .put(addFavorite)
    .delete(removeFavorite);

module.exports = router;