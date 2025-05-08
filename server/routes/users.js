
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const BookshelfItem = require('../models/BookshelfItem');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').notEmpty(),
    check('username', 'Username must be between 3 and 30 characters').isLength({ min: 3, max: 30 }),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password // Will be hashed in the pre-save hook
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Return user data (without password) and token
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      };

      res.status(201).json({
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('User registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Return user data (without password) and token
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      };

      res.json({
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('User login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    // User is already available in req.user from auth middleware
    res.json(req.user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    check('username', 'Username must be between 3 and 30 characters').optional().isLength({ min: 3, max: 30 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, profilePicture } = req.body;
    const updateFields = {};

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      updateFields.username = username;
    }

    if (profilePicture) {
      updateFields.profilePicture = profilePicture;
    }

    try {
      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }
);

// @route   GET /api/users/:id/profile
// @desc    Get user profile by id with books and reviews
// @access  Public
router.get('/:id/profile', async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find user's books
    const books = await BookshelfItem.find({ user: req.params.id })
      .populate('book')
      .sort({ updatedAt: -1 });
    
    // Find user's reviews
    const reviews = await Review.find({ user: req.params.id })
      .populate('book')
      .populate('user', '-password')
      .sort({ createdAt: -1 });
    
    res.json({ user, books, reviews });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// @route   GET /api/users/:id/reading-history
// @desc    Get user's reading history (books finished by month)
// @access  Public
router.get('/:id/reading-history', async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find finished books
    const finishedBooks = await BookshelfItem.find({ 
      user: req.params.id,
      status: 'finished'
    })
    .populate('book')
    .sort({ finishDate: -1, updatedAt: -1 });
    
    // Group by month-year
    const history = [];
    const monthGroups = {};
    
    finishedBooks.forEach(book => {
      // Use updatedAt as a proxy for finish date if finishDate is not available
      const finishDate = book.finishDate || book.updatedAt;
      const monthYear = new Date(finishDate).toISOString().substring(0, 7); // YYYY-MM format
      
      if (!monthGroups[monthYear]) {
        monthGroups[monthYear] = {
          date: finishDate,
          books: []
        };
      }
      
      monthGroups[monthYear].books.push(book);
    });
    
    // Convert to array and sort by date (newest first)
    Object.keys(monthGroups).forEach(key => {
      history.push(monthGroups[key]);
    });
    
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({ message: 'Server error fetching reading history' });
  }
});

module.exports = router;
