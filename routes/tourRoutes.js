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

const router = express.Router();

// Middleware to check if id exists
// router.param('id', checkValidId)

router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router.route('/top-3-cheap')
  .get(aliasTopTours, getTours);

router.route('/')
  .get(getTours)
  .post(createTour);

router.route('/:id')
  .get(getTourDetails)
  .put(updateTour)
  .delete(deleteTour);

module.exports = router;