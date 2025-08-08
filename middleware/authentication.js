const { customErrorBuilder } = require('../errors/custom-error');
const { tokenVerifier } = require('../utils/utils');
const User = require('../models/user');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) return next(customErrorBuilder(`Authentication failed!`, 401));

  try {
    const payload = tokenVerifier(token);
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
    };

    next();
  } catch (error) {
    return next(customErrorBuilder(`Authentication failed!`, 401));
  }
};

const authorizePermissions =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
      return;
    }
    return next(
      customErrorBuilder(`Not authorized to access this resource!`, 403)
    );
  };

module.exports = { authenticateUser, authorizePermissions };
