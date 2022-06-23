const sendEmail = require("./sendEmail");
const checkRole = require("./checkRole");

const sendVerificationEmail = async (browser, username, verificationToken, origin) => {
    // send the verification link to React and React will POST to server

    const role = checkRole(username);
    const email =
        role === "student"
            ? "s" + username + "@rmit.edu.vn"
            : role + "@gmail.com";

    const verifyEmail = `${origin}/verify-email?token=${verificationToken}`;
    const message = `<p>There is a new sign up with this email at ${browser}. If this was you, clicking on the following link : <a href="${verifyEmail}">Verify Email</a> </p>`;
    return sendEmail(email, "Email confirmation", message);
};

module.exports = sendVerificationEmail;
