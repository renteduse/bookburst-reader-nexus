
# BookBurst - Social Reading Tracker

BookBurst is a personal reading log and social discovery platform for book lovers. Track your reading journey, share insights, and discover new books without the noise of social media.

![BookBurst Screenshot](https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80)

## Features

- **My Bookshelf Management**: Track books as Reading, Finished, or Want to Read
- **Review System**: Share your thoughts with ratings, reviews, and recommendations
- **Explore Feed**: Discover trending books, recent reviews, and community favorites
- **Public Profiles**: View other users' bookshelves and reading activity
- **Reading History Timeline**: Visualize your reading journey over time
- **Book Details**: Comprehensive information and community reviews for each book

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router
- React Query
- Cookie management for personalization

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/bookburst
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:8080`

## Deployment

The application is set up to be easily deployed to any hosting service that supports Node.js applications.

For the frontend, you can build the production version:
```bash
npm run build
```

For the backend, the server is configured to serve the static frontend files in production mode.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
