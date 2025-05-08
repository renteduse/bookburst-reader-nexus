
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    isbn: {
      type: String,
      trim: true
    },
    pageCount: {
      type: Number
    },
    publishedDate: {
      type: Date
    },
    publisher: {
      type: String,
      trim: true
    },
    genre: {
      type: [String]
    }
  },
  { timestamps: true }
);

// Create text indices for search functionality
BookSchema.index({ 
  title: 'text', 
  author: 'text', 
  description: 'text' 
});

module.exports = mongoose.model('Book', BookSchema);
