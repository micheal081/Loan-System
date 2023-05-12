const https = require("https");

function initializeTransaction(email, amount) {
  const params = JSON.stringify({
    email: email,
    amount: amount,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer process.env.PAYSTACK_SECRET_KEY`,
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const reqpaystack = https.request(options, (respaystack) => {
      let data = "";

      respaystack.on("data", (chunk) => {
        data += chunk;
      });

      respaystack.on("end", () => {
        console.log(JSON.parse(data));
        resolve(JSON.parse(data));
      });
    });

    reqpaystack.on("error", (error) => {
      console.error(error);
      reject(error);
    });

    reqpaystack.write(params);
    reqpaystack.end();
  });
}

module.exports = { initializeTransaction };
