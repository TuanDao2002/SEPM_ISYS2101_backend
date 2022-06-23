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
    const message = `<center><h1>There is a new sign up with this email at ${browser}.</h1></center>
                    <center><h1>If this was you, clicking on the following link (it will expire after 2 minutes): <a href="${verifyEmail}">Verify Email</a></h1><center>`;
    return sendEmail(email, "Email confirmation", message);
};

module.exports = sendVerificationEmail;
