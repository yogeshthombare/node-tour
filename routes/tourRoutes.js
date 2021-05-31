const express = require('express');

const toursController = require('../controllers/toursController');

const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// Middleware to check if id exists
// router.param('id', checkValidId)
router.use('/:tourId/reviews', reviewRouter)

router.route('/')
  .get(toursController.getTours)
  .post(authController.isLoggedIn,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.createTour);


router.route('/:id')
  .get(toursController.getTourDetails)
  .patch(
    authController.isLoggedIn,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTour)
  .delete(
    authController.isLoggedIn,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour);

router.route('/tour-stats').get(
  authController.restrictTo('admin', 'guide', 'lead-guide'),
  toursController.getTourStats);

router.route('/monthly-plan/:year').get(
  authController.isLoggedIn,
  authController.restrictTo('admin', 'guide', 'lead-guide'),
  toursController.getMonthlyPlan);

router.route('/top-3-cheap')
  .get(toursController.aliasTopTours,
    toursController.getTours);

router.get('/tours-within/:distance/center/:latlng/unit/:unit', toursController.getToursWithinDistance);
router.get('/distances/:latlng/unit/:unit', toursController.getTourDistances);

module.exports = router;