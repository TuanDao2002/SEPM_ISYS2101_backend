const { createJWT } = require("./jwt");

const makeVerificationToken = (username, email, role, secretKey, minutesToExpire) => {
    const expirationDate = new Date();
    expirationDate.setMinutes(new Date().getMinutes() + minutesToExpire); // verification toke expires after 2 minutes
    return createJWT({ payload: { username, email, role, expirationDate } }, secretKey);
};

module.exports = makeVerificationToken;
