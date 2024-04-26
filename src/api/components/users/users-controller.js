const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { use } = require('express/lib/router');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await filteringUsers(request, response, next);
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function filteringUsers(request, response, next) {
  try {
    const search = request.query.search || null;
    const sort = request.query.sort || 'email:asc';
    const page_size = parseInt(request.query.page_size) || null;
    const page_number = parseInt(request.query.page_number) || null;

    let filteredUsers = [];
    if(search==null && page_size==null && page_number==null){
      const usersPure = await usersService.getUsers();
      return response.status(200).json(usersPure);
    }
    //SEARCH
    if (search != null){
      let [field, key] = search.split(':');
      field = field.toLowerCase();
      filteredUsers = await usersService.searchUsers(field, key);
    }else{
      return null;
    }

    //  //SEARCH
    //  if (search != null){
    //   const regexSearch = /^[email|name]:[\w\s\S]+$/;
    //   if(search.match(regexSearch)){
    //     let [field, key] = search.split(':');
    //     field = field.toLowerCase();
    //     filteredUsers = await usersService.search(field, key);
    //   } else {
    //     return response.status(400).json({error: 'tambahkan search'})
    //   }
    // }

    //SORT - karena sudah dibuat default jika tidak diisi, jadi tidak pakai if(sort != null)
    let [fieldSort, sortOrder] = sort.split(':');
    fieldSort = fieldSort.toLowerCase();
    sortOrder = sortOrder.toLowerCase();
    filteredUsers = await usersService.sort(fieldSort, sortOrder);
    
    //PAGE NUMBER & PAGE SIZE
    const userPerPage = 10;
    let indexAwal = (page_number - 1) * userPerPage;
    let indexAkhir = indexAwal + page_size;

    if (page_size < 0 || page_number < 0) {
    //saat di users-route sudah mengubah parameter page_size dan page_number menjadi integer, jadi disini hanya cek apakah bilangan positif atau bukan
      throw errorResponder(
        errorTypes.BAD_REQUEST,
        'page_size dan page_number harus angka integer positif'
      );
    }
    if (page_number != null && page_size != null) {
        //untuk page_number dan page_size tidak kosong
        if (page_size < 0 || page_number < 0) {
          //saat di users-route sudah mengubah parameter page_size dan page_number menjadi integer, jadi disini hanya cek apakah bilangan positif atau bukan
            throw errorResponder(
              errorTypes.BAD_REQUEST,
              'page_size dan page_number harus angka integer positif'
            );
          }
        filteredUsers = filteredUsers.slice(indexAwal, indexAkhir);
        return response.status(200).json(filteredUsers);
      } else if (page_number != null && page_size == null) {
        //untuk page_number tidak kosong dan page_size kosong
        if (page_size < 0 || page_number < 0) {
          //saat di users-route sudah mengubah parameter page_size dan page_number menjadi integer, jadi disini hanya cek apakah bilangan positif atau bukan
            throw errorResponder(
              errorTypes.BAD_REQUEST,
              'page_size dan page_number harus angka integer positif'
            );
          }
        indexAwal = (page_number - 1) * userPerPage;
        indexAkhir = indexAwal + userPerPage;
        filteredUsers = filteredUsers.slice(indexAwal, indexAkhir);
        return response.status(200).json(filteredUsers);
      } else if (page_number == null) {
        //untuk page_number kosong
        return response.status(200).json(filteredUsers);
      }

  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  filteringUsers,
};
