const { createJWT } = require("./jwt");

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJWT(
        { payload: { user } },
        process.env.JWT_SECRET
    );
    const refreshTokenJWT = createJWT(
        { payload: { user, refreshToken } },
        process.env.JWT_SECRET
    );

    const oneDay = 1000 * 60 * 60 * 24;
    const longerExp = 1000 * 60 * 60 * 24 * 30;

    res.cookie("accessToken", accessTokenJWT, {
        domain: "https://rmit-what-to-eat.netlify.app",
        httpOnly: true,
        secure: true, // later in production
        sameSite: "none",
        expires: new Date(Date.now() + oneDay),
    });

    res.cookie("refreshToken", refreshTokenJWT, {
        domain: "https://rmit-what-to-eat.netlify.app",
        httpOnly: true,
        secure: true, // later in production
        sameSite: "none",
        expires: new Date(Date.now() + longerExp),
    });
};

module.exports = attachCookiesToResponse;
