require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const passwordHasher = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

const passwordChecker = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);

  return isMatch;
};

const tokenGenerator = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

const tokenVerifier = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = tokenGenerator(user);

  // Attach cookie to headers
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};

module.exports = {
  passwordHasher,
  passwordChecker,
  tokenGenerator,
  tokenVerifier,
  attachCookiesToResponse,
};
