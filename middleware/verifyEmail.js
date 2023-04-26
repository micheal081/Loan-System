function sendVerificationLink(email, _id, uniqueString, currentUrl) {
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              /* Reset styles for email clients */
              * {
                margin: 0;
                padding: 0;
                font-family: sans-serif;
                line-height: 1.5;
                color: #333;
              }
  
              body {
                background-color: #f2f2f2;
                padding: 20px;
              }
  
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
              }
  
              h1 {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
              }
  
              p {
                font-size: 16px;
                margin-bottom: 10px;
              }
  
              .button {
                display: inline-block;
                background-color: #00bfff;
                color: #fff;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
                margin-top: 20px;
              }
  
              .button:hover {
                background-color: #009acd;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Email Verification</h1>
              <p>Verify your email address to complete the signup and log into your account.</p>
              <p>This link <strong>expires in 6 hours</strong>.</p>
              <p>Click the button below to proceed:</p>
              <a href="${currentUrl + "verify/" + _id + "/" + uniqueString}" class="button">Verify Email Address</a>
              <p style="margin-top: 20px;">You can also copy and paste the following link in your browser:</p>
              <p style="margin-top: 10px;"><a href="${currentUrl + "verify/" + _id + "/" + uniqueString}">${currentUrl + "verify/" + _id + "/" + uniqueString}</a></p>
            </div>
          </body>
        </html>
      `
    };
    return mailOptions;
  }
  
  module.exports = sendVerificationLink;