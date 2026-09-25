const express = require("express");
const supabase = require("../config/supabase");
const { error, success } = require("../controlers/responseHandler");
const { email } = require("../models/validation");
const { appApiKey, appPass } = require("../lib/hash");
const application = express.Router();
application.get("/", async (req, res) => {
  try {
    const { data, error: err } = await supabase.from("application").select("*");

    if (err) {
      // console.log(err);

      return error({
        response: res,
        status: 400,
        message: err.message,
      });
    }

    if (!data || data.length === 0) {
      return error({
        response: res,
        status: 404,
        message: "No data found!",
      });
    }

    return success({
      response: res,
      status: 200,
      message: "Data Fetched!",
      data,
    });
  } catch (err) {
    console.log(err);

    return error({
      response: res,
      status: 500,
      message: "Internal server error!",
    });
  }
});

application.post("/", async (req, res) => {
  const apikey = await appApiKey();
  if (!apikey) {
    return error({
      response: res,
      status: 400,
      message: "Something is wrong!",
    });
  }
  const { name, email: e, permision, password } = req.body;

  if (!name || name.length <= 0) {
    return error({
      response: res,
      status: 406,
      message: "Invalid name field!",
    });
  }

  if (!email || !email(e)) {
    return error({
      response: res,
      status: 406,
      message: "Invalid email field!",
    });
  }

  if (!password || password.length < 8) {
    return error({
      response: res,
      status: 406,
      message: "Invalid password!",
    });
  }
  const hashPass = await appPass(password);
  // console.log("Hass pass: ", hashPass);

  if (!hashPass) {
    return error({
      response: res,
      status: 400,
      message: "Somethings wrong!",
    });
  }
  const objectData = {
    name: name,
    email: e,
    permision: permision ?? 1,
    password: hashPass,
    apikey: apikey,
  };

  const data =
    typeof objectData === "object"
      ? [objectData]
      : Array.isArray(objectData)
      ? objectData
      : [objectData];

  const { data: d, error: err } = await supabase
    .from("application")
    .insert(data)
    .select();

  if (err) {
    console.log(
      err.code === "23505"
        ? "Already an application created using this email"
        : "internal server error!"
    );

    if (err.code === "") {
      return error({
        response: res,
        status: 500,
        message: "Server is offline!",
      });
    }
    return error({
      response: res,
      status: err.code === "23505" ? 409 : 500,
      message:
        err.code === "23505"
          ? "Already an application created using this email"
          : "internal server error!",
    });
  }

  console.log("Created a new application!");

  return success({
    response: res,
    status: 200,
    message: "Apllication created successfully!",
  });
});
module.exports = application;
