const { createJWT } = require("./jwt");

const makeToken = (username) => {
    const expirationDate = new Date();
    expirationDate.setMinutes(new Date().getMinutes() + 2); // verification toke expires after 2 minutes
    return createJWT({ payload: { username, expirationDate } });
};

module.exports = makeToken;
