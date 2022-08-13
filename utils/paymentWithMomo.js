const axios = require("axios");

const paymentWithMomo = async (orderId, amount) => {
    const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    const serverAPI = "http://localhost:8080/api/order";

    let partnerCode = "MOMOBLIB20220812";
    let accessKey = "GS3jssCpD5HB8yQF";
    let secretkey = "s6EkNgzyYMp9aM8GOB2DsSjWIUyYLk26";
    let requestId = orderId;
    // let orderId = requestId;
    let orderInfo = "pay with MoMo for order with ID: " + orderId;
    let redirectUrl = `${serverAPI}/momoReturn`;
    let ipnUrl = `${serverAPI}/momoNotify`;
    // let amount = amount;
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
    // console.log("--------------------RAW SIGNATURE----------------");
    // console.log(rawSignature);
    //signature
    const crypto = require("crypto");
    var signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");
    // console.log("--------------------SIGNATURE----------------");
    // console.log(signature);

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
    };

    try {
        const { data: response } = await axios.post(endpoint, data);
        return response;
    } catch (err) {
        throw err.response.data;
    }
};

module.exports = paymentWithMomo;
