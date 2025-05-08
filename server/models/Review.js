
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },
    recommend: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Ensure each user can only review a book once
ReviewSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
