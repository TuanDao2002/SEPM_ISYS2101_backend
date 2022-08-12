const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const User = require("../models/User");

const verifySocketJWT = async (socket, next) => {
    const accessToken = socket.handshake.auth.token;

    try {
        const payload = isTokenValid(accessToken, process.env.JWT_SECRET);
        const userId = payload.tokenUser.userId;

        const user = await User.findOne({ _id: userId, role: "vendor" });
        if (!user) {
            next(new Error("Authentication Invalid"));
        }

        next();
    } catch (err) {
        next(new Error("Authentication Invalid"));
    }
};

const notifySocket = (io, userId, payload) => {
    io.on("connection", (socket) => {
        socket.to(userId).emit("notification", payload);
    });
};

module.exports = { verifySocketJWT, notifySocket };
