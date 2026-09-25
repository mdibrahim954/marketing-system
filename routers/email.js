const express = require("express");

const emailRouter = express.Router();

const { error, success } = require("../controlers/responseHandler");
const validation = require("../models/validation");
const { insertEmail, getEmail } = require("../controlers/dataHandler");

const { checkAPIAuth } = require("../controlers/middleware");
const supabase = require("../config/supabase");

// GET - Read all emails
emailRouter.get("/", checkAPIAuth, async (req, res) => {
  const { search, apikey, password } = req.query;
  if (typeof apikey !== "string" && !apikey) {
    return error({
      response: res,
      status: 400,
      message: "please we need must api key!",
    });
  }
  if (typeof password !== "string" && !password) {
    return error({
      response: res,
      status: 400,
      message: "please we need must password!",
    });
  }
  let response = await getEmail(search);

  if (response.status === 200) {
    console.log(response.data);

    return success({
      response: res,
      status: response.status,
      message: response.message,
      data: response.data ?? {},
    });
  }

  return error({
    response: res,
    status: response.status,
    message: response.message,
  });
});

// POST - Add email
emailRouter.post("/", checkAPIAuth, async (req, res) => {
  try {
    // console.log("Request Body:", req.body);

    if (!req.body) {
      return error({
        response: res,
        status: 406,
        message: "Something is wrong",
      });
    }

    if (!req.body.email) {
      return error({
        response: res,
        status: 406,
        message: "Email is not found!",
      });
    }

    if (!validation.email(req.body.email)) {
      return error({
        response: res,
        status: 406,
        message: "Email is not valid!",
      });
    }
    const data = {
      name: req.body.name ?? "",
      email: req.body.email,
      ip: req.body.ip ?? "",
      website: req.body.website ?? "",
    };
    return insertEmail(res, data);
  } catch (err) {
    // console.error("Server Error:", err);

    return error({
      response: res,
      status: 500,
      message: "Internal server error",
    });
  }
});

emailRouter.delete("/:id", checkAPIAuth, async (req, res) => {
  const { id } = req.params;
  const { error: err } = await supabase.from("emails").delete().eq("id", id);

  console.log(err);

  if (err) {
    return error({
      response: res,
      status: 400,
      message: "Faild to delete Email1",
    });
  }

  return success({
    response: res,
    status: 200,
    message: "Deleted successfully",
  });
});

module.exports = emailRouter;
