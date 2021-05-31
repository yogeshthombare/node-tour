const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, res, cb) => {
  if (file.mimetype.startswith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid image', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Memory storage in multer returns buffer
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
});

const filterParams = (req, ...allowedParams) => {
  const newParams = {};
  Object.keys.forEach(el => {
    if (allowedParams.includes(el)) newParams[el] = req[el];
  });
}

exports.createUser = (req, res) => {
  res.status(404).json({
    message: 'This route is not defined, Please use signup instead'
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
  if (req.file) filteredObj.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, { new: true, runValidators: true });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getMe = (req, res, next) => {
  req.param.id = req.user.id;
  next();
};

exports.getUsers = factory.getAll(User);

exports.getUserDetails = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);