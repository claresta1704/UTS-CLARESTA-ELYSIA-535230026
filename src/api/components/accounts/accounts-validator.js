//MODIFIKASI COPY DARI USER
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

  updateNoTelp: {
    //untuk update nomor telepon
    body: {
      pin: joi.string().min(6).max(6).required().label('Pin'),
      noTelp: joi.string().min(10).max(13).required().label('noTelp'),
    },
  },

  changePin: {
    //change password kalau mau ganti pin
    body: {
      mothers_name: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('mothers_name'),
      pin_old: joi.string().required().label('pin_old'),
      pin_new: joiPassword.string().min(6).max(6).required().label('pin_new'),
      pin_confirm: joi.string().required().label('pin_confirm'),
    },
  },
};
