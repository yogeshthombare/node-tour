const express = require('express');

const {
  getTours,
  createTour,
  getTourDetails,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
} = require('../controllers/toursController');

const authController = require('../controllers/authController');

const router = express.Router();

// Middleware to check if id exists
// router.param('id', checkValidId)

router.route('/tour-stats').get(authController.isLoggedIn, getTourStats)
router.route('/monthly-plan/:year').get(authController.isLoggedIn, getMonthlyPlan)

router.route('/top-3-cheap')
  .get(aliasTopTours, authController.isLoggedIn, getTours);

router.route('/')
  .get(authController.isLoggedIn, getTours)
  .post(authController.isLoggedIn, createTour);

router.route('/:id')
  .get(authController.isLoggedIn, getTourDetails)
  .put(authController.isLoggedIn, updateTour)
  .delete(authController.isLoggedIn, deleteTour);

module.exports = router;