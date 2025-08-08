const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');
const Review = require('../models/Review');
const {
  passwordChecker,
  passwordHasher,
  attachCookiesToResponse,
} = require('../utils/utils');
const checkPermissions = require('../utils/checkPermissions');
// const path = require('path');
// const cloudinary = require('cloudinary').v2;
// const { unlinkSync } = require('fs');

const createReview = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('createReview');
});
const getAllReviews = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('getAllReviews');
});
const getSingleReview = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('getSingleReview');
});
const updateReview = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('updateReview');
});
const deleteReview = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('deleteReview');
});

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
