const { response } = require("express");
const supabase = require("../config/supabase");
const { success, error } = require("./responseHandler");
const { email } = require("../models/validation");

const dataHandler = {};

dataHandler.insertEmail = async (res, clientData) => {
  const _data =
    typeof clientData === "object"
      ? [clientData]
      : Array.isArray(data)
      ? clientData
      : false;

  if (!_data) {
    return error({
      response: res,
      status: 406,
      message: "Data is not valid data!",
    });
  }
  const { data, error: supabaseError } = await supabase
    .from("emails")
    .insert(_data)
    .select();

  console.log("Inserted email!");

  if (supabaseError) {
    console.error("Supabase Error:", supabaseError);
    const { code, message } = supabaseError;
    return error({
      response: res,
      status: code === "23505" ? 409 : 500,
      message:
        code === "23505"
          ? "Already this email saved on database!"
          : supabaseError.message,
    });
  }

  return success({
    response: res,
    status: 201,
    message: "Data saved successfully",
    data: data,
  });
};

dataHandler.getEmail = async (value) => {
  try {
    let dataResponse = {};
    if (value && value.length > 3 && email(value)) {
      dataResponse = await supabase
        .from("emails")
        .select("*")
        .eq("email", value);
    } else if (value && value.length > 3) {
      dataResponse = await supabase
        .from("emails")
        .select("*")
        .or(
          `email.eq.${value},name.eq.${value},ip.eq.${value},website.eq.${value}`
        );
    } else {
      dataResponse = await supabase.from("emails").select("*");
    }
    const { data, error: supabaseError } = dataResponse;

    if (supabaseError) {
      return {
        status: 400,
        message: supabaseError.message,
      };
    }

    if (data.length <= 0) {
      return {
        status: 404,
        message: "Data is not found!",
      };
    }

    return {
      status: 200,
      message: "Fetched all email data!",
      data: data,
    };
  } catch {
    return {
      status: 500,
      message: "Internal server error!",
    };
  }
};

dataHandler.insertUser = async (req, res) => {
  const requestBody = req.body;
  const { name, email, password } = requestBody;

  if (!name) {
    return error({
      response: res,
      status: 400,
      message: "Please fill up name field!",
    });
  }
  if (!email) {
    return error({
      response: res,
      status: 400,
      message: "Please fill up email field!",
    });
  }
  if (!password) {
    return error({
      response: res,
      status: 400,
      message: "Please fill up password field!",
    });
  }

  if (!name & !email & !password) {
    return error({
      response: res,
      status: 400,
      message: "Please fill up requied field!",
    });
  }

  const { data, error: err } = supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,
      },
      emailRedirectTo: "http://localhost:8080/api/confirmed",
    },
  });

  if (err) {
    return error({
      response: res,
      status: 500,
      message: "Internal server error!",
    });
  }

  return success({
    response: res,
    status: 200,
    message:
      "Account created! Please check your email and confirm your account.",
    data: {
      id: data?.user?.id,
      name: data?.user?.user_metadata?.name,
      email: data?.user?.email,
    },
  });
};

dataHandler.userIsLoggedIn = async (req, res) => {
  const {
    data: { session },
    err,
  } = supabase.auth.getSession();

  if (!session) {
    return error({
      response: res,
      status: 400,
      message: "User is not logged in!",
    });
  }

  return success({
    response: res,
    status: 200,
    message: message || "User is logged in!",
  });
};

dataHandler.updateUser = async (req, res) => {
  const { name, username, email } = req.body;
  if (!name & !username & !email) {
    return success({
      response: res,
      status: 304,
      message: "You not updated anything!",
    });
  }
  const userLoggedIn = dataHandler.userIsLoggedIn(req, res);
  if (userLoggedIn === 200) {
    return success({
      response: res,
      status: 200,
      message: "User update succesfully!",
    });
  }

  return error({
    response: res,
    status: 304,
    message: "User not logged is!",
  });
};

dataHandler.userLogin = async (req, res) => {
  const { user, password } = res.body;
  if (!user) {
    return error({
      response: res,
      status: 406,
      message: "Not found your account!",
    });
  }
};

module.exports = dataHandler;
