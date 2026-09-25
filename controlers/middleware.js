const supabase = require("../config/supabase");
const { appPassCompare } = require("../lib/hash");
const { error, success } = require("./responseHandler");

let middleware = {};
middleware.checkAPIAuth = async (req, res, next) => {
  const { apikey, password: pass } = { ...req.query, ...req.body };
  const cleanApiKey = String(apikey).trim();

  if (!apikey || apikey.length <= 0) {
    return error({
      response: res,
      status: 406,
      message: "API key is not found!",
    });
  }

  if (!pass || pass.length <= 0) {
    return error({
      response: res,
      status: 406,
      message: "Password is not found!",
    });
  }
  console.log("Clean Api Key: ", cleanApiKey);

  const { data, error: err } = await supabase.from("application").select("*");

  if (err) {
    console.log(err);

    return error({
      response: res,
      status: 400,
      message: err.message,
    });
  }

  const application =
    data.find((row) => row.apikey.trim() === cleanApiKey) || null;

  if (!application) {
    return error({
      response: res,
      status: 404,
      message: "Application is not found!",
    });
  }

  if (application) {
    const { password } = application;

    // console.log(data);

    if (!password || !pass) {
      return error({
        response: res,
        status: 400,
        message: "Missing credentials for comparison!",
      });
    }

    const isLoggedIn = await appPassCompare(pass, password);
    console.log("User is logged in: " + isLoggedIn);
    if (!isLoggedIn) {
      return error({
        response: res,
        status: 400,
        message: "Application is not Logged-in!",
      });
    }

    return next();
  }
  return error({
    response: res,
    status: 400,
    message: "Intarnal server error!",
  });
};

middleware.loggedinCheck = async (req, res, next) => {};

module.exports = middleware;
