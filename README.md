# Tourist Booking App

Built using modern technologies: node.js, express, mongoDB, mongoose ...

## Live Demo

You can find a running version of the app here: [Live Demo Link](https://vietnamtouristbooking.onrender.com/)

## Usage

To start the app in development mode:

```bash
npm run start:dev
```

This will start the Node server using nodemon for auto restart.

To start the app in production mode:

``` bash
npm run start:prod
```

This will set NODE_ENV to production and start the Node server.

To build the JavaScript files:

``` bash
npm run build:js
```

This will bundle the JS files with Parcel.

To start the app locally:

``` bash
npm start
```

This will start the Node server normally.

To debug the app:

``` bash
npm run debug
```

This will start the Node server in debug mode.

The app will run on <http://localhost:3000> by default.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## API Documentation

### Factory

This module provides a set of functions for handling common CRUD (Create, Read, Update, Delete) operations on a given Mongoose model. These functions are designed to work seamlessly with Express.js routes.

#### `deleteOne(Model)`

- **Description:** Deletes a document from the specified Mongoose model by its ID.
- **Response:**
  - HTTP 204 (No Content) on success.
  - HTTP 404 (Not Found) if the document with the provided ID is not found.

#### `updateOne(Model)`

- **Description:** Updates a document in the specified Mongoose model by its ID with data provided in the request body.
- **Response:**
  - HTTP 200 (OK) on success, returning the updated document.
  - HTTP 404 (Not Found) if the document with the provided ID is not found.

#### `createOne(Model)`

- **Description:** Creates a new document in the specified Mongoose model based on data provided in the request body.
- **Response:**
  - HTTP 201 (Created) on success, returning the newly created document.

#### `getOne(Model, populateOptions)`

- **Description:** Retrieves a single document from the specified Mongoose model by its ID.
- **Parameters:**
  - `populateOptions` (Optional): An object specifying fields to populate in the retrieved document.
- **Response:**
  - HTTP 200 (OK) on success, returning the retrieved document.
  - HTTP 404 (Not Found) if the document with the provided ID is not found.

#### `getAll(Model)`

- **Description:** Retrieves multiple documents from the specified Mongoose model with support for filtering, sorting, field limiting, and pagination based on query parameters.
- **Response:**
  - HTTP 200 (OK) on success, returning the retrieved documents along with the number of results.

These functions are wrapped in the `catchAsync` middleware, which handles asynchronous errors and passes them to the Express error-handling middleware.

By using this modular approach, you can easily handle common CRUD operations for different Mongoose models in your Express.js application, promoting code reusability and maintainability.

### Error Handling

#### Development Error Handling (`sendErrorDev`)

- **API Responses:**
  - If the request originates from an API (`/api` routes), it responds with a detailed JSON error object.
  - This JSON object includes the error status, error message, and a stack trace for debugging.

- **Rendered Website Responses:**
  - For rendered website requests, it logs the error to the console.
  - It renders an error page with a user-friendly message indicating that something went wrong.

#### Production Error Handling (`sendErrorProd`)

- **API Responses:**
  - For API requests (`/api` routes) in production:
    - If the error is operational (trusted error), it responds with a JSON error object containing the error status and message.
    - If the error is not operational (programming error), it logs the error and responds with a generic "Something went wrong" message.

- **Rendered Website Responses:**
  - For rendered website requests in production:
    - If the error is operational, it renders an error page with a user-friendly message.
    - If the error is not operational, it logs the error and renders a generic error page with a "Please try again later" message.

#### Error Handling Functions

- `handleCastErrorDB`: Handles cast errors by creating a custom `AppError` with a message like "Invalid {field}: {value}" and a status code of 400.

- `handleDuplicateFieldsDB`: Handles duplicate field errors by creating a custom `AppError` with a message containing the duplicate field value in JSON format and a status code of 400.

- `handleValidationErrorDB`: Handles validation errors by extracting and formatting error messages for each field. It creates a custom `AppError` with a message like "Validation Error: {errorMessages}" and a status code of 400.

- `handleJWTError`: Handles JWT (JSON Web Token) errors by creating a custom `AppError` with a message indicating an invalid token and a status code of 401.

- `handleJWTExpiredError`: Handles JWT expiration errors by creating a custom `AppError` with a message indicating an expired token and a status code of 401.

#### Exported Middleware

- The main exported function serves as middleware for handling errors in your routes.
- It sets the status code and status for the error.
- Based on the environment (development or production), it calls the appropriate error handling function (`sendErrorDev` or `sendErrorProd`).
- It includes specific checks for different error types and routes them to the appropriate error handling functions.

### Authentication

#### Signup

- Route: `POST /api/v1/users/signup`
- Creates a new user account and saves to the database
- Sends a welcome email to the new user
- Returns a JWT token and user data on success
  
#### Login

- Route: `POST /api/v1/users/login`
- Authenticates user credentials and returns a JWT token on success
- Requires email and password in request body
- Returns 401 error for invalid credentials

#### Logout

- Route: `GET /api/v1/users/logout`
- Clears the JWT cookie to log the user out

#### Protect middleware

- Verifies and decodes JWT token from Authorization header or cookie
- Fetches user data from database
- Checks if user exists and password was not changed after token issued
- Attaches user data to request object
- Returns 401 error if token is missing or invalid

#### Forgot Password

- Route: `POST /api/v1/users/forgotPassword`
- Sends password reset token to email
  
#### Reset Password

- Route: `PATCH /api/v1/users/resetPassword/:token`
- Resets user password based on reset token

### User Controller

This file contains controller functions for managing user-related operations in an Express.js application. It includes functionalities for user profile photo handling, user profile updates, and CRUD (Create, Read, Update, Delete) operations on user data.

#### User Image Upload and Resize

- **`uploadUserPhoto`**
  - **Middleware Function:** `uploadUserPhoto`
  - **Description:** Handles the upload of a user's profile photo. It allows for uploading a single photo and validates that it is an image.
  
- **`resizeUserPhoto`**
  - **Middleware Function:** `resizeUserPhoto`
  - **Description:** Resizes and formats the uploaded user profile photo. It resizes the photo to 500x500 pixels, converts it to JPEG format, and saves it in the `public/img/users` directory.

#### User Profile Operations

- **`getMe`**
  - **Middleware Function:** `getMe`
  - **Description:** Sets the `id` parameter in the request to the currently authenticated user's ID. This is typically used to retrieve the user's own profile.

- **`updateMe`**
  - **Middleware Function:** `updateMe`
  - **Description:** Allows users to update their own profiles. It filters out unwanted field names, such as passwords, from the request body. Users can update their `name`, `email`, and profile photo.

- **`deleteMe`**
  - **Middleware Function:** `deleteMe`
  - **Description:** Allows users to deactivate their own accounts. It sets the `active` field to `false` for the user.

#### CRUD Operations

The following functions utilize the `handlerFactory` module to handle common CRUD operations on the `User` model:

- **`getAllUsers`**
  - **Description:** Retrieves a list of all users.
  - **Method:** GET
  - **Response:** JSON response containing retrieved users.

- **`getUser`**
  - **Description:** Retrieves a specific user by their ID.
  - **Method:** GET
  - **Response:** JSON response with the retrieved user.

- **`updateUser`**
  - **Description:** Updates a user's data by their ID (excluding password updates).
  - **Method:** PUT
  - **Response:** JSON response with the updated user data.

- **`deleteUser`**
  - **Description:** Deletes a user by their ID.
  - **Method:** DELETE
  - **Response:** JSON response indicating success (usually with a status code 204).

#### User Authentication

- **`createUser`**
  - **Middleware Function:** `createUser`
  - **Description:** Placeholder function for creating users. It responds with an error message, indicating that the route is not defined and users should use the `/signup` route for registration.

These functions provide comprehensive functionality for managing user profiles, including photo uploads, updates, and CRUD operations on user data in your Express.js application.

### Booking Controller

#### Get Checkout Session

- Route: `GET /booking/checkout-session/:tourId`
- Gets tour and user data
- Creates a new booking in the database
- Returns booking data

#### Create Booking Checkout

- Route: `GET /booking/checkout`
- Creates a new booking from query parameters tour, user and price required
- Redirects to original URL after booking created

#### Booking CRUD Operations

Uses the handlerFactory to handle CRUD operations:

- createBooking - create a new booking
- getBooking - get a single booking
- getAllBookings - get all bookings
- updateBooking - update a booking
- deleteBooking - delete a booking

### Review Controller

This file contains controller functions for managing reviews related to tours in an Express.js application. It also utilizes the `handlerFactory` module for handling common CRUD (Create, Read, Update, Delete) operations on the `Review` model.

#### `allowNestedGetReviewsOnTour`

- **Middleware Function:** `allowNestedGetReviewsOnTour`
- **Description:** This middleware allows nested routes to retrieve reviews associated with a specific tour. It sets a filter in the request body based on the `tourId` parameter if it exists in the request. This is typically used before handling requests to get reviews for a specific tour.

#### `setTourUserIds`

- **Middleware Function:** `setTourUserIds`
- **Description:** This middleware sets the `tour` and `user` IDs in the request body, which are often required when creating or updating reviews. If the `tour` ID is not present in the request body, it sets it to the `tourId` parameter from the request. If the `user` ID is not present in the request body, it sets it to the `id` of the currently authenticated user (stored in `req.user.id`). This is typically used before creating or updating reviews to ensure correct associations.

#### Review CRUD Operations

The following functions utilize the `handlerFactory` module to handle common CRUD operations on the `Review` model:

- **`getAllReviews`**
  - **Description:** Retrieves a list of all reviews.
  - **Method:** GET
  - **Response:** JSON response containing retrieved reviews.

- **`getReview`**
  - **Description:** Retrieves a specific review by its ID.
  - **Method:** GET
  - **Response:** JSON response with the retrieved review.

- **`createReview`**
  - **Description:** Creates a new review.
  - **Method:** POST
  - **Response:** JSON response with the newly created review.

- **`updateReview`**
  - **Description:** Updates an existing review by its ID.
  - **Method:** PUT
  - **Response:** JSON response with the updated review.

- **`deleteReview`**
  - **Description:** Deletes a review by its ID.
  - **Method:** DELETE
  - **Response:** JSON response indicating success (usually with a status code 204).

These functions simplify the management of review-related operations and promote code reuse and maintainability in your Express.js application.

### Tour Controller

This file contains controller functions for managing tours in an Express.js application. It utilizes the `handlerFactory` module for handling common CRUD (Create, Read, Update, Delete) operations on the `Tour` model.

#### Tour Image Upload and Resize

- **`uploadTourImages`**
  - **Middleware Function:** `uploadTourImages`
  - **Description:** Handles the upload of tour images. It allows for uploading a cover image and up to three additional images.
  
- **`resizeTourImages`**
  - **Middleware Function:** `resizeTourImages`
  - **Description:** Resizes and formats the uploaded tour images. It resizes the cover image and all additional images to a specified size and saves them in the `public/img/tours` directory.

#### Alias Routes

- **`aliasTopTours`**
  - **Middleware Function:** `aliasTopTours`
  - **Description:** Sets query parameters for common tour alias routes. It limits the number of results to 5, sorts by ratingsAverage and price, and selects specific fields.

#### Tour CRUD Operations

The following functions utilize the `handlerFactory` module to handle common CRUD operations on the `Tour` model:

- **`getAllTours`**
  - **Description:** Retrieves a list of all tours.
  - **Method:** GET
  - **Response:** JSON response containing retrieved tours.

- **`getTour`**
  - **Description:** Retrieves a specific tour by its ID, including associated reviews.
  - **Method:** GET
  - **Response:** JSON response with the retrieved tour.

- **`createTour`**
  - **Description:** Creates a new tour.
  - **Method:** POST
  - **Response:** JSON response with the newly created tour.

- **`updateTour`**
  - **Description:** Updates an existing tour by its ID.
  - **Method:** PUT
  - **Response:** JSON response with the updated tour.

- **`deleteTour`**
  - **Description:** Deletes a tour by its ID.
  - **Method:** DELETE
  - **Response:** JSON response indicating success (usually with a status code 204).

#### Aggregation and Geo-spatial Queries

- **`getTourStats`**
  - **Description:** Retrieves tour statistics, including the number of tours, average ratings, and pricing statistics, for tours with ratings greater than or equal to 4.5.
  - **Method:** GET
  - **Response:** JSON response with tour statistics.

- **`getMonthlyPlan`**
  - **Description:** Retrieves monthly tour plans for a specified year, including the number of tour starts and tour names.
  - **Method:** GET
  - **Response:** JSON response with monthly tour plans.

- **`getToursWithin`**
  - **Description:** Retrieves tours within a specified distance from a given latitude and longitude using geo-spatial queries.
  - **Method:** GET
  - **Response:** JSON response with tours within the specified distance.

- **`getDistances`**
  - **Description:** Retrieves distances from a specified latitude and longitude to all tours using geo-spatial queries.
  - **Method:** GET
  - **Response:** JSON response with distances to tours.

These functions provide comprehensive functionality for managing tours, handling image uploads, and performing advanced queries in your Express.js application.

### View Controller

This file contains controller functions for rendering views and templates in an Express.js application. It handles the rendering of HTML templates for various pages and views of your application.

#### Overview Page

- **`getOverview`**
  - **Middleware Function:** `getOverview`
  - **Description:** Renders the overview page, displaying all available tours.
  - **Method:** GET
  - **Response:** HTML page with a list of tours.

#### Individual Tour Page

- **`getTour`**
  - **Middleware Function:** `getTour`
  - **Description:** Renders an individual tour page based on the provided tour slug. It also populates the tour with associated reviews.
  - **Method:** GET
  - **Response:** HTML page displaying detailed information about a specific tour.

#### User Authentication Pages

- **`getLoginForm`**
  - **Middleware Function:** `getLoginForm`
  - **Description:** Renders the login form page.
  - **Method:** GET
  - **Response:** HTML page with a login form.

- **`getAccount`**
  - **Middleware Function:** `getAccount`
  - **Description:** Renders the user's account page.
  - **Method:** GET
  - **Response:** HTML page displaying user account information.

#### User Profile Updates

- **`updateUserData`**
  - **Middleware Function:** `updateUserData`
  - **Description:** Handles the update of user data (name and email) and renders the user's account page with the updated data.
  - **Method:** POST
  - **Response:** HTML page with updated user account information.

#### User Tours

- **`getMyTours`**
  - **Middleware Function:** `getMyTours`
  - **Description:** Retrieves and renders the tours booked by the currently authenticated user.
  - **Method:** GET
  - **Response:** HTML page displaying tours booked by the user.

These functions are responsible for rendering HTML pages and views in your Express.js application, allowing users to interact with the application's content and user accounts.
