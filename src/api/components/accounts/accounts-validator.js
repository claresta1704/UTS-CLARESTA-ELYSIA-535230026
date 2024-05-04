const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createAccount: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      mothers_name: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('Nama ibu kandung'),
      email: joi.string().email().required().label('Email'),
      noTelp: joi.string().min(10).max(13).required().label('noTelp'),
      pin: joi.string().min(6).max(6).required().label('Pin'),
      pin_confirm: joi.string().required().label('Pin confirmation'),
    },
  },

  updateAccount: {
    //updateAccount kalau akun terblokir dan mau ganti pin (harus pergi ke bank)
    body: {
      pin: joi.string().min(6).max(6).required().label('Pin'),
      noTelp: joi.string().min(10).max(13).required().label('noTelp'),
    },
  },

  changePassword: {
    //change password kalau mau ubah pin atas kemauan sendiri dan masih ingat pin lama
    body: {
      pin_old: joi.string().required().label('Old pin'),
      pin_new: joiPassword.string().min(6).max(6).required().label('New pin'),
      pin_confirm: joi.string().required().label('Pin confirmation'),
    },
  },
};
