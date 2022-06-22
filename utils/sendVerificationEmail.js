const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, browser) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // hostname
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL,
            pass: process.env.PASS,
        },
    });

    return transporter.sendMail({
        from: process.env.MAIL,
        to: email,
        subject: `New log in to FOOD SUGGESTION RMIT with email: ${email}`,
        html: `There is new login to your account at ${browser} browser`,
    });
};

module.exports = sendVerificationEmail;
