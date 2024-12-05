# LeaftyNest Backend

![Picture](https://res.cloudinary.com/dmjd9rohb/image/upload/v1733383616/b907c474-f067-421c-9e6f-2ed2a54bafe3.png)

# Documentaion API

This project includes a robust API for managing various aspects of the LeaftyNest platform. The API facilitates the management of key entities such as users, addresses, orders, and Products, enabling seamless interactions and data handling for both the admin and user systems. Below is a comprehensive summary of the features and functionalities available through the API.

👉 [Access Admin Repository](https://github.com/violeteverg/Final_Project_FE_Adm)

👉 [Access User Repository](https://github.com/violeteverg/LeafyNest_user)




## Technologies Used
- **Node.js**: Backend JavaScript runtime.
- **Express.js**: Web framework for building the API.
- **Sequelize**: ORM for database interaction.
- **Swagger**: For API documentation generation.
- **MySQL**: Databases.
- **Nodemailer**: For sending emails such as verification and password reset emails.
- **Firebase**: For managing user authentication and secure tokens.
- **JWT (JSON Web Token)**: For secure user authentication and authorization.
- **Multer**: Middleware for handling multipart form data, primarily used for file uploads.
- **Cloudinary**: For managing and storing uploaded images securely.
- **bcrypt**: For hashing passwords to ensure secure storage.
- **Joi**: For validating user input and request payloads.
- **Midtrans**: Payment gateway integration.



## 🧩 Features
- **User Authentication**:
  - Secure user registration and login.
  - Google authentication for seamless user onboarding.
  - JSON Web Token (JWT) implementation for session management.
- **CRUD Operations**:
  - **Users**: Full management of user accounts, including profile updates and deletions.
  - **Products**: Backend support for creating, reading, updating, and deleting product data.
  - **Categories**: Organize and manage product categories with complete CRUD functionality.
  - **etc**
- **Payment Integration**:
  - Integrated with Midtrans for secure payment processing.
  - Support for handling transaction callbacks and updates.
- **File Management**:
  - File uploads handled using Multer.
  - Cloudinary integration for secure file storage and retrieval.
- **Email Services**:
  - Nodemailer used for email verification and password reset functionality.
  - Customizable email templates for transactional emails.
- **Validation and Security**:
  - Input validation using Joi for clean and secure data handling.
  - Password hashing with bcrypt for secure storage.
- **Admin Features**:
  - Detailed statistics and reporting for orders, users, and products.
  - Backend tools for managing platform operations.
- **Testing**:
  - Comprehensive API testing using Jest and Supertest to ensure reliability.



## How to Use This Project
1. Clone the repository:
   ```bash
   git clone https://github.com/violeteverg/Assignment2_muh_fauzan.git

## Setup Instructions

### Prerequisites
- You need to have **Node.js** and **npm** installed.
- You must have **MySql** installed and a running database.
- You must have **firebase**, **midtrans**, and **gmail** acount 

### 1. Install Dependencies

Clone this repository to your local machine and navigate to the project folder. Then, install the necessary dependencies:

```bash
  npm install
  ```
### 2. Create env
You can see an example `.env` configuration below. Copy this to a `.env` file in the root directory and replace the placeholder values with your actual credentials.

```bash
BASE_URL="your_backend_base_url"
BASE_URL_FRONTEND="your_frontend_base_url"
JWT_SECRET="your_jwt_secret"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
DB_HOST="your_database_host"
DB_PORT="your_database_port"
DB_USERNAME="your_database_username"
DB_PASSWORD="your_database_password"
DB_DATABASE="your_database_name"
FIREBASE_AUTH_PROVIDER_X509_CERT_URL="your_firebase_auth_provider_x509_cert_url"
FIREBASE_CLIENT_X509_CERT_URL="your_firebase_client_x509_cert_url"
FIREBASE_AUTH_URI="your_firebase_auth_uri"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_CLIENT_ID="your_firebase_client_id"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_PRIVATE_KEY_ID="your_firebase_private_key_id"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_TOKEN_URI="your_firebase_token_uri"
FIREBASE_TYPE="your_firebase_type"
FIREBASE_UNIVERSE_DOMAIN="your_firebase_universe_domain"
POSTMAN_API_URL="your_postman_api_url"
POSTMAN_ACCESS_KEY="your_postman_access_key"
MAIL_APP_PASSWORD="your_mail_app_password"
MAIL_SERVICE="your_mail_service_provider"
MAIL_USER="your_mail_user_email"
MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_SERVER_KEY="your_midtrans_server_key"
MIDTRANS_URL="your_midtrans_base_url"
PORT="your_application_port"
NODE_ENV="your_environment_mode (e.g., development or production)"
```

### 3. running app

running app using

```bash
  npm run dev
  ```

### 4. checking swagger

running app using

```bash
  http://localhost:3000/api-docs
  ```
## API Reference

### Product Endpoints

```http
  prefix endpoint /api/product
```


| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/create` | Create a new product (requires image upload) |
| GET | `/findAll` | Retrieve all products |
| GET | `/findId/:id` | Retrieve a specific product by ID |
| PATCH | `/update/:id` | Update a specific product (can include image upload) |
| PATCH | `/delete/:id` | Delete a specific product |
| POST | `/review/:id` | Create a review for a specific product (requires authentication) |

Note: 
- The `/create` and `/update/:id` endpoints use `multipart/form-data` to handle image uploads.
- The `/review/:id` endpoint requires user authentication.


### Cart Endpoints
```http
  prefix endpoint /api/cart
```

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/create` | Create a new cart item |
| GET | `/findAll` | Retrieve all cart items for the user |
| GET | `/count` | Get the count of items in the user's cart |
| POST | `/update/:id` | Update a specific cart item |
| DELETE | `/delete/:id` | Remove a specific item from the cart |

Note: 
- Cart endpoints require a bearer token in the Authorization header for authentication.

### User Endpoints

```http
  prefix endpoint /api/user
```

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/register` | Register a new user |
| GET | `/verify-email` | Verify user's email |
| POST | `/login` | User login |
| POST | `/login-google` | Login with Google |
| POST | `/admin-login` | Admin login |
| POST | `/forget-password` | Initiate forget password process |
| POST | `/reset-password` | Reset user's password |
| POST | `/reset-verifyemail` | Resend email verification |

### Order Endpoints

```http
  prefix endpoint /api/order
```

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/transactions` | Create a new order |
| POST | `/notification` | Handle payment callback |
| GET | `/admin/findAll` | Retrieve all orders (admin only) |
| GET | `/findAll` | Retrieve all orders for the user |
| GET | `/findId/:id` | Get product details by order detail ID |
| GET | `/admin/findId/:id` | Get product details by order detail ID (admin only) |
| GET | `/admin/stat` | Get order statistics (admin only) |
| POST | `/cancel` | Cancel an order |

