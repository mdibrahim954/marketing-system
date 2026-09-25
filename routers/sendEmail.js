const express = require("express");
const { checkAPIAuth } = require("../controlers/middleware");
const sendEmail = express.Router();

const nodemailer = require("nodemailer");
const { success, error } = require("../controlers/responseHandler");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

sendEmail.post("/", checkAPIAuth, async (req, res) => {
  const { to, subject, message, brandName } = req.body;

  try {
    await transport.verify(); // throws if verification fails — no callback needed

    let brand =
      typeof brandName === "string" && brandName.length > 3
        ? ` || ${brandName}`
        : "";

    const sendMail = await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: to,
      replyTo: process.env.GMAIL_USER,
      subject: `${subject}${brand}`,
      html: `<p>${message}</p>`,
    });

    if (sendMail.accepted && sendMail.accepted.length > 0) {
      return success({
        response: res,
        status: 200,
        message: "Mail sent successfully!",
        data: {
          messageId: sendMail.messageId,
          messageSize: sendMail.messageSize,
          message: sendMail.message,
          messageTime: sendMail.messageTime,
        },
      });
    }

    if (sendMail.rejected && sendMail.rejected.length > 0) {
      return error({
        response: res,
        status: 406,
        message:
          "Sorry, your mail was rejected — please try using another email!",
      });
    }

    return error({
      response: res,
      status: 406,
      message: "Something went wrong, try again!",
    });
  } catch (err) {
    console.error("Send mail error:", err); // log the real error — silent catches hide the actual bug
    return error({
      response: res,
      status: 500,
      message: "Internal error, try again later!",
    });
  }
});

sendEmail.post("/bulk", checkAPIAuth, async (res, req) => {
  const { name, email, message } = req.body;
});

module.exports = sendEmail;
