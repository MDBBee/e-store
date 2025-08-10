const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');

const Product = require('../models/Product');
const Order = require('../models/Order');
const checkPermissions = require('../utils/checkPermissions');

// Fake stripe sdk
const fakeStripeApi = async (payload) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount: payload.amount };
};

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

    orderItems = [...orderItems, singleOrderItem];
    subTotal += item.amount * price;
  }

  const total = tax + shippingFee + subTotal;
  //   Fake stripe process
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: 'usd',
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal: subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res.status(201).json({ order, clientSecret: order.clientSecret });
});

const getAllOrders = asyncWrapperMiddleWare(async (req, res, next) => {
  const orders = await Order.find({});
  res.status(200).json({ orders, count: orders.length });
});

const getSingleOrder = asyncWrapperMiddleWare(async (req, res, next) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    return next(customErrorBuilder(`No order with id : ${orderId}`));
  }
  checkPermissions(req.user, order.user);
  res.status(200).json({ order });
});

const getCurrentUserOrders = asyncWrapperMiddleWare(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(200).json({ orders, count: orders.length });
});

const updateOrder = asyncWrapperMiddleWare(async (req, res, next) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    return next(customErrorBuilder(`No order with id : ${orderId}`));
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(200).json({ order });
});

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
