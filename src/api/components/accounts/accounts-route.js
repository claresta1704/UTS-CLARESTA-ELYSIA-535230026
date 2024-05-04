const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const accountsControllers = require('./accounts-controller');
const accountsValidator = require('./accounts-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/accounts', route);

  // Get list of accounts
  route.get('/', authenticationMiddleware, accountsControllers.getAccounts);

  // Create account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(accountsValidator.createAccount),
    accountsControllers.createAccount
  );

  // Mentransfer uang
  route.post('/:id/transfer', authenticationMiddleware, accountsControllers.transferMoney);

  // Top Up
  route.post('/:id/topup', authenticationMiddleware, accountsControllers.topUp);

  // Get account detail
  route.get('/:id', authenticationMiddleware, accountsControllers.getAccount);

  // Update account
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(accountsValidator.updateAccount),
    accountsControllers.updateAccount
  );

  // Delete account
  route.delete('/:id', authenticationMiddleware, accountsControllers.deleteAccount);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(accountsValidator.changePassword),
    accountsControllers.changePassword
  );
};
