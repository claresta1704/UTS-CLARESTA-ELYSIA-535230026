const bcrypt = require('bcrypt');

/**
 * Hash a plain text password
 * @param {string} password - The password to be hashed
 * @returns {string}
 */
async function hashPassword(password) {
  const saltRounds = 16;
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });

  return hashedPassword;
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
 * Hash a plain text password
 * @param {string} pin - The password to be hashed
 * @returns {string}
 */
async function hashPin(pin) {
  const saltRounds = 16;
  const hashedPin = await new Promise((resolve, reject) => {
    bcrypt.hash(pin, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });

  return hashedPin;
}

/**
 * Compares a plain text password and its hashed to determine its equality
 * Mainly use for comparing login credentials
 * @param {string} password - A plain text password
 * @param {string} hashedPassword - A hashed password
 * @returns {boolean}
 */
async function passwordMatched(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

/**
 * Compares a plain text password and its hashed to determine its equality
 * Mainly use for comparing login credentials
 * @param {string} pin - A plain text password
 * @param {string} hashedPin - A hashed password
 * @returns {boolean}
 */
async function pinMatched(pin, hashedPin) {
  return bcrypt.compareSync(pin, hashedPin);
}

module.exports = {
  hashPassword,
  randomRekening,
  hashPin,
  passwordMatched,
  pinMatched,
};
