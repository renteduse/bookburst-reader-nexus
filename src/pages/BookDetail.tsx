
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book, ReadingStatus, bookshelfAPI, booksAPI, Review, reviewsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Star, StarHalf, StarOff, BookOpen, BookPlus } from 'lucide-react';
import ReviewCard from '@/components/Reviews/ReviewCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const BookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { isAuthenticated, user } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [bookshelfItem, setBookshelfItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  
  // Review form state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewRecommend, setReviewRecommend] = useState<boolean>(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Add to bookshelf state
  const [addToShelfDialogOpen, setAddToShelfDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>('want-to-read');
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  
  // Load book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      try {
        setLoading(true);
        const bookData = await booksAPI.getBookDetails(bookId);
        setBook(bookData);
        
        // Check if book is in user's bookshelf if authenticated
        if (isAuthenticated) {
          try {
            const bookshelfData = await bookshelfAPI.getMyBooks();
            const foundItem = bookshelfData.books.find((item: any) => 
              item.book._id === bookId
            );
            
            if (foundItem) {
              setBookshelfItem(foundItem);
            }
          } catch (error) {
            console.error('Error checking bookshelf:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast.error('Could not load book details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [bookId, isAuthenticated]);
  
  // Load book reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!bookId) return;
      
      try {
        setReviewsLoading(true);
        const response = await reviewsAPI.getBookReviews(bookId, reviewsPage);
        setReviews(response.reviews);
        setTotalReviewPages(response.pages);
        
        // Check if the current user has already reviewed this book
        if (isAuthenticated && user?._id) {
          const userReview = response.reviews.find((review: Review) => 
            review.user._id === user._id
          );
          setUserHasReviewed(!!userReview);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Could not load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchReviews();
  }, [bookId, reviewsPage, isAuthenticated, user]);
  
  const handleAddToBookshelf = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add books to your shelf');
      return;
    }
    
    try {
      setIsAddingToShelf(true);
      
      if (bookshelfItem) {
        // Update status if already in bookshelf
        await bookshelfAPI.updateBookStatus(bookshelfItem._id, selectedStatus);
        setBookshelfItem({
          ...bookshelfItem,
          status: selectedStatus
        });
        toast.success(`Book status updated to "${selectedStatus.replace(/-/g, ' ')}"`);
      } else {
        // Add to bookshelf
        const response = await bookshelfAPI.addToBookshelf({
          bookId,
          status: selectedStatus
        });
        setBookshelfItem(response);
        toast.success(`Book added to your "${selectedStatus.replace(/-/g, ' ')}" shelf`);
      }
      
      setAddToShelfDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating bookshelf:', error);
      
      // Check for error message about book already added
      if (error.message && error.message.includes('already')) {
        toast.error('This book is already in your bookshelf');
      } else {
        toast.error('Failed to update bookshelf');
      }
    } finally {
      setIsAddingToShelf(false);
    }
  };
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }
    
    if (!reviewContent.trim()) {
      toast.error('Review content cannot be empty');
      return;
    }
    
    try {
      setSubmittingReview(true);
      
      await reviewsAPI.createReview({
        bookId: bookId!,
        rating: reviewRating,
        content: reviewContent,
        recommend: reviewRecommend
      });
      
      toast.success('Your review has been posted!');
      setUserHasReviewed(true);
      setReviewFormOpen(false);
      
      // Refresh reviews
      const response = await reviewsAPI.getBookReviews(bookId!, 1);
      setReviews(response.reviews);
      setTotalReviewPages(response.pages);
      setReviewsPage(1);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  const getStatusBadge = () => {
    if (!bookshelfItem) return null;
    
    switch(bookshelfItem.status) {
      case 'reading':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">Currently Reading</span>;
      case 'finished':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">Finished</span>;
      case 'want-to-read':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs">Want to Read</span>;
      default:
        return null;
    }
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalReviewPages) return;
    setReviewsPage(page);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-serif mb-4">Book Not Found</h2>
          <p className="mb-6 text-gray-600">The book you're looking for doesn't exist or has been removed.</p>
          <Link to="/explore">
            <Button>Explore Books</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover and Add to Shelf */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center md:items-start">
            <div className="w-48 h-72 bg-gray-100 rounded-md overflow-hidden mb-4">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={`${book.title} cover`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
                  No Cover Image
                </div>
              )}
            </div>
            
            {isAuthenticated && (
              <>
                {bookshelfItem ? (
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">On your shelf:</span>
                      {getStatusBadge()}
                    </div>
                    
                    <Dialog open={addToShelfDialogOpen} onOpenChange={setAddToShelfDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-bookburst-teal text-white hover:bg-bookburst-teal/90"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Change Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Reading Status</DialogTitle>
                          <DialogDescription>
                            Change the status of "{book.title}" in your bookshelf
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">Reading Status</Label>
                            <Select 
                              value={selectedStatus} 
                              onValueChange={(value) => setSelectedStatus(value as ReadingStatus)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reading">Currently Reading</SelectItem>
                                <SelectItem value="finished">Finished</SelectItem>
                                <SelectItem value="want-to-read">Want to Read</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={handleAddToBookshelf} 
                            disabled={isAddingToShelf}
                            className="w-full"
                          >
                            {isAddingToShelf ? 'Updating...' : 'Update Status'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Dialog open={addToShelfDialogOpen} onOpenChange={setAddToShelfDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                      >
                        <BookPlus className="mr-2 h-4 w-4" />
                        Add to My Bookshelf
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Bookshelf</DialogTitle>
                        <DialogDescription>
                          Add "{book.title}" to your personal bookshelf
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Reading Status</Label>
                          <Select 
                            value={selectedStatus} 
                            onValueChange={(value) => setSelectedStatus(value as ReadingStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="want-to-read">Want to Read</SelectItem>
                              <SelectItem value="reading">Currently Reading</SelectItem>
                              <SelectItem value="finished">Finished</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleAddToBookshelf} 
                          disabled={isAddingToShelf}
                          className="w-full"
                        >
                          {isAddingToShelf ? 'Adding...' : 'Add to Bookshelf'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Book Details */}
        <div className="md:col-span-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy mb-2">
            {book.title}
          </h1>
          <h2 className="text-xl text-gray-700 mb-4">by {book.author}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {book.pageCount && (
              <div>
                <span className="text-sm text-gray-500">Pages</span>
                <p>{book.pageCount}</p>
              </div>
            )}
            
            {book.publishedDate && (
              <div>
                <span className="text-sm text-gray-500">Published</span>
                <p>{new Date(book.publishedDate).getFullYear()}</p>
              </div>
            )}
            
            {book.publisher && (
              <div>
                <span className="text-sm text-gray-500">Publisher</span>
                <p>{book.publisher}</p>
              </div>
            )}
            
            {book.isbn && (
              <div>
                <span className="text-sm text-gray-500">ISBN</span>
                <p>{book.isbn}</p>
              </div>
            )}
          </div>
          
          {book.genre && book.genre.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-gray-500 block mb-2">Genres</span>
              <div className="flex flex-wrap gap-2">
                {book.genre.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {book.description && (
            <div className="mb-8">
              <h3 className="font-medium text-lg mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{book.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-bookburst-navy">Reader Reviews</h2>
          
          {isAuthenticated && !userHasReviewed && (
            <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>
                    Share your thoughts about "{book.title}"
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5 stars)</Label>
                    <div className="flex items-center space-x-4">
                      <Select 
                        value={String(reviewRating)} 
                        onValueChange={(value) => setReviewRating(Number(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {star <= reviewRating ? (
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recommend">Would you recommend this book?</Label>
                    <Select 
                      value={reviewRecommend ? "yes" : "no"} 
                      onValueChange={(value) => setReviewRecommend(value === "yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, I recommend it</SelectItem>
                        <SelectItem value="no">No, I don't recommend it</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Your Review</Label>
                    <Textarea 
                      id="content"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Share your thoughts on this book..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submittingReview || !reviewContent.trim()}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {reviewsLoading ? (
          <div className="flex justify-center items-center h-48">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-xl text-gray-600 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">Be the first to review this book!</p>
            
            {!isAuthenticated && (
              <div className="mt-6">
                <Link to="/login">
                  <Button>Sign In to Write a Review</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} showBookInfo={false} />
            ))}
            
            {/* Pagination */}
            {totalReviewPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(reviewsPage - 1)}
                      className={reviewsPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalReviewPages) }, (_, i) => {
                    let pageNum;
                    if (totalReviewPages <= 5) {
                      pageNum = i + 1;
                    } else if (reviewsPage <= 3) {
                      pageNum = i + 1;
                    } else if (reviewsPage >= totalReviewPages - 2) {
                      pageNum = totalReviewPages - 4 + i;
                    } else {
                      pageNum = reviewsPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pageNum === reviewsPage}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(reviewsPage + 1)}
                      className={reviewsPage >= totalReviewPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
