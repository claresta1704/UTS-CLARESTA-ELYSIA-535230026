const accountsService = require('./accounts-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { use } = require('express/lib/router');
const { filter } = require('lodash');
const { boolean } = require('joi');

/**
 * Handle get list of accounts request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccounts(request, response, next) {
  try {
    const accounts = await accountsService.getAccounts (request, response, next);
    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get account detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccount(request, response, next) {
  try {
    const account = await accountsService.getAccount(request.params.id);

    if (!account) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown account');
    }

    return response.status(200).json(account);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createAccount(request, response, next) {
  try {
    const name = request.body.name;
    const mothers_name = request.body.mothers_name;
    const email = request.body.email;
    const noTelp = request.body.noTelp;
    const pin = request.body.pin;
    const pin_confirm = request.body.pin_confirm;

    // Check confirmation password
    if (pin !== pin_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const noTelpIsRegistered = await accountsService.noTelpIsRegistered(noTelp);
    if (noTelpIsRegistered) {
      throw errorResponder(
        errorTypes.NOTELP_ALREADY_TAKEN,
        'Phone number is already registered'
      );
    }

    const success = await accountsService.createAccount(name, mothers_name, email, noTelp, pin);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create account'
      );
    }

    return response.status(200).json({ name, noTelp });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateAccount(request, response, next) {
  try {
    const id = request.params.id;
    const mothers_name = request.body.mothers_name;
    const pin = request.body.pin;
    const pin_confirm = request.body.pin_confirm;

    // // Email must be unique
    // const emailIsRegistered = await accountsService.emailIsRegistered(email);
    // if (emailIsRegistered) {
    //   throw errorResponder(
    //     errorTypes.EMAIL_ALREADY_TAKEN,
    //     'Email is already registered'
    //   );
    // }

    const success = await accountsService.updateAccount(id, mothers_name, pin, pin_confirm);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update account'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const id = request.params.id;

    const success = await accountsService.deleteAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete account'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change account password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.pin_new !== request.body.pin) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Pin confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await accountsService.checkPassword(
        request.params.id,
        request.body.pin_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const changeSuccess = await accountsService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change pin'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change account password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function filteringAccounts(request, response, next) {
  try {
    const search = request.query.search || null;
    const sort = request.query.sort || 'email:asc'; //ini defaultnya jika tidak diisi berarti sorting secara asc pada email
    const page_size = parseInt(request.query.page_size) || null; //page_size dan page_number otomatis merubah parameter jadi integer
    const page_number = parseInt(request.query.page_number) || null;

    let filteredAccounts = [];
    const regexSearch = /^(email|name):[\w\s\S]+$/i; //kata awal harus antara email atau name, lalu ada : nya, terakhir boleh \w(huruf, angka, underscore), \s(spasi), \S(simbol), + artinya set karakter terakhir harus ada setidaknya 1
    const regexSort = /^(email|name):(asc|desc)$/i; //kata awal harus antara email atau name, lalu ada : nya, terakhir antara asc atau desc

    //SEARCH
    if (search != null){ //Jika search diisi
      let [field, key] = search.split(':'); //memisahkan parameter search dengan :. sebelum : jadi field, setelah : jadi key
      field = field.toLowerCase(); //mengubah field jadi huruf kecil untuk meminimalkan resiko error saat searchAccounts di accounts-service
      if(search.match(regexSearch)){ //jika formatnya sesuai
        filteredAccounts = await accountsService.searchAccounts(field, key);
      } else { //jika formatnya tidak sesuai, search dianggap tidak ada
        filteredAccounts = await accountsService.getAccounts();
      }
    } else if (search == null){ //jika tidak diisi, search dianggap tidak ada
      filteredAccounts = await accountsService.getAccounts();
    }

    const fieldSortDefault = 'email'; //disini membuat fieldSort dan sortOrder default untuk kalau sort nya salah format
    const sortOrderDefault = 'asc';

    //SORT - karena sudah dibuat default jika tidak diisi, jadi tidak pakai if(sort != null)
    if(sort.match(regexSort)){
      let [fieldSort, sortOrder] = sort.split(':');
      fieldSort = fieldSort.toLowerCase(); //dibuat huruf kecil untuk mengurangi resiko terjadi error
      sortOrder = sortOrder.toLowerCase();
      filteredAccounts = await accountsService.sort(filteredAccounts, fieldSort, sortOrder);
    }else if(sort.match(regexSort)){
      filteredAccounts = await accountsService.sort(filteredAccounts, fieldSortDefault, sortOrderDefault);
    }
    
    //PAGE NUMBER & PAGE SIZE
    const accountPerPage = 10;
    //dibawah ini default jika page_number dan page_size ada isinya. Kalau ada yang gak diisi, berarti bisa berubah. Oleh karena itu, disini pakai let, bukan const
    let indexAwal = (page_number - 1) * accountPerPage;
    //note indexAwal : misal total ada 4 halaman, accountPerPage nya 3
    //jika mau dikeluarkan semua yang di halaman 2, max accounts nya 2, maka index total accounts yang di page 2 berarti 3,4,5 (index mulai dari 0)
    //index awalnya 3. Untuk mendapatkan 3, (nomor halaman yang diinginkan - 1)*accountPerPage => (2-1)*3 => 1*3 = 3
    let indexAkhir = indexAwal + page_size;
    //node indexAkhir : dengan pemisalan yang sama
    //index akhirnya 5. Untuk dapat 5, (index awal + max accounts yang dimau) => 3+2 = 5

    if (page_size < 0 || page_number < 0) {
    //cek terlebih dulu apakah page_size dan page_numbernya bilangan positif, sesuai intruksi soal
      return response.status(400).json('page_size dan page_number harus bilangan integer positif');
    }

    if (page_number != null && page_size != null) { //jika page_number dan page_size tidak kosong, maka-
        filteredAccounts = filteredAccounts.slice(indexAwal, indexAkhir); //indexAwal dan indexAkhir memakai default yang tadi
    } else if (page_number != null && page_size == null) { //jika page_number ada isi, tapi page_size tidak diisi, maka-
      indexAwal = (page_number - 1) * accountPerPage;
      indexAkhir = indexAwal + accountPerPage; //index akhirnya jadi index awal + accountPerpage, karena jika page_size tidak diisi, akan menampilkan semua account dalam 1 halaman (accountPerPage)
      filteredAccounts = filteredAccounts.slice(indexAwal, indexAkhir); //dipotong, diambil dari indexAwal sampai indexAkhir
    }

    let totalAccount = await accountsService.countAccounts(); //hitung dulu total account yang ada
    let total_page;
    if(totalAccount % accountPerPage !== 0){ //jika hasilnya bukan integer, dibulatkan keatas
      total_page = (parseInt(totalAccount/accountPerPage))+1; //misalnya 13/10, integernya kan 1, tambah 1 jadi page nya akan ada 2
    } else if(totalAccount % accountPerPage == 0){ //jika hasilnya sudah integer
      total_page = totalAccount/accountPerPage; //tidak pakai parseInt lagi
    }
    let has_previous_page = (indexAwal-1 !== -1); //bernilai true jika index awal dikurangi 1, hasilnya bukan -1(-1 berarti sudah lewat indec)
    let has_next_page = (indexAkhir+1 <= totalAccount); //bernilai true jika index akhir ditambah 1, hasilnya tidak lebih dari total account
    let count = filteredAccounts.length;

    //Untuk OUTPUT
    const result = {};
    if(page_number !== null){
      result.page_number = page_number;
    }
    result.page_size = accountPerPage;
    result.count = count;
    result.total_pages = total_page;
    result.has_previous_page = has_previous_page;
    result.has_next_page = has_next_page;
    result.data = filteredAccounts;
    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  changePassword,
  filteringAccounts,
};
