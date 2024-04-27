const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

let limitFailedLogin = 0;

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    if (limitFailedLogin >= 5){
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too much login attempt, wait for 30 min to continue'
      )
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      limitFailedLogin = limitFailedLogin+1;
      if (limitFailedLogin==1){
        setTimeout(() => {
          limitFailedLogin = 0;
        }, 1800000); //ketika limit failed login pertama kali ditambahkan, langsung hitung 30 menit sebelum di reset
      }
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
