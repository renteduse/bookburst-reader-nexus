
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, ReadingStatus, bookshelfAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Star, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface BookCardProps {
  book: Book;
  rating?: number;
  showRating?: boolean;
  status?: ReadingStatus;
  bookshelfItemId?: string;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  rating = 0, 
  showRating = true,
  status,
  bookshelfItemId
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ReadingStatus | undefined>(status);
  const { isAuthenticated } = useAuth();

  // Function to render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(rating) ? 'fill-bookburst-amber text-bookburst-amber' : 'text-gray-300'}
          />
        ))}
        {rating > 0 && <span className="ml-1 text-sm">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  // Handle status change
  const handleStatusChange = async (newStatus: ReadingStatus) => {
    if (!bookshelfItemId || !isAuthenticated) return;
    
    setIsUpdating(true);
    try {
      await bookshelfAPI.updateBookStatus(bookshelfItemId, newStatus);
      setCurrentStatus(newStatus);
      toast.success(`Book moved to "${newStatus.replace('-', ' ')}" shelf`);
    } catch (error) {
      console.error('Error updating book status:', error);
      toast.error('Failed to update book status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/books/${book._id}`} className="flex-grow flex flex-col">
        <div className="relative pt-[150%]">
          <img
            src={book.coverImage || '/placeholder.svg'}
            alt={book.title}
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        
        <CardContent className="flex flex-col flex-grow p-4">
          <h3 className="font-serif font-medium text-bookburst-navy line-clamp-2">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{book.author}</p>
          
          {showRating && rating > 0 && (
            <div className="mt-auto">{renderStars(rating)}</div>
          )}
          
          {currentStatus && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <BookOpen size={14} className="mr-1" />
              <span className="capitalize">{currentStatus.replace('-', ' ')}</span>
            </div>
          )}
        </CardContent>
      </Link>
      
      {isAuthenticated && bookshelfItemId && (
        <div className="px-4 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full text-sm" 
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Change Status'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Reading Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                disabled={currentStatus === 'reading'}
                onClick={() => handleStatusChange('reading')}
              >
                Currently Reading
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={currentStatus === 'finished'}
                onClick={() => handleStatusChange('finished')}
              >
                Finished
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={currentStatus === 'want-to-read'}
                onClick={() => handleStatusChange('want-to-read')}
              >
                Want to Read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
};

export default BookCard;
