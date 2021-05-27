const Tour = require('../models/tourModel');
const APIHelper = require('../utils/APIHelper');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = '-price,rating';
  req.query.limit = '3';
  req.query.fields = 'name,rating, price';
  next();
}

exports.getTours = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const feature = new APIHelper(Tour.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  // console.log(feature.query.getFilter());

  const tours = await feature.query;

  res.json({
    status: 'success',
    result: tours.length,
    data: tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newTour
  });
});

exports.getTourDetails = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour available for '${req.params.id}'`, 404));
  }

  res.json({
    status: 'success',
    body: tour,
  });
});

exports.updateTour = async (req, res, next) => {
  try {
    const updatedDoc = await Tour.findByIdAndUpdate(req.params.id, req.body,
      { new: true, runValidators: true });
    res.status(200).json({
      status: 'success',
      data: updatedDoc,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        totalTours: { $sum: 1 },
        totalRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        totalTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        totalTourStarts: 1
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});