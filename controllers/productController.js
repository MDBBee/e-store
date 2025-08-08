const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');
const Product = require('../models/Product');
const {
  passwordChecker,
  passwordHasher,
  attachCookiesToResponse,
} = require('../utils/utils');
const checkPermissions = require('../utils/checkPermissions');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { unlinkSync } = require('fs');

// Create a product
const createProduct = asyncWrapperMiddleWare(async (req, res, next) => {
  let productObject = req.body;
  productObject.user = req.user.userId;

  const product = await Product.create(productObject);
  res.status(200).json({ product });
});

// Get all Products
const getAllProducts = asyncWrapperMiddleWare(async (req, res, next) => {
  const products = await Product.find({});
  res.status(200).json({ products, count: products.length });
});

// Get a single product
const getSingleProduct = asyncWrapperMiddleWare(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });

  if (!product)
    return next(customErrorBuilder(`No product with id:${req.params.id}`, 400));

  res.status(200).json({ product });
});

// Update Product
const updateProduct = asyncWrapperMiddleWare(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });

  if (!product)
    return next(customErrorBuilder(`No product with id:${req.params.id}`, 400));

  const newProduct = await Product.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  );
  res.status(200).json({ product: newProduct });
});

// Delete Product
const deleteProduct = asyncWrapperMiddleWare(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });

  if (!product)
    return next(customErrorBuilder(`No product with id:${req.params.id}`, 400));

  await Product.findOneAndDelete({ _id: req.params.id });
  res.send('Product deleted successfully!');
});

// Uplaod an Image
const uploadImage = asyncWrapperMiddleWare(async (req, res, next) => {
  if (!req.files)
    return next(
      customErrorBuilder(`No image selected, please select an image`, 400)
    );

  const { image } = req.files;

  if (!image.mimetype.startsWith('image'))
    return next(customErrorBuilder(`File type can only be an image`, 400));

  const maxSize = 1024 * 1024;

  if (image.size > maxSize)
    return next(customErrorBuilder(`Image size should be less than 1mb`, 400));
  // const imagePath = path.join(__dirname, '../public/uploads/' + image.name);
  // console.log(imagePath);

  // image.mv(imagePath);
  // res.status(200).json({ image: `/upload/${image.name}` });
  const cloudImage = await cloudinary.uploader.upload(image.tempFilePath, {
    use_filename: true,
    folder: 'e-store',
  });
  unlinkSync(image.tempFilePath);

  res.status(200).json({ image: cloudImage.secure_url });
});

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
