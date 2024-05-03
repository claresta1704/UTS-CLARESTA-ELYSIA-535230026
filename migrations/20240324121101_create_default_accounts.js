const logger = require('../src/core/logger')('api');
const { Account } = require('../src/models');
const { hashPassword } = require('../src/utils/password');

const name = 'Administrator';
const email = 'admin@example.com';
const password = '123456';

logger.info('Creating default Accounts');

(async () => {
  try {
    const numAccounts = await Account.countDocuments({
      name,
      email,
    });

    if (numAccounts > 0) {
      throw new Error(`Account ${email} already exists`);
    }

    const hashedPassword = await hashPassword(password);
    await Account.create({
      name,
      email,
      password: hashedPassword,
    });
    
  } catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
})();
