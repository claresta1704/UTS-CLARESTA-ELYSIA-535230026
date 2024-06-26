const usersRepository = require('./users-repository');
const { User } = require('../../../models');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * //Menghitung jumlah user keseluruhan
 * @returns {number}
 */
async function countUsers(){
  const counted = await usersRepository.getUsers(); //kita pakai getUser dulu, nanti dari getUser dimasukkan lagi ke array baru
  let count = 0;
  for(let j = 0; j < counted.length; j++){ //hitung jumlah berdasarkan length nya
    count = count + 1;
  };
  return (count);
}

/**
 * search user
 * @param {string} field
 * @param {string} key
 * @returns {Array}
 */
async function searchUsers(field, key) {
  const pengguna = await getUsers();
  
  const hasil = [];
  for(let i=0; i < pengguna.length; i++){ //kita pakai getUsers untuk mengambil semua data user dulu
    const searched = pengguna[i];
    if(field == 'name'){ //baru disini, kita sesuaikan fieldnya
      if(searched.name.includes(key)){ //jika di field name yang mengandung key, maka akan dimasukkan dalam array hasil
        hasil.push({
          id: searched.id,
          name: searched.name,
          email: searched.email,
        });
      }
    } else if (field == 'email'){
      if(searched.email.includes(key)){ //jika di field email yang mengandung key, maka akan dimasukkan dalam array hasil
        hasil.push({
          id: searched.id,
          name: searched.name,
          email: searched.email,
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
  const sorted = usersRepository.sort(array, field, sort_order); //memanggil fungsi sort di usersRepository
  return sorted;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}


/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  countUsers,
  getUser,
  searchUsers,
  sort,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
