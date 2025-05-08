
# BookBurst API Server

This is the backend server for BookBurst, a social reading tracker application.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Navigate to the server folder:
```bash
cd server
```
3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/bookburst
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

For production, use a secure JWT secret and a production MongoDB connection string.

### Running the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Books

- `GET /api/books/search?q=query` - Search for books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add a new book (protected)
- `GET /api/books/trending` - Get trending books

### Bookshelf

- `GET /api/bookshelf/my-books` - Get current user's bookshelf (protected)
- `POST /api/bookshelf` - Add book to bookshelf (protected)
- `PUT /api/bookshelf/:id` - Update bookshelf item status (protected)
- `PUT /api/bookshelf/:id/rating` - Update book rating (protected)
- `PUT /api/bookshelf/:id/notes` - Update book notes (protected)
- `DELETE /api/bookshelf/:id` - Remove book from bookshelf (protected)

### Reviews

- `GET /api/reviews/book/:bookId` - Get reviews for a book
- `GET /api/reviews/user/:userId` - Get reviews by a user
- `POST /api/reviews` - Create a review (protected)
- `GET /api/reviews/recent` - Get recent reviews

### Explore

- `GET /api/explore/trending` - Get trending books
- `GET /api/explore/recent-reviews` - Get recent reviews
- `GET /api/explore/top-rated` - Get top rated books
- `GET /api/explore/most-wishlisted` - Get most wishlisted books
- `GET /api/explore/genres` - Get all genres

## Authentication

The API uses JWT (JSON Web Token) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Models

- User - User profile information
- Book - Book metadata
- BookshelfItem - Represents a book in a user's bookshelf with status
- Review - User reviews for books

## Error Handling

Errors are returned as JSON objects with a message field:

```json
{
  "message": "Error message here"
}
```
