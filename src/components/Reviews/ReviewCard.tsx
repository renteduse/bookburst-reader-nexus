
import React from 'react';
import { Link } from 'react-router-dom';
import { Review } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, compact = false }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getUserInitials = (username: string): string => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Link to={`/books/${review.book._id}`} className="flex-shrink-0">
              <img
                src={review.book.coverImage || '/placeholder.svg'}
                alt={review.book.title}
                className="w-12 h-16 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </Link>
            <div>
              <Link to={`/books/${review.book._id}`} className="font-serif font-bold text-bookburst-navy hover:text-bookburst-amber transition-colors">
                {review.book.title}
              </Link>
              <p className="text-sm text-gray-600">{review.book.author}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'text-bookburst-amber fill-bookburst-amber'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-3">
        {compact ? (
          <p className="text-gray-700 line-clamp-2">{review.content}</p>
        ) : (
          <p className="text-gray-700">{review.content}</p>
        )}
        
        {review.recommend && (
          <div className="flex items-center mt-3 text-sm text-bookburst-burgundy">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Recommends this book
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t text-sm text-gray-500 flex justify-between items-center">
        <div className="flex items-center">
          <Link to={`/profile/${review.user._id}`} className="flex items-center hover:text-bookburst-navy">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={review.user.profilePicture} alt={review.user.username} />
              <AvatarFallback className="bg-bookburst-teal text-white text-xs">
                {getUserInitials(review.user.username)}
              </AvatarFallback>
            </Avatar>
            {review.user.username}
          </Link>
        </div>
        <span>{formatDate(review.createdAt)}</span>
      </CardFooter>
    </Card>
  );
};

export default ReviewCard;
