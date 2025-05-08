
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Book, booksAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import BookCard from '@/components/Books/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);
  
  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchPerformed(true);
    
    try {
      const books = await booksAPI.searchBooks(query);
      setResults(books);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for books.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery) {
      setSearchParams({ q: trimmedQuery });
      performSearch(trimmedQuery);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy mb-8">
        {searchPerformed 
          ? `Search Results for "${initialQuery}"`
          : 'Search Books'
        }
      </h1>
      
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mb-12">
        <Input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !searchQuery.trim()}
          className="bg-bookburst-amber text-bookburst-navy hover:bg-bookburst-amber/90"
        >
          {isLoading ? 'Searching...' : <Search className="h-4 w-4" />}
        </Button>
      </form>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p>Searching for books...</p>
          </div>
        </div>
      ) : searchPerformed && results.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="font-serif text-2xl font-medium text-gray-600 mb-2">
            No books found
          </h3>
          <p className="text-gray-500">
            We couldn't find any books matching "{initialQuery}".<br />
            Try a different search term or check the spelling.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((book) => (
            <div key={book._id} className="flex flex-col h-full">
              <BookCard book={book} showRating={false} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchResults;
