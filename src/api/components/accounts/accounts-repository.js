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
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createAccount(name, email, password) {
  return Account.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateAccount(id, name, email) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
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
 * Get account by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getAccountByEmail(email) {
  return Account.findOne({ email });
}

/**
 * Update account password
 * @param {string} id - Account ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return Account.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getAccounts,
  sort,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountByEmail,
  changePassword,
};
