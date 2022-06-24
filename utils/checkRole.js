const CustomError = require("../errors");

const checkRole = (username) => {
    if (username == "") {
        throw new CustomError.UnauthenticatedError("Empty username");
    }

    if (username.match('3[0-9]{6}')) {
        return "student";
    }

    const vendors = JSON.parse(process.env.LIST_VENDOR);
    for (let vendor of vendors) {
        if (username === vendor + "@gmail.com") {
            return "vendor";
        }
    }

    throw new CustomError.UnauthenticatedError("Invalid username")
};

module.exports = checkRole
