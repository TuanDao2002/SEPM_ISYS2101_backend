const axios = require("axios");

const paymentWithMomo = async (req, res) => {
    const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

    let partnerCode = "MOMOBLIB20220812";
    let accessKey = "GS3jssCpD5HB8yQF";
    let secretkey = "s6EkNgzyYMp9aM8GOB2DsSjWIUyYLk26";
    let requestId = partnerCode + new Date().getTime();
    let orderId = requestId;
    let orderInfo = "pay with MoMo";
    let redirectUrl = "https://food-suggestion-rmit.herokuapp.com/return";
    let ipnUrl = "https://food-suggestion-rmit.herokuapp.com/notify";
    // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
    let amount = "1000";
    let requestType = "captureWallet";
    let extraData = ""; //pass empty value if your merchant does not have stores

    var rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);
    //signature
    const crypto = require("crypto");
    var signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    const data = {
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "en",

        items: [{
            id: 1,
            name: "Cup Noodle",
            price: 0,
            quantity: 2,
            totalPrice: 0,
        }],
    };

    axios
        .post(endpoint, data)
        .then(function (res) {
            console.log(res.data);
        })
        .catch(function (err) {
            console.log(err);
        });
};

paymentWithMomo();

// module.exports = paymentWithMomo;
