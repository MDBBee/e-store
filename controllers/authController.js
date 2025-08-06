const asyncWrapperMiddleWare = require('../middleware/async-wrapper');

const register = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('Register!');
});
const login = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('Login!');
});
const logout = asyncWrapperMiddleWare(async (req, res, next) => {
  res.send('Logout!');
});

module.exports = { register, login, logout };
