
import React, { useState, useEffect } from 'react';
import { Book, Review, exploreAPI } from '@/services/api';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BookCard from '@/components/Books/BookCard';
import ReviewCard from '@/components/Reviews/ReviewCard';
import { saveLastExploreTab, getLastExploreTab, saveLastExploreGenre, getLastExploreGenre } from '@/utils/cookies';
import { toast } from '@/components/ui/sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState(getLastExploreTab() || 'trending');
  const [selectedGenre, setSelectedGenre] = useState<string>(getLastExploreGenre() || '');
  const [genres, setGenres] = useState<string[]>([]);
  
  // Data states
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [topRatedBooks, setTopRatedBooks] = useState<Book[]>([]);
  const [mostWishlistedBooks, setMostWishlistedBooks] = useState<Book[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  
  // Pagination states
  const [trendingPage, setTrendingPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [wishlistedPage, setWishlistedPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [trendingTotalPages, setTrendingTotalPages] = useState(1);
  const [topRatedTotalPages, setTopRatedTotalPages] = useState(1);
  const [wishlistedTotalPages, setWishlistedTotalPages] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  
  // Loading states
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingTopRated, setIsLoadingTopRated] = useState(true);
  const [isLoadingWishlisted, setIsLoadingWishlisted] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  
  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const data = await exploreAPI.getGenres();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setIsLoadingGenres(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Fetch trending books
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      setIsLoadingTrending(true);
      try {
        const data = await exploreAPI.getTrending(trendingPage, 10, selectedGenre || undefined);
        setTrendingBooks(data.books);
        setTrendingTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching trending books:', error);
        toast.error('Failed to load trending books.');
      } finally {
        setIsLoadingTrending(false);
      }
    };
    
    fetchTrendingBooks();
  }, [selectedGenre, trendingPage]);
  
  // Fetch top rated books
  useEffect(() => {
    const fetchTopRatedBooks = async () => {
      if (activeTab === 'top-rated') {
        setIsLoadingTopRated(true);
        try {
          const data = await exploreAPI.getTopRated(topRatedPage, 10, selectedGenre || undefined);
          setTopRatedBooks(data.books);
          setTopRatedTotalPages(data.pages);
        } catch (error) {
          console.error('Error fetching top rated books:', error);
          toast.error('Failed to load top rated books.');
        } finally {
          setIsLoadingTopRated(false);
        }
      }
    };
    
    fetchTopRatedBooks();
  }, [activeTab, selectedGenre, topRatedPage]);
  
  // Fetch most wishlisted books
  useEffect(() => {
    const fetchMostWishlistedBooks = async () => {
      if (activeTab === 'wishlisted') {
        setIsLoadingWishlisted(true);
        try {
          const data = await exploreAPI.getMostWishlisted(wishlistedPage, 10, selectedGenre || undefined);
          setMostWishlistedBooks(data.books);
          setWishlistedTotalPages(data.pages);
        } catch (error) {
          console.error('Error fetching most wishlisted books:', error);
          toast.error('Failed to load wishlisted books.');
        } finally {
          setIsLoadingWishlisted(false);
        }
      }
    };
    
    fetchMostWishlistedBooks();
  }, [activeTab, selectedGenre, wishlistedPage]);
  
  // Fetch recent reviews
  useEffect(() => {
    const fetchRecentReviews = async () => {
      if (activeTab === 'reviews') {
        setIsLoadingReviews(true);
        try {
          const data = await exploreAPI.getRecentReviews(reviewsPage, 10, selectedGenre || undefined);
          setRecentReviews(data.reviews);
          setReviewsTotalPages(data.pages);
        } catch (error) {
          console.error('Error fetching recent reviews:', error);
          toast.error('Failed to load recent reviews.');
        } finally {
          setIsLoadingReviews(false);
        }
      }
    };
    
    fetchRecentReviews();
  }, [activeTab, selectedGenre, reviewsPage]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    saveLastExploreTab(value);
  };
  
  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    saveLastExploreGenre(value);
    // Reset pagination when changing genre
    setTrendingPage(1);
    setTopRatedPage(1);
    setWishlistedPage(1);
    setReviewsPage(1);
  };
  
  const handlePageChange = (page: number) => {
    switch (activeTab) {
      case 'trending':
        if (page < 1 || page > trendingTotalPages) return;
        setTrendingPage(page);
        break;
      case 'top-rated':
        if (page < 1 || page > topRatedTotalPages) return;
        setTopRatedPage(page);
        break;
      case 'wishlisted':
        if (page < 1 || page > wishlistedTotalPages) return;
        setWishlistedPage(page);
        break;
      case 'reviews':
        if (page < 1 || page > reviewsTotalPages) return;
        setReviewsPage(page);
        break;
    }
  };
  
  const getCurrentPage = () => {
    switch (activeTab) {
      case 'trending': return trendingPage;
      case 'top-rated': return topRatedPage;
      case 'wishlisted': return wishlistedPage;
      case 'reviews': return reviewsPage;
      default: return 1;
    }
  };
  
  const getTotalPages = () => {
    switch (activeTab) {
      case 'trending': return trendingTotalPages;
      case 'top-rated': return topRatedTotalPages;
      case 'wishlisted': return wishlistedTotalPages;
      case 'reviews': return reviewsTotalPages;
      default: return 1;
    }
  };
  
  const renderBookGrid = (books: Book[], isLoading: boolean) => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">Loading books...</div>;
    }
    
    if (books.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="font-serif text-2xl font-medium text-gray-600 mb-4">
            No books found
          </h3>
          <p className="text-gray-500">
            {selectedGenre ? 
              `No books found for the ${selectedGenre} genre. Try selecting a different genre.` : 
              'No books found. Try again later.'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {books.map((book) => (
          <div key={book._id} className="flex flex-col h-full">
            <BookCard book={book} showRating={false} />
          </div>
        ))}
      </div>
    );
  };
  
  const renderReviewsGrid = (reviews: Review[], isLoading: boolean) => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">Loading reviews...</div>;
    }
    
    if (reviews.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="font-serif text-2xl font-medium text-gray-600 mb-4">
            No reviews found
          </h3>
          <p className="text-gray-500">
            {selectedGenre ? 
              `No reviews found for the ${selectedGenre} genre. Try selecting a different genre.` : 
              'No reviews have been posted yet.'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    );
  };
  
  const renderPagination = () => {
    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    
    if (totalPages <= 1) return null;
    
    return (
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
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy">Explore Books</h1>
        
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <Select value={selectedGenre} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full md:w-auto mb-8 flex flex-wrap">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          <TabsTrigger value="wishlisted">Most Wishlisted</TabsTrigger>
          <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trending" className="w-full">
          {renderBookGrid(trendingBooks, isLoadingTrending)}
          {renderPagination()}
        </TabsContent>
        
        <TabsContent value="top-rated" className="w-full">
          {renderBookGrid(topRatedBooks, isLoadingTopRated)}
          {renderPagination()}
        </TabsContent>
        
        <TabsContent value="wishlisted" className="w-full">
          {renderBookGrid(mostWishlistedBooks, isLoadingWishlisted)}
          {renderPagination()}
        </TabsContent>
        
        <TabsContent value="reviews" className="w-full">
          {renderReviewsGrid(recentReviews, isLoadingReviews)}
          {renderPagination()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
