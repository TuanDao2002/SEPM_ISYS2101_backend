const { createJWT, isTokenValid } = require("./jwt");

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJWT(
        { payload: { user } },
        process.env.JWT_SECRET
    );
    const refreshTokenJWT = createJWT(
        { payload: { user, refreshToken } },
        process.env.JWT_SECRET
    );

    res.cookie()    
};

module.exports = attachCookiesToResponse;
