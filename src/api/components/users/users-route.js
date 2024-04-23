const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  // Get list of users
  // route.get('/', authenticationMiddleware, usersControllers.getUsers);
  // Sebelumnya, fungsi untuk get list of users ini seperti diatas, hasilnya akan menampilkan semua list user yang ada tanpa filter apapun
  // Sehingga jika users nya banyak, hasil yang diberikan juga banyak dan sulit dilihat jika mau mencari data user tertentu saja
  // Maka itu, route untuk menampilkan list users dimodifikasi seperti fibawah ini

route.get('/', authenticationMiddleware,
async (request, response, next){
  try {
    const sort = request.query.sort;
    const search = request.query.search;
    const page_size = number(request.query.page_size);
    const page_number = number(request.query.page_number);

    const filteredUsersList = await usersControllers.filteringUsers(search, sort, page_size, page_number);

    return response.status(200).json(filteredUsersList);
  } catch (error) {
    return next(error);
  }
});


  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );
};
