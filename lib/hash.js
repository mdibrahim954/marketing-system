const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");

const hash = {};

hash.appApiKey = async () => {
  try {
    const apikey = uuidv4();

    // console.log("Generated:", apikey);

    if (apikey) {
      return apikey;
    }
    return false;
  } catch (error) {
    console.log("Catch Error:", error);
    return false;
  }
};

hash.appPass = async (pass) => {
  try {
    const hashedPassword = await bcrypt.hash(pass, 10);
    // console.log(hashedPassword);

    return hashedPassword;
  } catch (error) {
    console.log("Password hash error:", error);
    return false;
  }
};

hash.appPassCompare = async (pass, hash) => {
  try {
    const result = await bcrypt.compare(pass, hash);
    return result; // true or false
  } catch (err) {
    console.error(err);
    return false;
  }
};
module.exports = hash;
