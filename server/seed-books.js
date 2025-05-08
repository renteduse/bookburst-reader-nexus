
const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('./models/Book');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample books data with diverse genres
const books = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.',
    coverImage: 'https://images.unsplash.com/photo-1603162848322-06a0d2e7e8c7?q=80&w=2000',
    isbn: '9780061120084',
    pageCount: 324,
    publishedDate: new Date('1960-07-11'),
    publisher: 'J. B. Lippincott & Co.',
    genre: ['Fiction', 'Classics', 'Historical Fiction']
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.',
    coverImage: 'https://images.unsplash.com/photo-1587048561746-12b5d1a19d38?q=80&w=2000',
    isbn: '9780451524935',
    pageCount: 328,
    publishedDate: new Date('1949-06-08'),
    publisher: 'Secker & Warburg',
    genre: ['Science Fiction', 'Dystopian', 'Classics']
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'The Great Gatsby is a 1925 novel written by American author F. Scott Fitzgerald that follows a cast of characters living in the fictional towns of West Egg and East Egg on Long Island in the summer of 1922.',
    coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=2000',
    isbn: '9780743273565',
    pageCount: 180,
    publishedDate: new Date('1925-04-10'),
    publisher: 'Charles Scribner\'s Sons',
    genre: ['Fiction', 'Classics', 'Literature']
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'Pride and Prejudice is a romantic novel of manners written by Jane Austen in 1813. The novel follows the character development of Elizabeth Bennet, who learns about the repercussions of hasty judgments.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000',
    isbn: '9780141439518',
    pageCount: 432,
    publishedDate: new Date('1813-01-28'),
    publisher: 'T. Egerton, Whitehall',
    genre: ['Romance', 'Classics', 'Historical Fiction']
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'The Hobbit, or There and Back Again is a children\'s fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937.',
    coverImage: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?q=80&w=2000',
    isbn: '9780547928227',
    pageCount: 310,
    publishedDate: new Date('1937-09-21'),
    publisher: 'George Allen & Unwin',
    genre: ['Fantasy', 'Adventure', 'Classics']
  },
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    description: 'The first novel in the Harry Potter series and Rowling\'s debut novel, it follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.',
    coverImage: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=2000',
    isbn: '9781408855652',
    pageCount: 223,
    publishedDate: new Date('1997-06-26'),
    publisher: 'Bloomsbury',
    genre: ['Fantasy', 'Young Adult', 'Magic']
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'The Catcher in the Rye is a novel by J. D. Salinger, partially published in serial form in 1945–1946 and as a novel in 1951.',
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2000',
    isbn: '9780316769488',
    pageCount: 277,
    publishedDate: new Date('1951-07-16'),
    publisher: 'Little, Brown and Company',
    genre: ['Fiction', 'Classics', 'Coming of Age']
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'The Alchemist follows the journey of an Andalusian shepherd boy named Santiago. Believing a recurring dream to be prophetic, he asks a Romani fortune teller in a nearby town about its meaning.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2000',
    isbn: '9780062315007',
    pageCount: 197,
    publishedDate: new Date('1988-01-01'),
    publisher: 'HarperOne',
    genre: ['Fiction', 'Fantasy', 'Philosophy', 'Adventure']
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    description: 'The Da Vinci Code follows the investigations of Robert Langdon and Sophie Neveu after a murder in the Louvre Museum in Paris.',
    coverImage: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=2000',
    isbn: '9780307474278',
    pageCount: 597,
    publishedDate: new Date('2003-03-18'),
    publisher: 'Doubleday',
    genre: ['Mystery', 'Thriller', 'Conspiracy']
  },
  {
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    description: 'The Lord of the Rings is an epic high-fantasy novel written by English author and scholar J. R. R. Tolkien.',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000',
    isbn: '9780618640157',
    pageCount: 1178,
    publishedDate: new Date('1954-07-29'),
    publisher: 'George Allen & Unwin',
    genre: ['Fantasy', 'Adventure', 'Classics', 'Epic']
  }
];

// Seed function
const seedBooks = async () => {
  try {
    // Clear existing books
    await Book.deleteMany({});
    
    // Insert new books
    const result = await Book.insertMany(books);
    
    console.log(`${result.length} books successfully seeded!`);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding books:', error);
    mongoose.connection.close();
  }
};

// Run the seed function
seedBooks();
