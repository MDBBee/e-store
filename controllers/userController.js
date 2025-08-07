const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');
const User = require('../models/user');

const getAllUsers = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('getAllUsers');
});
const getSingleUser = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('getSingleUser');
});
const showCurrentUser = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('showCurrentUser');
});
const updateUser = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('updateUser');
});
const updateUserPassword = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('updateUserPassword');
});

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
