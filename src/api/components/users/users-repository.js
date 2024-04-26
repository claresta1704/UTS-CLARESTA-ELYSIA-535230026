const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * fungsi search
 * @param {string} fieldName
 * @param {string} searchKey
 * @returns {Promise}
 */
async function search(fieldName, searchKey){
  const query = {};

  switch (fieldName){
    case 'name':
      query.name = {$regex: new RegExp(searchKey, 'i')};
      break;
    case 'email' :
      query.email = {$regex: new RegExp(searchKey, 'i')};
      break;
    default:
      return null;
  }

  const users = await User.find(query);
  return users;
  
  // const searching = {};

  // switch (fieldName) {
  //   case 'name' :
  //     searching.name = searchKey;
  //     break;
  //   case 'email' :
  //     searching.email = searchKey;
  //     break;
  //   default :
  //     return null;
  // }

  // const searched = await User.find({name: Jeonghan});
  // return searched;
}

/**
 * fungsi sort
 * @param {string} field_name
 * @param {string} sort
 * @returns {Promise}
 */
async function sort(field_name, sort){
  let sorted;
  let sortOrder;
  if(sort == 'asc'){
    sortOrder = 1;
  }else if(sort == 'desc'){
    sortOrder = -1;
  }else{
    sortOrder = 1;
  }

  switch (field_name) {
    case 'name' :
      sorted = await User.find({}).sort({name: sortOrder});
      break;
    case 'email' :
      sorted = await User.find({}).sort({email: sortOrder});
      break;
    default:
      sorted = await User.find({}).sort({email: sortOrder});
  }

  return sorted;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
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
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  search,
  sort,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
