
import React, { useState } from 'react';
import { Book, BookShelfItem, ReadingStatus, booksAPI, bookshelfAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

interface BookSearchProps {
  onAddSuccess?: (bookshelfItem: BookShelfItem) => void;
}

const BookSearch: React.FC<BookSearchProps> = ({ onAddSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('want-to-read');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await booksAPI.searchBooks(searchQuery);
      setSearchResults(results);
      setSelectedBook(null);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for books. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddToShelf = async () => {
    if (!selectedBook) return;
    
    setIsAdding(true);
    try {
      const bookshelfItem = await bookshelfAPI.addToBookshelf({
        bookId: selectedBook._id,
        status: readingStatus
      });
      
      toast.success(`${selectedBook.title} added to your ${readingStatus.replace('-', ' ')} shelf!`);
      
      if (onAddSuccess) {
        onAddSuccess(bookshelfItem);
      }
      
      // Reset form
      setSearchQuery('');
      setSearchResults([]);
      setSelectedBook(null);
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book to your shelf. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={isSearching || !searchQuery.trim()}
          className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
        >
          {isSearching ? 'Searching...' : <Search className="h-4 w-4" />}
        </Button>
      </form>
      
      {isSearching && (
        <div className="text-center py-8">
          <p>Searching for books...</p>
        </div>
      )}
      
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p>No books found. Try a different search term.</p>
        </div>
      )}
      
      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-medium">Search Results:</h3>
          <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
            {searchResults.map((book) => (
              <div
                key={book._id}
                className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedBook?._id === book._id 
                    ? 'bg-bookburst-amber/20 border border-bookburst-amber' 
                    : 'hover:bg-gray-100 border border-gray-200'}`}
                onClick={() => setSelectedBook(book)}
              >
                <img
                  src={book.coverImage || '/placeholder.svg'}
                  alt={book.title}
                  className="w-16 h-24 object-cover rounded mr-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div>
                  <h4 className="font-serif font-medium text-bookburst-navy">{book.title}</h4>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  {book.publishedDate && (
                    <p className="text-xs text-gray-500">
                      Published: {new Date(book.publishedDate).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedBook && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Add "{selectedBook.title}" to:</h3>
          
          <RadioGroup 
            value={readingStatus} 
            onValueChange={(value) => setReadingStatus(value as ReadingStatus)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reading" id="reading" />
              <Label htmlFor="reading">Currently Reading</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="finished" id="finished" />
              <Label htmlFor="finished">Finished</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="want-to-read" id="want-to-read" />
              <Label htmlFor="want-to-read">Want to Read</Label>
            </div>
          </RadioGroup>
          
          <div className="pt-2">
            <Button 
              onClick={handleAddToShelf} 
              disabled={isAdding}
              className="w-full bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
            >
              {isAdding ? 'Adding...' : 'Add to My Shelf'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
