const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };