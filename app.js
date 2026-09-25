const express = require("express");
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const emailRouter = require("./routers/email");
const auth = require("./routers/auth");
const application = require("./routers/application");
const sendEmail = require("./routers/sendEmail");
// const { auth } = require("./config/supabase");

const app = express();

dotEnv.config();

const port = process.env.PORT;
app.use((req, res, next) => {
  const allowedOrigin = "http://localhost:3000";

  if (req.headers.origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use("/api/email", emailRouter);
app.use("/api", auth);
app.use("/api/application", application);
app.use("/api/email/send", sendEmail);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
