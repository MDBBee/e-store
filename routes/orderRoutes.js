const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/orderController');
const checkPermissions = require('../utils/checkPermissions');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .get(authorizePermissions('admin'), getAllOrders)
  .post(createOrder);
router.route('/showallmyorders').get(getCurrentUserOrders);

router.route('/:id').get(getSingleOrder).patch(updateOrder);

module.exports = router;
