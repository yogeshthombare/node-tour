const express = require('express');
const authController = require('../controllers/authController');

const usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('forgotPassword', authController.forgotPassword);
router.post('resetPassword/:token', authController.resetPassword);

router.patch('updatePassword', authController.isLoggedIn, authController.updatePassword);

router.patch('deleteMyAccount', authController.isLoggedIn, usersController.deleteMyAccount);

router.patch('updateMyAccount', authController.isLoggedIn, usersController.updateMyAccount);

router.route('/')
  .get(authController.isLoggedIn, usersController.getUsers)
  .post(authController.isLoggedIn, usersController.createUser);

router.route('/:id')
  .get(authController.isLoggedIn, usersController.getUserDetails)
  .put(authController.isLoggedIn, usersController.updateUser)
  .delete(authController.isLoggedIn, usersController.deleteUser);

module.exports = router;