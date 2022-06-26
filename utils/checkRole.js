const CustomError = require("../errors");
const vendorsList = require('./vendors.json')

const checkRole = (verificationName) => {
    if (verificationName == "") {
        throw new CustomError.UnauthenticatedError("Empty student ID or restaurant's name");
    }

    if (verificationName.match('3[0-9]{6}')) {
        return "student";
    }
    
    for (let vendor of vendorsList) {
        if (vendor.vendorName === verificationName) {
            return "vendor";
        }
    }

    throw new CustomError.UnauthenticatedError("Invalid verification name")
};

module.exports = checkRole
