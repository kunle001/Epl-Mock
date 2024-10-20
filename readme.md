Doc

---

# Mock Premier League API

This test project is to create an API that manages and serves the latest scores and fixtures of a “Mock Premier League.” The API allows admins to manage teams and fixtures, while users can view completed and pending fixtures and search for teams and matches.

## Features

### User Types

1. **Admin Accounts**:

   - Admins can sign up and log in.
   - Manage teams (add, remove, edit, and view).
   - Manage fixtures (add, remove, edit, and view).
   - Generate unique links for fixtures.

2. **User Accounts**:

   - Users can sign up and log in.
   - View all teams.
   - View completed fixtures.
   - View pending fixtures.
   - Perform robust searches for teams and fixtures.

3. **Public Access**:
   - The search API is available publicly, allowing anyone to search for teams and fixtures.

### Key Features

- **Authentication and Authorization**: Admin and user accounts are secured using JWT tokens (Bearer tokens).
- **Session Management**: Redis is used as the session store to manage user sessions.
- **Web Caching**: API responses are cached using Redis to improve performance.
- **Rate Limiting**: User account API access is rate-limited to prevent abuse.
- **Testing**: Comprehensive unit and end-to-end (e2e) tests are provided for all key features and user stories.

## Tech Stack

- **Node.js (TypeScript & Express)**: For API development.
- **MongoDB**: As the database for storing teams, fixtures, and users.
- **Redis**: For session management, caching, and rate-limiting.
- **Docker**: For containerization.
- **Postman**: For API documentation and testing.
- **Jest**: For unit and e2e testing.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Docker**: [Download Docker](https://www.docker.com/get-started)
- **Node.js**: [Download Node.js](https://nodejs.org/)
- **MongoDB**: [Download MongoDB](https://www.mongodb.com/)
- **Redis**: [Download Redis](https://redis.io/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kunle001/Epl-Mock.git
   cd Epl-Mock
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Update the `.env` file with your configuration (e.g., Redis, DB_URL, JWT secrets).

### Running the Application

To start the application using Docker:

```bash
docker-compose up
```

This will start both the API and the Redis service.
NB: Ensure that the port you will be exposing the app to is not already in use

The API will be available at `http://localhost:your-port` (replace `your-port` with the specified port in your Docker config).

### Running Tests

Run unit and e2e tests using the following command:

```bash
npm run test
```

### API Documentation

The API endpoints are fully documented using Postman. To view the documentation, [click here](https://documenter.getpostman.com/view/22302216/2sAXxWaV56).

## User Stories

### Admin Functionalities

- **Manage Teams**: Add, edit, view, and delete teams.
- **Manage Fixtures**: Add, edit, view, and delete fixtures.
- **Generate Unique Fixture Links**: Admins can generate unique shareable links for each fixture.

### User Functionalities

- **View Teams**: Users can browse all teams.
- **View Fixtures**: Users can view completed or pending fixtures.
- **Search API**: Users can search for teams or fixtures. This API is also available publicly.

### Public Access

- **Robust Search**: The public can search for teams and fixtures through the search API without authentication.

## Endpoints Overview

The following are some of the key API endpoints (full documentation is available in Postman):

- `POST /api/v1/auth/signup`: User/Admin signup.
- `POST /api/v1/auth/login`: User/Admin login.
- `POST /api/v1/team/create`: Add a new team (Admin only).
- `GET /api/v1/team`: View all teams (Admin and Users).
- `POST /api/v1/fixtures/create`: Add a new fixture (Admin only).
- `GET /api/v1/fixture/search`: Search for fixtures (Public).
- `GET /api/v1/team/search`: Search for fixtures (Public).
  and many more...

## Environment Variables

The following environment variables must be configured:

- `JWT_SECRET`: Secret key for JWT token signing.
- `JWT_EXPIRES_IN`: jwt expiration period.
- `PORT`: Port you want API to run on.
- `DB_URL`: MongoDB connection string.
- `REDIS_HOST`: Redis server host.
- `REDIS_PORT`: Redis server port.
- `REDIS_PASSWORD`: Redis server password.
- `REQUEST_PER_MINUTE`: Rate Limiting param, which declares how many request per minute you want the API to take per minute from same user/IP.

Example `.env` file:

```env
JWT_SECRET=yourjwtsecret
JWT_EXPIRES_IN=1d
DB_URL=mongodb://localhost:27017/mock-premier-league
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=yourredispassword
REQUEST_PER_MINUTE= 10
```

## Rate Limiting

To prevent abuse, rate limiting is applied to user account API access. This can be configured in the application settings.

## Deployment

1. Ensure the API is containerized using Docker.
2. Api is Available on [live api url](https://epl-mock.onrender.com).
3. Push the code to your Git repository (preferably GitHub).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
