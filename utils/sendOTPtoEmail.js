const nodemailer = require("nodemailer");

const sendOTPtoEmail = async (email, otp) => {
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
        subject: "OTP for login",
        html: `<center><h3>Your OTP to login is:</h3></center><center><strong><h1>${otp}</h1></strong></center>`,
    })
};

module.exports = sendOTPtoEmail;
