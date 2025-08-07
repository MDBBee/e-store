const asyncWrapperMiddleWare = require('../middleware/async-wrapper');
const { customErrorBuilder } = require('../errors/custom-error');
const User = require('../models/user');
const {
  passwordHasher,
  passwordChecker,
  tokenGenerator,
  tokenVerifier,
  attachCookiesToResponse,
} = require('../utils/utils');

const register = asyncWrapperMiddleWare(async (req, res, next) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(
      customErrorBuilder(
        "Please provide values for 'name', 'email' and 'password' fields! ",
        400
      )
    );

  email = email.toLowerCase();
  password = await passwordHasher(password);
  let role;

  //   Make first user admin
  if ((await User.countDocuments({})) === 0) role = 'admin';
  // Check if user exists
  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists)
    return next(
      customErrorBuilder(
        `User with email: ${email} already exists. Please Log in`,
        400
      )
    );
  // create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  // generate token details
  const tokenUser = { userId: user._id, name: user.name, role: user.role };

  // Fucntion generates and attaches cookies to headers
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(201).json({ user: tokenUser });
});

const login = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('Login!');
});
const logout = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('Logout!');
});

module.exports = { register, login, logout };
