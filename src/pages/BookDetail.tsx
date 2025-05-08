
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book, Review, booksAPI, reviewsAPI, bookshelfAPI, BookShelfItem } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import ReviewCard from '@/components/Reviews/ReviewCard';
import { BookOpen, Check, Plus, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookshelfItem, setBookshelfItem] = useState<BookShelfItem | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingBookshelfItem, setIsLoadingBookshelfItem] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Review form state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [isRecommended, setIsRecommended] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Add to bookshelf dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('want-to-read');
  const [isAddingToBookshelf, setIsAddingToBookshelf] = useState(false);
  
  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;
      
      setIsLoadingBook(true);
      try {
        const bookData = await booksAPI.getBookDetails(id);
        setBook(bookData);
        document.title = `${bookData.title} - BookBurst`;
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast.error('Failed to load book details.');
        navigate('/explore');
      } finally {
        setIsLoadingBook(false);
      }
    };
    
    fetchBookDetails();
  }, [id, navigate]);
  
  // Fetch reviews with pagination
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      setIsLoadingReviews(true);
      try {
        const reviewData = await reviewsAPI.getBookReviews(id, currentPage);
        setReviews(reviewData.reviews);
        setTotalPages(reviewData.pages);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews.');
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [id, currentPage]);
  
  // Fetch user's bookshelf item for this book if authenticated
  useEffect(() => {
    const fetchBookshelfItem = async () => {
      if (!id || !isAuthenticated) {
        setIsLoadingBookshelfItem(false);
        return;
      }
      
      setIsLoadingBookshelfItem(true);
      try {
        const response = await bookshelfAPI.getMyBooks();
        const item = response.books.find((item) => item.book._id === id);
        setBookshelfItem(item || null);
      } catch (error) {
        console.error('Error fetching bookshelf item:', error);
      } finally {
        setIsLoadingBookshelfItem(false);
      }
    };
    
    fetchBookshelfItem();
  }, [id, isAuthenticated]);
  
  // Check if user has already reviewed this book
  const hasUserReviewed = reviews.some(review => 
    review.user._id === (isAuthenticated ? JSON.parse(localStorage.getItem('bookburstUser') || '{}')._id : null)
  );
  
  // Handle adding book to shelf
  const handleAddToShelf = async () => {
    if (!book || !isAuthenticated) return;
    
    setIsAddingToBookshelf(true);
    try {
      const newBookshelfItem = await bookshelfAPI.addToBookshelf({
        bookId: book._id,
        status: selectedStatus as any
      });
      
      setBookshelfItem(newBookshelfItem);
      toast.success(`Added to your ${selectedStatus.replace('-', ' ')} shelf!`);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding to shelf:', error);
      toast.error('Failed to add book to your shelf.');
    } finally {
      setIsAddingToBookshelf(false);
    }
  };
  
  // Handle updating book status
  const handleUpdateStatus = async (status: string) => {
    if (!bookshelfItem || !isAuthenticated) return;
    
    try {
      const updatedItem = await bookshelfAPI.updateBookStatus(
        bookshelfItem._id,
        status as any
      );
      
      setBookshelfItem(updatedItem);
      toast.success(`Moved to your ${status.replace('-', ' ')} shelf!`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update book status.');
    }
  };
  
  // Handle submitting a review
  const handleSubmitReview = async () => {
    if (!book || !isAuthenticated || !reviewContent.trim() || reviewRating === 0) {
      toast.error('Please provide both a rating and review content.');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const newReview = await reviewsAPI.createReview({
        bookId: book._id,
        rating: reviewRating,
        content: reviewContent,
        recommend: isRecommended
      });
      
      // Refresh the reviews list to include the new review
      const reviewData = await reviewsAPI.getBookReviews(id!, 1);
      setReviews(reviewData.reviews);
      setCurrentPage(1);
      setTotalPages(reviewData.pages);
      
      toast.success('Your review has been published!');
      setIsReviewDialogOpen(false);
      setReviewContent('');
      setReviewRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  if (isLoadingBook) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="text-center">
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-bookburst-navy mb-4">Book not found</h2>
          <Link to="/explore">
            <Button className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
              Explore Books
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/explore" className="text-bookburst-navy hover:text-bookburst-amber font-medium">
          &larr; Back to Explore
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Book Cover */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-24">
            <img
              src={book.coverImage || '/placeholder.svg'}
              alt={`${book.title} cover`}
              className="w-full rounded-lg shadow-lg max-h-[500px] object-contain mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            
            {isAuthenticated && !isLoadingBookshelfItem && (
              <div className="mt-6 space-y-4">
                {bookshelfItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center bg-bookburst-amber/20 text-bookburst-navy rounded-lg p-3">
                      <BookOpen className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        {bookshelfItem.status === 'reading' ? 'Currently Reading' :
                         bookshelfItem.status === 'finished' ? 'Finished Reading' :
                         'Want to Read'}
                      </span>
                    </div>
                    
                    <Select
                      value={bookshelfItem.status}
                      onValueChange={handleUpdateStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">Currently Reading</SelectItem>
                        <SelectItem value="finished">Finished Reading</SelectItem>
                        <SelectItem value="want-to-read">Want to Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
                        <Plus className="mr-2 h-4 w-4" /> Add to My Shelf
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Your Shelf</DialogTitle>
                        <DialogDescription>
                          Add "{book.title}" to your bookshelf.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <Label htmlFor="status">Reading Status</Label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger id="status" className="w-full mt-2">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reading">Currently Reading</SelectItem>
                            <SelectItem value="finished">Finished Reading</SelectItem>
                            <SelectItem value="want-to-read">Want to Read</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={handleAddToShelf} 
                          disabled={isAddingToBookshelf}
                          className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                        >
                          {isAddingToBookshelf ? 'Adding...' : 'Add to Shelf'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                {(!hasUserReviewed && bookshelfItem?.status === 'finished') && (
                  <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-bookburst-navy text-bookburst-navy">
                        <Star className="mr-2 h-4 w-4" /> Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Review {book.title}</DialogTitle>
                        <DialogDescription>
                          Share your thoughts about this book with the community.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label>Your Rating</Label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-8 w-8 cursor-pointer transition-colors ${
                                  star <= reviewRating
                                    ? 'text-bookburst-amber fill-bookburst-amber'
                                    : 'text-gray-300 hover:text-gray-400'
                                }`}
                                onClick={() => setReviewRating(star)}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="review">Your Review</Label>
                          <Textarea
                            id="review"
                            placeholder="Share your thoughts about this book..."
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            rows={6}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="recommend"
                            checked={isRecommended}
                            onCheckedChange={(checked) => 
                              setIsRecommended(checked as boolean)
                            }
                          />
                          <Label htmlFor="recommend" className="text-sm font-normal">
                            I recommend this book
                          </Label>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || !reviewContent.trim() || reviewRating === 0}
                          className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
            
            {isAuthenticated === false && (
              <div className="mt-6 space-y-4">
                <Link to="/login">
                  <Button className="w-full bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
                    Log in to add to shelf
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Book Details */}
        <div className="md:col-span-8 lg:col-span-9">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy mb-2">
            {book.title}
          </h1>
          
          <p className="text-xl text-gray-700 mb-4">by {book.author}</p>
          
          <div className="flex items-center space-x-4 mb-8">
            {/* Average rating display would go here if we had that data */}
            {book.pageCount && (
              <span className="text-gray-600">{book.pageCount} pages</span>
            )}
            {book.publishedDate && (
              <span className="text-gray-600">
                Published {new Date(book.publishedDate).getFullYear()}
              </span>
            )}
            {book.publisher && (
              <span className="text-gray-600">Publisher: {book.publisher}</span>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="font-serif text-xl font-semibold mb-3">About this book</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700">{book.description}</p>
            </div>
          </div>
          
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="details">Book Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reviews" className="w-full pt-6">
              <h2 className="font-serif text-2xl font-semibold mb-6">
                Reviews
              </h2>
              
              {isLoadingReviews ? (
                <div className="flex justify-center items-center h-32">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 border border-gray-200 rounded-lg">
                  <h3 className="font-serif text-lg font-medium text-gray-600 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Be the first to review this book!
                  </p>
                  
                  {isAuthenticated ? (
                    bookshelfItem?.status === 'finished' ? (
                      <Button
                        onClick={() => setIsReviewDialogOpen(true)}
                        className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                      >
                        <Star className="mr-2 h-4 w-4" /> Write a Review
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Mark this book as "Finished" to write a review
                      </p>
                    )
                  ) : (
                    <Link to="/login">
                      <Button className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
                        Log in to write a review
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                  
                  {/* Pagination for reviews */}
                  {totalPages > 1 && (
                    <Pagination className="my-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show pages around current page
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink 
                                onClick={() => handlePageChange(pageNum)}
                                isActive={pageNum === currentPage}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="w-full pt-6">
              <h2 className="font-serif text-2xl font-semibold mb-6">
                Book Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {book.isbn && (
                    <div>
                      <h3 className="font-medium text-gray-700">ISBN</h3>
                      <p>{book.isbn}</p>
                    </div>
                  )}
                  
                  {book.publisher && (
                    <div>
                      <h3 className="font-medium text-gray-700">Publisher</h3>
                      <p>{book.publisher}</p>
                    </div>
                  )}
                  
                  {book.publishedDate && (
                    <div>
                      <h3 className="font-medium text-gray-700">Publication Date</h3>
                      <p>{new Date(book.publishedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {book.pageCount && (
                    <div>
                      <h3 className="font-medium text-gray-700">Page Count</h3>
                      <p>{book.pageCount} pages</p>
                    </div>
                  )}
                </div>
                
                {book.genre && book.genre.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700">Genres</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {book.genre.map((genre) => (
                        <span
                          key={genre}
                          className="inline-block bg-bookburst-teal/10 text-bookburst-navy px-3 py-1 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
