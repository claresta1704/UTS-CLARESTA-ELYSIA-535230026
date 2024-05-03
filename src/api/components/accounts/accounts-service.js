const accountsRepository = require('./accounts-repository');
const { Account } = require('../../../models');
const { hashPin, passwordMatched } = require('../../../utils/password');

/**
 * Get list of accounts
 * @returns {Array}
 */
async function getAccounts() {
  const accounts = await accountsRepository.getAccounts();

  const results = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    results.push({
      id: account.id,
      name: account.name,
      email: account.email,
      noTelp: account.noTelp,
      noRek: account.noRek,
    });
  }

  return results;
}

/**
 * //Menghitung jumlah account keseluruhan
 * @returns {number}
 */
async function countAccounts(){
  const counted = await accountsRepository.getAccounts(); //kita pakai getAccount dulu, nanti dari getAccount dimasukkan lagi ke array baru
  let count = 0;
  for(let j = 0; j < counted.length; j++){
    count = count + 1;
  };
  return (count);
}

/**
 * search account
 * @param {string} field
 * @param {string} key
 * @returns {Array}
 */
async function searchAccounts(field, key) {
  const pengguna = await getAccounts();
  
  const hasil = [];
  for(let i=0; i < pengguna.length; i++){ //kita pakai getAccounts untuk mengambil semua data account dulu
    const searched = pengguna[i];
    if(field == 'name'){ //baru disini, dicari data tertentu sesuai search
      if(searched.name.includes(key)){
        hasil.push({
          id: searched.id,
          name: searched.name,
          email: searched.email,
          noTelp: searched.noTelp,
        });
      }
    } else if (field == 'email'){
      if(searched.email.includes(key)){
        hasil.push({
          id: searched.id,
          name: searched.name,
          email: searched.email,
          noTelp: searched.noTelp,
        })
      }
    }
  }
  return hasil;
}

/**
 * sort
 * @param {Array} array
 * @param {string} field
 * @param {string} sort_order
 * @returns {Array}
 */
async function sort (array, field, sort_order){
  const sorted = accountsRepository.sort(array, field, sort_order); //memanggil fungsi sort di accountsRepository
  return sorted;
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Object}
 */
async function getAccount(id) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    noTelp: account.noTelp,
    noRek: account.noRek,
  };
}

/**
 * fungsi untuk membuat nomor rekening acak 10 angka
 * @returns {string}
 */
function randomRekening(){
  const noRek = Math.floor(1000000000 + Math.random() * 90000000000);
  return noRek.toString();
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} mothers_name - nama ibu kandung
 * @param {string} email - email
 * @param {string} noTelp - nomor telepon
 * @param {string} pin - pin
 * @returns {boolean}
 */
async function createAccount(name, mothers_name, email, noTelp, pin) {
  // Hash pin
  const hashedPin= await hashPin(pin);
  const noRek = randomRekening();

  try {
    await accountsRepository.createAccount(name, mothers_name, email, noTelp, hashedPin, noRek);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} mothers_name - Name
 * @param {string} password - Email
 * @param {string} password_confirm
 * @returns {boolean}
 */
async function updateAccount(id, mothers_name, password, password_confirm) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.updateAccount(id, mothers_name, password, password_confirm);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} noTelp - Email
 * @returns {boolean}
 */
async function noTelpIsRegistered(noTelp) {
  const account = await accountsRepository.getAccountBynoTelp(noTelp);

  if (account) {
    return true;
  }

  return false;
}

/**
 * untuk sorting
 * @param {string} sort
 * @returns {array}
 */

/**
 * Check whether the password is correct
 * @param {string} accountId - Account ID
 * @param {string} pin - Password
 * @returns {boolean}
 */
async function checkPassword(accountId, pin) {
  const account = await accountsRepository.getAccount(accountId);
  return passwordMatched(pin, account.pin);
}

/**
 * Change account password
 * @param {string} accountId - Account ID
 * @param {string} pin - Password
 * @returns {boolean}
 */
async function changePassword(accountId, pin) {
  const account = await accountsRepository.getAccount(accountId);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPin = await hashPin(pin);

  const changeSuccess = await accountsRepository.changePassword(
    accountId,
    hashedPin
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getAccounts,
  countAccounts,
  getAccount,
  searchAccounts,
  sort,
  createAccount,
  updateAccount,
  deleteAccount,
  noTelpIsRegistered,
  checkPassword,
  changePassword,
};
