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
  let { email, password } = req.body;

  if (!email || !password)
    return next(
      customErrorBuilder(
        "Please provide values for 'email' and 'password' fields! ",
        400
      )
    );

  email = email.toLowerCase();

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (!userExists)
    return next(
      customErrorBuilder(
        `User with email: ${email} doesn't exist in our database. Please Log in`,
        400
      )
    );

  // Verify password
  const isPasswordCorrect = await passwordChecker(
    password,
    userExists.password
  );

  if (!isPasswordCorrect)
    return next(
      customErrorBuilder(
        `Invalid credentials, please crosscheck your email and password`,
        400
      )
    );

  const tokenUser = {
    userId: userExists._id,
    name: userExists.name,
    role: userExists.role,
  };

  // Fucntion generates and attaches cookies to headers
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(200).json({ user: tokenUser });
});

const logout = asyncWrapperMiddleWare(async (req, res, next) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    maxAge: 0,
  });

  res.status(200).send('logout successful');
});

module.exports = { register, login, logout };
