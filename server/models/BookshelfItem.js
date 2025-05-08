
const mongoose = require('mongoose');

const BookshelfItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    status: {
      type: String,
      enum: ['reading', 'finished', 'want-to-read'],
      default: 'want-to-read'
    },
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    notes: {
      type: String
    },
    startDate: {
      type: Date
    },
    finishDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// Ensure each user can only have a book on their shelf once
BookshelfItemSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('BookshelfItem', BookshelfItemSchema);
