const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');

const accounts = require('./components/accounts/accounts-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  accounts(app);

  return app;
};
