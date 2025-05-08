
import React, { useState, useEffect } from 'react';
import { BookShelfItem, ReadingStatus, bookshelfAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import BookCard from '@/components/Books/BookCard';
import BookSearch from '@/components/Books/BookSearch';
import AddBookForm from '@/components/Books/AddBookForm';
import { saveLastBookshelfTab, getLastBookshelfTab } from '@/utils/cookies';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Bookshelf: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'all'>(getLastBookshelfTab() as ReadingStatus || 'reading');
  const [books, setBooks] = useState<BookShelfItem[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast('Please sign in to view your bookshelf');
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoadingBooks(true);
      try {
        const status = activeTab === 'all' ? undefined : activeTab;
        const response = await bookshelfAPI.getMyBooks(status, currentPage);
        setBooks(response.books);
        setTotalPages(response.pages);
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error('Failed to load your books.');
      } finally {
        setIsLoadingBooks(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated, activeTab, currentPage]);

  const handleAddBook = () => {
    setAddBookOpen(true);
  };

  const handleSearchBook = () => {
    setSearchOpen(true);
  };

  const handleSuccessfulAdd = (bookshelfItem: BookShelfItem) => {
    toast.success('Book added to your shelf!');
    // Refresh the list to include the new book
    const status = activeTab === 'all' ? undefined : activeTab;
    bookshelfAPI.getMyBooks(status, currentPage).then(response => {
      setBooks(response.books);
    });
    setSearchOpen(false);
    setAddBookOpen(false);
  };

  const handleTabChange = (value: string) => {
    const newTab = value as ReadingStatus | 'all';
    setActiveTab(newTab);
    setCurrentPage(1); // Reset to first page when changing tabs
    saveLastBookshelfTab(newTab);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (isLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy">My Bookshelf</h1>
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          {/* Search for existing books button */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleSearchBook} className="bg-bookburst-teal text-white hover:bg-bookburst-teal/90">
                <Plus className="mr-2 h-4 w-4" /> Add Existing Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add an Existing Book to Your Shelf</DialogTitle>
                <DialogDescription>
                  Search for books to add to your collection
                </DialogDescription>
              </DialogHeader>
              <BookSearch onAddSuccess={handleSuccessfulAdd} />
            </DialogContent>
          </Dialog>
          
          {/* Add new book form button */}
          <Dialog open={addBookOpen} onOpenChange={setAddBookOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddBook} className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
                <Plus className="mr-2 h-4 w-4" /> Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add a New Book</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new book to the library
                </DialogDescription>
              </DialogHeader>
              <AddBookForm onSuccess={(book) => {
                // After adding a new book, add it to the user's bookshelf
                bookshelfAPI.addToBookshelf({
                  bookId: book._id,
                  status: activeTab === 'all' ? 'want-to-read' : activeTab
                }).then(handleSuccessfulAdd);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Books</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
          <TabsTrigger value="want-to-read">Want to Read</TabsTrigger>
        </TabsList>
        
        {['all', 'reading', 'finished', 'want-to-read'].map((tab) => (
          <TabsContent key={tab} value={tab} className="w-full">
            {isLoadingBooks ? (
              <div className="flex justify-center items-center h-64">Loading your books...</div>
            ) : books.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="font-serif text-2xl font-medium text-gray-600 mb-4">
                  {tab === 'all'
                    ? "Your bookshelf is empty"
                    : tab === 'reading'
                    ? "You're not reading any books yet"
                    : tab === 'finished'
                    ? "You haven't finished any books yet"
                    : "You don't have any books in your wishlist"}
                </h3>
                <p className="text-gray-500 mb-6">Add some books to get started!</p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={handleSearchBook} 
                    className="bg-bookburst-teal text-white hover:bg-bookburst-teal/90"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Existing Book
                  </Button>
                  <Button 
                    onClick={handleAddBook} 
                    className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add New Book
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {books.map((item) => (
                    <div key={item._id} className="flex flex-col h-full">
                      <BookCard 
                        book={item.book} 
                        rating={item.rating} 
                        status={item.status}
                        bookshelfItemId={item._id}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
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
        ))}
      </Tabs>
    </div>
  );
};

export default Bookshelf;
