const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterParams = (req, allowedParams) => {
  const newParams = {};
  Object.keys.forEach(el => {
    if (allowedParams.includes(el)) newParams[el] = req[el];
  });
}

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.createUser = (req, res) => {
  res.status(404).json({
    message: 'No method implented'
  });
};

exports.getUserDetails = (req, res) => {
  res.status(404).json({
    message: 'No method implented'
  });
};

exports.updateUser = (req, res) => {
  res.status(404).json({
    message: 'No method implented'
  });
};

exports.deleteUser = (req, res) => {
  res.status(404).json({
    message: 'No method implented'
  });
};

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateMyAccount = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You are not able to update password here', 400));
  }

  // Remove all unwanted params to update
  const filteredObj = filterParams(req.body, ['name', 'email']);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});