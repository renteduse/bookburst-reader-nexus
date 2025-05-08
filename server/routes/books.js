
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Book = require('../models/Book');
const BookshelfItem = require('../models/BookshelfItem');
const auth = require('../middleware/auth');

// @route   GET /api/books/search
// @desc    Search for books
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    // Use MongoDB text search
    const books = await Book.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);
    
    // If no results with text search, try partial matching
    if (books.length === 0) {
      const regex = new RegExp(q, 'i');
      const altBooks = await Book.find({
        $or: [
          { title: regex },
          { author: regex },
          { isbn: regex }
        ]
      }).limit(20);
      
      return res.json(altBooks);
    }
    
    res.json(books);
  } catch (error) {
    console.error('Book search error:', error);
    res.status(500).json({ message: 'Server error during book search' });
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Server error fetching book' });
  }
});

// @route   POST /api/books
// @desc    Create a new book
// @access  Private
router.post(
  '/',
  [
    auth,
    check('title', 'Title is required').notEmpty(),
    check('author', 'Author is required').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { 
        title, 
        author, 
        description, 
        coverImage, 
        isbn,
        pageCount,
        publishedDate,
        publisher,
        genre
      } = req.body;
      
      // Check if book already exists with the same ISBN if provided
      if (isbn) {
        const existingBook = await Book.findOne({ isbn });
        if (existingBook) {
          return res.json(existingBook);
        }
      }
      
      // Check for duplicate based on title and author
      const existingTitleAuthor = await Book.findOne({ 
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        author: { $regex: new RegExp(`^${author}$`, 'i') }
      });
      
      if (existingTitleAuthor) {
        return res.json(existingTitleAuthor);
      }
      
      // Create new book
      const newBook = new Book({
        title,
        author,
        description: description || '',
        coverImage: coverImage || '',
        isbn: isbn || '',
        pageCount: pageCount || null,
        publishedDate: publishedDate || null,
        publisher: publisher || '',
        genre: genre || []
      });
      
      const book = await newBook.save();
      res.status(201).json(book);
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ message: 'Server error creating book' });
    }
  }
);

// @route   GET /api/books/trending
// @desc    Get trending books
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Aggregate to find trending books based on number of bookshelf adds
    const result = await BookshelfItem.aggregate([
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);
    
    // Get the book IDs
    const bookIds = result.map(item => item._id);
    
    // Fetch the actual book documents
    const books = await Book.find({ _id: { $in: bookIds } });
    
    // Sort the books in the same order as the aggregation results
    const sortedBooks = bookIds.map(id => 
      books.find(book => book._id.toString() === id.toString())
    ).filter(Boolean);
    
    // Get total count for pagination
    const total = await BookshelfItem.aggregate([
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      { $count: 'total' }
    ]);
    
    const totalCount = total.length > 0 ? total[0].total : 0;
    const pages = Math.ceil(totalCount / limit);
    
    res.json({
      books: sortedBooks,
      page,
      pages,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching trending books:', error);
    res.status(500).json({ message: 'Server error fetching trending books' });
  }
});

module.exports = router;
