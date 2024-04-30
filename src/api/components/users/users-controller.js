const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { use } = require('express/lib/router');
const { filter } = require('lodash');
const { boolean } = require('joi');

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
    const sort = request.query.sort || 'email:asc'; //ini defaultnya jika tidak diisi berarti sorting secara asc pada email
    const page_size = parseInt(request.query.page_size) || null;
    const page_number = parseInt(request.query.page_number) || null;

    let filteredUsers = [];
    const regexSearch = /^(email|name):[\w\s\S]+$/i;

    //SEARCH
    if (search != null){ //Jika search diisi
      let [field, key] = search.split(':'); //memisahkan parameter 
      field = field.toLowerCase();
      if(search.match(regexSearch)){
        filteredUsers = await usersService.searchUsers(field, key);
      } else {
        filteredUsers = await usersService.getUsers();
      }
    } else if (search == null){
      filteredUsers = await usersService.getUsers();
    }

    //SORT - karena sudah dibuat default jika tidak diisi, jadi tidak pakai if(sort != null)
    let [fieldSort, sortOrder] = sort.split(':');
    fieldSort = fieldSort.toLowerCase(); //dibuat huruf kecil untuk mengurangi resiko terjadi error
    sortOrder = sortOrder.toLowerCase();
    filteredUsers = await usersService.sort(filteredUsers, fieldSort, sortOrder);

    //PAGE NUMBER & PAGE SIZE
    const userPerPage = 10;
    //dibawah ini default jika page_number dan page_size ada isinya. Kalau ada yang gak diisi, berarti bisa berubah. Oleh karena itu, disini pakai let, bukan const
    let indexAwal = (page_number - 1) * userPerPage;
    //note indexAwal : misal total ada 4 halaman, userPerPage nya 3
    //jika mau dikeluarkan semua yang di halaman 2, max users nya 2, maka index total users yang di page 2 berarti 3,4,5 (index mulai dari 0)
    //index awalnya 3. Untuk mendapatkan 3, (nomor halaman yang diinginkan - 1)*userPerPage => (2-1)*3 => 1*3 = 3
    let indexAkhir = indexAwal + page_size;
    //node indexAkhir : dengan pemisalan yang sama
    //index akhirnya 5. Untuk dapat 5, (index awal + max users yang dimau) => 3+2 = 5

    if (page_size < 0 || page_number < 0) {
    //cek terlebih dulu apakah page_size dan page_numbernya bilangan positif, sesuai intruksi soal
      return response.status(400).json('page_size dan page_number harus bilangan integer positif');
    }

    if (page_number != null && page_size != null) { //jika page_number dan page_size tidak kosong, maka-
        filteredUsers = filteredUsers.slice(indexAwal, indexAkhir); //indexAwal dan indexAkhir memakai default yang tadi
    } else if (page_number != null && page_size == null) { //jika page_number ada isi, tapi page_size tidak diisi, maka-
      indexAwal = (page_number - 1) * userPerPage; //index akhirnya beru
      indexAkhir = indexAwal + userPerPage;
      filteredUsers = filteredUsers.slice(indexAwal, indexAkhir);
    }

    let totalUser = await usersService.countUsers(); //hitung dulu total user yang ada
    let total_page;
    if(totalUser % userPerPage !== 0){ //jika hasilnya bukan integer, dibulatkan keatas
      total_page = (parseInt(totalUser/userPerPage))+1; //misalnya 13/10, integernya kan 1, tambah 1 jadi page nya akan ada 2
    } else if(totalUser % userPerPage == 0){ //jika hasilnya sudah integer
      total_page = totalUser/userPerPage; //tidak pakai parseInt lagi
    }
    let has_previous_page = (indexAwal-1 !== -1); //bernilai true jika index awal dikurangi 1, hasilnya bukan -1(-1 berarti sudah lewat indec)
    let has_next_page = (indexAkhir+1 <= totalUser); //bernilai true jika index akhir ditambah 1, hasilnya tidak lebih dari total user
    let count = filteredUsers.length;

    //Untuk OUTPUT
    const result = {};
    if(page_number !== null){
      result.page_number = page_number;
    }
    result.page_size = userPerPage;
    result.count = count;
    result.total_pages = total_page;
    result.has_previous_page = has_previous_page;
    result.has_next_page = has_next_page;
    result.data = filteredUsers;
    return response.status(200).json(result);
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
