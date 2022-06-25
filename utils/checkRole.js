const CustomError = require("../errors");
const fs = require("fs");

const checkRole = (verificationName) => {
    if (verificationName == "") {
        throw new CustomError.UnauthenticatedError("Empty student ID or restaurant's name");
    }

    if (verificationName.match('3[0-9]{6}')) {
        return "student";
    }
    
    const restaurants = fs.readFileSync(__dirname + '\\vendors.txt').toString().replace(/\r\n/g,'\n').split("\n");
    for (let restaurant of restaurants) {
        if (restaurant === verificationName) {
            return "vendor";
        }
    }

    throw new CustomError.UnauthenticatedError("Invalid verification name")
};

module.exports = checkRole
