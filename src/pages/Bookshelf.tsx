
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
import { saveLastBookshelfTab, getLastBookshelfTab } from '@/utils/cookies';

const Bookshelf: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<ReadingStatus | 'all'>(getLastBookshelfTab() as ReadingStatus || 'reading');
  const [books, setBooks] = useState<BookShelfItem[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  
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
        const response = await bookshelfAPI.getMyBooks(status);
        setBooks(response.books);
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
  }, [isAuthenticated, activeTab]);

  const handleAddBook = () => {
    setSearchOpen(true);
  };

  const handleSuccessfulAdd = (bookshelfItem: BookShelfItem) => {
    toast.success('Book added to your shelf!');
    setBooks([bookshelfItem, ...books]);
    setSearchOpen(false);
  };

  const handleTabChange = (value: string) => {
    const newTab = value as ReadingStatus | 'all';
    setActiveTab(newTab);
    saveLastBookshelfTab(newTab);
  };

  if (isLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy">My Bookshelf</h1>
        
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddBook} className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90">
              <Plus className="mr-2 h-4 w-4" /> Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add a Book to Your Shelf</DialogTitle>
              <DialogDescription>
                Search for books to add to your collection
              </DialogDescription>
            </DialogHeader>
            <BookSearch onAddSuccess={handleSuccessfulAdd} />
          </DialogContent>
        </Dialog>
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
                <Button 
                  onClick={handleAddBook} 
                  className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Book
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((item) => (
                  <div key={item._id} className="flex flex-col h-full">
                    <BookCard 
                      book={item.book} 
                      rating={item.rating} 
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Bookshelf;
