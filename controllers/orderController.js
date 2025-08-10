const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');

const Product = require('../models/Product');
const Order = require('../models/Order');
const checkPermissions = require('../utils/checkPermissions');

const createOrder = asyncWrapperMiddleWare(async (req, res, next) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    return next(
      customErrorBuilder(
        `Cart itmes can't be empty or invalid. Cross-check`,
        400
      )
    );
  }
  if (!tax || !shippingFee) {
    return next(
      customErrorBuilder(
        `Please cross-check your tax and shipping fee. Invalid value!`,
        400
      )
    );
  }

  let orderItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const dbProdcut = await Product.findOne({ _id: item.product });

    if (!dbProdcut) {
      return next(
        customErrorBuilder(`No product with id:${item.product}!`, 404)
      );
    }

    const { name, price, image, _id } = dbProdcut;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, ...singleOrderItem];

    console.log(singleOrderItem);
  }

  res.status(201).json('createOrder');
});

const getAllOrders = asyncWrapperMiddleWare(async (req, res, next) => {
  res.status(201).json('getAllOrders');
});

const getSingleOrder = asyncWrapperMiddleWare(async (req, res, next) => {
  res.status(201).json('getSingleOrder');
});

const getCurrentUserOrders = asyncWrapperMiddleWare(async (req, res, next) => {
  res.status(201).json('getCurrentUserOrders');
});

const updateOrder = asyncWrapperMiddleWare(async (req, res, next) => {
  res.status(201).json('updateOrder');
});

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
