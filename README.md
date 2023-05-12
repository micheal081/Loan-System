Contact me for more clarifications and project leads:
michig3000@gmail.com

- LOAN SYSTEM API
This is a Node.js-based server application that provides API endpoints for loan services. It has two sets of routes, one for users and the other for administrators. Users' routes handle requests related to user authentication, loan application, loan repayment, and other user-specific operations. Admin routes handle requests related to administrative tasks such as approving or rejecting loan applications, disbursing funds, and managing administrators' accounts.

- Technology Stack
Node.js
Express.js
MongoDB
Mongoose

- Getting Started
Install Node.js and MongoDB on your machine.

- Clone the repository to your local machine.

Install the required dependencies using the following command in the root directory:
"npm install"

Create a .env file in the root directory of the project and add the following environment variables:

MONGO_URI = <Your_Mongo_URI_here>
PORT = <Port_number>
AUTH_EMAIL = <Your_email>
AUTH_USER = <Your_Sendinblue.com_username_credentials>
AUTH_PASS = <Your_Sendinblue.com_password_credentials>
PAYSTACK_SECRET_KEY = <Your_paystack_secret_live_key>

- Start the server using the following command:
"npm start"

-Access the API endpoints using the following base URL:

http://localhost:3000/api/v1/loan

- API Endpoints
- Users' Routes

GET / - returns the home page of the loan API.
GET /dashboard - requires authentication and returns the dashboard page for authenticated users.
POST /logout - logs out the authenticated user.
GET /users - returns the login page for users.
POST /users - registers a new user.
GET /verify - re-sends verification email to the user.
POST /verify - verifies the user's email address.
GET /kyc - returns the Know Your Customer (KYC) data page for the authenticated user.
POST /kyc - saves the KYC data for the authenticated user.
POST /direct - requires authentication and verifies a payment made by the user.
GET /check - checks the status of a payment made by the user.
POST /payment - requires authentication and processes a loan payment for the authenticated user.
POST /forgotpassword - sends an email to the user with instructions to reset their password.
GET /loanstatus - requires authentication and returns the status of the user's loan.
POST /loanapplication - requires authentication and submits a loan application for the authenticated user.
GET /loanhistory - requires authentication and returns the loan history for the authenticated user.
GET /payrecord - requires authentication and returns the payment history for the authenticated user.
GET /repayment/:loanId - requires authentication and returns the repayment page for the authenticated user for the loan identified by loanId.
GET /viewresetpasswordpage/:userId/:uniqueString - returns the reset password page for the user identified by userId and uniqueString.
GET /changepassword/:userId/:uniqueString - changes the password for the user identified by userId and uniqueString.
GET /verify/:userId/:uniqueString - verifies the user's email address identified by userId and uniqueString.
POST /verify/:userId/:uniqueString - verifies the user's email address identified by userId and uniqueString.

- Admin Routes
The following routes are available for the admin section of the application:

GET /api/v1/loan/admin/
This route displays the dashboard for the admin.

POST /api/v1/loan/admin/register
This route allows a new admin to register by submitting their name, email, and password in the request body.

GET /api/v1/loan/admin/login
This route displays the login page for the admin.

POST /api/v1/loan/admin/disburse/:loanId
This route allows the admin to disburse a loan. The :loanId parameter in the route should be replaced with the ID of the loan to be disbursed.

GET /api/v1/loan/admin/loanapplications
This route displays all loan applications submitted by users.

GET /api/v1/loan/admin/alladmins
This route displays all registered admins.

POST /api/v1/loan/admin/approveadmin/:adminIdParam
This route allows the admin to approve another admin. The :adminIdParam parameter in the route should be replaced with the ID of the admin to be approved.

DELETE /api/v1/loan/admin/deleteadmin/:adminIdParam
This route allows the admin to delete another admin. The :adminIdParam parameter in the route should be replaced with the ID of the admin to be deleted.

- Usage
To use these routes, send HTTP requests to the appropriate endpoint using a client such as Postman or using an HTTP library in your programming language of choice.

- Controller Functions
The routes in both the user and admin sections of the application are handled by functions defined in separate controller files, which are imported at the top of the routes.js file. These controller functions contain the logic for handling each route and generating a response to the client.

- Middleware Functions
The isAuthenticated middleware function is used in some of the routes to verify that a user or admin is authenticated and authorized to access the requested resource. This function checks for the presence of a valid JWT in the Authorization header of the request and verifies its validity using the secret key stored in the application's environment variables.

Contact me for more clarifications and project leads:
michig3000@gmail.com
