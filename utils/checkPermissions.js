const {
  customErrorBuilder,
  CustomAPIError,
} = require('../errors/custom-error');

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;

  throw new CustomAPIError(
    'Access denied. Resource requires admin authentication',
    403
  );
};

module.exports = checkPermissions;
