
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/services/api';
import { Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  rating?: number;
  showRating?: boolean;
  compact?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  rating, 
  showRating = true,
  compact = false
}) => {
  const defaultCover = '/placeholder.svg';

  return (
    <Link to={`/books/${book._id}`} className="block">
      <div className={`book-card ${compact ? 'h-full' : ''}`}>
        {/* Book Cover */}
        <div className="relative overflow-hidden">
          <img
            src={book.coverImage || defaultCover}
            alt={`${book.title} cover`}
            className={`w-full ${compact ? 'h-48' : 'h-64'} object-cover transition-transform duration-300 hover:scale-105`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultCover;
            }}
          />
          
          {/* Rating Badge */}
          {showRating && rating !== undefined && (
            <div className="absolute top-2 right-2 bg-bookburst-amber text-bookburst-navy font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
              {rating}
            </div>
          )}
        </div>
        
        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-serif font-bold text-bookburst-navy line-clamp-1">
            {book.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {book.author}
          </p>
          
          {!compact && showRating && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < (rating || 0)
                      ? 'text-bookburst-amber fill-bookburst-amber'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
