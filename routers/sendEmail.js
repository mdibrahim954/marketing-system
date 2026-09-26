const express = require("express");
const {
    checkAPIAuth
} = require("../controlers/middleware");
const sendEmail = express.Router();

const nodemailer = require("nodemailer");
const {
    success,
    error
} = require("../controlers/responseHandler");

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});

// basic HTML escape to prevent injection into the email body
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

sendEmail.post("/", checkAPIAuth, async (req, res) => {
    const {
        to,
        subject,
        message,
        brandName
    } = req.body;

    if (!to || !subject || !message) {
        return error({
            response: res,
            status: 400,
            message: "to, subject, and message are required!",
        });
    }

    try {
        await transport.verify(); // throws if verification fails — no callback needed

        let brand =
            typeof brandName === "string" && brandName.length > 3 ?
            ` || ${brandName}` :
            "";

        const sendMail = await transport.sendMail({
            from: process.env.GMAIL_USER,
            to: to,
            replyTo: process.env.GMAIL_USER,
            subject: `${subject}${brand}`,
            html: `<p>${escapeHtml(message)}</p>`,
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
                message: "Sorry, your mail was rejected — please try using another email!",
            });
        }

        return error({
            response: res,
            status: 406,
            message: "Something went wrong, try again!",
        });
    } catch (err) {
        console.error("Send mail error:", err);
        return error({
            response: res,
            status: 500,
            message: "Internal error, try again later!",
        });
    }
});

// recipients: [{ email, name }], subject, message (use {{name}} as placeholder)
sendEmail.post("/bulk", checkAPIAuth, async (req, res) => {
    const {
        recipients,
        subject,
        message,
        brandName
    } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0 || !subject || !message) {
        return error({
            response: res,
            status: 400,
            message: "recipients (array), subject, and message are required!",
        });
    }

    let brand =
        typeof brandName === "string" && brandName.length > 3 ?
        ` || ${brandName}` :
        "";

    const results = {
        accepted: [],
        rejected: []
    };

    try {
        await transport.verify();

        for (const r of recipients) {
            const to = r.email;
            if (!to) continue;

            const personalized = message.replace(/{{name}}/g, r.name || "");

            try {
                const sendMail = await transport.sendMail({
                    from: process.env.GMAIL_USER,
                    to,
                    replyTo: process.env.GMAIL_USER,
                    subject: `${subject}${brand}`,
                    html: `<p>${escapeHtml(personalized)}</p>`,
                });

                if (sendMail.accepted && sendMail.accepted.length > 0) {
                    results.accepted.push(to);
                } else {
                    results.rejected.push(to);
                }
            } catch (innerErr) {
                console.error(`Bulk send failed for ${to}:`, innerErr);
                results.rejected.push(to);
            }
        }

        return success({
            response: res,
            status: 200,
            message: "Bulk send complete.",
            data: results,
        });
    } catch (err) {
        console.error("Bulk send error:", err);
        return error({
            response: res,
            status: 500,
            message: "Internal error, try again later!",
        });
    }
});

module.exports = sendEmail;