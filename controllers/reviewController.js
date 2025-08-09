const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');
const Review = require('../models/Review');
const Product = require('../models/Product');
const checkPermissions = require('../utils/checkPermissions');

// 1)
const createReview = asyncWrapperMiddleWare(async (req, res, next) => {
  const { product: productId } = req.body;

  // Check for product validity
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct)
    return next(customErrorBuilder(`Product was not found!`, 400));

  // Check if user has dropped a review for this product
  const hasBeenReviewed = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (hasBeenReviewed)
    return next(
      customErrorBuilder(`This Product has already been reviewed`, 400)
    );

  let reviewObject = req.body;
  reviewObject.user = req.user.userId;

  const review = await Review.create(reviewObject);

  res.status(201).json({ review });
});

//2) Get all Reviews
const getAllReviews = asyncWrapperMiddleWare(async (req, res, next) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({
      path: 'user',
      select: 'name',
    });
  res.status(200).json({ reviews, count: reviews.length });
});

//3) Get a single review
const getSingleReview = asyncWrapperMiddleWare(async (req, res, next) => {
  const { id } = req.params;

  // Check for product validity
  const review = await Review.findOne({ _id: id });
  if (!review)
    return next(customErrorBuilder(`Requested review does not exist!`, 400));

  res.status(200).json({ review });
});

//4) Update a review
const updateReview = asyncWrapperMiddleWare(async (req, res, next) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  // Check for product validity
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    return next(customErrorBuilder(`Requested review does not exist!`, 400));

  // Check for review ownership
  checkPermissions(req.user, review.user);
  // Updating the retrieved review
  review.rating = rating;
  review.title = title;
  review.comment = comment;

  const updatedReview = await Review.findOneAndUpdate(
    { _id: reviewId },
    review,
    { runValidators: true, new: true }
  );

  res.status(200).json({ review: updatedReview });
});

//5) Delete a review
const deleteReview = asyncWrapperMiddleWare(async (req, res, next) => {
  const { id: reviewId } = req.params;

  // Check for product validity
  const review = await Review.findOne({ _id: reviewId });

  if (!review)
    return next(customErrorBuilder(`Requested review does not exist!`, 404));

  // Check for review ownership
  checkPermissions(req.user, review.user);

  // Delete the review
  // await Review.findOneAndDelete({ _id: reviewId });
  await review.deleteOne();

  res.status(200).json({ msg: 'Review deleted!' });
});

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
