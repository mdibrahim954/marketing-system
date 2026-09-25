const express = require("express");
const supabase = require("../config/supabase");
const { insertUser } = require("../controlers/dataHandler");
const auth = express.Router();

auth.post("/singIn", insertUser);
auth.get("/confirmed", (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are user created successfully!",
  });
  res.end();
  return;
});
module.exports = auth;
