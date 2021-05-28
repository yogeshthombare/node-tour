const APIHelper = require("../utils/APIHelper");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    next(new AppError('No record found!', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body,
    { new: true, runValidators: true });

  if (!updatedDoc) {
    next(new AppError('No record found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { data: updatedDoc },
  });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
  const newDoc = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { data: newDoc }
  });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);

  if (populateOptions) query.populate(populateOptions);

  const doc = await query;

  if (!doc) {
    return next(new AppError(`No record available for '${req.params.id}'`, 404));
  }

  res.json({
    status: 'success',
    data: { data: doc },
  });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
  // This is a small hack here but not recommended always
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }

  const feature = new APIHelper(Model.find(filter), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const doc = await feature.query;
  // const doc = await feature.query.explain();

  res.json({
    status: 'success',
    result: doc.length,
    data: { data: doc },
  });
});