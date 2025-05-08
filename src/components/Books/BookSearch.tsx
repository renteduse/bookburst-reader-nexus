import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Book, ReadingStatus, booksAPI, bookshelfAPI } from '@/services/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BookSearch: React.FC<{
  onAddSuccess?: (bookshelfItem: any) => void;
}> = ({ onAddSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>('want-to-read');
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await booksAPI.searchBooks(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('No books found. Try a different search term or add a new book.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for books');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddToBookshelf = async (book: Book) => {
    setLoadingBookId(book._id);
    try {
      const bookshelfItem = await bookshelfAPI.addToBookshelf({
        bookId: book._id,
        status: selectedStatus
      });
      
      toast.success(`"${book.title}" added to your bookshelf!`);
      
      if (onAddSuccess) {
        onAddSuccess(bookshelfItem);
      }
    } catch (error: any) {
      // Check for error message about book already added
      if (error.message && error.message.includes('already')) {
        toast.error('This book is already in your bookshelf');
      } else {
        console.error('Error adding to bookshelf:', error);
        toast.error('Failed to add book to bookshelf');
      }
    } finally {
      setLoadingBookId(null);
    }
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by title, author, or ISBN"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={isSearching}
          className="bg-bookburst-teal text-white hover:bg-bookburst-teal/90"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>
      
      <div className="my-4">
        <label htmlFor="status-select" className="block text-sm font-medium mb-2">
          Add books to:
        </label>
        <Select 
          value={selectedStatus} 
          onValueChange={(value) => setSelectedStatus(value as ReadingStatus)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="want-to-read">Want to Read</SelectItem>
            <SelectItem value="reading">Currently Reading</SelectItem>
            <SelectItem value="finished">Finished Reading</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {searchResults.length > 0 && (
        <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
          <h3 className="font-medium text-lg">Search Results</h3>
          {searchResults.map((book) => (
            <div 
              key={book._id} 
              className="flex gap-4 p-4 border rounded-md"
            >
              <div className="flex-shrink-0 w-16 h-24 bg-gray-100 rounded overflow-hidden">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs text-center p-1">
                    No Cover Image
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium">{book.title}</h4>
                <p className="text-sm text-gray-600">by {book.author}</p>
                {book.genre && book.genre.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {book.genre.join(', ')}
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                <Button 
                  onClick={() => handleAddToBookshelf(book)}
                  disabled={loadingBookId === book._id}
                  size="sm"
                  className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
                >
                  {loadingBookId === book._id ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSearch;
