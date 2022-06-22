const sendEmail = require('./sendEmail');

const sendVerificationEmail = async (email, verificationToken, origin) => {
    // send the verification link to React and React will POST to server

    const verifyEmail = `${origin}/verify-email?token=${verificationToken}&email=${email}`; 
    const message = `<p>Please confirm your email by clicking on the following link : <a href="${verifyEmail}">Verify Email</a> </p>`;    
    return sendEmail(email, "Email confirmation", message)
};

module.exports = sendVerificationEmail;
