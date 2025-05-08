
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bookburst-navy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-bookburst-amber" />
              <span className="font-serif text-xl font-bold">BookBurst</span>
            </Link>
            <p className="mt-4 text-sm text-gray-300">
              Your personal reading companion. Track your books, share your thoughts, and discover new favorites.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-bookburst-amber transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-300 hover:text-bookburst-amber transition-colors">Explore</Link>
              </li>
              <li>
                <Link to="/shelf" className="text-gray-300 hover:text-bookburst-amber transition-colors">My Bookshelf</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-300 hover:text-bookburst-amber transition-colors">Log In</Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-300 hover:text-bookburst-amber transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-bookburst-amber transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-bookburst-amber transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-bookburst-amber transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-bookburst-amber transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-300 text-sm">
          <p>&copy; {currentYear} BookBurst. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
