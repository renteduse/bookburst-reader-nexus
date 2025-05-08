
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// @route   GET /api/reviews/book/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Fetch reviews for the book
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', '-password')
      .populate('book')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Review.countDocuments({ book: req.params.bookId });
    const pages = Math.ceil(total / limit);
    
    res.json({
      reviews,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    res.status(500).json({ message: 'Server error fetching book reviews' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Fetch reviews by the user
    const reviews = await Review.find({ user: req.params.userId })
      .populate('user', '-password')
      .populate('book')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Review.countDocuments({ user: req.params.userId });
    const pages = Math.ceil(total / limit);
    
    res.json({
      reviews,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error fetching user reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post(
  '/',
  [
    auth,
    check('bookId', 'Book ID is required').notEmpty(),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('content', 'Review content is required').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { bookId, rating, content, recommend = true } = req.body;
      
      // Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Check if user already reviewed this book
      const existingReview = await Review.findOne({
        user: req.user._id,
        book: bookId
      });
      
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this book' });
      }
      
      // Create new review
      const review = new Review({
        user: req.user._id,
        book: bookId,
        rating,
        content,
        recommend
      });
      
      await review.save();
      
      // Populate user and book details
      await review.populate('user', '-password');
      await review.populate('book');
      
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Server error creating review' });
    }
  }
);

// @route   GET /api/reviews/recent
// @desc    Get recent reviews
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const genre = req.query.genre;
    
    let query = {};
    
    // Add genre filter if provided
    if (genre) {
      // First get all book IDs with the specified genre
      const books = await Book.find({ genre: { $in: [genre] } });
      const bookIds = books.map(book => book._id);
      
      // Add book filter to the query
      query.book = { $in: bookIds };
    }
    
    // Fetch recent reviews
    const reviews = await Review.find(query)
      .populate('user', '-password')
      .populate('book')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Review.countDocuments(query);
    const pages = Math.ceil(total / limit);
    
    res.json({
      reviews,
      page,
      pages,
      total
    });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({ message: 'Server error fetching recent reviews' });
  }
});

module.exports = router;
