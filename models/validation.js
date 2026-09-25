const EmailValidation = require("emailvalid");

const ev = new EmailValidation({
  allowFreemail: true,
});

const validation = {};

validation.email = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const regexValidation = typeof email === "string" && regex.test(email.trim());

  if (regexValidation) {
    const emailValidation = ev.check(email);
    return emailValidation.valid;
  }
  return false;
};

module.exports = validation;
