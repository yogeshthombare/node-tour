const express = require('express');
const authController = require('../controllers/authController');

const usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('forgotPassword', authController.forgotPassword);
router.post('resetPassword/:token', authController.resetPassword);

router.use(authController.isLoggedIn);

router.get('/me', usersController.getMe, usersController.getUserDetails);

router.patch('updatePassword', authController.updatePassword);
router.patch('deleteMyAccount', usersController.deleteMyAccount);
router.patch('updateMyAccount',
  usersController.uploadUserPhoto,
  usersController.resizeUserPhoto,
  usersController.updateMyAccount);

// following routes can be accessed by admin only
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(usersController.getUsers)
  .post(usersController.createUser);

router.route('/:id')
  .get(usersController.getUserDetails)
  .put(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;