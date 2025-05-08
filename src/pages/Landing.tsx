
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Star, TrendingUp, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const mockBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://images-na.ssl-images-amazon.com/images/I/81YzHKeWq7L.jpg"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://m.media-amazon.com/images/I/91bYsX41DVL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://m.media-amazon.com/images/I/91Bd7P8UwxL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    title: "Educated",
    author: "Tara Westover",
    cover: "https://m.media-amazon.com/images/I/81NwOj14S6L._AC_UF1000,1000_QL80_.jpg"
  }
];

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-bookburst-cream">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-12 md:mb-0">
              <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight text-bookburst-navy mb-6 animate-fade-up">
                Your Personal<br />
                <span className="text-bookburst-burgundy">Reading Journey</span><br />
                Starts Here
              </h1>
              <p className="text-lg text-gray-700 mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Track books, share insights, and discover new reads with a community of passionate book lovers.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                {isAuthenticated ? (
                  <Link to="/shelf">
                    <Button className="bg-bookburst-amber hover:bg-bookburst-amber/90 text-bookburst-navy text-lg px-8 py-6">
                      Go to My Bookshelf
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/signup">
                    <Button className="bg-bookburst-amber hover:bg-bookburst-amber/90 text-bookburst-navy text-lg px-8 py-6">
                      Start Reading Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/explore">
                  <Button variant="outline" className="border-bookburst-navy text-bookburst-navy hover:bg-bookburst-navy hover:text-white text-lg px-8 py-6">
                    Explore Books
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 animate-fade-up" style={{ animationDelay: "0.6s" }}>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {mockBooks.map((book, index) => (
                    <div 
                      key={book.title}
                      className="book-card transform transition-all duration-500 hover:scale-105"
                      style={{ animationDelay: `${0.2 * index}s` }}
                    >
                      <img 
                        src={book.cover} 
                        alt={book.title} 
                        className="w-full h-64 object-cover rounded-lg shadow-md" 
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute -z-10 top-10 left-10 w-full h-full bg-bookburst-teal/30 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-bookburst-navy mb-16">
            Your Complete Reading Companion
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-bookburst-cream rounded-lg p-8 shadow-md transition-transform hover:transform hover:-translate-y-2">
              <BookOpen className="w-12 h-12 text-bookburst-amber mb-4" />
              <h3 className="font-serif text-2xl font-bold text-bookburst-navy mb-4">Organize Your Library</h3>
              <p className="text-gray-700">
                Easily track books you're currently reading, want to read, or have finished. Keep your reading life organized.
              </p>
            </div>
            
            <div className="bg-bookburst-cream rounded-lg p-8 shadow-md transition-transform hover:transform hover:-translate-y-2">
              <Star className="w-12 h-12 text-bookburst-amber mb-4" />
              <h3 className="font-serif text-2xl font-bold text-bookburst-navy mb-4">Rate & Review</h3>
              <p className="text-gray-700">
                Share your thoughts with ratings and reviews. Capture your insights and recommendations for each book.
              </p>
            </div>
            
            <div className="bg-bookburst-cream rounded-lg p-8 shadow-md transition-transform hover:transform hover:-translate-y-2">
              <TrendingUp className="w-12 h-12 text-bookburst-amber mb-4" />
              <h3 className="font-serif text-2xl font-bold text-bookburst-navy mb-4">Discover Trends</h3>
              <p className="text-gray-700">
                Explore what others are reading and reviewing. Find new books based on community favorites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-bookburst-navy text-white">
        <div className="container px-4 mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16">
            How BookBurst Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-bookburst-amber/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-bookburst-amber" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-gray-300">Create your free account to get started</p>
            </div>
            
            <div className="text-center">
              <div className="bg-bookburst-amber/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-bookburst-amber" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Add Books</h3>
              <p className="text-gray-300">Build your personal reading shelf</p>
            </div>
            
            <div className="text-center">
              <div className="bg-bookburst-amber/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-bookburst-amber" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Review & Rate</h3>
              <p className="text-gray-300">Share your thoughts and ratings</p>
            </div>
            
            <div className="text-center">
              <div className="bg-bookburst-amber/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-bookburst-amber" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Discover</h3>
              <p className="text-gray-300">Find new books from the community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-bookburst-amber/60 to-bookburst-burgundy/40">
        <div className="container px-4 mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-bookburst-navy mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who are tracking their books, sharing their thoughts, and discovering new reads.
          </p>
          
          {isAuthenticated ? (
            <Link to="/shelf">
              <Button className="bg-bookburst-navy hover:bg-bookburst-navy/90 text-white text-lg px-8 py-6">
                Go to My Bookshelf
              </Button>
            </Link>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button className="bg-bookburst-navy hover:bg-bookburst-navy/90 text-white text-lg px-8 py-6">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-bookburst-navy text-bookburst-navy hover:bg-bookburst-navy hover:text-white text-lg px-8 py-6">
                  Log In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;
