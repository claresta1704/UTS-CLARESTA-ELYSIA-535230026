const logger = require('../src/core/logger')('api');
const { Account } = require('../src/models');
const { hashPin } = require('../src/utils/password');
const { randomRekening } = require('../src/utils/password');

const name = 'Administrator';
const mothers_name = 'nama ibu';
const email = 'default@example.com';
const noTelp = '081234567891';
const pin = '123456';

logger.info('Creating default Accounts');

(async () => {
  try {
    const numAccounts = await Account.countDocuments({
      name,
      noTelp,
    });

    if (numAccounts > 0) {
      throw new Error(`Account with phone number ${noTelp} already exists`);
    }

    const hashedPin = await hashPin(pin);
    const noRek = randomRekening();
    await Account.create({
      name,
      mothers_name,
      email,
      noTelp,
      pin: hashedPin,
      noRek,
    });
  } catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
})();
