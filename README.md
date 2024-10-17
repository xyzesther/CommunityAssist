# Full-Stack Web Application for Requests & Appointments

This project is a full-stack web application built to manage user requests and appointments, with authentication and authorization features. It leverages **React** for the front-end and **Node.js** with **Express** and **Prisma** for the back-end, with **PostgreSQL** as the database. User authentication and authorization are handled securely using **Auth0**.

## Features

- **User Authentication & Authorization**: Secure login, logout, and protected routes using **Auth0**.
- **Request Management**: Users can create, view, update, and delete requests, with appointment association.
- **Appointment Management**: Users can make appointments tied to requests, view upcoming appointments, and manage status updates.
- **Data Persistence**: The back-end uses **Prisma ORM** to interact with a **PostgreSQL** database, ensuring efficient data handling and validation.
- **API Integration**: RESTful APIs manage user data, requests, and appointments with robust error handling and data flow validation.
- **Deployment**: The application is deployed on **Render** (back-end) and **Vercel** (front-end) with seamless CORS configuration.

## Technologies Used

### Front-End
- **React**
- **CSS** for styling

### Back-End
- **Node.js** with **Express**
- **Prisma** ORM
- **PostgreSQL** for data storage

### Authentication & Authorization
- **Auth0** for secure authentication

### Deployment
- **Render** (back-end)
- **Vercel** (front-end)

## API Endpoints

### Authentication
- **POST** `/verify-user`: Verifies or registers a user in the database.
  
### User
- **GET** `/user`: Fetches authenticated user's information.
- **PUT** `/user`: Updates authenticated user's information.

### Requests
- **POST** `/requests`: Creates a new request.
- **GET** `/requests`: Retrieves all requests.
- **GET** `/requests/user`: Retrieves requests by a user.
- **GET** `/requests/:id`: Retrieves a request by its ID.
- **PUT** `/requests/:id`: Updates a request.
- **DELETE** `/requests/:id`: Deletes a request.

### Appointments
- **POST** `/appointments`: Creates a new appointment.
- **GET** `/appointments`: Retrieves all appointments.
- **GET** `/appointments/user`: Retrieves appointments by a user.
- **GET** `/appointments/:id`: Retrieves an appointment by its ID.
- **PUT** `/appointments/:id`: Updates an appointment.
- **DELETE** `/appointments/:id`: Deletes an appointment.

## Deployment

The application is deployed as follows:
- **Front-end**: Deployed on **Vercel**.
- **Back-end**: Deployed on **Render**.

## Contributing

Feel free to submit issues and pull requests for improvement. Please follow standard [GitHub flow](https://guides.github.com/introduction/flow/) for contributions.