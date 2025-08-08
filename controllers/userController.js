const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');
const User = require('../models/user');
const {
  passwordChecker,
  passwordHasher,
  attachCookiesToResponse,
} = require('../utils/utils');
const checkPermissions = require('../utils/checkPermissions');

const getAllUsers = asyncWrapperMiddleWare(async (req, res, next) => {
  const users = await User.find({ role: 'user' }, 'name email role');
  res.status(200).json({ users });
});

const getSingleUser = asyncWrapperMiddleWare(async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  if (!id)
    return next(
      customErrorBuilder(`Id field in the params must be provided`, 400)
    );

  const userExists = await User.findOne({ _id: id }, 'name email role');
  if (!userExists)
    return next(
      customErrorBuilder(
        `No user with id: ${id} found!, Please cross-check`,
        400
      )
    );

  // Check if user requesting for details === authenticated user or admin
  checkPermissions(req.user, id);
  res.status(200).json({ user: userExists });
});

const showCurrentUser = asyncWrapperMiddleWare(async (req, res, next) => {
  res.status(200).json({ user: req.user });
});

const updateUser = asyncWrapperMiddleWare(async (req, res, next) => {
  const { name, email } = req.body;
  const { userId } = req.user;

  if (!name || !email)
    return next(
      customErrorBuilder('Please provide values for all fields! ', 400)
    );

  const user = await User.findOne({ _id: userId });

  if (!user)
    return next(
      customErrorBuilder(
        `Invalid request, user doesn't exist in our database. Please Log in`,
        400
      )
    );

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { name, email: email.toLowerCase },
    { new: true, runValidators: true }
  ).select('-password');

  const tokenUser = {
    userId: updatedUser._id,
    name: updatedUser.name,
    role: updatedUser.role,
  };

  // Fucntion generates and attaches cookies to headers
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(200).json({ user: updatedUser });
});

const updateUserPassword = asyncWrapperMiddleWare(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { userId } = req.user;

  if (!oldPassword || !newPassword)
    return next(
      customErrorBuilder(
        "Please provide values for 'oldPassword' and 'newPassword' fields! ",
        400
      )
    );

  const user = await User.findOne({ _id: userId });

  if (!user)
    return next(
      customErrorBuilder(
        `Invalid request, user doesn't exist in our database. Please Log in`,
        400
      )
    );

  const oldPasswordIsMatch = await passwordChecker(oldPassword, user.password);

  if (!oldPasswordIsMatch)
    return next(
      customErrorBuilder(
        `Invalid request, the oldPassword is incorrect, try again!`,
        400
      )
    );

  const updatedPassword = await passwordHasher(newPassword);
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { password: updatedPassword },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({ user: updatedUser });
});

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
