const vendorsList = require('./vendors.json')

const getEmail = (verificationName, role) => {
    if (role === "student") {
        return "s" + verificationName + "@rmit.edu.vn"
    }

    if (role === "vendor") {
        return vendorsList.find(vendor => vendor.vendorName === verificationName).email;
    }

    return null;
}

module.exports = getEmail;