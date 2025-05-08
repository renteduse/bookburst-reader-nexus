
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const BookshelfItem = require('../models/BookshelfItem');
const Review = require('../models/Review');

// @route   GET /api/explore/trending
// @desc    Get trending books
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const genre = req.query.genre;
    
    let matchStage = {};
    
    // Add genre filter if provided
    if (genre) {
      // First get all book IDs with the specified genre
      const books = await Book.find({ genre: { $in: [genre] } });
      const bookIds = books.map(book => book._id);
      
      // Add book filter to match stage
      matchStage.book = { $in: bookIds };
    }
    
    // Aggregate to find trending books based on number of bookshelf adds
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const result = await BookshelfItem.aggregate(pipeline);
    
    // Get the book IDs
    const bookIds = result.map(item => item._id);
    
    // Fetch the actual book documents
    let books = [];
    if (bookIds.length > 0) {
      books = await Book.find({ _id: { $in: bookIds } });
      
      // Sort the books in the same order as the aggregation results
      books = bookIds.map(id => 
        books.find(book => book._id.toString() === id.toString())
      ).filter(Boolean);
    }
    
    // Get total count for pagination
    const totalPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$book'
        }
      },
      { $count: 'total' }
    ];
    
    const total = await BookshelfItem.aggregate(totalPipeline);
    const totalCount = total.length > 0 ? total[0].total : 0;
    const pages = Math.ceil(totalCount / limit);
    
    res.json({
      books,
      page,
      pages,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching trending books:', error);
    res.status(500).json({ message: 'Server error fetching trending books' });
  }
});

// @route   GET /api/explore/recent-reviews
// @desc    Get recent reviews
// @access  Public
router.get('/recent-reviews', async (req, res) => {
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

// @route   GET /api/explore/top-rated
// @desc    Get top rated books
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const genre = req.query.genre;
    
    let matchStage = {};
    
    // Add genre filter if provided
    if (genre) {
      // First get all book IDs with the specified genre
      const books = await Book.find({ genre: { $in: [genre] } });
      const bookIds = books.map(book => book._id);
      
      // Add book filter to match stage
      matchStage.book = { $in: bookIds };
    }
    
    // Only include reviews with ratings
    matchStage.rating = { $exists: true, $gt: 0 };
    
    // Aggregate to find top rated books
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$book',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      // Only include books with at least 2 ratings
      { $match: { count: { $gte: 2 } } },
      { $sort: { avgRating: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const result = await Review.aggregate(pipeline);
    
    // Get the book IDs
    const bookIds = result.map(item => item._id);
    
    // Fetch the actual book documents
    let books = [];
    if (bookIds.length > 0) {
      books = await Book.find({ _id: { $in: bookIds } });
      
      // Sort the books in the same order as the aggregation results
      books = bookIds.map(id => 
        books.find(book => book._id.toString() === id.toString())
      ).filter(Boolean);
    }
    
    // Get total count for pagination
    const totalPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gte: 2 } } },
      { $count: 'total' }
    ];
    
    const total = await Review.aggregate(totalPipeline);
    const totalCount = total.length > 0 ? total[0].total : 0;
    const pages = Math.ceil(totalCount / limit);
    
    res.json({
      books,
      page,
      pages,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching top rated books:', error);
    res.status(500).json({ message: 'Server error fetching top rated books' });
  }
});

// @route   GET /api/explore/most-wishlisted
// @desc    Get most wishlisted books
// @access  Public
router.get('/most-wishlisted', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const genre = req.query.genre;
    
    let matchStage = { status: 'want-to-read' };
    
    // Add genre filter if provided
    if (genre) {
      // First get all book IDs with the specified genre
      const books = await Book.find({ genre: { $in: [genre] } });
      const bookIds = books.map(book => book._id);
      
      // Add book filter to match stage
      matchStage.book = { $in: bookIds };
    }
    
    // Aggregate to find most wishlisted books
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const result = await BookshelfItem.aggregate(pipeline);
    
    // Get the book IDs
    const bookIds = result.map(item => item._id);
    
    // Fetch the actual book documents
    let books = [];
    if (bookIds.length > 0) {
      books = await Book.find({ _id: { $in: bookIds } });
      
      // Sort the books in the same order as the aggregation results
      books = bookIds.map(id => 
        books.find(book => book._id.toString() === id.toString())
      ).filter(Boolean);
    }
    
    // Get total count for pagination
    const totalPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$book'
        }
      },
      { $count: 'total' }
    ];
    
    const total = await BookshelfItem.aggregate(totalPipeline);
    const totalCount = total.length > 0 ? total[0].total : 0;
    const pages = Math.ceil(totalCount / limit);
    
    res.json({
      books,
      page,
      pages,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching most wishlisted books:', error);
    res.status(500).json({ message: 'Server error fetching most wishlisted books' });
  }
});

// @route   GET /api/explore/genres
// @desc    Get all genres
// @access  Public
router.get('/genres', async (req, res) => {
  try {
    // Find all books with genre field
    const books = await Book.find({ genre: { $exists: true, $not: { $size: 0 } } });
    
    // Extract all genres
    const genres = [];
    books.forEach(book => {
      if (book.genre && book.genre.length > 0) {
        book.genre.forEach(genre => {
          if (!genres.includes(genre)) {
            genres.push(genre);
          }
        });
      }
    });
    
    // Sort alphabetically
    genres.sort();
    
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Server error fetching genres' });
  }
});

module.exports = router;
