const { Account } = require('../../../models');

/**
 * Get a list of accounts
 * @returns {Promise}
 */
async function getAccounts() {
  return Account.find({});
}

/**
 * fungsi sort
 * @param {Array} array
 * @param {string} field_name
 * @param {string} sort
 * @returns {Promise}
 */
async function sort(array, field_name, sort){
  let sortOrder;
  if(sort == 'asc'){
    sortOrder = 1;
  }else if(sort == 'desc'){
    sortOrder = -1;
  }else{
    sortOrder = 1;
  }

  let sorted = await array.sort((colSatu, colDua) => {
    if(colSatu[field_name] < colDua[field_name]){
      return (-1*sortOrder);
    }else if(colSatu[field_name] > colDua[field_name]){
      return (1*sortOrder);
    }else{
      return 0;
    }
  });

  return sorted;
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function getAccount(id) {
  return Account.findById(id);
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} mothers_name - Nama ibu kandung
 * @param {string} email - Email
 * @param {string} noTelp - Nomor telepom
 * @param {string} pin - Hashed pin
 * @param {string} noRek - nomor rekening random 10 angka
 * @returns {Promise}
 */
async function createAccount(name, mothers_name, email, noTelp, pin, noRek, saldo) {
  return Account.create({
    name,
    mothers_name,
    email,
    noTelp,
    pin,
    noRek,
    saldo,
  });
}

/**
 * @param {string} id
 * @param {number} amount
 * @returns {Promise}
 */
async function tambahKurangSaldo(id, amount){
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        saldo: amount,
      },
    }
  );
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} noTelp - Email
 * @returns {Promise}
 */
async function updateNoTelp(id, noTelp) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        noTelp,
      },
    }
  );
}

/**
 * Delete a account
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return Account.deleteOne({ _id: id });
}

/**
 * Get account buat cek nomor telpon sudah ada atau belum
 * @param {string} noTelp - Email
 * @returns {Promise}
 */
async function getAccountBynoTelp(noTelp) {
  return Account.findOne({ noTelp });
}

/**
 * Update account password
 * @param {string} id - Account ID
 * @param {string} pin - New hashed pin
 * @returns {Promise}
 */
async function changePin(id, pin) {
  return Account.updateOne({ _id: id }, { $set: { pin } });
}

module.exports = {
  getAccounts,
  sort,
  getAccount,
  createAccount,
  updateNoTelp,
  deleteAccount,
  getAccountBynoTelp,
  tambahKurangSaldo,
  changePin,
};
