const User = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const AppError = require('../utils/appError.js');
const sendEmail = require('../utils/email');
const { promisify } = require('util');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRETE_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

createAndSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // also send cookie
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: { user }
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const user = new User({
    'name': req.body.name,
    'email': req.body.email,
    'password': req.body.password,
    'passwordConfirm': req.body.passwordConfirm,
  });

  const newUser = await user.save();

  console.log(newUser);
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide valid credentials', 400));
  }
  // Check of user exists and validate password
  const user = await User.findOne({ email }).select('password');

  if (!user || !(await user.isValidPassword(password, user.password))) {
    return next(new AppError('Invalid email or Password', 401));
  }

  // send token
  createAndSendToken(user, 200, res);
});


exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // check if email exists
  if (!email) {
    return next(new AppError('Plese provide email', 400));
  }

  // check if valid email and get user record
  const user = await User.findOne(email);
  if (!user) {
    return next(new AppError('User does not exists', 404));
  }
  // create random new token
  const resetToken = user.createPasswordResetToken();
  // This disables the validation for required fields
  await user.save({ validateBeforeSave: false });

  // send email to user with token

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

  const emailBody = `Forgot your password? Please click on link below to reset password ${resetUrl}. \n this token is valid for 10 mins only.`

  const emailOptions = {
    email: user.email,
    emailBody,
    subject: 'Reset password request'
  }

  try {
    await sendEmail(emailOptions);

    res.status(200).json({
      status: success,
      message: 'Password reset token sent to your email.'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending an email. Please try again'), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get uset based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('kex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or Expired Token', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // login user and send new token
  createAndSendToken(user, 200, res);
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // get token and check if it is valid
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access Denied for anuthorised login', 401));
  }
  // token verification
  const decoded = await promisify(jwt.verify)(token, process.env.SECRETE_KEY);

  console.log(decoded);
  // check if user still exists or not deleted
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User does not exist for the token provided', 401));
  }

  // check if user chenged password after token issued
  if (currentUser.isPasswordChangedAfterLogin(decoded.iat)) {
    return next(new AppError('Password has changed, Please login again ', 401));
  }

  // store user info in req
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have access to this functionality', 403));
    }
    next();
  }
}

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user
  // + here indicate the dispaite password is select false in model we are explicitely asking 
  // for password
  const user = await User.findById(req.user.id).select('+password');

  // validate password
  if (!(await user.isValidPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Please enter valid current password', 401));
  }

  // update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // here findIdAndUpdate is not used as it will not validate password
  await user.save();
  // resend new token
  createAndSendToken(user, 200, res);
});
