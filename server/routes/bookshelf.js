const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const BookshelfItem = require('../models/BookshelfItem');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// @route   GET /api/bookshelf/my-books
// @desc    Get current user's books
// @access  Private
router.get('/my-books', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50; // Higher limit for initial load
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    // Fetch bookshelf items with pagination
    const books = await BookshelfItem.find(query)
      .populate('book')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await BookshelfItem.countDocuments(query);
    const pages = Math.ceil(total / limit);
    
    res.json({
      books,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error fetching bookshelf:', error);
    res.status(500).json({ message: 'Server error fetching bookshelf' });
  }
});

// @route   POST /api/bookshelf
// @desc    Add book to bookshelf
// @access  Private
router.post(
  '/',
  [
    auth,
    check('status', 'Status is required').isIn(['reading', 'finished', 'want-to-read'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { bookId, book, status } = req.body;
      let bookDocument;
      
      // Create book if not exists
      if (!bookId && book) {
        const requiredFields = ['title', 'author'];
        for (const field of requiredFields) {
          if (!book[field]) {
            return res.status(400).json({ message: `${field} is required for new book` });
          }
        }
        
        // Check if book already exists
        let existingBook = null;
        if (book.isbn) {
          existingBook = await Book.findOne({ isbn: book.isbn });
        }
        
        if (!existingBook) {
          existingBook = await Book.findOne({ 
            title: { $regex: new RegExp(`^${book.title}$`, 'i') },
            author: { $regex: new RegExp(`^${book.author}$`, 'i') }
          });
        }
        
        if (existingBook) {
          bookDocument = existingBook;
        } else {
          // Create new book
          const newBook = new Book({
            title: book.title,
            author: book.author,
            description: book.description || '',
            coverImage: book.coverImage || '',
            isbn: book.isbn || '',
            pageCount: book.pageCount || null,
            publishedDate: book.publishedDate || null,
            publisher: book.publisher || '',
            genre: book.genre || []
          });
          
          bookDocument = await newBook.save();
        }
      } else if (bookId) {
        // Find existing book
        bookDocument = await Book.findById(bookId);
        if (!bookDocument) {
          return res.status(404).json({ message: 'Book not found' });
        }
      } else {
        return res.status(400).json({ message: 'Either bookId or book details are required' });
      }
      
      // Check if book is already in user's bookshelf
      const existingBookshelfItem = await BookshelfItem.findOne({
        user: req.user._id,
        book: bookDocument._id
      });
      
      if (existingBookshelfItem) {
        // Return a clear error message that the book is already in the bookshelf
        return res.status(400).json({ message: 'This book is already in your bookshelf' });
      }
      
      // Create new bookshelf item
      const bookshelfItem = new BookshelfItem({
        user: req.user._id,
        book: bookDocument._id,
        status
      });
      
      // Set dates if applicable
      if (status === 'reading') {
        bookshelfItem.startDate = new Date();
      }
      if (status === 'finished') {
        bookshelfItem.finishDate = new Date();
      }
      
      await bookshelfItem.save();
      
      // Populate book details
      await bookshelfItem.populate('book');
      
      res.status(201).json(bookshelfItem);
    } catch (error) {
      console.error('Error adding book to bookshelf:', error);
      
      // Check if the error is a duplicate key error (MongoDB)
      if (error.code === 11000 && error.keyPattern && error.keyPattern.user && error.keyPattern.book) {
        return res.status(400).json({ message: 'This book is already in your bookshelf' });
      }
      
      res.status(500).json({ message: 'Server error adding book to bookshelf' });
    }
  }
);

// @route   PUT /api/bookshelf/:id
// @desc    Update bookshelf item status
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('status', 'Status is required').isIn(['reading', 'finished', 'want-to-read'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { status } = req.body;
      
      // Find bookshelf item
      const bookshelfItem = await BookshelfItem.findById(req.params.id);
      
      if (!bookshelfItem) {
        return res.status(404).json({ message: 'Bookshelf item not found' });
      }
      
      // Ensure user owns this bookshelf item
      if (bookshelfItem.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this bookshelf item' });
      }
      
      // Update status
      bookshelfItem.status = status;
      
      // Set dates if applicable
      if (status === 'reading' && !bookshelfItem.startDate) {
        bookshelfItem.startDate = new Date();
      }
      if (status === 'finished' && !bookshelfItem.finishDate) {
        bookshelfItem.finishDate = new Date();
      }
      
      await bookshelfItem.save();
      
      // Populate book details
      await bookshelfItem.populate('book');
      
      res.json(bookshelfItem);
    } catch (error) {
      console.error('Error updating bookshelf item:', error);
      res.status(500).json({ message: 'Server error updating bookshelf item' });
    }
  }
);

// @route   PUT /api/bookshelf/:id/rating
// @desc    Update bookshelf item rating
// @access  Private
router.put(
  '/:id/rating',
  [
    auth,
    check('rating', 'Rating must be between 0 and 5').isFloat({ min: 0, max: 5 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { rating } = req.body;
      
      // Find bookshelf item
      const bookshelfItem = await BookshelfItem.findById(req.params.id);
      
      if (!bookshelfItem) {
        return res.status(404).json({ message: 'Bookshelf item not found' });
      }
      
      // Ensure user owns this bookshelf item
      if (bookshelfItem.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this bookshelf item' });
      }
      
      // Update rating
      bookshelfItem.rating = rating;
      await bookshelfItem.save();
      
      // Populate book details
      await bookshelfItem.populate('book');
      
      res.json(bookshelfItem);
    } catch (error) {
      console.error('Error updating rating:', error);
      res.status(500).json({ message: 'Server error updating rating' });
    }
  }
);

// @route   PUT /api/bookshelf/:id/notes
// @desc    Update bookshelf item notes
// @access  Private
router.put(
  '/:id/notes',
  [
    auth,
    check('notes', 'Notes are required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { notes } = req.body;
      
      // Find bookshelf item
      const bookshelfItem = await BookshelfItem.findById(req.params.id);
      
      if (!bookshelfItem) {
        return res.status(404).json({ message: 'Bookshelf item not found' });
      }
      
      // Ensure user owns this bookshelf item
      if (bookshelfItem.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this bookshelf item' });
      }
      
      // Update notes
      bookshelfItem.notes = notes;
      await bookshelfItem.save();
      
      // Populate book details
      await bookshelfItem.populate('book');
      
      res.json(bookshelfItem);
    } catch (error) {
      console.error('Error updating notes:', error);
      res.status(500).json({ message: 'Server error updating notes' });
    }
  }
);

// @route   DELETE /api/bookshelf/:id
// @desc    Remove book from bookshelf
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find bookshelf item
    const bookshelfItem = await BookshelfItem.findById(req.params.id);
    
    if (!bookshelfItem) {
      return res.status(404).json({ message: 'Bookshelf item not found' });
    }
    
    // Ensure user owns this bookshelf item
    if (bookshelfItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this bookshelf item' });
    }
    
    await bookshelfItem.deleteOne();
    res.json({ message: 'Book removed from bookshelf' });
  } catch (error) {
    console.error('Error removing book from bookshelf:', error);
    res.status(500).json({ message: 'Server error removing book from bookshelf' });
  }
});

module.exports = router;
