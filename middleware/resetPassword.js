function resetPasswordLink(email, _id, uniqueString, currentUrl) {
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Reset Password",
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
              <h1>Reset Password</h1>
              <p>Click the button below to reset your password. This link <strong>expires in 15 minutes</strong>.</p>
              <a href="${currentUrl}/${_id}/${uniqueString}" class="button">Reset Password</a>
              <p style="margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
            </div>
          </body>
        </html>
      `
    };
    return mailOptions;
  }
  
  module.exports = resetPasswordLink;
  